import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@contracts/bonding-config"
import "@contracts/bonding-storage"
import "@contracts/jetton-utils"
import "@contracts/messages"
import "@gen/JettonWallet.code"
import "@wrappers/BondingCurve.gen"

get fun `test M9 fix: partial mint clears jettonMinter so ReinitializeCurve can retry`() {
    val masterAddr = randomAddress();
    val minterAddr = randomAddress();
    val funder = testing.treasury("m9-funder");
    val creator = testing.treasury("m9-creator");
    val saltUsed = 9999 as uint64;

    val cfg: LaunchConfig = {
        master: masterAddr,
        creator: creator.address,
        salt: saltUsed,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val planted: BondingCurveStorage = {
        state: CURVE_STATE_INITIALIZING,
        jettonMinter: minterAddr,
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: 0,
        curveJettonBalance: 0,
        feeAccrued: 0,
        migrationReserve: 0,
        config: cfg.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: 0,
    };
    val curve = BondingCurve.fromStorage(planted);
    net.send(
        funder.address,
        createMessage({
            bounce: false,
            dest: { stateInit: curve.stateInit! },
            value: ton("2"),
            body: TopUpTons {},
        }),
    );

    val before = curve.getCurveData();
    expect(before.state).toEqual(CURVE_STATE_INITIALIZING);

    val ourWallet = calcAddressOfJettonWallet(
        curve.address,
        minterAddr,
        jettonWalletCompiledCode(),
    );
    val partialAmount = TOTAL_SUPPLY - ton("1");

    val notif: TransferNotificationForRecipient = {
        queryId: 0,
        jettonAmount: partialAmount,
        transferInitiator: curve.address,
        forwardPayload: beginCell().endCell().beginParse(),
    };
    val notifMsg = createMessage({
        bounce: false,
        value: ton("0.05"),
        dest: curve.address,
        body: notif,
    });

    testing.processSingleTraceStep(ourWallet, notifMsg);

    val after = curve.getCurveData();

    expect(after.state).toEqual(CURVE_STATE_INITIALIZING);
    expect(after.jettonMinter).toEqual(null);
    expect(after.curveJettonBalance).toEqual(0);
}
