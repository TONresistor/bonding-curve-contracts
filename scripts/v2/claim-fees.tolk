import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/FeeCollectorV2.gen"
import "@wrappers/FeeSplitterV2.gen"

// Steps: collect, sweep the confirmed token balance, then claim.
// Wait for each operation to finish before starting the next.
fun main(
    walletName: string,
    collectorAddress: address,
    step: uint8,
    tokenAmount: coins,
    protocol: bool,
) {
    val wallet = scripts.wallet(walletName);
    val collector = FeeCollectorV2.fromAddress(collectorAddress);
    if (step == 1) {
        collector
            .sendCollectPoolFees(wallet.address, 0, { value: ton("0.4") })
            .waitForFirstTransaction();
    } else if (step == 2) {
        collector
            .sendSweepCollectedTokens(wallet.address, 0, tokenAmount, { value: ton("0.4") })
            .waitForFirstTransaction();
    } else {
        assert (step == 3) throw 49;
        val splitter = FeeSplitterV2.fromAddress(collector.getSplitterAddress());
        splitter
            .sendClaimSplitFees(wallet.address, 0, protocol, { value: ton("0.2") })
            .waitForFirstTransaction();
    }
}
