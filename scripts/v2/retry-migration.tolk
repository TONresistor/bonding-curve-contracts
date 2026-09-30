import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveV2.gen"
import "@contracts/v2/bonding-storage"

fun main(walletName: string, curveAddress: address) {
    val wallet = scripts.wallet(walletName);
    val curve = BondingCurveV2.fromAddress(curveAddress);
    if (curve.getState() == CURVE_STATE_AWAITING_LIQUIDITY) {
        curve
            .sendConfirmMigration(wallet.address, 0, { value: ton("0.1"), bounce: true })
            .waitForFirstTransaction();
    } else {
        curve
            .sendRetryMigration(wallet.address, 0, { value: ton("0.5"), bounce: true })
            .waitForFirstTransaction();
    }
}
