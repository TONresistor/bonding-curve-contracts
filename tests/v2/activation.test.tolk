// DeDust CPMM v2 depositActivation = ActivationInitiator(curve), measured against the pinned
// mainnet pool, deposit and position libraries loaded by loadV2Libraries() (hash-checked).
//
// Standalone tests deploy a pool at a custom config (same layout as buildCpmmV2PoolConfig,
// explicit activation fields) with an "activator" treasury standing in for the curve. Curve tests
// run the real graduation and force third-party messages in at chosen points of its trace.
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/message"
import "@acton/types/transaction"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/BuybackBurnV2.gen"
import "@wrappers/FeeCollectorV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-dedust"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/buyback-messages"
import "migration"
import "../shared/dedust"

// DeDust CPMM v2 payout callback (ABI: DedustV2CpmmCallback3216ca09).
struct (0x3216ca09) PoolCallback {
    queryId: uint64
    amount0: coins
    code: int32
    payload: cell?
}

const OP_PAY_NATIVE = 0xa5a7cbf8
const OP_TRANSFER_NOTIFICATION = 0x7362d09c
const OP_JOIN_LIQUIDITY = 0x25251ee0
const OP_INIT_POOL = 0xde8402ce

const POOL_INITIALIZED = 2

fun activationInitiator(who: address): cell {
    return beginCell().storeUint(2, 8).storeAddress(who).endCell();
}

// Same layout as buildCpmmV2PoolConfig, with explicit activation rules.
fun customPool(
    minter: address,
    creator: address,
    bps: int,
    dep: cell?,
    swp: cell?,
): AutoDeployAddress {
    val config = beginCell()
        .storeUint(0, 2)
        .storeAddress(minter)
        .storeAddress(creator)
        .storeUint(poolBaseFeeBps(bps), 16)
        .storeUint(5000, 16)
        .storeMaybeRef(dep)
        .storeMaybeRef(swp)
        .storeUint(DEDUST_FEE_IN_BOTH, 2)
        .storeBool(false)
        .storeBool(false)
        .endCell();
    return {
        workchain: 0,
        stateInit: {
            code: buildCpmmV2PoolCode(),
            data: beginCell()
                .storeRef(config)
                .storeRef(buildCpmmV2PoolFees())
                .storeRef(buildCpmmV2PoolExtra())
                .storeBool(false)
                .storeUint(0, 2)
                .storeBool(false)
                .storeBool(false)
                .storeCoins(0)
                .storeCoins(0)
                .storeCoins(0)
                .endCell(),
        },
    };
}

struct Env {
    curve: BondingCurveV2
    minter: JettonMinterV2
    attacker: address
    activator: address
    buyer: address
    creator: address
}

fun setupEnv(salt: uint64): Env {
    testing.setNow(V2_TIME);
    loadV2Libraries();
    val owner = testing.treasury("act-owner").address;
    val creator = testing.treasury("act-creator").address;
    val buyer = testing.treasury("act-buyer").address;
    val attacker = testing.treasury("act-attacker").address;
    val activator = testing.treasury("act-activator").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    master.deploy(owner, { value: ton("2") });
    val options = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
    };
    master.sendCreateLaunch(
        creator,
        1,
        beginCell().endCell(),
        salt,
        options,
        { value: ton("101") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, salt, options));
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    curve.sendBuyJettons(attacker, 1, 0, { value: ton("20.05") });
    curve.sendBuyJettons(activator, 2, 0, { value: ton("20.05") });
    return {
        curve,
        minter,
        attacker,
        activator,
        buyer,
        creator,
    };
}

fun pd(pool: address): SimulationPoolData {
    return net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
}

fun initPool(from: address, poolAuto: AutoDeployAddress, id: uint64): SendResultList {
    return net.send(
        from,
        createMessage({ bounce: false, dest: poolAuto, value: ton("0.3"), body: DedustInit {
                queryId: id,
                customPayload: null,
            } }),
    );
}

fun payNative(from: address, pool: address, x: coins, y: coins): SendResultList {
    return net.send(
        from,
        createMessage({ bounce: true, dest: pool, value: x + ton("0.3"), body: V2PayNative {
                queryId: 11,
                amount: x,
                paymentPayload: buildDepositPayload(x, y),
                payoutConfig: buildEmptyExtendedPayoutConfig(from),
            } }),
    );
}

