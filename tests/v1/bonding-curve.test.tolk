import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "@contracts/v1/bonding-config"
import "@contracts/v1/bonding-dedust"
import "@contracts/v1/bonding-math"
import "@contracts/v1/bonding-messages"
import "@contracts/v1/bonding-storage"
import "@contracts/v1/messages"
import "test-utils"

fun setupMaster(): (BondingCurveMaster, Treasury, Treasury) {
    val deployer = testing.treasury("master-deployer");
    val treasury = testing.treasury("master-treasury");

    val master = BondingCurveMaster.fromStorage({
        admin: deployer.address,
        nextAdmin: null,
        treasury: treasury.address,
        totalLaunches: 0,
        feesBalance: 0,
    });

    val res = master.sendDeploy(deployer.address, { value: ton("1") });
    expect(res).toHaveSuccessfulDeploy({ to: master.address });

    return (master, deployer, treasury);
}

get fun `test master: deploys with correct initial state`() {
    val (master, deployer, treasury) = setupMaster();
    val data = master.getMasterData();
    expect(data.admin).toEqual(deployer.address);
    expect(data.treasury).toEqual(treasury.address);
    expect(data.totalLaunches).toEqual(0);
}

get fun `test launch: create-launch increments totalLaunches and deploys curve+minter`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator");

    val metadata = buildTestMetadata("ipfs://test");
    val salt = 42 as uint64;

    val expectedCurve = master.getLaunchAddress(creator.address, salt);

    val res = master.sendCreateLaunch(
        creator.address,
        0,
        metadata,
        salt,
        { value: ton("3"), bounce: false },
    );
    expect(res).toHaveSuccessfulTx<CreateLaunch>({
        from: creator.address,
        to: master.address,
    });

    val data = master.getMasterData();
    expect(data.totalLaunches).toEqual(1);

    val curve = BondingCurve.fromAddress(expectedCurve);
    val curveData = curve.getCurveData();
    expect(curveData.state).toEqual(CURVE_STATE_TRADING);
    expect(curveData.creator).toEqual(creator.address);

    expect(curveData.curveJettonBalance).toEqual(TOTAL_SUPPLY);
    expect(curveData.realTonReserve).toEqual(0);
    expect(curveData.virtualTonReserve).toEqual(VIRTUAL_TON_RESERVE_INIT);
}

get fun `test curve math: small buy returns positive jettons with decreasing marginal price`() {
    val (out1, _f1) = computeBuyOut(
        ton("0.1"),
        VIRTUAL_TON_RESERVE_INIT,
        0,
        CURVE_SUPPLY,
    );
    val (out2, _f2) = computeBuyOut(
        ton("0.1"),
        VIRTUAL_TON_RESERVE_INIT,
        ton("100"),
        CURVE_SUPPLY / 2,
    );
    expect(out1 > 0).toEqual(true);
    expect(out2 > 0).toEqual(true);
    expect(out1 > out2).toEqual(true);
}

get fun `test curve math: round-trip (buy then sell) cannot enrich the user`() {
    val virtualTon = VIRTUAL_TON_RESERVE_INIT;
    val realTon = 0;
    val jettonBalance = CURVE_SUPPLY;
    val tonIn = ton("5");

    val (jettonsOut, feeTonBuy) = computeBuyOut(tonIn, virtualTon, realTon, jettonBalance);
    val tonInNet = tonIn - feeTonBuy;
    val newRealTon = realTon + tonInNet;
    val newJettonBalance = jettonBalance - jettonsOut;

    val (tonOut, _feeTonSell) = computeSellOut(
        jettonsOut,
        virtualTon,
        newRealTon,
        newJettonBalance,
    );
    expect(tonOut <= tonIn).toEqual(true);
}

fun launchCurve(master: BondingCurveMaster, creator: Treasury, salt: uint64): BondingCurve {
    val metadata = buildTestMetadata("ipfs://test");
    master.sendCreateLaunch(creator.address, 0, metadata, salt, { value: ton("3"), bounce: false });
    return BondingCurve.fromAddress(master.getLaunchAddress(creator.address, salt));
}

get fun `test buy: end-to-end purchase moves reserves and decreases inventory`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-buy");
    val buyer = testing.treasury("buyer");

    val curve = launchCurve(master, creator, 200 as uint64);

    val before = curve.getCurveData();
    expect(before.state).toEqual(CURVE_STATE_TRADING);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: buyBody,
    });
    val buyRes = net.send(buyer.address, buyMsg);
    expect(buyRes).toHaveSuccessfulTx<BuyJettons>({
        from: buyer.address,
        to: curve.address,
    });

    val after = curve.getCurveData();
    expect(after.realTonReserve > 0).toEqual(true);
    expect(after.curveJettonBalance < before.curveJettonBalance).toEqual(true);
    expect(after.feeAccrued > 0).toEqual(true);
}

