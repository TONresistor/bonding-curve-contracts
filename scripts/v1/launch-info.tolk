import "@acton/io"
import "@wrappers/BondingCurve.gen"
import "utils/common"

fun main() {
    val curveAddr = promptJettonAddressRequired("CURVE_ADDRESS", "BondingCurve address");
    val curve = BondingCurve.fromAddress(curveAddr);

    val data = curve.getCurveData();

    println("=== BondingCurve {} ===", curveAddr);
    println("State:                  {} ({})", stateName(data.state), data.state);
    println("Creator:                {}", data.creator);
    println("Salt:                   {}", data.salt);
    println("Jetton minter:          {}", data.jettonMinter);
    println("Virtual TON reserve:    {}", data.virtualTonReserve);
    println("Real TON reserve:       {}", data.realTonReserve);
    println("Curve jetton balance:   {}", data.curveJettonBalance);
    println("Curve supply (total):   {}", data.curveSupply);
    println("DEX reserve supply:     {}", data.dexReserveSupply);
    println("Graduation threshold:   {}", data.graduationThreshold);
    println("Fee accrued (TON):      {}", data.feeAccrued);

    val maxSafe = curve.getMaxSafeSell();
    val quoteOne = curve.getQuoteBuy(ton("1"));
    println("Max safe sell (jettons):{}", maxSafe);
    println("Quote: 1 TON buys ~     {} jettons (post-fee)", quoteOne);
}

fun stateName(state: uint8): string {
    if (state == 0) {
        return "Initializing";
    }
    if (state == 1) {
        return "Trading";
    }
    if (state == 2) {
        return "Graduating";
    }
    if (state == 3) {
        return "Migrated";
    }
    return "Unknown";
}