fun payJettons(
    minter: JettonMinterV2,
    from: address,
    pool: address,
    x: coins,
    y: coins,
): SendResultList {
    val payload = beginCell()
        .storeUint(DEDUST_CPMM_V2_OP_PAY_JETTON, 32)
        .storeRef(buildDepositPayload(x, y))
        .storeRef(buildEmptyExtendedPayoutConfig(from))
        .endCell();
    return net.send(
        from,
        createMessage({ bounce: true, dest: minter.getWalletAddress(
                from,
            ), value: ton("0.5"), body: v2Transfer(
                12,
                y,
                pool,
                from,
                payload,
            ) }),
    );
}

fun swapNative(from: address, pool: address, x: coins): SendResultList {
    return net.send(
        from,
        createMessage({ bounce: true, dest: pool, value: x + ton("0.3"), body: V2PayNative {
                queryId: 13,
                amount: x,
                paymentPayload: V2Swap {
                    minimalAmountOut: 1,
                    deadline: V2_TIME + 100000,
                }.toCell(),
                payoutConfig: buildEmptyExtendedPayoutConfig(from),
            } }),
    );
}

fun graduatingBuy(curve: BondingCurveV2): OutMessage {
    return createMessage({ bounce: true, dest: curve.address, value: ton("2500.05"), body: BuyJettons {
            queryId: 50,
            minJettonsOut: 0,
        } });
}

fun callbackTo(trace: SendResultList, pool: address, to: address): PoolCallback {
    val tx = trace.findTransaction<PoolCallback>({ from: pool, to });
    assert (tx != null) throw 1100;
    return tx!.loadInMsg<PoolCallback>().loadBody();
}

fun initResultCode(trace: SendResultList, pool: address, to: address): int {
    val tx = trace.findTransaction<InitPoolResultMessage>({ from: pool, to });
    assert (tx != null) throw 1101;
    return tx!.loadInMsg<InitPoolResultMessage>().loadBody().exitCode;
}

// A rejected two-leg deposit: native leg refunded by Callback(code), jetton leg sent back.
fun expectRejectedDeposit(
    e: Env,
    pool: address,
    who: address,
    x: coins,
    y: coins,
    code: int,
) {
    val before = pd(pool);
    val tokens = v2Tokens(e.minter, who);
    val native = payNative(who, pool, x, y);
    expect(
        native,
    ).toHaveTx({ from: who, to: pool, opcode: OP_PAY_NATIVE, exitCode: code, aborted: false });
    val cb = callbackTo(native, pool, who);
    expect(cb.code).toEqual(code);
    expect(cb.amount0).toEqual(x);
    expect(native).toHaveTx<PoolCallback>({ from: pool, to: who, value: x });
    val jet = payJettons(e.minter, who, pool, x, y);
    expect(
        jet,
    ).toHaveTx({ to: pool, opcode: OP_TRANSFER_NOTIFICATION, exitCode: code, aborted: false });
    expect(jet).toHaveTx({ from: pool, to: e.minter.getWalletAddress(pool), opcode: 0x0f8a7ea5 });
    expect(v2Tokens(e.minter, who)).toEqual(tokens);
    expect(pd(pool).reserveX).toEqual(before.reserveX);
    expect(pd(pool).reserveY).toEqual(before.reserveY);
    expect(pd(pool).liquidity).toEqual(before.liquidity);
}

fun expectAcceptedDeposit(e: Env, pool: address, who: address, x: coins, y: coins) {
    val before = pd(pool);
    expect(
        payNative(who, pool, x, y),
    ).toHaveTx({ from: who, to: pool, opcode: OP_PAY_NATIVE, exitCode: 0 });
    val jet = payJettons(e.minter, who, pool, x, y);
    expect(jet).toHaveTx({ to: pool, opcode: OP_JOIN_LIQUIDITY, exitCode: 0, aborted: false });
    expect(pd(pool).liquidity > before.liquidity).toEqual(true);
}

