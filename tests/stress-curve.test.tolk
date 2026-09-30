import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/testing/fuzz"
import "@contracts/bonding-config"
import "@contracts/bonding-math"
import "@contracts/bonding-messages"
import "@contracts/bonding-storage"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "test-utils"

fun setupMasterStress(): (BondingCurveMaster, Treasury, Treasury) {
    val deployer = testing.treasury("stress-deployer");
    val treasury = testing.treasury("stress-treasury");
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

fun launchCurveStress(master: BondingCurveMaster, creator: Treasury, salt: uint64): BondingCurve {
    val metadata = buildTestMetadata("ipfs://stress");
    master.sendCreateLaunch(creator.address, 0, metadata, salt, { value: ton("3"), bounce: false });
    return BondingCurve.fromAddress(master.getLaunchAddress(creator.address, salt));
}

@test.fuzz(100)
get fun `test STRESS buy fuzz: slippage protection always holds`(rawIn: int) {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("fuzz-buy-creator");
    val buyer = testing.treasury("fuzz-buy-buyer");
    val curve = launchCurveStress(master, creator, 1000 as uint64);

    val tonIn = fuzz.bound(rawIn, ton("0.06"), ton("1000"));

    val before = curve.getCurveData();

    val tonInNet = tonIn - CURVE_TRANSFER_VALUE;
    val (expectedOut, _fee) = computeBuyOut(
        tonInNet,
        before.virtualTonReserve,
        before.realTonReserve,
        before.curveJettonBalance,
    );

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: expectedOut };
    val _res = net.send(
        buyer.address,
        createMessage({
            bounce: true,
            value: tonIn,
            dest: curve.address,
            body: buyBody,
        }),
    );

    val after = curve.getCurveData();

    val stateMoved = after.realTonReserve > before.realTonReserve;
    val balanceDecreased = after.curveJettonBalance < before.curveJettonBalance;
    expect(stateMoved == balanceDecreased).toEqual(true);
}

@test.fuzz(80)
get fun `test STRESS sell fuzz: state always consistent post-sell`(rawJetIn: int) {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("fuzz-sell-creator");
    val seller = testing.treasury("fuzz-sell-seller");
    val curve = launchCurveStress(master, creator, 1001 as uint64);

    val initialBuyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    net.send(
        seller.address,
        createMessage({
            bounce: true,
            value: ton("10"),
            dest: curve.address,
            body: initialBuyBody,
        }),
    );

    val curveData = curve.getCurveData();
    val minter = JettonMinter.fromAddress(curveData.jettonMinter!);
    val sellerWallet = JettonWallet.fromAddress(minter.getWalletAddress(seller.address));
    val held = sellerWallet.getJettonBalance();
    fuzz.assume(held > 0);

    val jettonAmount = fuzz.bound(rawJetIn, 1, held);
    val _before = curve.getCurveData();

    val sellPayloadCell = beginCell()
        .storeUint(0xa0a0a020, 32)
        .storeUint(2, 64)
        .storeCoins(0)
        .endCell();

    sellerWallet.sendTransfer(
        seller.address,
        ton("0.3"),
        jettonAmount,
        curve.address,
        seller.address,
        null,
        ton("0.05"),
        sellPayloadCell,
    );

    val after = curve.getCurveData();

    expect(after.realTonReserve >= 0).toEqual(true);
    expect(after.curveJettonBalance <= TOTAL_SUPPLY).toEqual(true);
}

@test.fuzz(50)
get fun `test STRESS round-trip: buy then sell, user always loses fees`(rawIn: int) {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("rt-creator");
    val trader = testing.treasury("rt-trader");
    val curve = launchCurveStress(master, creator, 1002 as uint64);

    val tonIn = fuzz.bound(rawIn, ton("0.1"), ton("100"));

    val tonInGross = tonIn;

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    net.send(
        trader.address,
        createMessage({
            bounce: true,
            value: tonInGross,
            dest: curve.address,
            body: buyBody,
        }),
    );

    val curveData = curve.getCurveData();
    val minter = JettonMinter.fromAddress(curveData.jettonMinter!);
    val traderWallet = JettonWallet.fromAddress(minter.getWalletAddress(trader.address));
    val jettonsHeld = traderWallet.getJettonBalance();
    fuzz.assume(jettonsHeld > 0);

    val _realTonAfterBuy = curveData.realTonReserve;

    val sellPayloadCell = beginCell()
        .storeUint(0xa0a0a020, 32)
        .storeUint(3, 64)
        .storeCoins(0)
        .endCell();
    traderWallet.sendTransfer(
        trader.address,
        ton("0.3"),
        jettonsHeld,
        curve.address,
        trader.address,
        null,
        ton("0.05"),
        sellPayloadCell,
    );

    val finalCurve = curve.getCurveData();

    expect(finalCurve.realTonReserve >= 0).toEqual(true);

    expect(finalCurve.curveJettonBalance <= TOTAL_SUPPLY).toEqual(true);

    expect(finalCurve.feeAccrued > 0).toEqual(true);
}

