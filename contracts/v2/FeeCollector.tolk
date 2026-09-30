import "@gen/JettonWalletV2.code"
import "bonding-dedust"
import "bonding-messages"
import "fee-addresses"
import "fee-storage"

import "../fees-management"
import "../jetton-utils"
import "../messages"

contract FeeCollectorV2 {
    version: "2.0.0"
    storage: CollectorStorage
    incomingMessages: CollectorMessages
}

type CollectorMessages =
    | CollectPoolFees
    | SweepCollectedTokens
    | DedustNativePayout
    | ReturnExcessesBack
    | TopUpTons

fun onInternalMessage(in: InMessage) {
    if (in.body.isEmpty()) {
        return;
    }
    val msg = lazy CollectorMessages.fromSlice(in.body);
    var s = CollectorStorage.fromCell(contract.getData());
    val r = s.recipients.load();
    val pool = calcDeployedCpmmV2Pool(
        s.minter,
        contract.getAddress(),
        r.creatorBps,
    ).calculateAddress();
    val split = splitterAddress(contract.getAddress(), s.minter, s.recipients);
    match (msg) {
        TopUpTons => {
            if (!s.initialized) {
                assert (in.valueCoins >= ton("0.1")) throw 48;
                s.initialized = true;
                createMessage({ bounce: false, dest: split, value: ton("0.05"), body: TopUpTons {} }).send(
                    SEND_MODE_PAY_FEES_SEPARATELY,
                );
            }
        }
        CollectPoolFees => {
            assert (s.initialized && in.valueCoins >= ton("0.4")) throw 48;
            val id = s.nextId;
            s.nextId += 1;
            createMessage({ bounce: true, dest: pool, value: ton("0.3"), body: DedustClaimCreatorFees {
                    queryId: id,
                    to: contract.getAddress(),
                    excessesTo: in.senderAddress,
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        DedustNativePayout => {
            assert (in.senderAddress == pool) throw 73;
            createMessage({ bounce: false, dest: split, value: in.valueCoins +
                    ton("0.02"), body: CreditNativeFees {
                    queryId: msg.queryId,
                    amount: in.valueCoins,
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        SweepCollectedTokens => {
            assert (s.initialized && in.valueCoins >= ton("0.4") && msg.amount > 0) throw 48;
            // Credit the splitter only for tokens actually delivered.
            val wallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                s.minter,
                jettonWalletV2CompiledCode(),
            );
            createMessage({ bounce: true, dest: wallet, value: ton("0.3"), body: AskToTransfer {
                    queryId: msg.queryId,
                    jettonAmount: msg.amount,
                    transferRecipient: split.calculateAddress(),
                    sendExcessesTo: in.senderAddress,
                    customPayload: null,
                    forwardTonAmount: ton("0.15"),
                    forwardPayload: beginCell().storeUint(0, 1).toSlice(),
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        ReturnExcessesBack => {}
        else => throw 65535,
    }
    contract.setData(s.toCell());
}

fun onBouncedMessage(in: InMessageBounced) {}

get fun get_splitter_address(): address {
    val s = CollectorStorage.fromCell(contract.getData());
    return splitterAddress(contract.getAddress(), s.minter, s.recipients).calculateAddress();
}

get fun get_pool_address(): address {
    val s = CollectorStorage.fromCell(contract.getData());
    return calcDeployedCpmmV2Pool(
        s.minter,
        contract.getAddress(),
        s.recipients.load().creatorBps,
    ).calculateAddress();
}
