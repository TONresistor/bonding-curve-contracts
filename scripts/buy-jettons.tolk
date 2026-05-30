import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurve.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "utils/common"

const NANO_PER_TON: int = 1000000000

fun main() {
    val buyer = promptJettonWallet("BUYER", "Select buyer ActonWallet");
    val curveAddr = promptJettonAddressRequired("CURVE_ADDRESS", "BondingCurve address");
    val curve = BondingCurve.fromAddress(curveAddr);

    val nanoStr = promptJettonString(
        "BUY_VALUE_NANO_TON",
        "TON to spend in nano-TON (1 TON = 1_000_000_000)",
        "100000000",
    );
    val tonIn = parseInt(nanoStr) as coins;
    assert (tonIn >= 60000000) throw 100;
    val minOutStr = promptJettonString(
        "MIN_JETTONS_OUT",
        "Slippage floor in nano-jettons (0 = no slippage check)",
        "0",
    );
    val minJettonsOut = parseInt(minOutStr) as coins;

    val data = curve.getCurveData();
    assert (data.state == 1 as uint8) throw 100;

    val swapIn = tonIn - ton("0.05");
    val quote = curve.getQuoteBuy(swapIn);
    println("Quote (post-fee, on {} nano swap input): {} nano-jettons", swapIn, quote);
    if (minJettonsOut > 0 && quote < minJettonsOut) {
        println("ABORT: live quote {} < minJettonsOut {}", quote, minJettonsOut);
        return;
    }

    val res = curve.sendBuyJettons(
        buyer.address,
        0,
        minJettonsOut,
        { value: tonIn, bounce: true },
    );
    res.waitForFirstTransaction();

    val after = curve.getCurveData();
    println("=== Buy submitted ===");
    println("Buyer:                  {}", buyer.address);
    println("Curve:                  {}", curveAddr);
    println("Real TON reserve:       {} -> {}", data.realTonReserve, after.realTonReserve);
    println("Curve jetton balance:   {} -> {}", data.curveJettonBalance, after.curveJettonBalance);
    println("Fee accrued:            {} -> {}", data.feeAccrued, after.feeAccrued);

    if (after.jettonMinter != null) {
        val minter = JettonMinter.fromAddress(after.jettonMinter!);
        val walletAddr = minter.getWalletAddress(buyer.address);
        println("Buyer jetton wallet:    {}", walletAddr);
        if (scripts.isContractDeployed(walletAddr)) {
            val wallet = JettonWallet { address: walletAddr };
            println("Buyer balance:          {} nano-jettons", wallet.getJettonBalance());
        } else {
            println("Buyer wallet not yet deployed (TEP-74 forward chain still in flight).");
        }
    }
}
