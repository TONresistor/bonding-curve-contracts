import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@contracts/bonding-config"
import "@contracts/bonding-dedust"
import "@contracts/bonding-messages"
import "@contracts/bonding-storage"
import "@contracts/messages"
import "@wrappers/BondingCurve.gen"
import "@wrappers/BondingCurveMaster.gen"
import "@wrappers/utils"

struct PhaseBFixture {
    curve: BondingCurve
    minterAddr: address
    poolAddr: address
    creatorAddr: address
    masterAddr: address
    realTonAtPhaseA: coins
    curveJetAtPhaseA: coins
    migrationReserve: coins
}

fun setupPhaseBFixture(scenario: string, salt: uint64, migrationReserve: coins): PhaseBFixture {
    val deployer = testing.treasury("pb-deployer");
    val treasury = testing.treasury("pb-treasury");
    val creator = testing.treasury("pb-creator");
    val master = BondingCurveMaster.fromStorage({
        admin: deployer.address,
        nextAdmin: null,
        treasury: treasury.address,
        totalLaunches: 0,
        feesBalance: 0,
    });
    master.sendDeploy(deployer.address, { value: ton("1") });

    val mockMinterAddr = testing.treasury(scenario).address;

    val cfg: LaunchConfig = {
        master: master.address,
        creator: creator.address,
        salt,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };

    val realTonAtPhaseA = GRADUATION_THRESHOLD_TON - MIGRATION_FEE;
    val curveJetAtPhaseA = DEX_RESERVE_SUPPLY * 2;

    val planted: BondingCurveStorage = {
        state: CURVE_STATE_GRADUATING,
        jettonMinter: mockMinterAddr,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: realTonAtPhaseA,
        curveJettonBalance: curveJetAtPhaseA,
        feeAccrued: 0,
        migrationReserve,
        config: cfg.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val curve = BondingCurve.fromStorage(planted);
    val funder = testing.treasury(scenario);

    net.send(
        funder.address,
        createMessage({
            bounce: false,
            value: GRADUATION_THRESHOLD_TON + ton("10"),
            dest: { stateInit: curve.stateInit! },
            body: TopUpTons {},
        }),
    );

    val poolAuto = calcDeployedCpmmV2Pool(mockMinterAddr, creator.address);
    val poolAddr = poolAuto.calculateAddress();

    return {
        curve,
        minterAddr: mockMinterAddr,
        poolAddr,
        creatorAddr: creator.address,
        masterAddr: master.address,
        realTonAtPhaseA,
        curveJetAtPhaseA,
        migrationReserve,
    };
}

get fun `test phase-b: wrong sender is silently ignored`() {
    val fx = setupPhaseBFixture("pb-fx-wrong-sender", 7001 as uint64, MIGRATION_RESERVE_TARGET);
    val attacker = testing.treasury("pb-attacker-7001");

    net.send(
        attacker.address,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: fx.curve.address,
            body: InitPoolResultMessage {
                queryId: 999,
                exitCode: 0 as int32,
                customPayload: null,
            },
        }),
    );

    val after = fx.curve.getCurveData();

    expect(after.state).toEqual(CURVE_STATE_GRADUATING);
    expect(after.realTonReserve).toEqual(fx.realTonAtPhaseA);
    expect(after.curveJettonBalance).toEqual(fx.curveJetAtPhaseA);
    expect(after.migrationReserve).toEqual(MIGRATION_RESERVE_TARGET);
}

