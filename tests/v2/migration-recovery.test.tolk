import "@acton/build"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/big_array"
import "@acton/types/message"
import "@acton/types/transaction"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/BuybackBurnV2.gen"
import "@wrappers/FeeCollectorV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@contracts/v1/jetton-utils"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-dedust"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/buyback-messages"
import "@contracts/v2/collector-address"
import "@contracts/v2/wallet-messages"
import "activation.test"
import "migration"
import "migration-finalization"
import "../shared/dedust"
import "../../scripts/v2/retry-migration"

get fun `test recovery: normal migration retains all locked liquidity`() {
    val e = setupEnv(9301);
    val trace = net.send(e.buyer, graduatingBuy(e.curve));
    expectMigrated(e, e.curve.getPoolAddress());
}

get fun `test recovery: retry script graduates a FROZEN curve`() {
    val e = setupEnv(9302);
    val pool = e.curve.getPoolAddress();
    val cursor = testing.createTraceIterationCursor(e.buyer, graduatingBuy(e.curve));
    cursor.executeTill<InitPoolResultMessage>({ from: pool, to: e.curve.address });
    val original = testing.getShardAccount(pool)!;
    // Simulate the queried account being unavailable, so the actual query bounces.
    testing.setShardAccount(pool, null);
    cursor.executeAllRemaining();
    cursor.close();
    expect(e.curve.getState()).toEqual(CURVE_STATE_FROZEN);
    testing.setShardAccount(pool, original);
    retryMigration("act-buyer", e.curve.address);
    expectMigrated(e, pool);
}

get fun `test recovery: retry script resends refunded MIGRATION_RETRY legs`() {
    val e = setupEnv(9303);
    val pool = e.curve.getPoolAddress();
    val (native, jettons) = recoveryLegs(e);
    val original = recoveryPoolData(pool);
    initializingRecoveryPool(pool, e.attacker);
    net.send(e.curve.address, native);
    net.send(e.curve.address, jettons);
    expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATION_RETRY);
    expect(e.curve.getMigrationData()!.nativeRetry).toEqual(true);
    expect(e.curve.getMigrationData()!.jettonRetry).toEqual(true);
    setRecoveryPoolData(pool, original);
    retryMigration("act-buyer", e.curve.address);
    expectMigrated(e, pool);
}

get fun `test recovery: retry script confirms AWAITING_LIQUIDITY before delayed notification`() {
    val e = setupEnv(9304);
    val pool = e.curve.getPoolAddress();
    val position = calcMigrationPosition(pool, e.curve.address);
    val cursor = testing.createTraceIterationCursor(e.buyer, graduatingBuy(e.curve));
    cursor.executeTill<PositionCreditProbe>({ to: position });
    expect(e.curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
    retryMigration("act-buyer", e.curve.address);
    expectMigrated(e, pool);
    val protocol = testing.treasury("act-owner").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: protocol, nextAdmin: null, treasury: protocol, totalLaunches: 0, feesBalance: 0 });
    expect(master.getMasterData().feesBalance).toEqual(ton("20.2"));
    cursor.executeAllRemaining();
    cursor.close();
    expect(master.getMasterData().feesBalance).toEqual(ton("20.2"));
    expectMigrated(e, pool);
}

fun recoveryPoolData(pool: address): cell {
    val account = testing.getAccountState(pool)!;
    val active = account.storage.state;
    assert (active is TlbAccountStateActive) throw 1200;
    return active.stateInit.data!;
}

fun setRecoveryPoolData(pool: address, data: cell) {
    var shard = testing.getShardAccount(pool)!;
    var account = shard.account.load();
    assert (account is TlbAccountInfo) throw 1200;
    var active = account.storage.state;
    assert (active is TlbAccountStateActive) throw 1200;
    active.stateInit.data = data;
    account.storage.state = active;
    shard.account = (account as TlbAccount).toCell();
    testing.setShardAccount(pool, shard);
}

fun initializingRecoveryPool(pool: address, initiator: address) {
    var original = recoveryPoolData(pool).beginParse();
    val config = original.loadRef();
    val fees = original.loadRef();
    val extra = original.loadRef();
    setRecoveryPoolData(
        pool,
        beginCell()
            .storeRef(config)
            .storeRef(fees)
            .storeRef(extra)
            .storeBool(false)
            .storeUint(1, 2)
            .storeAddress(initiator)
            .storeBool(false)
            .storeBool(true)
            .storeCoins(0)
            .storeCoins(0)
            .storeCoins(0)
            .endCell(),
    );
}

