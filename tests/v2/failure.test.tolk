import "@acton/build"
import "@acton/emulation/config"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/message"
import "@acton/types/transaction"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWallet.gen"
import "@contracts/v1/jetton-utils"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"

fun failureMaster(owner: address): BondingCurveMasterV2 {
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    return master;
}

fun pendingLaunch(master: BondingCurveMasterV2, owner: address, options: LaunchOptions): TxCursor {
    return testing.createTraceIterationCursor(
        owner,
        createMessage({
            bounce: true,
            dest: master.address,
            value: options.devBuyAmount + ton("1"),
            body: CreateLaunch {
                queryId: 1,
                metadata: beginCell().endCell(),
                salt: 42,
                options: options.toCell(),
            },
        }),
    );
}

get fun `test v2: presets, slippage and gas rejected before launch`() {
    val owner = testing.treasury("invalid-owner");
    val master = failureMaster(owner.address);
    var o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("10"),
        minDevTokens: 1000000000000000000,
    };
    expect(
        master.sendCreateLaunch(
            owner.address,
            1,
            beginCell().endCell(),
            1,
            o,
            { value: ton("11"), bounce: true },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 49 });
    o.minDevTokens = 0;
    o.creatorFeeBps = 101;
    expect(
        master.sendCreateLaunch(
            owner.address,
            2,
            beginCell().endCell(),
            2,
            o,
            { value: ton("11"), bounce: true },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 49 });
    o.creatorFeeBps = 100;
    o.supply = 123;
    expect(
        master.sendCreateLaunch(
            owner.address,
            3,
            beginCell().endCell(),
            3,
            o,
            { value: ton("11"), bounce: true },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 49 });
    o.supply = 1000000000000000000;
    expect(
        master.sendCreateLaunch(
            owner.address,
            4,
            beginCell().endCell(),
            4,
            o,
            { value: ton("10"), bounce: true },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 48 });
    expect(master.getMasterData().totalLaunches).toEqual(0);
}

get fun `test v2: delayed dev receipt blocks snipers and forged confirmations`() {
    val owner = testing.treasury("pending-owner");
    val attacker = testing.treasury("pending-sniper");
    val master = failureMaster(owner.address);
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 1,
    };
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner.address, 42, o));
    val cursor = pendingLaunch(master, owner.address, o);
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    expect(master.getMasterData().feesBalance).toEqual(0);
    expect(
        curve.sendBuyJettons(attacker.address, 8, 0, { value: ton("20"), bounce: true }),
    ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 72 });
    curve.sendReturnExcessesBack(attacker.address, 2, { value: ton("0.05") });
    expect(curve.getState()).toEqual(CURVE_STATE_INITIALIZING);
    expect(
        curve.sendLaunchMintFailed(attacker.address, 2, { value: ton("0.05") }),
    ).toHaveFailedTx<LaunchMintFailed>({ to: curve.address, exitCode: 73 });
    cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val before = curve.getCurveData();
    // A duplicate mint receipt must not change supply or reserves.
    val minter = JettonMinterV2.fromAddress(before.jettonMinter!);
    curve.sendMintDelivered(
        minter.getWalletAddress(owner.address),
        2,
        curve.getLaunchProgress().devTokens,
        { value: ton("0.05") },
    );
    expect(curve.getCurveData().realTonReserve).toEqual(before.realTonReserve);
    expect(minter.getJettonData().totalSupply).toEqual(o.supply);
    expect(
        master.sendCreateLaunch(
            owner.address,
            1,
            beginCell().endCell(),
            42,
            o,
            { value: ton("101"), bounce: true },
        ),
    ).toHaveFailedTx<CreateLaunch>({ to: master.address, exitCode: 72 });
    expect(master.getMasterData().totalLaunches).toEqual(1);
}