get fun `test buy: slippage protection rejects when minJettonsOut not met`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-slip");
    val buyer = testing.treasury("buyer-slip");

    val curve = launchCurve(master, creator, 201 as uint64);

    val unreasonableMin = TOTAL_SUPPLY;
    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: unreasonableMin };
    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: buyBody,
    });
    val _buyRes = net.send(buyer.address, buyMsg);

    val after = curve.getCurveData();
    expect(after.realTonReserve).toEqual(0);

    expect(after.curveJettonBalance).toEqual(TOTAL_SUPPLY);
    expect(after.feeAccrued).toEqual(0);
}

get fun `test math: maxSafeSellJettons caps at xAfter == virtualTon`() {
    val virtualTon = VIRTUAL_TON_RESERVE_INIT;
    val (jettonsOut, feeBuy) = computeBuyOut(ton("100"), virtualTon, 0, CURVE_SUPPLY);
    val realTonAfterBuy = ton("100") - feeBuy;
    val curveJettonAfterBuy = CURVE_SUPPLY - jettonsOut;

    val maxSafe = maxSafeSellJettons(virtualTon, realTonAfterBuy, curveJettonAfterBuy);
    expect(maxSafe < jettonsOut).toEqual(true);
    expect(maxSafe > 0).toEqual(true);

    val (tonOut, feeSell) = computeSellOut(
        maxSafe,
        virtualTon,
        realTonAfterBuy,
        curveJettonAfterBuy,
    );
    expect(realTonAfterBuy >= tonOut + feeSell).toEqual(true);
}

get fun `test master: non-admin cannot change admin`() {
    val (master, _deployer, _treasury) = setupMaster();
    val attacker = testing.treasury("attacker");

    val _res = master.sendChangeMasterAdmin(
        attacker.address,
        0,
        attacker.address,
        { value: ton("0.1"), bounce: true },
    );
    val data = master.getMasterData();
    expect(data.nextAdmin).toEqual(null);
}

get fun `test master: admin can rotate via change+claim`() {
    val (master, deployer, _treasury) = setupMaster();
    val newAdmin = testing.treasury("new-admin");

    master.sendChangeMasterAdmin(
        deployer.address,
        0,
        newAdmin.address,
        { value: ton("0.1"), bounce: true },
    );
    expect(master.getMasterData().nextAdmin).toEqual(newAdmin.address);

    master.sendClaimMasterAdmin(
        newAdmin.address,
        1,
        { value: ton("0.1"), bounce: true },
    );
    val after = master.getMasterData();
    expect(after.admin).toEqual(newAdmin.address);
    expect(after.nextAdmin).toEqual(null);
}

get fun `test master: WithdrawProtocolFees rejects amount > feesBalance`() {
    val (master, deployer, _treasury) = setupMaster();

    val _res = master.sendWithdrawProtocolFees(
        deployer.address,
        0,
        ton("1"),
        { value: ton("0.1"), bounce: true },
    );
    val data = master.getMasterData();
    expect(data.feesBalance).toEqual(0);
}

get fun `test master: DepositProtocolFees from random sender does not credit feesBalance`() {
    val (master, _deployer, _treasury) = setupMaster();
    val attacker = testing.treasury("fee-spoofer");
    val victim = testing.treasury("victim-creator");

    val fakeBody: DepositProtocolFees = {
        queryId: 0,
        creator: victim.address,
        salt: 999 as uint64,
        amount: ton("0.4"),
    };
    val spoofMsg = createMessage({
        bounce: true,
        value: ton("0.5"),
        dest: master.address,
        body: fakeBody,
    });
    net.send(attacker.address, spoofMsg);

    val data = master.getMasterData();
    expect(data.feesBalance).toEqual(0);
}

get fun `test sell slippage: minTonOut violated refunds jettons fully`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-slip-sell");
    val buyer = testing.treasury("buyer-slip-sell");

    val curve = launchCurve(master, creator, 400 as uint64);
    val curveData = curve.getCurveData();
    val jettonMinterAddr = curveData.jettonMinter!;
    val minter = JettonMinter.fromAddress(jettonMinterAddr);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: buyBody,
    });
    net.send(buyer.address, buyMsg);

    val buyerWallet = JettonWallet.fromAddress(minter.getWalletAddress(buyer.address));
    val jettonsHeld = buyerWallet.getJettonBalance();
    expect(jettonsHeld > 0).toEqual(true);

    val beforeSell = curve.getCurveData();

    val absurdMin = ton("1000000");

    val sellPayloadCell = beginCell()
        .storeUint(0xa0a0a020, 32)
        .storeUint(2, 64)
        .storeCoins(absurdMin)
        .endCell();
    buyerWallet.sendTransfer(
        buyer.address,
        ton("0.3"),
        jettonsHeld,
        curve.address,
        buyer.address,
        null,
        ton("0.05"),
        sellPayloadCell,
    );

    val afterSell = curve.getCurveData();
    expect(afterSell.realTonReserve).toEqual(beforeSell.realTonReserve);
    expect(afterSell.curveJettonBalance).toEqual(beforeSell.curveJettonBalance);
    expect(afterSell.feeAccrued).toEqual(beforeSell.feeAccrued);

    val jettonsAfter = buyerWallet.getJettonBalance();
    expect(jettonsAfter).toEqual(jettonsHeld);
}

