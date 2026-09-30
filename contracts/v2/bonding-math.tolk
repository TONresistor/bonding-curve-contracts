import "bonding-storage"
import "../bonding-config"

fun computeBuyOut(
    tonIn: coins,
    virtualTon: coins,
    realTon: coins,
    jettonBalance: coins,
    creatorFeeBps: int = 0,
): (coins, coins) {
    val feeTon = tonIn * PROTOCOL_FEE_BPS / BPS_DENOMINATOR +
        tonIn * creatorFeeBps / BPS_DENOMINATOR;
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
    creatorFeeBps: int = 0,
): (coins, coins) {
    val xBefore = virtualTon + realTon;
    val yBefore = jettonBalance;
    val yAfter = yBefore + jettonIn;

    val gross = xBefore - (xBefore * yBefore) / yAfter;
    val feeTon = gross * PROTOCOL_FEE_BPS / BPS_DENOMINATOR +
        gross * creatorFeeBps / BPS_DENOMINATOR;

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

fun validateLaunchOptions(o: LaunchOptions) {
    assert (
        o.supply == 100000000 * 1000000000 || o.supply == 1000000000 * 1000000000 ||
        o.supply == 10000000000 * 1000000000
    ) throw 49;
    assert (
        o.creatorFeeBps == 0 || o.creatorFeeBps == 10 || o.creatorFeeBps == 50 ||
        o.creatorFeeBps == 100 ||
        o.creatorFeeBps == 200
    ) throw 49;
}
