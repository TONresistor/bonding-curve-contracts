import "@acton/build"
import "@acton/io"
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
import "@contracts/v2/wallet-fees"
import "@contracts/v2/wallet-messages"
import "activation.test"
import "migration"
import "migration-finalization"
import "../shared/dedust"
import "../../scripts/v2/retry-migration"

struct (0x3db5f13a) MigrationTestCancelDeposit {
    queryId: uint64
}

fun foreignRefundScenario(
    jettons: bool,
    afterCredit: bool,
    earlyReject: bool = false,
    beforeJoin: bool = false,
    delayedCheck: bool = false,
    manualConfirm: bool = false,
) {
    val e = setupEnv(9991 + (jettons ? 1 : 0) + (afterCredit ? 2 : 0) + (earlyReject ? 4 : 0));
    val pool = e.curve.getPoolAddress();
    val position = calcMigrationPosition(pool, e.curve.address);
    val cursor = testing.createTraceIterationCursor(e.buyer, graduatingBuy(e.curve));
    if (beforeJoin) {
        cursor.executeTill<TakeMigrationPoolState>({ from: pool, to: e.curve.address });
    } else if (afterCredit) {
        cursor.executeTill<PositionCreditProbe>({ to: position });
    } else {
        pendingRecoveryJoin(cursor, pool);
        cursor.executeTill<FinalizationJoin>({ to: pool });
    }
    val m = e.curve.getMigrationData()!;
    val before = e.curve.getCurveData();
    val attacker = jettons ? e.buyer : e.attacker;
    val payout = beginCell()
        .storeUint(0, 2)
        .storeCoins(0)
        .storeMaybeRef(null)
        .storeBool(false)
        .storeAddress(e.curve.address)
        .storeCoins(ton("0.03"))
        .storeMaybeRef(
            MigrationDepositRefundContext { depositGeneration: m.depositGeneration }.toCell(),
        )
        .storeBool(true)
        .storeAddress(attacker)
        .endCell();
    val payment: cell = earlyReject
        ? V2Swap {
            minimalAmountOut: (1 << 120) - 1,
            deadline: V2_TIME + 1000,
        }.toCell() as cell
        : buildDepositPayload(jettons ? 1 : m.tonAmount, jettons ? m.jettonAmount : 1) as cell;
    var trace = BigArray<SendResult>.createEmpty();
    if (jettons) {
        expect(v2Tokens(e.minter, attacker) >= m.jettonAmount).toEqual(true);
        val payload = beginCell()
            .storeUint(DEDUST_CPMM_V2_OP_PAY_JETTON, 32)
            .storeRef(payment)
            .storeRef(payout)
            .endCell();
        trace = net.send(
            attacker,
            createMessage({ bounce: true, dest: e
                    .minter
                    .getWalletAddress(attacker), value: ton("0.5"), body: v2Transfer(
                    m.jettonQueryId,
                    m.jettonAmount,
                    pool,
                    attacker,
                    payload,
                ) }),
        );
    } else {
        trace = net.send(
            attacker,
            createMessage({ bounce: true, dest: pool, value: m.tonAmount +
                    ton("0.5"), body: V2PayNative {
                    queryId: m.nativeQueryId,
                    amount: m.tonAmount,
                    paymentPayload: payment,
                    payoutConfig: payout,
                } }),
        );
    }
    if (!earlyReject) {
        val credit = trace.findTransaction({ from: pool, opcode: 0xdc5ddba1 });
        assert (credit != null) throw 1300;
        val cancellation = createMessage({ bounce: true, dest: credit!.getAccountAddress(), value: ton("0.5"), body: MigrationTestCancelDeposit {
                queryId: 667,
            } });
        if (delayedCheck) {
            val verification = testing.createTraceIterationCursor(attacker, cancellation);
            if (jettons) {
                verification.executeTill<MigrationJettonRefund>({ to: e.curve.address });
            } else {
                verification.executeTill<MigrationNativeRefund>({ to: e.curve.address });
            }
            val pending = e.curve.getMigrationData()!;
            expect(pending.pendingNativeRefund).toEqual(!jettons);
            expect(pending.pendingJettonRefund).toEqual(jettons);
            cursor.executeAllRemaining();
            cursor.close();
            expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATED);
            val fees = masterMigrationFees(e);
            verification.executeAllRemaining();
            verification.close();
            expect(e.curve.getMigrationData()!.pendingNativeRefund).toEqual(false);
            expect(e.curve.getMigrationData()!.pendingJettonRefund).toEqual(false);
            expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATED);
            expect(masterMigrationFees(e)).toEqual(fees);
            expect(fees).toEqual(ton("20.2"));
            return;
        }
        trace = net.send(attacker, cancellation);
    }
    if (!beforeJoin) {
        expect(e.curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
        val checked = e.curve.getMigrationData()!;
        expect(checked.closingDeposit).toEqual(false);
        expect(checked.nativeRetry).toEqual(false);
        expect(checked.jettonRetry).toEqual(false);
        expect(checked.pendingNativeRefund).toEqual(false);
        expect(checked.pendingJettonRefund).toEqual(false);
        expect(e.curve.getCurveData().realTonReserve).toEqual(before.realTonReserve);
        expect(e.curve.getCurveData().curveJettonBalance).toEqual(before.curveJettonBalance);
    }
    if (beforeJoin && manualConfirm) {
        cursor.executeTill<PositionCreditProbe>({ to: position });
        val one = v2Cursor(e.buyer, e.curve.address, ton("0.1"), ConfirmMigration { queryId: 704 });
        val two = v2Cursor(
            e.attacker,
            e.curve.address,
            ton("0.1"),
            ConfirmMigration { queryId: 705 },
        );
        one.executeN(1);
        two.executeN(1);
        one.executeAllRemaining();
        one.close();
        two.executeAllRemaining();
        two.close();
    }
    cursor.executeAllRemaining();
    cursor.close();
    val lp = net.runGetMethod<SimulationPositionData>(position, "get_position_data");
    expect(lp.liquidity).toEqual(lp.lockedLiquidity);
    expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    expect(masterMigrationFees(e)).toEqual(ton("20.2"));
    expect(
        lp.lockedLiquidity >= migrationMinimumLiquidity(m.tonAmount, m.jettonAmount),
    ).toEqual(true);
    expect(e.curve.getCurveData().realTonReserve).toEqual(0);
    expect(pd(pool).reserveX).toEqual(m.tonAmount);
    if (beforeJoin && !jettons) {
        val fees = masterMigrationFees(e);
        val accrued = e.curve.getCurveData().feeAccrued;
        expect(
            e.curve.sendFlushFees(e.buyer, 706, { value: ton("0.05") }),
        ).toHaveSuccessfulTx<FlushFees>({ to: e.curve.address });
        expect(masterMigrationFees(e) - fees).toBeGreaterOrEqual(accrued);
        expect(e.curve.getCurveData().realTonReserve).toEqual(0);
    }
}