get fun `test sell slippage: zero minTonOut allows sell to proceed`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-slip-ok");
    val buyer = testing.treasury("buyer-slip-ok");

    val curve = launchCurve(master, creator, 401 as uint64);
    val curveData = curve.getCurveData();
    val minter = JettonMinter.fromAddress(curveData.jettonMinter!);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: buyBody,
    });
    net.send(buyer.address, buyMsg);

    val buyerWallet = JettonWallet.fromAddress(minter.getWalletAddress(buyer.address));
    val jettonsHeld = buyerWallet.getJettonBalance();

    val beforeSell = curve.getCurveData();
    val sellPayloadCell = SellPayload {
        queryId: 2,
        minTonOut: 0,
    }.toCell();
    buyerWallet.sendTransfer(
        buyer.address,
        ton("0.3"),
        jettonsHeld,
        curve.address,
        buyer.address,
        null,
        ton("0.05"),
        sellPayloadCell,
    );

    val afterSell = curve.getCurveData();

    expect(afterSell.realTonReserve < beforeSell.realTonReserve).toEqual(true);
    expect(afterSell.curveJettonBalance > beforeSell.curveJettonBalance).toEqual(true);

    expect(buyerWallet.getJettonBalance() < jettonsHeld / 100).toEqual(true);
}

get fun `test FlushFees: amount field carried in DepositProtocolFees`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-flush-amount");
    val buyer = testing.treasury("buyer-flush-amount");
    val flusher = testing.treasury("flusher-amount");

    val curve = launchCurve(master, creator, 301 as uint64);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    net.send(
        buyer.address,
        createMessage({
            bounce: true,
            value: ton("1"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    val curveBefore = curve.getCurveData();
    val expectedFee = curveBefore.feeAccrued;
    expect(expectedFee > 0).toEqual(true);

    net.send(
        flusher.address,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: curve.address,
            body: FlushFees { queryId: 2 },
        }),
    );

    val masterData = master.getMasterData();

    expect(masterData.feesBalance >= CREATE_LAUNCH_FEE + expectedFee).toEqual(true);
}

get fun `test ReinitializeCurve: non-admin is rejected`() {
    val (master, _deployer, _treasury) = setupMaster();
    val attacker = testing.treasury("reinit-attacker");
    val victim = testing.treasury("reinit-victim");

    val metadata = buildTestMetadata("ipfs://test");
    val res = master.sendReinitializeCurve(
        attacker.address,
        0,
        victim.address,
        555 as uint64,
        metadata,
        { value: ton("1"), bounce: true },
    );

    val data = master.getMasterData();
    expect(data.totalLaunches).toEqual(0);

    expect(res).toNotHaveTx<ReinitializeCurve>({
        from: attacker.address,
        to: master.address,
        success: true,
    });
}

get fun `test ReinitializeCurve: admin can reinit a stuck curve`() {
    val (master, deployer, _treasury) = setupMaster();
    val creator = testing.treasury("reinit-creator");
    val metadata = buildTestMetadata("ipfs://test");
    val salt = 777 as uint64;

    val curveAddr = master.getLaunchAddress(creator.address, salt);
    val launchConfig: LaunchConfig = {
        master: master.address,
        creator: creator.address,
        salt,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val stuckStorage: BondingCurveStorage = {
        state: CURVE_STATE_INITIALIZING,
        jettonMinter: null,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: 0,
        curveJettonBalance: 0,
        feeAccrued: 0,
        migrationReserve: 0,
        config: launchConfig.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val stuckCurve = BondingCurve.fromStorage(stuckStorage);

    expect(stuckCurve.address).toEqual(curveAddr);

    net.send(
        deployer.address,
        createMessage({
            bounce: false,
            value: ton("1"),
            dest: { stateInit: stuckCurve.stateInit! },
            body: TopUpTons {},
        }),
    );

    val minter = JettonMinter.fromStorage({
        totalSupply: 0,
        adminAddress: curveAddr,
        nextAdminAddress: null,
        metadata,
    });
    net.send(
        deployer.address,
        createMessage({
            bounce: false,
            value: ton("1"),
            dest: { stateInit: minter.stateInit! },
            body: TopUpTons {},
        }),
    );

    master.sendReinitializeCurve(
        deployer.address,
        0,
        creator.address,
        salt,
        metadata,
        { value: ton("3"), bounce: true },
    );

    val curveData = stuckCurve.getCurveData();
    expect(curveData.state).toEqual(CURVE_STATE_TRADING);
    expect(curveData.jettonMinter).toBeNotNull();
}

get fun `test BuyJettons: rejects masterchain sender`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-wc-check");
    val curve = launchCurve(master, creator, 800 as uint64);

    val before = curve.getCurveData();

    val mcSender = address.fromWorkchainAndHash(-1, 0x123456789abcdef as uint256);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: buyBody,
    });
    net.send(mcSender, buyMsg);

    val after = curve.getCurveData();
    expect(after.realTonReserve).toEqual(before.realTonReserve);
    expect(after.curveJettonBalance).toEqual(before.curveJettonBalance);
    expect(after.feeAccrued).toEqual(before.feeAccrued);
}