fun expectSwapRejected(pool: address, who: address, code: int) {
    val before = pd(pool);
    val trace = swapNative(who, pool, ton("1"));
    expect(
        trace,
    ).toHaveTx({ from: who, to: pool, opcode: OP_PAY_NATIVE, exitCode: code, aborted: false });
    val cb = callbackTo(trace, pool, who);
    expect(cb.code).toEqual(code);
    expect(cb.amount0).toEqual(ton("1"));
    expect(trace).toHaveTx<PoolCallback>({ from: pool, to: who, value: ton("1") });
    expect(pd(pool).reserveX).toEqual(before.reserveX);
    expect(pd(pool).reserveY).toEqual(before.reserveY);
}

fun expectSwapAccepted(pool: address, who: address) {
    val before = pd(pool);
    val trace = swapNative(who, pool, ton("1"));
    expect(
        trace,
    ).toHaveTx({ from: who, to: pool, opcode: OP_PAY_NATIVE, exitCode: 0, aborted: false });
    // Reserves move (part of the input is kept as protocol/creator fee outside the reserves).
    expect(pd(pool).reserveX > before.reserveX).toEqual(true);
    expect(pd(pool).reserveY < before.reserveY).toEqual(true);
}

fun expectFlags(pool: address, status: int, deposit: bool, swap: bool) {
    val p = pd(pool);
    expect(p.status).toEqual(status);
    expect(p.depositActive).toEqual(deposit);
    expect(p.swapActive).toEqual(swap);
}

// ---------------------------------------------------------------------------------------------
// ActivationInitiator on a standalone pool
// ---------------------------------------------------------------------------------------------

get fun `test activation: InitPool stays permissionless under an initiator rule`() {
    val e = setupEnv(7001);
    val poolAuto = customPool(
        e.minter.address,
        e.creator,
        100,
        activationInitiator(e.activator),
        null,
    );
    val pool = poolAuto.calculateAddress();
    val first = initPool(e.attacker, poolAuto, 1);
    expect(
        first,
    ).toHaveTx({ from: e.attacker, to: pool, opcode: OP_INIT_POOL, exitCode: 0, deploy: true });
    expect(initResultCode(first, pool, e.attacker)).toEqual(0);
    expectFlags(pool, POOL_INITIALIZED, false, true);
    // The configured activator is not special for InitPool: it gets 20 like anyone else.
    val second = initPool(e.activator, poolAuto, 2);
    expect(
        second,
    ).toHaveTx({ from: e.activator, to: pool, opcode: OP_INIT_POOL, exitCode: 20, aborted: false });
    expect(initResultCode(second, pool, e.activator)).toEqual(20);
    expectFlags(pool, POOL_INITIALIZED, false, true);
}

get fun `test activation: initiator rule rejects others until the activator deposits`() {
    val e = setupEnv(7002);
    val poolAuto = customPool(
        e.minter.address,
        e.creator,
        100,
        activationInitiator(e.activator),
        activationInitiator(e.activator),
    );
    val pool = poolAuto.calculateAddress();
    initPool(e.attacker, poolAuto, 1);
    expectFlags(pool, POOL_INITIALIZED, false, false);
    val atk = v2Tokens(e.minter, e.attacker);
    val act = v2Tokens(e.minter, e.activator);
    // Both legs rejected with 38 DepositNotActive and refunded (TON by Callback, jettons back).
    expectRejectedDeposit(
        e,
        pool,
        e.attacker,
        ton("1"),
        atk / 100,
        38,
    );
    // An empty pool rejects swaps with 34 ZeroLiquidity before the swap gate is checked.
    expectSwapRejected(pool, e.attacker, 34);

    // The activator's native leg alone does not open deposits ...
    expect(
        payNative(e.activator, pool, ton("5"), act / 2),
    ).toHaveTx({ from: e.activator, to: pool, opcode: OP_PAY_NATIVE, exitCode: 0 });
    expectFlags(pool, POOL_INITIALIZED, false, false);
    // ... so a third party still cannot slip a skewed deposit in between the activator's legs.
    expectRejectedDeposit(
        e,
        pool,
        e.attacker,
        ton("1"),
        atk / 100,
        38,
    );
    // The activator's JoinLiquidity opens deposits, not swaps.
    val join = payJettons(e.minter, e.activator, pool, ton("5"), act / 2);
    expect(join).toHaveTx({ to: pool, opcode: OP_JOIN_LIQUIDITY, exitCode: 0 });
    expectFlags(pool, POOL_INITIALIZED, true, false);
    expect(pd(pool).reserveX).toEqual(ton("5"));
    expect(pd(pool).reserveY).toEqual(act / 2);
    expectAcceptedDeposit(e, pool, e.attacker, ton("1"), atk / 10);
    // Why the curve pool leaves swapActivation empty: an initiator swap gate stays closed (37)
    // until the activator itself swaps, which the curve never does.
    expectSwapRejected(pool, e.attacker, 37);
    expectSwapAccepted(pool, e.activator);
    expectFlags(pool, POOL_INITIALIZED, true, true);
    expectSwapAccepted(pool, e.attacker);
}

