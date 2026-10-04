import "@acton/fmt"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@wrappers/BondingCurveMasterV2.gen"
import "@wrappers/BondingCurveV2.gen"
import "@wrappers/BuybackBurnV2.gen"
import "@wrappers/FeeSplitterV2.gen"
import "@wrappers/JettonMinterV2.gen"
import "@contracts/v1/messages"
import "@contracts/v2/bonding-messages"
import "@contracts/v2/bonding-storage"
import "@contracts/v2/buyback-messages"
import "@contracts/v2/fee-storage"
import "../../tests/v2/migration"

struct SdkTransaction {
    destination: address
    value: coins
    bounce: bool
    body: cell
}

fun sendSdk(
    messages: map<uint8, cell>,
    id: uint8,
    from: address,
    target: address,
    discover: bool = false,
): SendResultList {
    val tx = SdkTransaction.fromCell(messages.mustGet(id));
    if (!discover) {
        expect(tx.destination).toEqual(target);
    }
    return net.send(
        from,
        createMessage({
            dest: discover ? target : tx.destination,
            value: tx.value,
            bounce: tx.bounce,
            body: tx.body.beginParse(),
        }),
    );
}

fun main(bundle: string, discover: bool) {
    loadV2Libraries();
    testing.setNow(V2_TIME);
    val messages = map<uint8, cell>.fromCell(parseCellFromBase64(bundle));
    val creator = testing.treasury("sdk-flow-creator").address;
    val buyer = testing.treasury("sdk-flow-buyer").address;
    val admin = testing.treasury("sdk-flow-admin").address;
    val master = BondingCurveMasterV2.fromStorage({ admin, nextAdmin: null, treasury: admin, totalLaunches: 0, feesBalance: 0 });
    master.deploy(admin, { value: ton("2") });
    val launch = CreateLaunch.fromCell(SdkTransaction.fromCell(messages.mustGet(0)).body);
    val options = launch.options.load();
    val created = sendSdk(messages, 0, creator, master.address, discover);
    expect(created).toHaveSuccessfulTx<CreateLaunch>({ to: master.address });
    val curve = BondingCurveV2.fromAddress(
        master.getLaunchAddress(creator, launch.salt, options),
    );
    val minter = JettonMinterV2.fromAddress(curve.getCurveData().jettonMinter!);
    val manager = FeeSplitterV2.fromAddress(curve.getFeeManagerAddress());
    expect(minter.getJettonData().totalSupply).toEqual(options.supply);
    expect(v2Tokens(minter, creator) > 0).toEqual(true);
    if (discover) {
        println("master={}", master.address);
        println("curve={}", curve.address);
        println("creator={}", creator);
        println("buyer={}", buyer);
        println("wallet={}", minter.getWalletAddress(buyer));
        println("manager={}", manager.address);
    }
    if (options.buybackBurn) {
        expect(curve.getState()).toEqual(CURVE_STATE_MIGRATED);
        val burner = BuybackBurnV2.fromAddress(curve.getBuybackAddress()!);
        if (discover) {
            println("burner={}", burner.address);
            return;
        }
        sendSdk(messages, 1, buyer, curve.address);
        sendSdk(messages, 2, buyer, curve.address);
        sendSdk(messages, 3, buyer, burner.address);
        expect(burner.getBuybackData().availableTon > 0).toEqual(true);
        val executed = sendSdk(messages, 4, buyer, burner.address);
        expect(executed).toHaveSuccessfulTx<ExecuteBuyback>({ to: burner.address });
        val state = burner.getBuybackData();
        expect(state.burned > 0).toEqual(true);
        expect(minter.getJettonData().totalSupply).toEqual(options.supply - state.burned);
        expect(v2Tokens(minter, burner.address)).toEqual(0);
        expect(state.availableTon).toEqual(0);
        expect(state.swap == null && state.burnId == 0).toEqual(true);
        println("SDK_BUYBACK_OK");
        return;
    }
    expect(curve.getState()).toEqual(CURVE_STATE_TRADING);
    val quoteBuy = curve.getQuoteBuy(ton("10"));
    val bought = sendSdk(messages, 1, buyer, curve.address, discover);
    expect(bought).toHaveSuccessfulTx<BuyJettons>({ to: curve.address });
    expect(v2Tokens(minter, buyer)).toEqual(quoteBuy);
    val tokensToSell: coins = 1000000 * 1000000000;
    val quoteSell = curve.getQuoteSell(tokensToSell);
    if (discover) {
        println("quoteBuy={}", quoteBuy);
        println("quoteSell={}", quoteSell);
        return;
    }
    val reserveBefore = curve.getCurveData().realTonReserve;
    val sold = sendSdk(messages, 2, buyer, minter.getWalletAddress(buyer));
    expect(sold).toHaveSuccessfulTx<AskToTransfer>({ to: minter.getWalletAddress(buyer) });
    expect(v2Tokens(minter, buyer)).toEqual(quoteBuy - tokensToSell);
    expect(curve.getCurveData().realTonReserve < reserveBefore).toEqual(true);
    v2Payout(sold, curve.address, buyer, quoteSell);
    val fees = curve.getLaunchProgress().creatorAccrued;
    expect(fees > 0).toEqual(true);
    sendSdk(messages, 3, buyer, curve.address);
    expect(curve.getLaunchProgress().creatorAccrued).toEqual(0);
    expect(manager.getFeeBalance(creator, false).tonAmount).toEqual(fees);
    val claimed = sendSdk(messages, 4, creator, manager.address);
    v2Payout(claimed, manager.address, creator, fees);
    expect(manager.getFeeBalance(creator, false).tonAmount).toEqual(0);
    expect(minter.getJettonData().totalSupply).toEqual(options.supply);
    println("SDK_TRADING_OK");
}