get fun `test recovery: foreign native cancellation before position credit cannot close migration`() {
    foreignRefundScenario(false, false);
}

get fun `test recovery: foreign native cancellation after position credit cannot close migration`() {
    foreignRefundScenario(false, true);
}

get fun `test recovery: foreign jetton cancellation before position credit cannot close migration`() {
    foreignRefundScenario(true, false);
}

get fun `test recovery: foreign jetton cancellation after position credit cannot close migration`() {
    foreignRefundScenario(true, true);
}

get fun `test recovery: foreign early native rejection cannot impersonate our refund`() {
    foreignRefundScenario(false, true, true);
}

get fun `test recovery: foreign early jetton rejection cannot impersonate our refund`() {
    foreignRefundScenario(true, true, true);
}

get fun `test recovery: foreign native refund before JoinLiquidity cannot suppress real LP credit`() {
    foreignRefundScenario(false, false, true, true);
}

get fun `test recovery: foreign jetton refund before JoinLiquidity cannot suppress real LP credit`() {
    foreignRefundScenario(true, false, true, true);
}

get fun `test recovery: pending refund verification survives bounce stale replies and concurrent confirmation`() {
    val e = setupEnv(10021);
    val pool = e.curve.getPoolAddress();
    val (native, jettons) = recoveryLegs(e);
    val original = recoveryPoolData(pool);
    initializingRecoveryPool(pool, e.attacker);
    val cursor = testing.createTraceIterationCursor(e.curve.address, native);
    cursor.executeTill<MigrationNativeRefund>({ from: pool, to: e.curve.address });
    val pending = e.curve.getMigrationData()!;
    expect(pending.pendingNativeRefund).toEqual(true);
    expect(pending.nativeRetry).toEqual(false);
    val reserve = e.curve.getCurveData().realTonReserve;
    val fees = masterMigrationFees(e);
    e.curve.sendFlushFees(e.buyer, 701, { value: ton("0.05") });
    expect(masterMigrationFees(e) - fees < pending.tonAmount).toEqual(true);
    expect(e.curve.getCurveData().realTonReserve).toEqual(reserve);
    val shard = testing.getShardAccount(pool)!;
    testing.setShardAccount(pool, null);
    cursor.executeAllRemaining();
    cursor.close();
    expect(e.curve.getMigrationData()!.pendingNativeRefund).toEqual(true);
    testing.setShardAccount(pool, shard);
    setRecoveryPoolData(pool, original);
    val one = v2Cursor(e.buyer, e.curve.address, ton("0.1"), ConfirmMigration { queryId: 702 });
    one.executeN(1);
    val checkId = e.curve.getMigrationData()!.refundCheckId;
    var i = 0;
    repeat (3) {
        net.send(
            i == 2 ? e.attacker : pool,
            createMessage({ bounce: false, dest: e
                    .curve
                    .address, value: ton("0.05"), body: TakeMigrationPoolState {
                    queryId: i == 0 ? 0 : i == 1 ? pending.refundCheckId : checkId,
                    status: MigrationPoolInitialized {},
                    depositActive: false,
                    swapActive: true,
                    liquidity: 0,
                    reserveX: 0,
                    reserveY: 0,
                    rest: createEmptySlice(),
                } }),
        );
        expect(e.curve.getMigrationData()!.pendingNativeRefund).toEqual(true);
        expect(e.curve.getCurveData().realTonReserve).toEqual(reserve);
        i += 1;
    }
    val two = v2Cursor(e.attacker, e.curve.address, ton("0.1"), ConfirmMigration { queryId: 703 });
    two.executeN(1);
    expect(e.curve.getMigrationData()!.refundCheckId).toEqual(checkId + 1);
    one.executeAllRemaining();
    one.close();
    expect(e.curve.getMigrationData()!.pendingNativeRefund).toEqual(true);
    two.executeAllRemaining();
    two.close();
    expect(e.curve.getMigrationData()!.pendingNativeRefund).toEqual(false);
    expect(e.curve.getMigrationData()!.nativeRetry).toEqual(true);
    expect(e.curve.getCurveData().realTonReserve).toEqual(reserve + pending.tonAmount);
    net.send(e.curve.address, jettons);
    retryMigration("act-buyer", e.curve.address);
    expectMigrated(e, pool);
}

