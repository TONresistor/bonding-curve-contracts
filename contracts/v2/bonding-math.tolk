import "bonding-storage"
import "fee-storage"
import "../v1/bonding-config"

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

fun shouldGraduate(realTon: coins, threshold: coins): bool {
    return realTon >= threshold;
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
    // coins is VarUInteger16: at most 120 bits. Bounding x and supply
    // also keeps every reserve product within TVM's signed 257-bit integer.
    val maxCoins = (1 << 120) - 1;
    assert (o.supply > 0 && o.supply <= maxCoins) throw 49;
    assert (o.graduationThreshold >= ton("500") && o.graduationThreshold <= ton("10000")) throw 49;
    assert (o.soldSupplyBps > 0 && o.soldSupplyBps < BPS_DENOMINATOR) throw 49;
    assert (o.creatorFeeBps >= 0 && o.creatorFeeBps <= 1000 && o.creatorFeeBps % 10 == 0) throw 49;
    assert (
        o.minBuyBps >= 0 && o.maxBuyBps >= 0 && o.minBuyBps <= BPS_DENOMINATOR &&
        o.maxBuyBps <= BPS_DENOMINATOR
    ) throw 49;
    assert (o.maxBuyBps == 0 || o.minBuyBps <= o.maxBuyBps) throw 49;
    val virtual = initialVirtualReserve(o);
    val x = virtual + o.graduationThreshold;
    assert (virtual > 0 && x <= maxCoins) throw 49;
    val remainingAtGraduation = virtual * o.supply / x;
    val poolTokens = (o.graduationThreshold - MIGRATION_FEE) * remainingAtGraduation / x;
    assert (remainingAtGraduation > 0 && poolTokens > 0) throw 49;
    val (minTokens, maxTokens) = buyTokenLimits(o);
    assert (minTokens < o.supply) throw 49;
    assert (o.maxBuyBps == 0 || minTokens <= maxTokens) throw 49;
    assert (o.maxBuyBps == 0 || maxTokens > 0) throw 49;
    var publicReserve: coins = 0;
    var publicBalance = o.supply;
    if (o.devBuyAmount > 0) {
        val (devTokens, devFees) = computeBuyOut(
            o.devBuyAmount,
            virtual,
            0,
            o.supply,
            o.creatorFeeBps,
        );
        assert (devTokens > 0 && devTokens < o.supply && devTokens >= o.minDevTokens) throw 49;
        publicReserve = o.devBuyAmount - devFees;
        publicBalance -= devTokens;
        assert (
            hasMigrationLiquidity(virtual, publicReserve, publicBalance, o.graduationThreshold)
        ) throw 49;
    }
    if (publicReserve < o.graduationThreshold) {
        val (minimumPublicOut, _) = computeBuyOut(
            ton("0.01"),
            virtual,
            publicReserve,
            publicBalance,
            o.creatorFeeBps,
        );
        val target = max(minTokens, minimumPublicOut);
        assert (target > 0 && target < publicBalance) throw 49;
        val input = minimumGrossForBuyTokens(
            target,
            virtual + publicReserve,
            publicBalance,
            o.creatorFeeBps,
        );
        assert (input <= maxCoins) throw 49;
        val (tokens, fees) = computeBuyOut(
            input,
            virtual,
            publicReserve,
            publicBalance,
            o.creatorFeeBps,
        );
        assert (o.maxBuyBps == 0 || tokens <= maxTokens) throw 49;
        assert (
            hasMigrationLiquidity(
                virtual,
                publicReserve + input - fees,
                publicBalance - tokens,
                o.graduationThreshold,
            )
        ) throw 49;
    }
    assert (!o.buybackBurn || (o.beneficiaries == null && o.creatorFeeBps > 0)) throw 49;
    validateBeneficiaries(o.beneficiaries);
}

// Check the liquidity attainable at the threshold, or at an actual overshoot.
// This prevents integer buy rounding from exhausting migration inventory early.
fun hasMigrationLiquidity(virtual: coins, real: coins, balance: coins, threshold: coins): bool {
    if (balance <= 0) {
        return false;
    }
    val destinationReserve: coins = max(real, threshold);
    val destinationX = virtual + destinationReserve;
    val destinationBalance: coins = real < threshold
        ? (virtual + real) * balance / destinationX
        : balance;
    return (destinationReserve - MIGRATION_FEE) * destinationBalance / destinationX > 0;
}

fun minimumGrossForBuyTokens(target: coins, x: coins, balance: coins, creatorFeeBps: int): coins {
    val requiredNet = x * balance / (balance - target + 1) + 1 - x;
    val feeAdjustedRate = BPS_DENOMINATOR - PROTOCOL_FEE_BPS - creatorFeeBps;
    var gross = max(
        ton("0.01"),
        (requiredNet * BPS_DENOMINATOR + feeAdjustedRate - 1) / feeAdjustedRate,
    );
    // Independent fee floors can add fewer than two net nanos. The accepted
    // creator fee bound leaves a net rate >=89%; four adjustments cover both fee floors.
    val upperGross = gross;
    var offset = 0;
    repeat (4) {
        offset += 1;
        val candidate = upperGross - offset;
        if (candidate >= ton("0.01")) {
            val candidateNet = candidate - candidate * PROTOCOL_FEE_BPS / BPS_DENOMINATOR -
                candidate * creatorFeeBps / BPS_DENOMINATOR;
            if (candidateNet >= requiredNet) {
                gross = candidate;
            }
        }
    }
    return gross;
}

fun buyTokenLimits(o: LaunchOptions): (coins, coins) {
    return (
        (o.supply * o.minBuyBps + BPS_DENOMINATOR - 1) / BPS_DENOMINATOR,
        o.supply * o.maxBuyBps / BPS_DENOMINATOR,
    );
}

fun initialVirtualReserve(o: LaunchOptions): coins {
    return o.graduationThreshold * (BPS_DENOMINATOR - o.soldSupplyBps) / o.soldSupplyBps;
}

fun initialMigrationReserve(o: LaunchOptions): coins {
    // Match the trading contribution: 10% of the 1% protocol fee.
    val contribution = o.graduationThreshold * PROTOCOL_FEE_BPS / BPS_DENOMINATOR / 10;
    return max(ton("0.8") - contribution, 0);
}

fun minimumCreateValue(o: LaunchOptions): coins {
    return ton("1") + initialMigrationReserve(o) + o.devBuyAmount;
}

fun previewLaunch(o: LaunchOptions): LaunchPreview {
    validateLaunchOptions(o);
    val virtual = initialVirtualReserve(o);
    val x = virtual + o.graduationThreshold;
    val remaining = virtual * o.supply / x;
    val poolTon = o.graduationThreshold - MIGRATION_FEE;
    val poolTokens = poolTon * remaining / x;
    val (minBuyTokens, maxBuyTokens) = buyTokenLimits(o);
    return {
        minimumCreateValue: minimumCreateValue(o),
        migrationPrefund: initialMigrationReserve(o),
        minBuyTokens,
        maxBuyTokens,
        virtualTonReserve: virtual,
        graduationThreshold: o.graduationThreshold,
        soldTokens: o.supply - remaining,
        poolTon,
        poolTokens,
        remainingTokens: remaining - poolTokens,
        initialPriceNanoPerBillion: virtual * 1000000000000000000 / o.supply,
        graduationPriceNanoPerBillion: x * 1000000000000000000 / remaining,
    };
}
