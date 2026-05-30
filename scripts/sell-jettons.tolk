import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@contracts/bonding-messages"
import "@wrappers/BondingCurve.gen"
import "@wrappers/JettonMinter.gen"
import "@wrappers/JettonWallet.gen"
import "@wrappers/utils"
import "utils/common"

fun main() {
    val seller = promptJettonWallet("SELLER", "Select seller ActonWallet");
    val curveAddr = promptJettonAddressRequired("CURVE_ADDRESS", "BondingCurve address");
    val curve = BondingCurve.fromAddress(curveAddr);
    val data = curve.getCurveData();
    assert (data.state == 1 as uint8) throw 100;
    assert (data.jettonMinter != null) throw 101;

    val minter = JettonMinter.fromAddress(data.jettonMinter!);
    val sellerWalletAddr = minter.getWalletAddress(seller.address);
    val sellerWallet = JettonWallet { address: sellerWalletAddr };
    val balance = sellerWallet.getJettonBalance();
    println("Seller jetton wallet:   {}", sellerWalletAddr);
    println("Seller jetton balance:  {}", balance);

    val amountStr = promptJettonString(
        "SELL_AMOUNT_NANO",
        "Jettons to sell in nano (blank = full balance)",
        format("{}", balance),
    );
    val sellAmount = parseInt(amountStr) as coins;
    if (sellAmount <= 0 || sellAmount > balance) {
        println("ABORT: amount {} is invalid (max sellable = {})", sellAmount, balance);
        return;
    }

    val maxSafe = curve.getMaxSafeSell();
    var effective: coins = sellAmount;
    if (sellAmount > maxSafe) {
        effective = maxSafe;
    }
    if (effective < sellAmount) {
        println(
            "NOTE: requested {} > maxSafeSell {} — only {} will swap; rest stays in your wallet",
            sellAmount,
            maxSafe,
            effective,
        );
    }
    val quote = curve.getQuoteSell(effective);
    println("Quote (TON out for {} jettons): {} nano-TON", effective, quote);

    val minOutStr = promptJettonString(
        "MIN_TON_OUT",
        "Slippage floor in nano-TON (0 = no check)",
        "0",
    );
    val minTonOut = parseInt(minOutStr) as coins;

    val sellPayload = SellPayload {
        queryId: 0,
        minTonOut,
    }.toCell();

    val res = sellerWallet.sendTransfer(
        seller.address,
        ton("0.15"),
        sellAmount,
        curveAddr,
        seller.address,
        null,
        ton("0.08"),
        sellPayload,
    );
    res.waitForFirstTransaction();

    val after = curve.getCurveData();
    val balanceAfter = sellerWallet.getJettonBalance();
    println("=== Sell submitted ===");
    println("Seller:                 {}", seller.address);
    println("Curve:                  {}", curveAddr);
    println("Real TON reserve: {} -> {}", data.realTonReserve, after.realTonReserve);
    println("Curve jetton balance: {} -> {}", data.curveJettonBalance, after.curveJettonBalance);
    println("Fee accrued: {} -> {}", data.feeAccrued, after.feeAccrued);
    println("Seller jetton balance: {} -> {}", balance, balanceAfter);
    println("");
    println("Note: TON payout arrives a couple txs later; check seller wallet balance after ~30s.");
}