get fun `test phase-b: state != GRADUATING is silently ignored`() {
    val deployer = testing.treasury("pb-trader-deployer");
    val treasury = testing.treasury("pb-trader-treasury");
    val creator = testing.treasury("pb-trader-creator");
    val master = BondingCurveMaster.fromStorage({
        admin: deployer.address,
        nextAdmin: null,
        treasury: treasury.address,
        totalLaunches: 0,
        feesBalance: 0,
    });
    master.sendDeploy(deployer.address, { value: ton("1") });

    val mockMinterAddr = testing.treasury("pb-trader-minter").address;
    val cfg: LaunchConfig = {
        master: master.address,
        creator: creator.address,
        salt: 7002 as uint64,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val planted: BondingCurveStorage = {
        state: CURVE_STATE_TRADING,
        jettonMinter: mockMinterAddr,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: ton("100"),
        curveJettonBalance: TOTAL_SUPPLY - ton("10000"),
        feeAccrued: 0,
        migrationReserve: ton("0.5"),
        config: cfg.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val curve = BondingCurve.fromStorage(planted);
    val funder = testing.treasury("pb-trader-funder");
    net.send(
        funder.address,
        createMessage({
            bounce: false,
            value: ton("5"),
            dest: { stateInit: curve.stateInit! },
            body: TopUpTons {},
        }),
    );

    val poolAddr = calcDeployedCpmmV2Pool(mockMinterAddr, creator.address).calculateAddress();
    net.send(
        poolAddr,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: curve.address,
            body: InitPoolResultMessage {
                queryId: 1,
                exitCode: 0 as int32,
                customPayload: null,
            },
        }),
    );

    val after = curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_TRADING);
    expect(after.realTonReserve).toEqual(ton("100"));
}

get fun `test phase-b: non-zero exitCode is silently ignored`() {
    val fx = setupPhaseBFixture("pb-fx-bad-exit", 7003 as uint64, MIGRATION_RESERVE_TARGET);

    net.send(
        fx.poolAddr,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: fx.curve.address,
            body: InitPoolResultMessage {
                queryId: 1,
                exitCode: 42 as int32,
                customPayload: null,
            },
        }),
    );

    val after = fx.curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_GRADUATING);
    expect(after.realTonReserve).toEqual(fx.realTonAtPhaseA);
    expect(after.curveJettonBalance).toEqual(fx.curveJetAtPhaseA);
    expect(after.migrationReserve).toEqual(fx.migrationReserve);
}

get fun `test phase-b: happy path transitions to MIGRATED`() {
    val fx = setupPhaseBFixture("pb-fx-happy", 7004 as uint64, MIGRATION_RESERVE_TARGET);

    net.send(
        fx.poolAddr,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: fx.curve.address,
            body: InitPoolResultMessage {
                queryId: 1,
                exitCode: 0 as int32,
                customPayload: null,
            },
        }),
    );

    val after = fx.curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_MIGRATED);
    expect(after.realTonReserve).toEqual(0);
    expect(after.migrationReserve).toEqual(0);
}

get fun `test phase-b: duplicate callback after MIGRATED is no-op`() {
    val fx = setupPhaseBFixture("pb-fx-dup", 7005 as uint64, MIGRATION_RESERVE_TARGET);

    net.send(
        fx.poolAddr,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: fx.curve.address,
            body: InitPoolResultMessage {
                queryId: 1,
                exitCode: 0 as int32,
                customPayload: null,
            },
        }),
    );
    val firstSnap = fx.curve.getCurveData();
    expect(firstSnap.state).toEqual(CURVE_STATE_MIGRATED);

    net.send(
        fx.poolAddr,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: fx.curve.address,
            body: InitPoolResultMessage {
                queryId: 2,
                exitCode: 0 as int32,
                customPayload: null,
            },
        }),
    );
    val secondSnap = fx.curve.getCurveData();
    expect(secondSnap.state).toEqual(CURVE_STATE_MIGRATED);
    expect(secondSnap.realTonReserve).toEqual(firstSnap.realTonReserve);
    expect(secondSnap.curveJettonBalance).toEqual(firstSnap.curveJettonBalance);
    expect(secondSnap.feeAccrued).toEqual(firstSnap.feeAccrued);
    expect(secondSnap.migrationReserve).toEqual(firstSnap.migrationReserve);
}

get fun `test phase-b: reserve below gas budget still transitions to MIGRATED`() {
    val belowBudget: coins = (DEDUST_GRADUATE_GAS_BUDGET / 2) as coins;
    val fx = setupPhaseBFixture("pb-fx-below", 7006 as uint64, belowBudget);

    net.send(
        fx.poolAddr,
        createMessage({
            bounce: true,
            value: ton("0.1"),
            dest: fx.curve.address,
            body: InitPoolResultMessage {
                queryId: 1,
                exitCode: 0 as int32,
                customPayload: null,
            },
        }),
    );

    val after = fx.curve.getCurveData();
    expect(after.state).toEqual(CURVE_STATE_MIGRATED);
    expect(after.migrationReserve).toEqual(0);
}