// Capture the actual queued migration legs, then deliver them in either order.
fun recoveryLegs(e: Env): (OutMessage, OutMessage) {
    val cursor = testing.createTraceIterationCursor(e.buyer, graduatingBuy(e.curve));
    val trace = cursor.executeTill<TakeMigrationPoolState>({ from: e.curve.getPoolAddress(), to: e
            .curve
            .address });
    val result = trace.at(trace.size() - 1);
    var native: cell? = null;
    var jettons: cell? = null;
    var i = 0;
    while (i < result.outMessages.size()) {
        val raw = result.outMessages.atCell(i);
        val message = TlbMessageRelaxed<RemainingBitsAndRefs>.fromCell(raw);
        val op = message.loadBody().preloadUint(32);
        if (op == OP_PAY_NATIVE) {
            native = raw;
        }
        if (op == 0xa0a0b053) {
            jettons = raw;
        }
        i += 1;
    }
    cursor.close();
    assert (native != null && jettons != null) throw 1201;
    return (OutMessage { messageCell: native! }, OutMessage { messageCell: jettons! });
}

fun nativeRefund(e: Env, id: uint64, amount: coins, value: coins, sender: address): SendResultList {
    return net.send(
        sender,
        createMessage({ bounce: false, dest: e.curve.address, value, body: MigrationNativeRefund {
                queryId: id,
                amount,
                code: 22,
                payload: null,
            } }),
    );
}

fun tokenRefundReceipt(e: Env, id: uint64, amount: coins, sender: address): SendResultList {
    return net.send(
        sender,
        createMessage({ bounce: true, dest: e
                .curve
                .address, value: ton("0.01"), body: TransferFailed {
                queryId: id,
                amount,
            } }),
    );
}

fun recoveryScenario(jettonsFirst: bool, partial: bool) {
    val e = setupEnv(9400 + (jettonsFirst ? 1 : 0) + (partial ? 2 : 0));
    val pool = e.curve.getPoolAddress();
    val (native, jettons) = recoveryLegs(e);
    val m = e.curve.getMigrationData()!;
    val before = e.curve.getCurveData();
    val original = recoveryPoolData(pool);
    // Fault injection only changes the pool's lifecycle, never its code or address config.
    initializingRecoveryPool(pool, e.attacker);
    if (jettonsFirst) {
        net.send(e.curve.address, jettons);
    } else {
        net.send(e.curve.address, native);
    }
    expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATION_RETRY);
    val first = e.curve.getMigrationData()!;
    expect(first.nativeRetry).toEqual(!jettonsFirst);
    expect(first.jettonRetry).toEqual(jettonsFirst);

    var pending: TxCursor? = null;
    if (partial) {
        setRecoveryPoolData(pool, original);
        pending = v2Cursor(e.buyer, e.curve.address, ton("0.5"), RetryMigration { queryId: 100 });
        pending!.executeN(1);
        expect(e.curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
        // The other original leg rejects before the retry's messages are delivered.
        initializingRecoveryPool(pool, e.attacker);
    }
    if (jettonsFirst) {
        net.send(e.curve.address, native);
    } else {
        net.send(e.curve.address, jettons);
    }
    expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATION_RETRY);
    setRecoveryPoolData(pool, original);

    if (pending != null) {
        pending!.executeAllRemaining();
        pending!.close();
    } else {
        val restored = e.curve.getCurveData();
        expect(restored.realTonReserve).toEqual(before.realTonReserve + m.tonAmount);
        expect(restored.curveJettonBalance).toEqual(before.curveJettonBalance + m.jettonAmount);
        expect(v2Tokens(e.minter, e.curve.address)).toEqual(restored.curveJettonBalance);
        val protocol = testing.treasury("act-owner").address;
        val master = BondingCurveMasterV2.fromStorage({ admin: protocol, nextAdmin: null, treasury: protocol, totalLaunches: 0, feesBalance: 0 });
        val fees = master.getMasterData().feesBalance;
        e.curve.sendFlushFees(e.buyer, 101, { value: ton("0.05") });
        expect(
            master.getMasterData().feesBalance - fees < before.feeAccrued + ton("2"),
        ).toEqual(true);
        expect(e.curve.getCurveData().realTonReserve).toEqual(restored.realTonReserve);

        // Replay authenticated notifications. They must not restore a leg twice.
        nativeRefund(e, m.nativeQueryId, m.tonAmount, m.tonAmount, pool);
        val wallet = e.minter.getWalletAddress(e.curve.address);
        tokenRefundReceipt(e, m.jettonQueryId, m.jettonAmount, wallet);
        expect(e.curve.getCurveData().realTonReserve).toEqual(restored.realTonReserve);
        expect(e.curve.getCurveData().curveJettonBalance).toEqual(restored.curveJettonBalance);
    }

    val protocol = testing.treasury("act-owner").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: protocol, nextAdmin: null, treasury: protocol, totalLaunches: 0, feesBalance: 0 });
    val feesBeforeRetry = master.getMasterData().feesBalance;
    val one = v2Cursor(e.buyer, e.curve.address, ton("0.5"), RetryMigration { queryId: 102 });
    val two = v2Cursor(e.attacker, e.curve.address, ton("0.5"), RetryMigration { queryId: 103 });
    one.executeN(1);
    val duplicate = two.executeAllRemaining();
    two.close();
    expect(duplicate).toHaveFailedTx<RetryMigration>({ to: e.curve.address, exitCode: 72 });
    val newM = e.curve.getMigrationData()!;
    expect(newM.nativeQueryId).toEqual(m.nativeQueryId + 1);
    expect(newM.jettonQueryId).toEqual(m.jettonQueryId + 1);
    // Old IDs cannot set retry flags for an outstanding newer attempt.
    nativeRefund(e, m.nativeQueryId, m.tonAmount, m.tonAmount, pool);
    tokenRefundReceipt(
        e,
        m.jettonQueryId,
        m.jettonAmount,
        e.minter.getWalletAddress(e.curve.address),
    );
    expect(e.curve.getMigrationData()!.nativeRetry).toEqual(false);
    expect(e.curve.getMigrationData()!.jettonRetry).toEqual(false);
    one.executeAllRemaining();
    one.close();
    expectMigrated(e, pool);
    expect(master.getMasterData().feesBalance).toEqual(feesBeforeRetry + ton("20"));
    val after = e.curve.getCurveData();
    nativeRefund(e, newM.nativeQueryId, m.tonAmount, m.tonAmount, pool);
    tokenRefundReceipt(
        e,
        newM.jettonQueryId,
        m.jettonAmount,
        e.minter.getWalletAddress(e.curve.address),
    );
    expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    expect(e.curve.getCurveData().realTonReserve).toEqual(after.realTonReserve);
    expect(e.curve.getCurveData().curveJettonBalance).toEqual(after.curveJettonBalance);
}

