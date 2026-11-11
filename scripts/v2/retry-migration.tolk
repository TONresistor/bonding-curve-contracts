import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveV2.gen"
import "@contracts/v2/bonding-storage"
import "arguments"

fun main(walletName: string, curveAddress: address) {
    retryMigration(walletName, curveAddress);
}

fun retryMigration(walletName: string, curveAddress: address) {
    val wallet = scripts.wallet(scriptString(walletName));
    val curve = BondingCurveV2.fromAddress(curveAddress);
    val state = curve.getState();
    if (state == CURVE_STATE_FROZEN) {
        curve
            .sendGraduate(wallet.address, 0, { value: ton("0.8"), bounce: true })
            .waitForFirstTransaction();
    } else if (state == CURVE_STATE_AWAITING_LIQUIDITY) {
        curve
            .sendConfirmMigration(wallet.address, 0, { value: ton("0.1"), bounce: true })
            .waitForFirstTransaction();
    } else {
        curve
            .sendRetryMigration(wallet.address, 0, { value: ton("0.5"), bounce: true })
            .waitForFirstTransaction();
    }
}