get fun `test recovery: genuine LP credit wins over delayed foreign native verification`() {
    foreignRefundScenario(false, true, false, false, true);
}

get fun `test recovery: genuine LP credit wins over delayed foreign jetton verification`() {
    foreignRefundScenario(true, true, false, false, true);
}

get fun `test recovery: pre-Join foreign refund and concurrent manual confirmations finalize once`() {
    foreignRefundScenario(
        false,
        false,
        true,
        true,
        false,
        true,
    );
}

fun pendingRecoveryJoin(cursor: TxCursor, pool: address): FinalizationJoin {
    var steps = 0;
    while (!cursor.isDone() && steps < 100) {
        val segment = cursor.executeN(1);
        val result = segment.at(0);
        var i = 0;
        while (i < result.outMessages.size()) {
            val raw = result.outMessages.atCell(i);
            if (raw.beginParse().preloadUint(1) == 0) {
                val message = TlbMessageRelaxed<RemainingBitsAndRefs>.fromCell(raw);
                val body = message.loadBody();
                if (
                    message.info.dest == pool && body.remainingBitsCount() >= 32 &&
                    body.preloadUint(32) == OP_JOIN_LIQUIDITY
                ) {
                    return FinalizationJoin.fromSlice(body);
                }
            }
            i += 1;
        }
        steps += 1;
    }
    throw 1202;
}

