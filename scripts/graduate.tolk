import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurve.gen"
import "utils/common"

fun main() {
    val caller = promptJettonWallet("CALLER", "Select caller ActonWallet (pays gas)");
    val curveAddr = promptJettonAddressRequired("CURVE_ADDRESS", "Curve to graduate");
    val curve = BondingCurve.fromAddress(curveAddr);

    val data = curve.getCurveData();
    println("Curve pre-flight:");
    println("  state:                  {}", data.state);
    println("  realTonReserve:         {} nano-TON", data.realTonReserve);
    println("  graduationThreshold:    {} nano-TON", data.graduationThreshold);
    println("  curveJettonBalance:     {}", data.curveJettonBalance);
    println("  dexReserveSupply:       {}", data.dexReserveSupply);

    if (data.state != 1 as uint8) {
        println("ABORT: curve state is {} (need 1=Trading).", data.state);
        return;
    }
    if (data.realTonReserve < data.graduationThreshold) {
        println(
            "ABORT: realTonReserve < threshold ({} < {})",
            data.realTonReserve,
            data.graduationThreshold,
        );
        return;
    }

    val res = curve.sendGraduate(
        caller.address,
        0,
        { value: ton("1.0"), bounce: true },
    );
    res.waitForFirstTransaction();

    val after = curve.getCurveData();
    println("=== Graduate submitted ===");
    println("Curve:                  {}", curveAddr);
    println("state: {} -> {}", data.state, after.state);
    println("realTonReserve: {} -> {}", data.realTonReserve, after.realTonReserve);
    println("");
    println("If state==2 (Graduating), CPMM v2 deploy is in flight; re-query in ~30s.");
    println("If state==3 (Migrated), pool is live and LP is locked permanently.");
}
