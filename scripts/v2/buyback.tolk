import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/BuybackBurnV2.gen"
import "@contracts/v2/buyback-messages"
import "arguments"

fun runBuyback(walletName: string, curveAddress: address, step: uint8) {
    val wallet = scripts.wallet(scriptString(walletName));
    val curve = BondingCurveV2.fromAddress(curveAddress);
    val address = curve.getBuybackAddress();
    assert (address != null) throw 49;
    val burner = BuybackBurnV2.fromAddress(address!);
    if (step == 1) {
        curve
            .sendPrepareBuyback(wallet.address, 0, { value: ton("0.15") })
            .waitForFirstTransaction();
    } else if (step == 2) {
        burner
            .sendClaimBuybackFees(wallet.address, 0, { value: ton("0.5") })
            .waitForFirstTransaction();
    } else if (step == 3) {
        burner
            .sendExecuteBuyback(wallet.address, 0, { value: BUYBACK_TRIGGER_GAS })
            .waitForFirstTransaction();
    } else if (step == 4) {
        burner
            .sendBurnAvailable(wallet.address, 0, { value: ton("0.2") })
            .waitForFirstTransaction();
    } else {
        assert (step == 0) throw 49;
        println(burner.getBuybackData());
    }
}

fun main(walletName: string, curveAddress: address, step: uint8) {
    runBuyback(walletName, curveAddress, step);
}