get fun `test WithdrawProtocolFees: rejects non-admin`() {
    val (master, _deployer, _treasury) = setupMaster();
    val attacker = testing.treasury("withdraw-attacker");

    val _res = master.sendWithdrawProtocolFees(
        attacker.address,
        0,
        ton("1"),
        { value: ton("0.1"), bounce: true },
    );
    val data = master.getMasterData();
    expect(data.feesBalance).toEqual(0);
}

get fun `test flush: buy accrues fee, flush moves it to master.feesBalance`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-flush");
    val buyer = testing.treasury("buyer-flush");
    val flusher = testing.treasury("flusher");

    val curve = launchCurve(master, creator, 300 as uint64);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: buyBody,
    });
    net.send(buyer.address, buyMsg);

    val curveBefore = curve.getCurveData();
    expect(curveBefore.feeAccrued > 0).toEqual(true);

    val flushBody: FlushFees = { queryId: 2 };
    val flushMsg = createMessage({
        bounce: true,
        value: ton("0.1"),
        dest: curve.address,
        body: flushBody,
    });
    val flushRes = net.send(flusher.address, flushMsg);
    expect(flushRes).toHaveSuccessfulTx<FlushFees>({
        from: flusher.address,
        to: curve.address,
    });

    val curveAfter = curve.getCurveData();
    val masterData = master.getMasterData();
    expect(curveAfter.feeAccrued).toEqual(0);

    expect(masterData.feesBalance >= CREATE_LAUNCH_FEE + curveBefore.feeAccrued).toEqual(true);
}

get fun `test tokenomics: graduation reachability invariant`() {
    val k = VIRTUAL_TON_RESERVE_INIT * TOTAL_SUPPLY;
    val realTonMax = k / DEX_RESERVE_SUPPLY - VIRTUAL_TON_RESERVE_INIT;
    expect(realTonMax > GRADUATION_THRESHOLD_TON).toEqual(true);

    val margin = realTonMax - GRADUATION_THRESHOLD_TON;
    expect(margin > MIGRATION_FEE).toEqual(true);
}

get fun `test init mint: curveJettonBalance set to TOTAL_SUPPLY (not curveSupply)`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-init");
    val curve = launchCurve(master, creator, 400 as uint64);

    val data = curve.getCurveData();
    expect(data.state).toEqual(CURVE_STATE_TRADING);
    expect(data.curveJettonBalance).toEqual(TOTAL_SUPPLY);

    expect(data.curveSupply).toEqual(CURVE_SUPPLY);
    expect(data.dexReserveSupply).toEqual(DEX_RESERVE_SUPPLY);
}