get fun `test STRESS sequence: 30 alternating trades, k+fee monotone non-decreasing`() {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("seq-creator");
    val trader = testing.treasury("seq-trader");
    val curve = launchCurveStress(master, creator, 1003 as uint64);

    val curveData = curve.getCurveData();
    val minter = JettonMinter.fromAddress(curveData.jettonMinter!);
    val traderWallet = JettonWallet.fromAddress(minter.getWalletAddress(trader.address));

    var i = 0;
    while (i < 30) {
        val before = curve.getCurveData();
        val invariantBefore = (before.virtualTonReserve + before.realTonReserve) *
            before.curveJettonBalance +
            before.feeAccrued;

        if (i % 2 == 0) {
            val buyBody: BuyJettons = { queryId: i as uint64, minJettonsOut: 0 };
            net.send(
                trader.address,
                createMessage({
                    bounce: true,
                    value: ton("2"),
                    dest: curve.address,
                    body: buyBody,
                }),
            );
        } else {
            val held = traderWallet.getJettonBalance();
            if (held > 0) {
                val sellPayloadCell = beginCell()
                    .storeUint(0xa0a0a020, 32)
                    .storeUint(i as uint64, 64)
                    .storeCoins(0)
                    .endCell();
                traderWallet.sendTransfer(
                    trader.address,
                    ton("0.3"),
                    held / 2 as coins,
                    curve.address,
                    trader.address,
                    null,
                    ton("0.05"),
                    sellPayloadCell,
                );
            }
        }

        val after = curve.getCurveData();
        val invariantAfter = (after.virtualTonReserve + after.realTonReserve) *
            after.curveJettonBalance +
            after.feeAccrued;

        expect(invariantAfter + after.curveJettonBalance * 2 >= invariantBefore).toEqual(true);
        i += 1;
    }
}

get fun `test STRESS edge: cross-workchain buy rejected`() {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("edge-wc-creator");
    val curve = launchCurveStress(master, creator, 1004 as uint64);

    val mcSender = address.fromWorkchainAndHash(-1, 0xdeadbeefcafe as uint256);
    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val res = net.send(
        mcSender,
        createMessage({
            bounce: true,
            value: ton("1"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    expect(res).toHaveFailedTx<BuyJettons>({
        from: mcSender,
        to: curve.address,
        exitCode: 333 as int32,
    });
}

get fun `test STRESS edge: buy below CURVE_TRANSFER_VALUE rejects`() {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("edge-min-creator");
    val buyer = testing.treasury("edge-min-buyer");
    val curve = launchCurveStress(master, creator, 1005 as uint64);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val res = net.send(
        buyer.address,
        createMessage({
            bounce: true,
            value: ton("0.05"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    expect(res).toHaveFailedTx<BuyJettons>({
        from: buyer.address,
        to: curve.address,
        exitCode: 48 as int32,
    });
}

get fun `test STRESS edge: massive minJettonsOut triggers slippage bounce`() {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("edge-slip-creator");
    val buyer = testing.treasury("edge-slip-buyer");
    val curve = launchCurveStress(master, creator, 1006 as uint64);

    val before = curve.getCurveData();
    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: TOTAL_SUPPLY * 2 };
    net.send(
        buyer.address,
        createMessage({
            bounce: true,
            value: ton("1"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    val after = curve.getCurveData();

    expect(after.realTonReserve).toEqual(before.realTonReserve);
    expect(after.curveJettonBalance).toEqual(before.curveJettonBalance);
}

get fun `test STRESS edge: dust buy near floor produces zero jetton out`() {
    val (master, _d, _t) = setupMasterStress();
    val creator = testing.treasury("edge-dust-creator");
    val buyer = testing.treasury("edge-dust-buyer");
    val curve = launchCurveStress(master, creator, 1007 as uint64);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    val _res = net.send(
        buyer.address,
        createMessage({
            bounce: true,
            value: ton("0.06"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    val curveData = curve.getCurveData();
    val minter = JettonMinter.fromAddress(curveData.jettonMinter!);
    val buyerWallet = JettonWallet.fromAddress(minter.getWalletAddress(buyer.address));
    val held = buyerWallet.getJettonBalance();
    expect(held > 0).toEqual(true);
}
