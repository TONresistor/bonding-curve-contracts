import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurve.gen"
import "utils/common"

fun main() {
    val caller = promptJettonWallet("CALLER", "Select caller ActonWallet (pays gas)");
    val curveAddr = promptJettonAddressRequired("CURVE_ADDRESS", "BondingCurve to flush");
    val curve = BondingCurve.fromAddress(curveAddr);

    val before = curve.getCurveData();
    println("feeAccrued (pre-flush): {} nano-TON", before.feeAccrued);
    if (before.feeAccrued == 0) {
        println("Nothing to flush. Aborting (would throw BalanceError on-chain).");
        return;
    }

    val res = curve.sendFlushFees(
        caller.address,
        0,
        { value: ton("0.07"), bounce: true },
    );
    res.waitForFirstTransaction();

    val after = curve.getCurveData();
    println("=== FlushFees submitted ===");
    println("Curve:                  {}", curveAddr);
    println(
        "feeAccrued: {} -> {} (delta {})",
        before.feeAccrued,
        after.feeAccrued,
        before.feeAccrued - after.feeAccrued,
    );
}