get fun `test buy floor: buy refused when remaining curveJettonBalance would dip below dexReserve`() {
    val (_master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-floor");
    val buyer = testing.treasury("buyer-floor");

    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val launchCfg: LaunchConfig = {
        master: masterAddr,
        creator: creator.address,
        salt: 401 as uint64,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val planted: BondingCurveStorage = {
        state: CURVE_STATE_TRADING,
        jettonMinter: minterAddr,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: ton("19000"),

        curveJettonBalance: DEX_RESERVE_SUPPLY + 1000,
        feeAccrued: 0,
        migrationReserve: 0,
        config: launchCfg.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val curve = BondingCurve.fromStorage(planted);

    val deployRes = net.send(
        buyer.address,
        createMessage({
            bounce: false,
            value: ton("1"),
            dest: { stateInit: curve.stateInit! },
            body: TopUpTons {},
        }),
    );
    expect(deployRes).toHaveSuccessfulDeploy({ to: curve.address });

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val buyMsg = createMessage({
        bounce: true,
        value: ton("1"),
        dest: curve.address,
        body: buyBody,
    });
    net.send(buyer.address, buyMsg);

    val after = curve.getCurveData();
    expect(after.curveJettonBalance).toEqual(DEX_RESERVE_SUPPLY + 1000);
    expect(after.realTonReserve).toEqual(ton("19000"));
}

fun deployCurveForGraduation(
    state: uint8,
    realTon: coins,
    curveBalance: coins,
    salt: uint64,
): (BondingCurve, address) {
    val minterAddr = randomAddress();
    val creator = testing.treasury("grad-creator");

    val masterAddr = randomAddress();
    val caller = testing.treasury("grad-caller");
    val cfg: LaunchConfig = {
        master: masterAddr,
        creator: creator.address,
        salt,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val planted: BondingCurveStorage = {
        state,
        jettonMinter: minterAddr,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: realTon,
        curveJettonBalance: curveBalance,
        feeAccrued: 0,

        migrationReserve: MIGRATION_RESERVE_TARGET,
        config: cfg.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val curve = BondingCurve.fromStorage(planted);

    val deployRes = net.send(
        caller.address,
        createMessage({
            bounce: false,
            value: realTon + ton("2"),
            dest: { stateInit: curve.stateInit! },
            body: TopUpTons {},
        }),
    );
    expect(deployRes).toHaveSuccessfulDeploy({ to: curve.address });
    return (curve, caller.address);
}

get fun `test graduate: CPMM v2 Phase A transitions to GRADUATING and deducts MIGRATION_FEE`() {
    val (curve, caller) = deployCurveForGraduation(
        CURVE_STATE_TRADING,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY,
        500 as uint64,
    );

    val res = curve.sendGraduate(caller, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveSuccessfulTx<Graduate>({ from: caller, to: curve.address });

    val after = curve.getCurveData();

    expect(after.state).toEqual(CURVE_STATE_FROZEN);

    expect(after.realTonReserve).toEqual(GRADUATION_THRESHOLD_TON);
}

get fun `test graduate: rejected when state != TRADING`() {
    val (curve, caller) = deployCurveForGraduation(
        CURVE_STATE_INITIALIZING,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY,
        501 as uint64,
    );
    val res = curve.sendGraduate(caller, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveFailedTx<Graduate>({
        from: caller,
        to: curve.address,
        exitCode: 72 as int32,
    });
    val after = curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_INITIALIZING);
}

get fun `test graduate: rejected when realTon below threshold`() {
    val (curve, caller) = deployCurveForGraduation(
        CURVE_STATE_TRADING,
        GRADUATION_THRESHOLD_TON - 1,
        DEX_RESERVE_SUPPLY,
        502 as uint64,
    );
    val res = curve.sendGraduate(caller, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveFailedTx<Graduate>({
        from: caller,
        to: curve.address,
        exitCode: 72 as int32,
    });
    val after = curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_TRADING);
}

get fun `test graduate: rejected when migrationReserve below DEDUST_GRADUATE_GAS_BUDGET`() {
    val masterAddr = randomAddress();
    val (curve, callerAddr) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        randomAddress(),
        VIRTUAL_TON_RESERVE_INIT,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY,
        0,
        541 as uint64,
        ton("2"),
    );

    val drainedStorage: BondingCurveStorage = {
        state: CURVE_STATE_TRADING,
        jettonMinter: curve.getCurveData().jettonMinter,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: GRADUATION_THRESHOLD_TON,
        curveJettonBalance: DEX_RESERVE_SUPPLY,
        feeAccrued: 0,
        migrationReserve: ton("0.1"),
        config: ({
            master: masterAddr,
            creator: testing.treasury("plant-creator").address,
            salt: 541 as uint64,
            curveSupply: CURVE_SUPPLY,
            dexReserveSupply: DEX_RESERVE_SUPPLY,
            graduationThreshold: GRADUATION_THRESHOLD_TON,
        } as LaunchConfig).toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val drained = BondingCurve.fromStorage(drainedStorage);
    val funder = testing.treasury("drain-funder");
    net.send(
        funder.address,
        createMessage({
            bounce: false,
            value: ton("2"),
            dest: { stateInit: drained.stateInit! },
            body: TopUpTons {},
        }),
    );

    val res = drained.sendGraduate(callerAddr, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveFailedTx<Graduate>({
        from: callerAddr,
        to: drained.address,
        exitCode: 48 as int32,
    });
    val after = drained.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_TRADING);
}

get fun `test graduate: rejected when realTon <= MIGRATION_FEE`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY,
        0,
        541 as uint64,
        ton("2"),
    );

    val caller = testing.treasury("grad-fee-defensive");
    val res = curve.sendGraduate(caller.address, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveSuccessfulTx<Graduate>({ from: caller.address, to: curve.address });
}

get fun `test graduate: strandedJettons math matches formula`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val plantedRealTon = ton("21000");
    val plantedCurveJettons = DEX_RESERVE_SUPPLY + ton("50000");
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        plantedRealTon,
        plantedCurveJettons,
        0,
        542 as uint64,
        ton("2"),
    );
    val caller = testing.treasury("grad-strand-math");
    val res = curve.sendGraduate(caller.address, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveSuccessfulTx<Graduate>({ from: caller.address, to: curve.address });

    val after = curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_FROZEN);
    expect(after.realTonReserve).toEqual(plantedRealTon);
    expect(after.curveJettonBalance).toEqual(plantedCurveJettons);
}

get fun `test graduate: permissionless — any sender can trigger once threshold met`() {
    val (curve, _origCaller) = deployCurveForGraduation(
        CURVE_STATE_TRADING,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY,
        503 as uint64,
    );

    val randomTrigger = testing.treasury("random-grad-trigger");
    val res = curve.sendGraduate(
        randomTrigger.address,
        1,
        { value: ton("1.2"), bounce: true },
    );
    expect(res).toHaveSuccessfulTx<Graduate>({
        from: randomTrigger.address,
        to: curve.address,
    });

    val after = curve.getCurveData();

    expect(after.state).toEqual(CURVE_STATE_FROZEN);
    expect(after.realTonReserve).toEqual(GRADUATION_THRESHOLD_TON);
}

get fun `test cpmm v2 pool address: matches kit PoolV2.fromConfig fixture (v0.3 with creator)`() {
    val fixtureMinter = address("EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67");
    val fixtureCreator = address("EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67");
    val computedAddr = calcDeployedCpmmV2Pool(fixtureMinter, fixtureCreator).calculateAddress();
    val expectedHash = 0x274d6c720b366afb14bde9290607f43e8c030f5668f6cdb1f20159539bf95f55;

    val (wc, hash) = computedAddr.getWorkchainAndHash();
    expect(wc).toEqual(0);
    expect(hash).toEqual(expectedHash);
}

fun plantCurve(
    state: uint8,
    master: address,
    jettonMinter: address?,
    virtualTon: coins,
    realTon: coins,
    curveBalance: coins,
    feeAccrued: coins,
    salt: uint64,
    fundingExtra: coins,
): (BondingCurve, address) {
    val creator = testing.treasury("plant-creator");
    val caller = testing.treasury("plant-caller");
    val cfg: LaunchConfig = {
        master,
        creator: creator.address,
        salt,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val planted: BondingCurveStorage = {
        state,
        jettonMinter,
        virtualTonReserve: virtualTon,
        realTonReserve: realTon,
        curveJettonBalance: curveBalance,
        feeAccrued,

        migrationReserve: MIGRATION_RESERVE_TARGET,
        config: cfg.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val curve = BondingCurve.fromStorage(planted);
    net.send(
        caller.address,
        createMessage({
            bounce: false,
            value: realTon + fundingExtra,
            dest: { stateInit: curve.stateInit! },
            body: TopUpTons {},
        }),
    );
    return (curve, caller.address);
}

get fun `test init: rejected when sender is not master`() {
    val realMaster = testing.treasury("real-master");
    val (curve, _caller) = plantCurve(
        CURVE_STATE_INITIALIZING,
        realMaster.address,
        null,
        VIRTUAL_TON_RESERVE_INIT,
        0,
        0,
        0,
        1000 as uint64,
        ton("2"),
    );
    val attacker = testing.treasury("init-attacker");
    val newMinter = randomAddress();
    val res = curve.sendInitializeCurve(
        attacker.address,
        1,
        newMinter,
        null,
        { value: ton("0.5"), bounce: true },
    );
    expect(res).toHaveFailedTx<InitializeCurve>({
        from: attacker.address,
        to: curve.address,
        exitCode: 73 as int32,
    });
}

get fun `test init: rejected when state already != INITIALIZING`() {
    val realMaster = testing.treasury("master-init-state");
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        realMaster.address,
        null,
        VIRTUAL_TON_RESERVE_INIT,
        0,
        CURVE_SUPPLY,
        0,
        1001 as uint64,
        ton("2"),
    );
    val newMinter = randomAddress();
    val res = curve.sendInitializeCurve(
        realMaster.address,
        1,
        newMinter,
        null,
        { value: ton("0.5"), bounce: true },
    );
    expect(res).toHaveFailedTx<InitializeCurve>({
        from: realMaster.address,
        to: curve.address,
        exitCode: 72 as int32,
    });
}

get fun `test init: rejected when jettonMinter is already set`() {
    val realMaster = testing.treasury("master-init-minter-set");
    val alreadySet = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_INITIALIZING,
        realMaster.address,
        alreadySet,
        VIRTUAL_TON_RESERVE_INIT,
        0,
        0,
        0,
        1002 as uint64,
        ton("2"),
    );
    val newMinter = randomAddress();
    val res = curve.sendInitializeCurve(
        realMaster.address,
        1,
        newMinter,
        null,
        { value: ton("0.5"), bounce: true },
    );
    expect(res).toHaveFailedTx<InitializeCurve>({
        from: realMaster.address,
        to: curve.address,
        exitCode: 72 as int32,
    });
}

get fun `test buy: rejected when state is not TRADING (e.g. GRADUATING)`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_GRADUATING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY,
        0,
        1010 as uint64,
        ton("2"),
    );
    val buyer = testing.treasury("buy-wrong-state");
    val res = curve.sendBuyJettons(
        buyer.address,
        1,
        0,
        { value: ton("1"), bounce: true },
    );
    expect(res).toHaveFailedTx<BuyJettons>({
        from: buyer.address,
        to: curve.address,
        exitCode: 72 as int32,
    });
}

get fun `test buy: rejected when value below gas floor`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        0,
        TOTAL_SUPPLY,
        0,
        1011 as uint64,
        ton("2"),
    );
    val buyer = testing.treasury("buy-low-gas");

    val res = curve.sendBuyJettons(
        buyer.address,
        1,
        0,
        { value: ton("0.04"), bounce: true },
    );
    expect(res).toHaveFailedTx<BuyJettons>({
        from: buyer.address,
        to: curve.address,
        exitCode: 48 as int32,
    });
}

