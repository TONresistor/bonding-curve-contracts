import "@acton/io"
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
import "@contracts/v2/bonding-dedust"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "../simulation/dedust"

// Schema: https://hub-beta.dedust.io/docs/cpmm-v2/reference/pool
struct (0x25251ee0) FinalizationJoin {
    queryId: uint64
    config: cell
    amountX: coins
    amountY: coins
    initiatorAddress: address
}

struct (0x855afcbd) PositionCreditProbe {
    queryId: uint64
    rest: RemainingBitsAndRefs
}

// Modes: normal completion or concurrent confirmation requests.
fun simulateFinalization(mode: int) {
    val owner = testing.treasury("finalization-owner").address;
    val creator = testing.treasury("finalization-creator").address;
    val master = BondingCurveMasterV2.fromStorage({ admin: owner, nextAdmin: null, treasury: owner, totalLaunches: 0, feesBalance: 0 });
    testing.setShardAccount(master.address, null);
    master.deploy(owner, { value: ton("2") });
    val options = LaunchOptions {
        supply: 1000000000000000000,
        creatorFeeBps: 100,
        devBuyAmount: ton("100"),
        minDevTokens: 0,
    };
    val salt = 9100 + mode;
    master.sendCreateLaunch(
        creator,
        1,
        beginCell().endCell(),
        salt,
        options,
        { value: ton("101") },
    );
    val curve = BondingCurveV2.fromAddress(master.getLaunchAddress(creator, salt, options));
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val pool = curve.getPoolAddress();
    val poolWallet = JettonWallet.fromAddress(minter.getWalletAddress(pool));
    val cursor = testing.createTraceIterationCursor(
        owner,
        createMessage({ bounce: true, dest: curve.address, value: ton("2500.05"), body: BuyJettons {
                queryId: 50,
                minJettonsOut: 0,
            } }),
    );
    var deposit: address? = null;
    var join: FinalizationJoin? = null;
    var steps = 0;
    // Pause before the pool processes JoinLiquidity.
    while (join == null) {
        assert (!cursor.isDone() && steps < 100) throw 1000;
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
                    body.preloadUint(32) == 0x25251ee0
                ) {
                    join = FinalizationJoin.fromSlice(body);
                    deposit = result.tx.load().getAccountAddress();
                }
            }
            i += 1;
        }
        steps += 1;
    }
    val pending = join!;
    expect(calcMigrationPosition(pool, curve.address)).toEqual(
        net.runGetMethod<address>(pool, "get_position_address", [curve.address]),
    );
    val before = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
    expect(pending.initiatorAddress).toEqual(curve.address);
    expect(pending.amountX).toEqual(ton("2528"));
    expect(poolWallet.getWalletData().jettonBalance).toEqual(pending.amountY);
    expect(testing.getAccountBalance(pool) >= pending.amountX).toEqual(true);
    expect(before.reserveX).toEqual(0);
    expect(before.reserveY).toEqual(0);
    expect(before.liquidity).toEqual(0);
    println(
        "BOTH_ASSETS_RECEIVED ton={} jettons={} curve_state={} deposit_deployed={}",
        pending.amountX,
        pending.amountY,
        curve.getState(),
        testing.isDeployed(deposit!),
    );
    expect(curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
    expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
    expect(curve.getCurveData().realTonReserve).toEqual(ton("20"));
    val position = calcMigrationPosition(pool, curve.address);
    var first: TxCursor? = null;
    var second: TxCursor? = null;
    if (mode == 1) {
        cursor.executeTill<PositionCreditProbe>({ to: position });
        expect(curve.getState()).toEqual(CURVE_STATE_AWAITING_LIQUIDITY);
        expect(master.getMasterData().feesBalance).toEqual(ton("0.2"));
        first = testing.createTraceIterationCursor(
            owner,
            createMessage({ bounce: true, dest: curve.address, value: ton("0.1"), body: ConfirmMigration {
                    queryId: 10,
                } }),
        );
        second = testing.createTraceIterationCursor(
            owner,
            createMessage({ bounce: true, dest: curve.address, value: ton("0.1"), body: ConfirmMigration {
                    queryId: 11,
                } }),
        );
        first!.executeN(1);
        second!.executeN(1);
    }
    // Deliver the original notification before later Position responses.
    cursor.executeAllRemaining();
    cursor.close();
    if (first != null) {
        first!.executeAllRemaining();
        first!.close();
    }
    if (second != null) {
        second!.executeAllRemaining();
        second!.close();
    }
    val after = net.runGetMethod<SimulationPoolData>(pool, "get_pool_data");
    val lp = net.runGetMethod<SimulationPositionData>(position, "get_position_data");
    expect(after.reserveX).toEqual(pending.amountX);
    expect(after.reserveY).toEqual(pending.amountY);
    expect(after.liquidity > 0).toEqual(true);
    expect(lp.liquidity).toEqual(after.liquidity);
    expect(lp.lockedLiquidity).toEqual(lp.liquidity);
    expect(curve.getState()).toEqual(CURVE_STATE_MIGRATED);
    expect(master.getMasterData().feesBalance).toEqual(ton("20.2"));
    expect(curve.getCurveData().realTonReserve).toEqual(0);
    println("FINALIZATION_PASS mode={}", mode);
}
