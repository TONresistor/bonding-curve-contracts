import "bonding-config"

fun computeBuyOut(
    tonIn: coins,
    virtualTon: coins,
    realTon: coins,
    jettonBalance: coins,
): (coins, coins) {
    val feeTon = (tonIn * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
    val tonInNet = tonIn - feeTon;

    val xBefore = virtualTon + realTon;
    val yBefore = jettonBalance;
    val xAfter = xBefore + tonInNet;

    val yAfter = (xBefore * yBefore) / xAfter;
    val jettonsOut = yBefore - yAfter;

    return (jettonsOut, feeTon);
}

fun computeSellOut(
    jettonIn: coins,
    virtualTon: coins,
    realTon: coins,
    jettonBalance: coins,
): (coins, coins) {
    val xBefore = virtualTon + realTon;
    val yBefore = jettonBalance;
    val yAfter = yBefore + jettonIn;

    val feeTon = (xBefore * jettonIn * PROTOCOL_FEE_BPS) / (yAfter * BPS_DENOMINATOR);

    val xAfter = (xBefore * yBefore) / yAfter;
    val tonOutGross = xBefore - xAfter;
    val tonOut = tonOutGross - feeTon;

    return (tonOut, feeTon);
}

fun shouldGraduate(realTon: coins): bool {
    return realTon >= GRADUATION_THRESHOLD_TON;
}

fun maxSafeSellJettons(virtualTon: coins, realTon: coins, jettonBalance: coins): coins {
    val xBefore = virtualTon + realTon;

    val safeFloor = virtualTon + 1;
    val yAfterMax = (xBefore * jettonBalance) / safeFloor;
    if (yAfterMax <= jettonBalance) {
        return 0;
    }
    return yAfterMax - jettonBalance;
}
