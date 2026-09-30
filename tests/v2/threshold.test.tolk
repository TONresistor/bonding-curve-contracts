import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@contracts/v1/bonding-config"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/wallet-messages"

fun thresholdGross(target: coins): coins {
    var gross = target * 100 / 99;
    while (gross - gross / 100 < target) {
        gross += 1;
    }
    return gross;
}

fun thresholdLaunch(threshold: coins, target: coins, salt: uint64): (
    BondingCurveV2,
    address,
    TxCursor,
) {
    val creator = testing.treasury("threshold-creator").address;
    val supply: coins = 1000000000000000000;
    val dev = thresholdGross(target);
    val options = LaunchOptions {
        supply,
        creatorFeeBps: 0,
        devBuyAmount: dev,
        minDevTokens: 0,
        graduationThreshold: threshold,
    };
    val curve = BondingCurveV2.fromStorage({
        state: CURVE_STATE_INITIALIZING,
        jettonMinter: null,
        virtualTonReserve: threshold / 5,
        realTonReserve: 0,
        curveJettonBalance: 0,
        feeAccrued: 0,
        migrationReserve: 0,
        config: LaunchConfig {
            master: creator,
            creator,
            salt,
            curveSupply: supply * 9 / 10,
            dexReserveSupply: supply / 10,
            graduationThreshold: threshold,
            options: options.toCell(),
        }.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
        progress: LaunchProgress {
            protocolTreasury: null,
            curveReceived: false,
            devReceived: false,
            devTokens: 0,
            creatorAccrued: 0,
        }.toCell(),
    });
    curve.deploy(creator, { value: ton("2") });
    val minter = JettonMinterV2.fromStorage({ totalSupply: 0, adminAddress: curve.address, nextAdminAddress: null, metadata: beginCell().endCell() });
    minter.deploy(creator, { value: ton("0.3") });
    val cursor = testing.createTraceIterationCursor(
        creator,
        createMessage({ bounce: true, dest: curve.address, value: dev +
                ton("1"), body: InitializeCurve {
                queryId: 1,
                jettonMinter: minter.address,
                refundTo: creator,
                protocolTreasury: creator,
            } }),
    );
    cursor.executeTill<InitializeCurve>({ to: curve.address });
    while (curve.getState() == CURVE_STATE_INITIALIZING) {
        cursor.executeTill<MintDelivered>({ to: curve.address });
    }
    return (curve, creator, cursor);
}

get fun `test v2: dev buy uses stored graduation threshold and progress`() {
    val thresholds: array<coins> = [ton("1000"), ton("3000")];
    var i = 0;
    repeat (2) {
        val threshold = thresholds.get(i);
        var delta = -1;
        repeat (3) {
            val target = threshold + delta;
            val (curve, _, cursor) = thresholdLaunch(threshold, target, 5000 + i * 3 + delta + 1);
            expect(curve.getCurveData().realTonReserve).toEqual(target);
            expect(curve.getState()).toEqual(delta < 0 ? CURVE_STATE_TRADING : CURVE_STATE_FROZEN);
            expect(curve.getProgressBps()).toEqual(min(target * 10000 / threshold, 10000));
            if (delta >= 0) {
                val graduate = cursor.executeTill<Graduate>({ to: curve.address });
                expect(graduate).toHaveSuccessfulTx<Graduate>({ to: curve.address });
                expect(curve.getState()).toEqual(CURVE_STATE_GRADUATING);
            }
            cursor.close();
            delta += 1;
        }
        i += 1;
    }
}

get fun `test v2: public buy crosses stored graduation threshold`() {
    val thresholds: array<coins> = [ton("1000"), ton("3000")];
    val buyer = testing.treasury("threshold-buyer").address;
    var i = 0;
    repeat (2) {
        val threshold = thresholds.get(i);
        val (curve, creator, launchCursor) = thresholdLaunch(
            threshold,
            threshold - ton("0.99"),
            6000 + i,
        );
        expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
        launchCursor.executeAllRemaining();
        launchCursor.close();
        val early = curve.sendGraduate(creator, 2, { value: ton("0.1"), bounce: true });
        expect(early).toHaveFailedTx<Graduate>({ to: curve.address, exitCode: 72 });
        val cursor = testing.createTraceIterationCursor(
            buyer,
            createMessage({ bounce: true, dest: curve.address, value: ton("1.05"), body: BuyJettons {
                    queryId: 3,
                    minJettonsOut: 0,
                } }),
        );
        val buy = cursor.executeTill<BuyJettons>({ to: curve.address });
        expect(buy).toHaveSuccessfulTx<BuyJettons>({ to: curve.address });
        expect(curve.getCurveData().realTonReserve).toEqual(threshold);
        expect(curve.getState()).toEqual(CURVE_STATE_FROZEN);
        expect(curve.getProgressBps()).toEqual(10000);
        val graduate = cursor.executeTill<Graduate>({ to: curve.address });
        expect(graduate).toHaveSuccessfulTx<Graduate>({ to: curve.address });
        expect(curve.getState()).toEqual(CURVE_STATE_GRADUATING);
        cursor.close();
        i += 1;
    }
}
