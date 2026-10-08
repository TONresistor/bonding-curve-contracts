import "@gen/JettonWalletV2.code"
import "bonding-dedust"
import "bonding-messages"
import "fee-addresses"
import "fee-storage"

import "../v1/fees-management"
import "../v1/jetton-utils"
import "../v1/messages"

contract FeeCollectorV2 {
    version: "2.1.0"
    storage: CollectorStorage
    incomingMessages: CollectorMessages
}

type CollectorMessages =
    | CollectPoolFees
    | SweepCollectedTokens
    | DedustNativePayout
    | ReturnExcessesBack
    | TopUpTons
    | RetryCollectedFees

fun onInternalMessage(in: InMessage) {
    if (in.body.isEmpty()) {
        return;
    }
    val msg = lazy CollectorMessages.fromSlice(in.body);
    var s = CollectorStorage.fromCell(contract.getData());
    match (msg) {
        TopUpTons => {
            if (s.initialized) {
                return;
            }
            if (!s.initialized) {
                assert (in.valueCoins >= ton("0.1")) throw 48;
                s.initialized = true;
                createMessage({ bounce: false, dest: splitterAddress(
                        contract.getAddress(),
                        s.minter,
                        s.recipients,
                    ), value: ton("0.05"), body: TopUpTons {} }).send(
                    SEND_MODE_PAY_FEES_SEPARATELY,
                );
            }
        }
        CollectPoolFees => {
            assert (s.initialized && in.valueCoins >= ton("0.4")) throw 48;
            val id = s.nextId;
            s.nextId += 1;
            createMessage({ bounce: true, dest: collectorPool(
                    s,
                ), value: ton("0.3"), body: DedustClaimCreatorFees {
                    queryId: id,
                    to: contract.getAddress(),
                    excessesTo: in.senderAddress,
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        DedustNativePayout => {
            assert (in.senderAddress == collectorPool(s)) throw 73;
            s.nativeAccrued += in.valueCoins;
            flushCollectedNative(mutate s);
        }
        RetryCollectedFees => {
            assert (in.valueCoins >= ton("0.05")) throw 48;
            flushCollectedNative(mutate s);
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
                    transferRecipient: splitterAddress(
                        contract.getAddress(),
                        s.minter,
                        s.recipients,
                    ).calculateAddress(),
                    sendExcessesTo: in.senderAddress,
                    customPayload: null,
                    forwardTonAmount: ton("0.15"),
                    forwardPayload: beginCell().storeUint(0, 1).toSlice(),
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        ReturnExcessesBack => {
            return;
        }
        else => throw 65535,
    }
    contract.setData(s.toCell());
}

fun onBouncedMessage(in: InMessageBounced) {
    var s = CollectorStorage.fromCell(contract.getData());
    val split = splitterAddress(contract.getAddress(), s.minter, s.recipients);
    if (in.senderAddress != split.calculateAddress()) {
        return;
    }
    in.bouncedBody.skipBouncedPrefix();
    val msg = lazy CreditNativeFees.fromSlice(in.bouncedBody);
    s.nativeAccrued += msg.amount;
    contract.setData(s.toCell());
}

fun flushCollectedNative(mutate s: CollectorStorage) {
    val amount = s.nativeAccrued;
    if (amount == 0) {
        return;
    }
    val id = s.nextId;
    s.nextId += 1;
    s.nativeAccrued = 0;
    createMessage({
        bounce: true,
        dest: splitterAddress(contract.getAddress(), s.minter, s.recipients),
        value: amount + ton("0.03"),
        body: CreditNativeFees {
            queryId: id,
            amount,
        },
    }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

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

fun collectorPool(s: CollectorStorage): address {
    return calcDeployedCpmmV2Pool(
        s.minter,
        contract.getAddress(),
        s.recipients.load().creatorBps,
    ).calculateAddress();
}