fun lateNativeReceipt(
    e: Env,
    generation: uint64,
    id: uint64,
    amount: coins,
    sender: address,
    value: coins,
    payload: cell?,
): SendResultList {
    return net.send(
        sender,
        createMessage({ bounce: false, dest: e.curve.address, value, body: MigrationNativeRefund {
                queryId: id,
                amount,
                code: 0,
                payload,
            } }),
    );
}

fun lateTokenReceipt(
    e: Env,
    generation: uint64,
    id: uint64,
    amount: coins,
    sender: address,
): SendResultList {
    return net.send(
        sender,
        createMessage({ bounce: false, dest: e
                .curve
                .address, value: ton("0.02"), body: MigrationJettonRefund {
                queryId: id,
                depositGeneration: generation,
                amount,
            } }),
    );
}

fun lateJoinRefundScenario(
    retryLeg: int,
    probeOnly: bool = false,
    reordered: bool = false,
    jettonsFirst: bool = false,
) {
    val e = setupEnv(9960 + retryLeg);
    val pool = e.curve.getPoolAddress();
    val (native, jettons) = recoveryLegs(e);
    val original = recoveryPoolData(pool);
    var cursor: TxCursor? = null;
    if (retryLeg == 0) {
        net.send(e.curve.address, native);
        cursor = testing.createTraceIterationCursor(e.curve.address, jettons);
    } else {
        // Reject only one original payment, then accept the other one into Deposit.
        initializingRecoveryPool(pool, e.attacker);
        net.send(e.curve.address, retryLeg == 1 ? native : jettons);
        expect(e.curve.getMigrationData()!.nativeRetry).toEqual(retryLeg == 1);
        expect(e.curve.getMigrationData()!.jettonRetry).toEqual(retryLeg == 2);
        setRecoveryPoolData(pool, original);
        net.send(e.curve.address, retryLeg == 1 ? jettons : native);
        cursor = v2Cursor(e.buyer, e.curve.address, ton("0.5"), RetryMigration { queryId: 200 });
    }
    val join = pendingRecoveryJoin(cursor!, pool);
    val migration = e.curve.getMigrationData()!;
    expect(migration.nativeQueryId).toEqual(retryLeg == 1 ? 2 : 1);
    expect(migration.jettonQueryId).toEqual(retryLeg == 2 ? 2 : 1);
    expect(join.queryId).toEqual(retryLeg == 0 ? 1 : 2);
    expect(join.amountX).toEqual(migration.tonAmount);
    expect(join.amountY).toEqual(migration.jettonAmount);
    expect(v2Tokens(e.minter, pool)).toEqual(migration.jettonAmount);
    val before = e.curve.getCurveData();
    val walletBefore = v2Tokens(e.minter, e.curve.address);

    // Fault injection, not an achievable third-party deposit: preserve code/config,
    // but force zero minted liquidity so the real JoinLiquidity handler rejects (30).
    var data = original.beginParse();
    val config = data.loadRef();
    val fees = data.loadRef();
    val extra = data.loadRef();
    setRecoveryPoolData(
        pool,
        beginCell()
            .storeRef(config)
            .storeRef(fees)
            .storeRef(extra)
            .storeBool(false)
            .storeUint(2, 2)
            .storeBool(false)
            .storeBool(true)
            .storeCoins(1)
            .storeCoins((1 << 120) - 1)
            .storeCoins((1 << 120) - 1)
            .endCell(),
    );
    var rejected = BigArray<SendResult>.createEmpty();
    var nativeCallback: PoolCallback? = null;
    val joinTrace = cursor!.executeTill<FinalizationJoin>({ to: pool });
    expect(
        joinTrace,
    ).toHaveTx({ to: pool, opcode: OP_JOIN_LIQUIDITY, exitCode: 30, aborted: false });
    // Restore the injected fault before the independent refund-state queries run.
    setRecoveryPoolData(pool, original);
    if (reordered) {
        rejected = joinTrace;
        val outputs = rejected.at(rejected.size() - 1).outMessages;
        var nativeReturn: cell? = null;
        var jettonReturn: cell? = null;
        var i = 0;
        while (i < outputs.size()) {
            val raw = outputs.atCell(i);
            val message = TlbMessageRelaxed<RemainingBitsAndRefs>.fromCell(raw);
            val opcode = message.loadBody().preloadUint(32);
            if (opcode == 0x3216ca09) {
                nativeReturn = raw;
            }
            if (opcode == 0x0f8a7ea5) {
                jettonReturn = raw;
            }
            i += 1;
        }
        cursor!.close();
        assert (nativeReturn != null && jettonReturn != null) throw 1204;
        // Reschedule the actual library payouts, preserving their bodies and destinations.
        val firstTrace = net.send(
            pool,
            OutMessage { messageCell: jettonsFirst ? jettonReturn! : nativeReturn! },
        );
        if (!jettonsFirst) {
            nativeCallback = callbackTo(firstTrace, pool, e.curve.address);
            expect(firstTrace).toHaveTx<PoolCallback>({ from: pool, to: e
                    .curve
                    .address, value: migration.tonAmount });
        }
        val first = e.curve.getMigrationData()!;
        expect(first.closingDeposit).toEqual(true);
        expect(first.nativeRetry).toEqual(!jettonsFirst);
        expect(first.jettonRetry).toEqual(jettonsFirst);
        val blocked = e.curve.sendRetryMigration(e.buyer, 201, { value: ton("0.5") });
        expect(blocked).toHaveFailedTx<RetryMigration>({ to: e.curve.address, exitCode: 72 });
        expect(e.curve.getMigrationData()!.depositGeneration).toEqual(migration.depositGeneration);
        val reserve = e.curve.getCurveData().realTonReserve;
        val protocol = testing.treasury("act-owner").address;
        val master = BondingCurveMasterV2.fromStorage({ admin: protocol, nextAdmin: null, treasury: protocol, totalLaunches: 0, feesBalance: 0 });
        val fees = master.getMasterData().feesBalance;
        e.curve.sendFlushFees(e.buyer, 202, { value: ton("0.05") });
        expect(e.curve.getCurveData().realTonReserve).toEqual(reserve);
        expect(master.getMasterData().feesBalance - fees < migration.tonAmount).toEqual(true);
        // Duplicate the first authenticated receipt while the other payout is delayed.
        if (jettonsFirst) {
            lateTokenReceipt(
                e,
                migration.depositGeneration,
                migration.jettonQueryId,
                migration.jettonAmount,
                e.minter.getWalletAddress(e.curve.address),
            );
        } else {
            lateNativeReceipt(
                e,
                migration.depositGeneration,
                join.queryId,
                migration.tonAmount,
                pool,
                migration.tonAmount,
                MigrationDepositRefundContext {
                    depositGeneration: migration.depositGeneration,
                }.toCell(),
            );
        }
        expect(e.curve.getCurveData().realTonReserve).toEqual(reserve);
        expect(e.curve.getMigrationData()!.nativeRetry).toEqual(first.nativeRetry);
        expect(e.curve.getMigrationData()!.jettonRetry).toEqual(first.jettonRetry);
        rejected = net.send(
            pool,
            OutMessage { messageCell: jettonsFirst ? nativeReturn! : jettonReturn! },
        );
        if (jettonsFirst) {
            nativeCallback = callbackTo(rejected, pool, e.curve.address);
            expect(rejected).toHaveTx<PoolCallback>({ from: pool, to: e
                    .curve
                    .address, value: migration.tonAmount });
        }
    } else {
        rejected = cursor!.executeAllRemaining();
        cursor!.close();
    }
    if (!reordered) {
        nativeCallback = callbackTo(rejected, pool, e.curve.address);
        expect(rejected).toHaveTx<PoolCallback>({ from: pool, to: e
                .curve
                .address, value: migration.tonAmount });
    }
    val returned = nativeCallback!;
    val after = e.curve.getCurveData();
    val recovered = e.curve.getMigrationData()!;
    println(
        "LATE_JOIN_REFUND leg={} join_id={} native_id={} jetton_id={} code={}",
        retryLeg,
        join.queryId,
        migration.nativeQueryId,
        migration.jettonQueryId,
        returned.code,
    );
    println(
        "LATE_JOIN_STATUS refund_id={} native_retry={} jetton_retry={}",
        returned.queryId,
        recovered.nativeRetry,
        recovered.jettonRetry,
    );
    println(
        "LATE_JOIN_NATIVE returned_amount={} expected_amount={}",
        returned.amount0,
        migration.tonAmount,
    );
    println(
        "LATE_JOIN_BALANCES native_restored={} jettons_restored={} wallet_restored={}",
        after.realTonReserve - before.realTonReserve,
        after.curveJettonBalance - before.curveJettonBalance,
        v2Tokens(e.minter, e.curve.address) - walletBefore,
    );
    setRecoveryPoolData(pool, original);
    // The pool exits with error 30, but its generic asset payout callback uses code 0.
    expect(returned.code).toEqual(0);
    expect(returned.queryId).toEqual(join.queryId);
    expect(returned.amount0).toEqual(migration.tonAmount);
    if (probeOnly) {
        val context = MigrationDepositRefundContext { depositGeneration: 1 }.toCell();
        expect(returned.payload!.hash()).toEqual(context.hash());
        val refund = rejected.findTransaction<InternalTransferStep>({ from: e
                .minter
                .getWalletAddress(pool), to: e.minter.getWalletAddress(e.curve.address) });
        assert (refund != null) throw 1203;
        println("LATE_REFUND_RECEIVE_GAS {}", refund!.getUsedGas());
        expect(refund!.getUsedGas()).toBeLessOrEqual(V2_RECEIVE_GAS);
        var payload = refund!.loadBody<InternalTransferStep>().forwardPayload;
        val ref = payload.loadMaybeRef();
        if (ref != null) {
            payload.assertEnd();
            payload = ref!.beginParse();
        }
        val wrapped = MigrationPayoutPayload.fromSlice(payload);
        expect(wrapped.exitCode).toEqual(0);
        expect(wrapped.payload!.hash()).toEqual(context.hash());
        return;
    }
    expect(v2Tokens(e.minter, pool)).toEqual(0);
    // Both assets were returned by the same failed deposit; both must be recoverable.
    expect(recovered.nativeRetry).toEqual(true);
    expect(recovered.jettonRetry).toEqual(true);
    expect(after.realTonReserve).toEqual(before.realTonReserve + migration.tonAmount);
    expect(after.curveJettonBalance).toEqual(before.curveJettonBalance + migration.jettonAmount);
    expect(v2Tokens(e.minter, e.curve.address)).toEqual(walletBefore + migration.jettonAmount);
    if (reordered) {
        val feesBeforeRetry = masterMigrationFees(e);
        val one = v2Cursor(e.buyer, e.curve.address, ton("0.5"), RetryMigration { queryId: 203 });
        val two = v2Cursor(
            e.attacker,
            e.curve.address,
            ton("0.5"),
            RetryMigration { queryId: 204 },
        );
        one.executeN(1);
        expect(two.executeAllRemaining()).toHaveFailedTx<RetryMigration>({ to: e
                .curve
                .address, exitCode: 72 });
        two.close();
        val next = e.curve.getMigrationData()!;
        expect(next.depositGeneration).toEqual(migration.depositGeneration + 1);
        expect(next.closingDeposit).toEqual(false);
        one.executeTill<AskToTransferTracked>({ to: e.minter.getWalletAddress(e.curve.address) });
        // Old generation with the new transfer ID must not bypass the protected wallet.
        val stale = net.send(
            e.minter.getWalletAddress(pool),
            createMessage({ bounce: false, dest: e
                    .minter
                    .getWalletAddress(
                        e.curve.address,
                    ), value: ton("0.3"), body: InternalTransferStep {
                    queryId: next.jettonQueryId,
                    jettonAmount: next.jettonAmount,
                    transferInitiator: pool,
                    sendExcessesTo: null,
                    forwardTonAmount: ton("0.2"),
                    forwardPayload: beginCell()
                        .storeUint(1, 1)
                        .storeRef(
                            MigrationPayoutPayload {
                                exitCode: 0,
                                payload: MigrationDepositRefundContext {
                                    depositGeneration: migration.depositGeneration,
                                }.toCell(),
                            }.toCell(),
                        )
                        .toSlice(),
                } }),
        );
        expect(stale).toHaveFailedTx<InternalTransferStep>({ to: e
                .minter
                .getWalletAddress(e.curve.address), exitCode: 48 });
        lateNativeReceipt(
            e,
            migration.depositGeneration,
            next.nativeQueryId,
            next.tonAmount,
            pool,
            next.tonAmount,
            MigrationDepositRefundContext {
                depositGeneration: migration.depositGeneration,
            }.toCell(),
        );
        lateTokenReceipt(
            e,
            migration.depositGeneration,
            next.jettonQueryId,
            next.jettonAmount,
            e.minter.getWalletAddress(e.curve.address),
        );
        expect(e.curve.getMigrationData()!.nativeRetry).toEqual(false);
        expect(e.curve.getMigrationData()!.jettonRetry).toEqual(false);
        one.executeAllRemaining();
        one.close();
        expect(masterMigrationFees(e)).toEqual(feesBeforeRetry + ton("20"));
    } else {
        retryMigration("act-buyer", e.curve.address);
    }
    expectMigrated(e, pool);
}