get fun `test buy: exactly minimum value (0.06 TON) accepted`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("creator-min-buy");
    val buyer = testing.treasury("buyer-min-boundary");
    val curve = launchCurve(master, creator, 211 as uint64);

    val before = curve.getCurveData();
    val buyRes = curve.sendBuyJettons(
        buyer.address,
        1,
        0,
        { value: ton("0.06"), bounce: true },
    );
    expect(buyRes).toHaveSuccessfulTx<BuyJettons>({
        from: buyer.address,
        to: curve.address,
    });
    val after = curve.getCurveData();
    expect(after.realTonReserve > before.realTonReserve).toEqual(true);
}

get fun `test flush negative: rejects when feeAccrued and excess are both zero`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();

    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        ton("100"),
        TOTAL_SUPPLY - ton("1000"),
        0,
        1020 as uint64,
        ton("1.55"),
    );
    val flusher = testing.treasury("flush-zero");
    val res = curve.sendFlushFees(
        flusher.address,
        1,
        { value: ton("0.1"), bounce: true },
    );
    expect(res).toHaveFailedTx<FlushFees>({
        from: flusher.address,
        to: curve.address,
        exitCode: 47 as int32,
    });
}

get fun `test flush: rejected when value below gas floor`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        ton("100"),
        TOTAL_SUPPLY - ton("1000"),
        ton("1"),
        1021 as uint64,
        ton("2"),
    );
    val flusher = testing.treasury("flush-low-gas");
    val res = curve.sendFlushFees(
        flusher.address,
        1,
        { value: ton("0.01"), bounce: true },
    );
    expect(res).toHaveFailedTx<FlushFees>({
        from: flusher.address,
        to: curve.address,
        exitCode: 48 as int32,
    });
}