// ---------------------------------------------------------------------------------------------
// Curve migration against the curve's own pool config
// ---------------------------------------------------------------------------------------------

fun expectMigrated(e: Env, pool: address) {
    expect(e.curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    val m = e.curve.getMigrationData()!;
    val p = pd(pool);
    expectFlags(pool, POOL_INITIALIZED, true, true);
    // The curve is the first and only liquidity provider, at the curve's own price.
    expect(p.reserveX).toEqual(m.tonAmount);
    expect(p.reserveY).toEqual(m.jettonAmount);
    val lp = net.runGetMethod<SimulationPositionData>(
        calcMigrationPosition(pool, e.curve.address),
        "get_position_data",
    );
    expect(lp.liquidity).toEqual(p.liquidity);
    expect(lp.lockedLiquidity).toEqual(p.liquidity);
    expect(
        lp.lockedLiquidity >= migrationMinimumLiquidity(m.tonAmount, m.jettonAmount),
    ).toEqual(true);
}

fun curvePool(e: Env): AutoDeployAddress {
    val auto = calcDeployedCpmmV2Pool(
        e.minter.address,
        e.curve.getCollectorAddress(),
        100,
        e.curve.address,
    );
    expect(auto.calculateAddress()).toEqual(e.curve.getPoolAddress());
    return auto;
}

get fun `test activation: migration deposit opens the pool for everyone`() {
    val e = setupEnv(7101);
    val pool = curvePool(e).calculateAddress();
    val cursor = testing.createTraceIterationCursor(e.buyer, graduatingBuy(e.curve));
    val init = cursor.executeTill<InitPoolResultMessage>({ from: pool, to: e.curve.address });
    expect(initResultCode(init, pool, e.curve.address)).toEqual(0);
    expectFlags(pool, POOL_INITIALIZED, false, true);
    // Nothing to swap against before the curve's deposit: 34 ZeroLiquidity, input refunded.
    expectSwapRejected(pool, e.attacker, 34);
    cursor.executeAllRemaining();
    cursor.close();
    expectMigrated(e, pool);
    expectAcceptedDeposit(e, pool, e.attacker, ton("1"), v2Tokens(e.minter, e.attacker) / 100);
    expectSwapAccepted(pool, e.attacker);
    expectSwapAccepted(pool, e.buyer);
}

// The drain from a skewed first deposit (10 TON : 1 jetton) landing after the curve handles
// InitPoolResult(0) and before both of our legs: the pool now refuses it.
get fun `test activation: skewed deposit before our legs is refused`() {
    val e = setupEnv(7102);
    val pool = curvePool(e).calculateAddress();
    val tokens = v2Tokens(e.minter, e.attacker);
    val cursor = testing.createTraceIterationCursor(e.buyer, graduatingBuy(e.curve));
    cursor.executeTill<InitPoolResultMessage>({ from: pool, to: e.curve.address });
    expect(e.curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
    expectRejectedDeposit(
        e,
        pool,
        e.attacker,
        ton("10"),
        1000000000,
        38,
    );
    expectSwapRejected(pool, e.attacker, 34);
    cursor.executeAllRemaining();
    cursor.close();
    expectMigrated(e, pool);
    // The attacker holds no LP and got its jettons back: selling them only meets the curve's price.
    expect(testing.isDeployed(calcMigrationPosition(pool, e.attacker))).toEqual(false);
    expect(v2Tokens(e.minter, e.attacker)).toEqual(tokens);
}

get fun `test activation: deposit between the curve legs is refused`() {
    val e = setupEnv(7103);
    val pool = curvePool(e).calculateAddress();
    val cursor = testing.createTraceIterationCursor(e.buyer, graduatingBuy(e.curve));
    cursor.executeTill({ from: e.curve.address, to: pool, opcode: OP_PAY_NATIVE });
    expect(e.curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
    expectFlags(pool, POOL_INITIALIZED, false, true);
    expectRejectedDeposit(
        e,
        pool,
        e.attacker,
        ton("1"),
        v2Tokens(e.minter, e.attacker) / 100,
        38,
    );
    expectSwapRejected(pool, e.attacker, 34);
    cursor.executeAllRemaining();
    cursor.close();
    expectMigrated(e, pool);
}

// Known remaining issue: a third-party InitPool still freezes the curve (20 NotUninitialized),
// but the front-runner cannot seed the pool, and none of our liquidity reaches it.
get fun `test activation: front-run InitPool freezes the curve and leaves the pool empty`() {
    val e = setupEnv(7104);
    val poolAuto = curvePool(e);
    val pool = poolAuto.calculateAddress();
    expect(initResultCode(initPool(e.attacker, poolAuto, 666), pool, e.attacker)).toEqual(0);
    expectFlags(pool, POOL_INITIALIZED, false, true);
    expectRejectedDeposit(
        e,
        pool,
        e.attacker,
        ton("1"),
        v2Tokens(e.minter, e.attacker) / 100,
        38,
    );
    expectSwapRejected(pool, e.attacker, 34);

    val grad = net.send(e.buyer, graduatingBuy(e.curve));
    expect(grad).toHaveTx({ from: e
            .curve
            .address, to: pool, opcode: OP_INIT_POOL, exitCode: 20, aborted: false });
    expect(initResultCode(grad, pool, e.curve.address)).toEqual(20);
    expect(e.curve.getState()).toEqual(CURVE_STATE_FROZEN);
    expect(grad).toNotHaveTx({ from: e.curve.address, to: pool, opcode: OP_PAY_NATIVE });
    expect(v2Tokens(e.minter, pool)).toEqual(0);
    val p = pd(pool);
    expect(p.reserveX).toEqual(0);
    expect(p.reserveY).toEqual(0);
    expect(p.liquidity).toEqual(0);
    expectFlags(pool, POOL_INITIALIZED, false, true);
}

get fun `test activation: curve collector and buyback derive the deployed pool`() {
    testing.setNow(V2_TIME);
    loadV2Libraries();
    val user = testing.treasury("act-buyback").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: user, nextAdmin: null, treasury: user, totalLaunches: 0, feesBalance: 0 });
    master.deploy(user, { value: ton("2") });
    val options = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("3000"),
        minDevTokens: 0,
        buybackBurn: true,
    };
    val launch = master.sendCreateLaunch(
        user,
        1,
        beginCell().endCell(),
        1,
        options,
        { value: ton("3001") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(user, 1, options));
    val minter = curve.getCurveData().jettonMinter!;
    val collector = FeeCollectorV2.fromAddress(curve.getCollectorAddress());
    val pool = curve.getPoolAddress();
    expect(curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    expect(
        launch,
    ).toHaveTx({ from: curve.address, to: pool, opcode: OP_INIT_POOL, exitCode: 0, deploy: true });
    expect(collector.getPoolAddress()).toEqual(pool);
    expect(
        calcDeployedCpmmV2Pool(minter, collector.address, 100, curve.address).calculateAddress(),
    ).toEqual(pool);
    // The curve is part of the pool's StateInit.
    expect(
        calcDeployedCpmmV2Pool(minter, collector.address, 100, user).calculateAddress() != pool,
    ).toEqual(true);

    curve.sendPrepareBuyback(user, 2, { value: ton("0.15") });
    val burner = BuybackBurnV2.fromAddress(curve.getBuybackAddress()!);
    curve.sendFlushCreatorFees(user, 3, { value: ton("0.05") });
    burner.sendClaimBuybackFees(user, 4, { value: ton("0.5") });
    val trace = burner.sendExecuteBuyback(user, 5, { value: BUYBACK_TRIGGER_GAS });
    expect(
        trace,
    ).toHaveTx({ from: burner.address, to: pool, opcode: OP_PAY_NATIVE, exitCode: 0, aborted: false });
    expect(burner.getBuybackData().burned > 0).toEqual(true);
}