fun masterMigrationFees(e: Env): coins {
    val protocol = testing.treasury("act-owner").address;
    return BondingCurveMasterV2
        .fromStorage({ admin: protocol, nextAdmin: null, treasury: protocol, totalLaunches: 0, feesBalance: 0 })
        .getMasterData()
        .feesBalance;
}

get fun `test recovery: late native first blocks premature and duplicate retries`() {
    lateJoinRefundScenario(1, false, true, false);
}

get fun `test recovery: late jettons first blocks premature and duplicate retries`() {
    lateJoinRefundScenario(2, false, true, true);
}

get fun `test recovery: malformed stale unrelated and underfunded late refunds cannot restore principal`() {
    val e = setupEnv(9981);
    val pool = e.curve.getPoolAddress();
    val (native, jettons) = recoveryLegs(e);
    val m = e.curve.getMigrationData()!;
    val before = e.curve.getCurveData();
    val context: cell = MigrationDepositRefundContext {
        depositGeneration: m.depositGeneration,
    }.toCell();
    var i = 0;
    repeat (6) {
        val payload = i == 0
            ? null
            : i == 1
                ? beginCell().storeUint(0xa0a0b066, 32).endCell()
                : i == 2
                    ? MigrationDepositRefundContext {
                        depositGeneration: m.depositGeneration + 1,
                    }.toCell() as cell
                    : context;
        lateNativeReceipt(
            e,
            m.depositGeneration,
            m.nativeQueryId,
            m.tonAmount + (i == 3 ? 1 : 0),
            i == 4 ? e.attacker : pool,
            i == 5 ? ton("0.01") : m.tonAmount,
            payload,
        );
        lateTokenReceipt(
            e,
            m.depositGeneration + (i == 0 ? 1 : 0),
            m.jettonQueryId + (i == 1 ? 1 : 0),
            m.jettonAmount + (i == 2 ? 1 : 0),
            i >= 3 ? e.attacker : e.minter.getWalletAddress(e.curve.address),
        );
        expect(e.curve.getCurveData().realTonReserve).toEqual(before.realTonReserve);
        expect(e.curve.getCurveData().curveJettonBalance).toEqual(before.curveJettonBalance);
        expect(e.curve.getMigrationData()!.closingDeposit).toEqual(false);
        i += 1;
    }
    // A funded ordinary pool notification must not bypass the wallet receipt protocol.
    net.send(
        e.minter.getWalletAddress(e.curve.address),
        createMessage({ bounce: false, dest: e
                .curve
                .address, value: ton("0.2"), body: TransferNotificationForRecipient {
                queryId: m.jettonQueryId,
                jettonAmount: m.jettonAmount,
                transferInitiator: pool,
                forwardPayload: beginCell().storeUint(0, 1).toSlice(),
            } }),
    );
    expect(e.curve.getMigrationData()!.jettonRetry).toEqual(false);
    val cursor = testing.createTraceIterationCursor(e.curve.address, jettons);
    cursor.executeN(1);
    val balance = v2Tokens(e.minter, e.curve.address);
    i = 0;
    repeat (4) {
        val payload = i == 0
            ? null
            : i == 1
                ? beginCell().storeUint(0xa0a0b066, 32).endCell()
                : i == 2
                    ? MigrationDepositRefundContext {
                        depositGeneration: m.depositGeneration + 1,
                    }.toCell() as cell
                    : context;
        val wrapped = MigrationPayoutPayload {
            exitCode: 0,
            payload,
        }.toCell();
        val bad = net.send(
            i == 3 ? e.attacker : e.minter.getWalletAddress(pool),
            createMessage({ bounce: false, dest: e
                    .minter
                    .getWalletAddress(
                        e.curve.address,
                    ), value: ton("0.3"), body: InternalTransferStep {
                    queryId: m.jettonQueryId,
                    jettonAmount: m.jettonAmount,
                    transferInitiator: pool,
                    sendExcessesTo: null,
                    forwardTonAmount: ton("0.2"),
                    forwardPayload: beginCell().storeUint(1, 1).storeRef(wrapped).toSlice(),
                } }),
        );
        expect(
            bad.findTransaction<InternalTransferStep>({ to: e
                    .minter
                    .getWalletAddress(e.curve.address), success: false }) !=
                null,
        ).toEqual(true);
        expect(v2Tokens(e.minter, e.curve.address)).toEqual(balance);
        i += 1;
    }
    cursor.executeAllRemaining();
    cursor.close();
    net.send(e.curve.address, native);
    expectMigrated(e, pool);
    val final = e.curve.getCurveData();
    val fees = masterMigrationFees(e);
    lateNativeReceipt(
        e,
        m.depositGeneration,
        m.nativeQueryId,
        m.tonAmount,
        pool,
        m.tonAmount,
        context,
    );
    lateTokenReceipt(
        e,
        m.depositGeneration,
        m.jettonQueryId,
        m.jettonAmount,
        e.minter.getWalletAddress(e.curve.address),
    );
    expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    expect(e.curve.getCurveData().realTonReserve).toEqual(final.realTonReserve);
    expect(e.curve.getCurveData().curveJettonBalance).toEqual(final.curveJettonBalance);
    expect(masterMigrationFees(e)).toEqual(fees);
}