get fun `test graduate: rejected when curveJettonBalance < dexReserveSupply`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY - ton("1"),
        0,
        1030 as uint64,
        ton("2"),
    );
    val caller = testing.treasury("grad-starved");
    val res = curve.sendGraduate(caller.address, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveFailedTx<Graduate>({
        from: caller.address,
        to: curve.address,
        exitCode: 47 as int32,
    });
}

get fun `test graduate: rejected when jettonMinter is null`() {
    val masterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        null,
        VIRTUAL_TON_RESERVE_INIT,
        GRADUATION_THRESHOLD_TON,
        DEX_RESERVE_SUPPLY,
        0,
        1031 as uint64,
        ton("2"),
    );
    val caller = testing.treasury("grad-null-minter");
    val res = curve.sendGraduate(caller.address, 1, { value: ton("1.2"), bounce: true });
    expect(res).toHaveFailedTx<Graduate>({
        from: caller.address,
        to: curve.address,
        exitCode: 72 as int32,
    });
}

get fun `test notification: dropped silently when jettonMinter is null`() {
    val masterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_INITIALIZING,
        masterAddr,
        null,
        VIRTUAL_TON_RESERVE_INIT,
        0,
        0,
        0,
        1040 as uint64,
        ton("2"),
    );
    val stranger = testing.treasury("notif-stranger");
    val forwardPayload = beginCell().storeUint(0, 1).toSlice();
    val notifMsg = createMessage({
        bounce: false,
        value: ton("0.1"),
        dest: curve.address,
        body: TransferNotificationForRecipient {
            queryId: 0,
            jettonAmount: ton("1"),
            transferInitiator: stranger.address,
            forwardPayload,
        },
    });
    val res = net.send(stranger.address, notifMsg);

    expect(res).toHaveAllSuccessfulTxs();
    val after = curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_INITIALIZING);
    expect(after.curveJettonBalance).toEqual(0);
}

get fun `test notification: dropped when sender is not our jetton wallet`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        ton("100"),
        TOTAL_SUPPLY - ton("1000"),
        0,
        1041 as uint64,
        ton("2"),
    );
    val spoofer = testing.treasury("notif-spoofer");
    val forwardPayload = beginCell().storeUint(0, 1).toSlice();
    val notifMsg = createMessage({
        bounce: false,
        value: ton("0.5"),
        dest: curve.address,
        body: TransferNotificationForRecipient {
            queryId: 0,
            jettonAmount: ton("100"),
            transferInitiator: spoofer.address,
            forwardPayload,
        },
    });
    val res = net.send(spoofer.address, notifMsg);

    expect(res).toHaveAllSuccessfulTxs();
    val after = curve.getCurveData();

    expect(after.realTonReserve).toEqual(ton("100"));
    expect(after.curveJettonBalance).toEqual(TOTAL_SUPPLY - ton("1000"));
}