get fun `test recovery: native then token refunds concurrent retries and duplicate receipts`() {
    recoveryScenario(false, false);
}

get fun `test recovery: token then native refunds concurrent retries and duplicate receipts`() {
    recoveryScenario(true, false);
}

get fun `test recovery: native retry races with delayed token refund`() {
    recoveryScenario(false, true);
}

get fun `test recovery: token retry races with delayed native refund`() {
    recoveryScenario(true, true);
}

get fun `test recovery: unauthenticated and insufficient refunds do not restore reserves`() {
    val e = setupEnv(9500);
    val (native, jettons) = recoveryLegs(e);
    val m = e.curve.getMigrationData()!;
    val before = e.curve.getCurveData();
    val bad = nativeRefund(e, m.nativeQueryId, m.tonAmount, m.tonAmount, e.attacker);
    expect(bad).toHaveFailedTx<MigrationNativeRefund>({ to: e.curve.address, exitCode: 73 });
    nativeRefund(e, m.nativeQueryId, m.tonAmount, ton("0.01"), e.curve.getPoolAddress());
    nativeRefund(e, m.nativeQueryId + 1, m.tonAmount, m.tonAmount, e.curve.getPoolAddress());
    tokenRefundReceipt(e, m.jettonQueryId, m.jettonAmount, e.attacker);
    expect(e.curve.getCurveData().realTonReserve).toEqual(before.realTonReserve);
    expect(e.curve.getCurveData().curveJettonBalance).toEqual(before.curveJettonBalance);
    expect(e.curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
    net.send(e.curve.address, native);
    net.send(e.curve.address, jettons);
    expectMigrated(e, e.curve.getPoolAddress());
}

get fun `test recovery: gas rejection credits only actual returned principal`() {
    val e = setupEnv(9501);
    val (native, jettons) = recoveryLegs(e);
    val m = e.curve.getMigrationData()!;
    val before = e.curve.getCurveData();
    val protocol = testing.treasury("act-owner").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: protocol, nextAdmin: null, treasury: protocol, totalLaunches: 0, feesBalance: 0 });
    val rejected = net.send(
        e.curve.address,
        createMessage({ bounce: true, dest: e.curve.getPoolAddress(), value: m.tonAmount +
                ton("0.001"), body: V2PayNative {
                queryId: m.nativeQueryId,
                amount: m.tonAmount,
                paymentPayload: buildDepositPayload(m.tonAmount, m.jettonAmount),
                payoutConfig: buildMigrationPayoutConfig(master.address),
            } }),
    );
    val returned = callbackTo(rejected, e.curve.getPoolAddress(), e.curve.address);
    expect(returned.code).toEqual(25);
    expect(returned.amount0 == 0 || returned.amount0 == m.tonAmount).toEqual(true);
    expect(e.curve.getMigrationData()!.nativeRetry).toEqual(true);
    expect(e.curve.getCurveData().realTonReserve).toEqual(before.realTonReserve + m.tonAmount);
    net.send(e.curve.address, jettons);
    e.curve.sendRetryMigration(e.buyer, 1, { value: ton("0.5") });
    expectMigrated(e, e.curve.getPoolAddress());
}

