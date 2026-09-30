import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/FeeCollectorV2.gen"
import "@wrappers/FeeSplitterV2.gen"
import "arguments"

fun main(
    walletName: string,
    collectorAddress: address,
    step: uint8,
    tokenAmount: coins,
    protocol: bool,
    curveAddress: address? = null,
) {
    val wallet = scripts.wallet(scriptString(walletName));
    val collector = FeeCollectorV2.fromAddress(collectorAddress);
    if (step == 1) {
        collector
            .sendCollectPoolFees(wallet.address, 0, { value: ton("0.4") })
            .waitForFirstTransaction();
    } else if (step == 2) {
        collector
            .sendSweepCollectedTokens(wallet.address, 0, tokenAmount, { value: ton("0.4") })
            .waitForFirstTransaction();
    } else if (step == 4) {
        assert (curveAddress != null) throw 49;
        BondingCurveV2
            .fromAddress(curveAddress!)
            .sendFlushCreatorFees(wallet.address, 0, { value: ton("0.05") })
            .waitForFirstTransaction();
    } else if (step == 5) {
        collector
            .sendRetryCollectedFees(wallet.address, 0, { value: ton("0.05") })
            .waitForFirstTransaction();
    } else {
        assert (step == 3) throw 49;
        val splitter = FeeSplitterV2.fromAddress(collector.getSplitterAddress());
        println("Available fees: {}", splitter.getFeeBalance(wallet.address, protocol));
        splitter
            .sendClaimSplitFees(wallet.address, 0, protocol, { value: ton("0.2") })
            .waitForFirstTransaction();
    }
}