get fun `test v2: failed mint cancels launch and refunds dev funds once`() {
    val owner = testing.treasury("failed-owner");
    val master = failureMaster(owner.address);
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 1,
    };
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner.address, 42, o));
    val cursor = pendingLaunch(master, owner.address, o);
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    val minter = curve.getCurveData().jettonMinter!;
    // Raise gas prices for the mint, then restore them before recovery.
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 1000;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    val failed = cursor.executeTill<MintNewJettons>({ to: minter });
    expect(failed).toHaveFailedTx<MintNewJettons>({ to: minter, exitCode: 48 });
    testing.setConfig(original);
    val recovery = cursor.executeAllRemaining();
    cursor.close();
    expect(curve.getState()).toEqual(CURVE_STATE_CANCELLED);
    expect(curve.getCurveData().realTonReserve).toEqual(0);
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(0);
    expect(master.getMasterData().totalLaunches).toEqual(0);
    expect(master.getMasterData().feesBalance).toEqual(0);
    expect(
        recovery,
    ).toHaveSuccessfulTx<ReturnExcessesBack>({ from: master.address, to: owner.address, value: ton("0.2") });
    val refund = recovery.findTransaction<ReturnExcessesBack>({ from: curve.address, to: owner.address });
    expect(refund != null).toEqual(true);
    val refundMessage = refund!.loadInMsg<RemainingBitsAndRefs>();
    assert (refundMessage.info is TlbInternalMessage) throw 1000;
    expect(refundMessage.info.value.grams > ton("99")).toEqual(true);
    expect(
        curve.sendBuyJettons(owner.address, 9, 0, { value: ton("10"), bounce: true }),
    ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 72 });
    curve.sendLaunchMintFailed(minter, 1, { value: ton("0.05") });
    expect(master.getMasterData().totalLaunches).toEqual(0);
}

get fun `test v2: reproduce zero-token dev receipt spoof`() {
    val owner = testing.treasury("spoof-owner");
    val attacker = testing.treasury("spoof-attacker");
    val master = failureMaster(owner.address);
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 1,
    };
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner.address, 42, o));
    val cursor = pendingLaunch(master, owner.address, o);
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val emptyWallet = calcDeployedJettonWallet(
        attacker.address,
        minter.address,
        build("JettonWalletV2"),
    );
    net.send(
        attacker.address,
        createMessage({ bounce: false, dest: emptyWallet, value: ton("0.2"), body: TopUpTons {} }),
    );
    val spoof = net.send(
        attacker.address,
        createMessage({ bounce: true, dest: emptyWallet.calculateAddress(), value: ton("0.2"), body: AskToTransfer {
                queryId: 2,
                jettonAmount: 0,
                transferRecipient: owner.address,
                sendExcessesTo: curve.address,
                customPayload: null,
                forwardTonAmount: 0,
                forwardPayload: beginCell().storeUint(0, 1).toSlice(),
            } }),
    );
    expect(
        spoof,
    ).toHaveSuccessfulTx<ReturnExcessesBack>({ to: curve.address, from: minter.getWalletAddress(
            owner.address,
        ) });
    expect(
        JettonWallet
            .fromAddress(minter.getWalletAddress(owner.address))
            .getWalletData()
            .jettonBalance,
    ).toEqual(0);
    expect(curve.getLaunchProgress().devReceived).toEqual(false);
    cursor.executeAllRemaining();
    cursor.close();
}

get fun `test v2: low gas buy leaves creator and protocol accounting unchanged`() {
    val owner = testing.treasury("gas-v2-owner");
    val master = failureMaster(owner.address);
    val o = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 200,
        devBuyAmount: 0,
        minDevTokens: 0,
    };
    master.sendCreateLaunch(
        owner.address,
        1,
        beginCell().endCell(),
        5,
        o,
        { value: ton("1") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(owner.address, 5, o));
    val before = curve.getCurveData();
    val original = testing.getConfig();
    var expensive = original;
    var prices = expensive.getGasPrices(BASECHAIN);
    var other = prices.other;
    other.gasPrice *= 100;
    prices.other = other;
    expensive.setGasPrices(prices, BASECHAIN);
    testing.setConfig(expensive);
    expect(
        curve.sendBuyJettons(owner.address, 2, 0, { value: ton("10"), bounce: true }),
    ).toHaveFailedTx<BuyJettons>({ to: curve.address, exitCode: 48 });
    testing.setConfig(original);
    val after = curve.getCurveData();
    expect(after.realTonReserve).toEqual(before.realTonReserve);
    expect(after.curveJettonBalance).toEqual(before.curveJettonBalance);
    expect(after.feeAccrued).toEqual(before.feeAccrued);
    expect(after.migrationReserve).toEqual(before.migrationReserve);
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(0);
}