get fun `test recovery: wallet accepts only the expected low-gas pool refund`() {
    val e = setupEnv(9502);
    val (native, jettons) = recoveryLegs(e);
    val m = e.curve.getMigrationData()!;
    val wallet = e.minter.getWalletAddress(e.curve.address);
    val pool = e.curve.getPoolAddress();
    val poolWallet = e.minter.getWalletAddress(pool);
    val cursor = testing.createTraceIterationCursor(e.curve.address, jettons);
    cursor.executeN(1);
    val tokens = v2Tokens(e.minter, e.curve.address);
    var i = 0;
    repeat (2) {
        val bad = net.send(
            poolWallet,
            createMessage({ bounce: false, dest: wallet, value: ton("0.05"), body: InternalTransferStep {
                    queryId: m.jettonQueryId + (i == 0 ? 1 : 0),
                    jettonAmount: m.jettonAmount - (i == 1 ? 1 : 0),
                    transferInitiator: pool,
                    sendExcessesTo: null,
                    forwardTonAmount: 0,
                    forwardPayload: beginCell().storeUint(0, 1).toSlice(),
                } }),
        );
        expect(bad).toHaveFailedTx<InternalTransferStep>({ to: wallet, exitCode: 48 });
        expect(v2Tokens(e.minter, e.curve.address)).toEqual(tokens);
        i += 1;
    }
    val original = recoveryPoolData(pool);
    initializingRecoveryPool(pool, e.attacker);
    cursor.executeAllRemaining();
    cursor.close();
    expect(e.curve.getMigrationData()!.jettonRetry).toEqual(true);
    expect(v2Tokens(e.minter, e.curve.address)).toEqual(tokens + m.jettonAmount);
    setRecoveryPoolData(pool, original);
    net.send(e.curve.address, native);
    e.curve.sendRetryMigration(e.buyer, 2, { value: ton("0.5") });
    expectMigrated(e, pool);
}

get fun `test recovery: pool initialized before minter and curve deployment recovers`() {
    testing.setNow(V2_TIME);
    loadV2Libraries();
    val owner = testing.treasury("review-owner").address;
    val creator = testing.treasury("review-creator").address;
    val attacker = testing.treasury("review-attacker").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    val options = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
    };
    val curveAddr = master.getLaunchAddress(creator, 9902, options);
    val minter = JettonMinterV2.fromStorage({ totalSupply: 0, adminAddress: curveAddr, nextAdminAddress: null, metadata: beginCell().endCell() });
    val collector = collectorAddress(
        minter.address,
        creator,
        owner,
        100,
        curveAddr,
    ).calculateAddress();
    val auto = calcDeployedCpmmV2Pool(minter.address, collector, 100, curveAddr);
    val pool = auto.calculateAddress();
    expect(testing.isDeployed(minter.address)).toEqual(false);
    val attack = initPool(attacker, auto, 901);
    expect(pd(pool).status).toEqual(1);
    master.sendCreateLaunch(
        creator,
        1,
        beginCell().endCell(),
        9902,
        options,
        { value: ton("101") },
    );
    val curve = BondingCurveV2.fromAddress(curveAddr);
    expect(curve.getCurveData().jettonMinter!).toEqual(minter.address);
    expect(curve.getPoolAddress()).toEqual(pool);
    expect(testing.isDeployed(minter.address)).toEqual(true);
    expect(pd(pool).status).toEqual(1);
    val retry = initPool(attacker, auto, 902);
    expect(initResultCode(retry, pool, attacker)).toEqual(20);
    val graduation = net.send(attacker, graduatingBuy(curve));
    expect(initResultCode(graduation, pool, curve.address)).toEqual(20);
    expect(curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    expect(pd(pool).status).toEqual(2);
    val e = Env {
        curve,
        minter,
        attacker,
        activator: attacker,
        buyer: attacker,
        creator,
    };
    expectMigrated(e, pool);
}
