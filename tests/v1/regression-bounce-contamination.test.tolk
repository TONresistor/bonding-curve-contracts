import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurve.gen"
import "@contracts/v1/bonding-config"
import "@contracts/v1/bonding-storage"
import "@contracts/v1/messages"
import "test-utils"

// Regression for the pendingBuyTonInNet cross-path contamination bug.
//
// Before the fix, BondingCurve.onBouncedMessage's AskToTransfer arm applied a
// "buy rollback" (realTonReserve -= pendingBuyTonInNet; feeAccrued += same)
// whenever pendingBuyTonInNet > 0. Because every AskToTransfer (buy delivery,
// sell/excess/frozen refunds, and the Phase-B pool seed) shares opcode
// 0x0f8a7ea5 and the bounce body is truncated (Only256BitsOfBody), a bounced
// REFUND or SEED would consume the stale value left by an earlier successful
// buy, silently moving user-backing reserve into admin-withdrawable fees.
//
// After the fix the arm only restores curve jetton inventory and never touches
// realTonReserve / feeAccrued. This plants a curve with a nonzero
// pendingBuyTonInNet and asserts a bounced AskToTransfer leaves the TON-side
// accounting untouched: it FAILS on the pre-fix code and PASSES on the fix.

get fun `test contamination: bounced AskToTransfer leaves realTonReserve and feeAccrued untouched`() {
    val realTon = ton("123");
    val feeAccrued = ton("7");
    val curveJettons = TOTAL_SUPPLY - ton("400");
    val stalePending = ton("99");
    val bouncedJettons = ton("400");

    val launchConfig: LaunchConfig = {
        master: randomAddress(),
        creator: randomAddress(),
        salt: 2001 as uint64,
        curveSupply: CURVE_SUPPLY,
        dexReserveSupply: DEX_RESERVE_SUPPLY,
        graduationThreshold: GRADUATION_THRESHOLD_TON,
    };
    val curveStorage: BondingCurveStorage = {
        state: CURVE_STATE_TRADING,
        jettonMinter: randomAddress(),
        virtualTonReserve: VIRTUAL_TON_RESERVE_INIT,
        realTonReserve: realTon,
        curveJettonBalance: curveJettons,
        feeAccrued,
        migrationReserve: 0,
        config: launchConfig.toCell(),
        dropAdminPending: false,
        pendingBuyTonInNet: stalePending,
    };
    val curve = BondingCurve.fromStorage(curveStorage);
    net.send(
        randomAddress(),
        createMessage({
            bounce: false,
            value: ton("2"),
            dest: { stateInit: curve.stateInit! },
            body: TopUpTons {},
        }),
    );

    val bouncedBody = beginCell()
        .storeUint(0xffffffff, 32)
        .storeUint(0x0f8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(bouncedJettons)
        .endCell();
    val sourceWallet = testing.treasury("contamination-source");
    val bouncedMsg = createMessage({
        bounce: false,
        value: ton("0.05"),
        dest: curve.address,
        body: bouncedBody,
    }).bounced();
    testing.processSingleTraceStep(sourceWallet.address, bouncedMsg);

    val after = curve.getCurveData();
    // Jetton inventory is restored (the transfer never moved the jettons)...
    expect(after.curveJettonBalance).toEqual(curveJettons + bouncedJettons);
    // ...but the TON-side accounting is NOT contaminated by the stale value:
    // the pre-fix code would have done realTon -= 99 and feeAccrued += 99 here.
    expect(after.realTonReserve).toEqual(realTon);
    expect(after.feeAccrued).toEqual(feeAccrued);
}
