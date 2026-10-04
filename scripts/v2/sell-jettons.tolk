import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@wrappers/JettonWalletV2.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/wallet-messages"
import "arguments"

fun sellJettons(walletName: string, curveAddress: address, amount: coins, minTonOut: coins) {
    val seller = scripts.wallet(scriptString(walletName));
    val curve = BondingCurveV2.fromAddress(curveAddress);
    val data = curve.getCurveData();
    assert (data.state == CURVE_STATE_TRADING && data.jettonMinter != null) throw 72;
    val minter = JettonMinterV2.fromAddress(data.jettonMinter!);
    val wallet = JettonWalletV2.fromAddress(minter.getWalletAddress(seller.address));
    assert (amount > 0 && amount <= wallet.getWalletData().jettonBalance) throw 47;
    val curveWallet = JettonWalletV2.fromAddress(minter.getWalletAddress(curveAddress));
    val forward = max(MIN_CURVE_SELL_NOTIFICATION, curveWallet.getMinSellNotification());
    println("Quote (nano-TON): {}", curve.getQuoteSell(amount));
    wallet
        .sendAskToTransfer(
            seller.address,
            0,
            amount,
            curveAddress,
            seller.address,
            null,
            forward,
            PayloadInline {
                value: SellPayload {
                    queryId: 0,
                    minTonOut,
                }
                .toCell()
                .beginParse(),
            },
            { value: forward + ton("0.2"), bounce: true },
        )
        .waitForFirstTransaction();
    println("Sell requested; verify payout or token return to {}", seller.address);
}

fun main(walletName: string, curveAddress: address, amount: coins, minTonOut: coins) {
    sellJettons(walletName, curveAddress, amount, minTonOut);
}