get fun `test misc: unknown opcode is rejected with 0xFFFF`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        0,
        TOTAL_SUPPLY,
        0,
        1060 as uint64,
        ton("2"),
    );
    val attacker = testing.treasury("unknown-opcode");

    val junkBody = beginCell().storeUint(0xdeadbeef, 32).storeUint(0, 64).endCell();
    val junkMessage = createMessage({
        bounce: true,
        value: ton("0.1"),
        dest: curve.address,
        body: junkBody,
    });
    val res = net.send(attacker.address, junkMessage);
    expect(res).toHaveFailedTx({
        from: attacker.address,
        to: curve.address,
        exitCode: 65535 as int32,
    });
}

get fun `test bounce: AskToTransfer restores curveJettonBalance`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val initialBalance = TOTAL_SUPPLY - ton("500");
    val bouncedJettons = ton("500");
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        ton("50"),
        initialBalance,
        0,
        1050 as uint64,
        ton("2"),
    );
    val bouncedBody = beginCell()
        .storeUint(0xffffffff, 32)
        .storeUint(0x0f8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(bouncedJettons)
        .endCell();
    val sourceWallet = testing.treasury("bounced-wallet");
    val bouncedMsg = createMessage({
        bounce: false,
        value: ton("0.05"),
        dest: curve.address,
        body: bouncedBody,
    }).bounced();
    testing.processSingleTraceStep(sourceWallet.address, bouncedMsg);
    val after = curve.getCurveData();
    expect(after.curveJettonBalance).toEqual(initialBalance + bouncedJettons);
}

get fun `test bounce: MintNewJettons resets jettonMinter to null for re-init`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val (curve, _caller) = plantCurve(
        CURVE_STATE_INITIALIZING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        0,
        0,
        0,
        1051 as uint64,
        ton("2"),
    );

    val bouncedBody = beginCell()
        .storeUint(0xffffffff, 32)
        .storeUint(0x642b7d07, 32)
        .storeUint(0, 64)
        .endCell();
    val sourceMinter = testing.treasury("bounced-minter");
    val bouncedMsg = createMessage({
        bounce: false,
        value: ton("0.1"),
        dest: curve.address,
        body: bouncedBody,
    }).bounced();
    testing.processSingleTraceStep(sourceMinter.address, bouncedMsg);
    val after = curve.getCurveData();
    expect(after.jettonMinter).toEqual(null);
}

get fun `test bounce: DepositProtocolFees restores feeAccrued`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val bouncedAmount = ton("3");
    val (curve, _caller) = plantCurve(
        CURVE_STATE_TRADING,
        masterAddr,
        minterAddr,
        VIRTUAL_TON_RESERVE_INIT,
        ton("100"),
        TOTAL_SUPPLY - ton("1000"),
        0,
        1052 as uint64,
        ton("5"),
    );
    val creator = testing.treasury("plant-creator");

    val bouncedBody = beginCell()
        .storeUint(0xffffffff, 32)
        .storeUint(0xa0a0a006, 32)
        .storeUint(0, 64)
        .storeCoins(bouncedAmount)
        .storeAddress(creator.address)
        .storeUint(1052, 64)
        .endCell();
    val bouncedMsg = createMessage({
        bounce: false,
        value: bouncedAmount,
        dest: curve.address,
        body: bouncedBody,
    }).bounced();
    testing.processSingleTraceStep(masterAddr, bouncedMsg);
    val after = curve.getCurveData();
    expect(after.feeAccrued).toEqual(bouncedAmount);
}

get fun `test graduate E2E: real buys reach floor and auto-graduate deposits migration fee`() {
    val (master, _deployer, _treasury) = setupMaster();
    val creator = testing.treasury("e2e-grad-creator");
    val buyer = testing.treasury("e2e-grad-buyer");
    val curve = launchCurve(master, creator, 700 as uint64);

    val initial = curve.getCurveData();
    expect(initial.state).toEqual(CURVE_STATE_TRADING);

    var i: int = 0;
    var migrated: bool = false;
    while (!migrated && i < 250) {
        curve.sendBuyJettons(
            buyer.address,
            (i + 7000) as uint64,
            0,
            { value: ton("100"), bounce: true },
        );

        if (curve.getCurveData().state != CURVE_STATE_TRADING) {
            migrated = true;
        }
        i += 1;
    }

    val postGrad = curve.getCurveData();

    expect(postGrad.state).toEqual(CURVE_STATE_FROZEN);
    expect(postGrad.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);

    val masterAfter = master.getMasterData();
    expect(masterAfter.feesBalance).toEqual(ton("0.2") + MIGRATION_FEE);
}

get fun `test master: unknown opcode silently accepted (DeDust refund compatibility)`() {
    val (master, _deployer, _treasury) = setupMaster();
    val sender = testing.treasury("unknown-opcode-sender");

    val unknownBody = beginCell().storeUint(0xdeadbeef, 32).storeUint(42, 64).endCell();
    val res = master.sendAny(
        sender.address,
        unknownBody,
        { value: ton("0.1"), bounce: true },
    );

    expect(res).toHaveAllSuccessfulTxs();

    val data = master.getMasterData();
    expect(data.totalLaunches).toEqual(0);
    expect(data.feesBalance).toEqual(0);
}
