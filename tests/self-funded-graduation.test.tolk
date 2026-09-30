import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/message"
import "@contracts/bonding-config"
import "@contracts/bonding-dedust"
import "@contracts/bonding-messages"
import "@contracts/bonding-storage"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "test-utils"

fun setupMasterSf(): (BondingCurveMaster, Treasury, Treasury) {
    val deployer = testing.treasury("sf-deployer");
    val treasury = testing.treasury("sf-treasury");
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

fun launchCurveSf(master: BondingCurveMaster, creator: Treasury, salt: uint64): BondingCurve {
    val metadata = buildTestMetadata("ipfs://sf");
    master.sendCreateLaunch(creator.address, 0, metadata, salt, { value: ton("3"), bounce: false });
    return BondingCurve.fromAddress(master.getLaunchAddress(creator.address, salt));
}

get fun `test self-funded: buys divert fees to migrationReserve until cap`() {
    val (master, _d, _t) = setupMasterSf();
    val creator = testing.treasury("sf-cr-1");
    val buyer = testing.treasury("sf-buyer-1");
    val curve = launchCurveSf(master, creator, 2000 as uint64);

    val before = curve.getCurveData();
    expect(before.migrationReserve).toEqual(0);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    net.send(
        buyer.address,
        createMessage({
            bounce: true,
            value: ton("100"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    val after = curve.getCurveData();

    expect(after.migrationReserve > 0).toEqual(true);
    expect(after.migrationReserve < MIGRATION_RESERVE_TARGET).toEqual(true);
}

get fun `test self-funded: large buy caps reserve at MIGRATION_RESERVE_TARGET`() {
    val (master, _d, _t) = setupMasterSf();
    val creator = testing.treasury("sf-cr-2");
    val whale = testing.treasury("sf-whale");
    val curve = launchCurveSf(master, creator, 2001 as uint64);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    net.send(
        whale.address,
        createMessage({
            bounce: true,
            value: ton("2000"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    val after = curve.getCurveData();
    expect(after.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);
}

get fun `test self-funded: buy crossing threshold runs Phase A (v5.3)`() {
    val (master, _d, _t) = setupMasterSf();
    val creator = testing.treasury("sf-cr-3");
    val whale = testing.treasury("sf-whale-3");
    val curve = launchCurveSf(master, creator, 2002 as uint64);

    val buyBody: BuyJettons = { queryId: 1, minJettonsOut: 0 };
    net.send(
        whale.address,
        createMessage({
            bounce: true,
            value: ton("2100"),
            dest: curve.address,
            body: buyBody,
        }),
    );

    val after = curve.getCurveData();

    expect(after.state).toEqual(CURVE_STATE_FROZEN);
    expect(after.realTonReserve > 0).toEqual(true);
    expect(after.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);
    expect(after.feeAccrued > 0).toEqual(true);
}

get fun `test self-funded: buys refused after auto-graduate`() {
    val (master, _d, _t) = setupMasterSf();
    val creator = testing.treasury("sf-cr-4");
    val whale = testing.treasury("sf-whale-4");
    val secondBuyer = testing.treasury("sf-buyer2");
    val curve = launchCurveSf(master, creator, 2003 as uint64);

    net.send(
        whale.address,
        createMessage({
            bounce: true,
            value: ton("2100"),
            dest: curve.address,
            body: BuyJettons {
                queryId: 1,
                minJettonsOut: 0,
            },
        }),
    );
    expect(curve.getCurveData().state).toEqual(CURVE_STATE_FROZEN);

    val res = net.send(
        secondBuyer.address,
        createMessage({
            bounce: true,
            value: ton("10"),
            dest: curve.address,
            body: BuyJettons {
                queryId: 2,
                minJettonsOut: 0,
            },
        }),
    );
    expect(res).toHaveFailedTx<BuyJettons>({
        from: secondBuyer.address,
        to: curve.address,
        exitCode: 72 as int32,
    });
}

get fun `test self-funded: sells after auto-graduate refund jettons to seller`() {
    val (master, _d, _t) = setupMasterSf();
    val creator = testing.treasury("sf-cr-5");
    val whale = testing.treasury("sf-whale-5");
    val curve = launchCurveSf(master, creator, 2004 as uint64);

    val curveData = curve.getCurveData();
    val minter = JettonMinter.fromAddress(curveData.jettonMinter!);
    net.send(
        whale.address,
        createMessage({
            bounce: true,
            value: ton("500"),
            dest: curve.address,
            body: BuyJettons {
                queryId: 1,
                minJettonsOut: 0,
            },
        }),
    );

    net.send(
        whale.address,
        createMessage({
            bounce: true,
            value: ton("1700"),
            dest: curve.address,
            body: BuyJettons {
                queryId: 2,
                minJettonsOut: 0,
            },
        }),
    );
    expect(curve.getCurveData().state).toEqual(CURVE_STATE_FROZEN);

    val whaleWallet = JettonWallet.fromAddress(minter.getWalletAddress(whale.address));
    val heldBefore = whaleWallet.getJettonBalance();
    expect(heldBefore > 0).toEqual(true);

    val sellPayloadCell = beginCell()
        .storeUint(0xa0a0a020, 32)
        .storeUint(3, 64)
        .storeCoins(0)
        .endCell();
    whaleWallet.sendTransfer(
        whale.address,
        ton("0.3"),
        heldBefore,
        curve.address,
        whale.address,
        null,
        ton("0.05"),
        sellPayloadCell,
    );

    val heldAfter = whaleWallet.getJettonBalance();

    expect(heldAfter).toEqual(heldBefore);

    expect(curve.getCurveData().state).toEqual(CURVE_STATE_FROZEN);
}

get fun `test self-funded: Phase A bounce-recovers via FROZEN`() {
    val (master, _d, _t) = setupMasterSf();
    val creator = testing.treasury("sf-cr-6");
    val whale = testing.treasury("sf-whale-6");
    val anyKeeper = testing.treasury("sf-keeper");
    val curve = launchCurveSf(master, creator, 2005 as uint64);

    net.send(
        whale.address,
        createMessage({
            bounce: true,
            value: ton("2100"),
            dest: curve.address,
            body: BuyJettons {
                queryId: 1,
                minJettonsOut: 0,
            },
        }),
    );
    val afterBounce = curve.getCurveData();
    expect(afterBounce.state).toEqual(CURVE_STATE_FROZEN);
    expect(afterBounce.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);

    expect(afterBounce.realTonReserve >= GRADUATION_THRESHOLD_TON).toEqual(true);

    // Acton 1.2 can resolve the pool library on retry. Inject the failed Init
    // explicitly so this checks bounce recovery, independent of RPC/library availability.
    val retry = testing.processSingleTraceStep(
        anyKeeper.address,
        createMessage({
            bounce: true,
            value: ton("0.05"),
            dest: curve.address,
            body: Graduate { queryId: 99 },
        }),
    );
    expect(curve.getCurveData().state).toEqual(CURVE_STATE_GRADUATING);
    val init = retry.outMessages.at<DedustInit>(1).loadBody();
    val pool = calcDeployedCpmmV2Pool(
        afterBounce.jettonMinter!,
        creator.address,
    ).calculateAddress();
    testing.processSingleTraceStep(
        pool,
        createMessage({
            bounce: false,
            value: ton("0.29"),
            dest: curve.address,
            body: beginCell()
                .storeUint(0xffffffff, 32)
                .storeSlice(init.toCell().beginParse())
                .endCell(),
        }).bounced(),
    );
    val afterRetry = curve.getCurveData();
    expect(afterRetry.state).toEqual(CURVE_STATE_FROZEN);
    expect(afterRetry.realTonReserve).toEqual(afterBounce.realTonReserve);
    expect(afterRetry.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);
}

get fun `test self-funded: Phase A accounting correct`() {
    val (master, _d, _t) = setupMasterSf();
    val creator = testing.treasury("sf-cr-7");
    val whale = testing.treasury("sf-whale-7");
    val curve = launchCurveSf(master, creator, 2006 as uint64);

    net.send(
        whale.address,
        createMessage({
            bounce: true,
            value: ton("2100"),
            dest: curve.address,
            body: BuyJettons {
                queryId: 1,
                minJettonsOut: 0,
            },
        }),
    );

    val after = curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_FROZEN);

    expect(after.realTonReserve >= GRADUATION_THRESHOLD_TON - MIGRATION_FEE).toEqual(true);

    expect(after.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);

    expect(after.feeAccrued > 0).toEqual(true);
}