get fun `test recovery: retry counter overflow rejects before state or sends change`() {
    val e = setupEnv(9982);
    val pool = e.curve.getPoolAddress();
    val (native, jettons) = recoveryLegs(e);
    val original = recoveryPoolData(pool);
    initializingRecoveryPool(pool, e.attacker);
    net.send(e.curve.address, native);
    net.send(e.curve.address, jettons);
    setRecoveryPoolData(pool, original);
    val saved = recoveryPoolData(e.curve.address);
    var i = 0;
    repeat (4) {
        var storage = BondingCurveStorage.fromCell(saved);
        var m = storage.migration!.load();
        if (i == 0) {
            m.nativeQueryId = (1 << 64) - 1;
        }
        if (i == 1) {
            m.jettonQueryId = (1 << 64) - 1;
        }
        if (i == 2) {
            m.depositGeneration = (1 << 64) - 1;
        }
        if (i == 3) {
            m.refundCheckId = (1 << 64) - 1;
            m.pendingNativeRefund = true;
        }
        storage.migration = m.toCell();
        setRecoveryPoolData(e.curve.address, storage.toCell());
        val result = e.curve.sendRetryMigration(e.buyer, 205, { value: ton("0.5") });
        expect(result).toHaveFailedTx<RetryMigration>({ to: e.curve.address, exitCode: 72 });
        expect(e.curve.getMigrationData()!.toCell().hash()).toEqual(m.toCell().hash());
        expect(pd(pool).liquidity).toEqual(0);
        i += 1;
    }
    setRecoveryPoolData(e.curve.address, saved);
    retryMigration("act-buyer", e.curve.address);
    expectMigrated(e, pool);
}

get fun `test recovery: real DeDust late refunds preserve generation context`() {
    lateJoinRefundScenario(0, true);
}

get fun `test recovery: late JoinLiquidity refund with equal IDs retries with all LP locked`() {
    lateJoinRefundScenario(0);
}

get fun `test recovery: late JoinLiquidity refund after native-only retry restores both legs`() {
    lateJoinRefundScenario(1);
}

get fun `test recovery: late JoinLiquidity refund after jetton-only retry restores both legs`() {
    lateJoinRefundScenario(2);
}

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
