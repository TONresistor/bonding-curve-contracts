import "@gen/JettonWalletV2.code"
import "fee-storage"
import "wallet-messages"
import "../fees-management"
import "../jetton-utils"
import "../messages"

contract FeeSplitterV2 {
    version: "2.0.0"
    storage: SplitterStorage
    incomingMessages: SplitterMessages
}

type SplitterMessages =
    | CreditNativeFees
    | TransferNotificationForRecipient
    | ClaimSplitFees
    | TransferDelivered
    | TransferFailed
    | ReturnExcessesBack
    | TopUpTons

fun onInternalMessage(in: InMessage) {
    if (in.body.isEmpty()) {
        return;
    }
    val msg = lazy SplitterMessages.fromSlice(in.body);
    var s = SplitterStorage.fromCell(contract.getData());
    val c = s.config.load();
    val r = c.recipients.load();
    val wallet = calcAddressOfJettonWallet(
        contract.getAddress(),
        c.minter,
        jettonWalletV2CompiledCode(),
    );
    match (msg) {
        CreditNativeFees => {
            assert (in.senderAddress == c.collector && in.valueCoins >= msg.amount) throw 73;
            val protocol = msg.amount * 10 / (10 + r.creatorBps);
            s.protocolTon += protocol;
            s.creatorTon += msg.amount - protocol;
        }
        TransferNotificationForRecipient => {
            assert (
                in.senderAddress == wallet && msg.transferInitiator != null &&
                msg.transferInitiator! == c.collector
            ) throw 73;
            val protocol = msg.jettonAmount * 10 / (10 + r.creatorBps);
            s.protocolTokens += protocol;
            s.creatorTokens += msg.jettonAmount - protocol;
        }
        ClaimSplitFees => {
            val recipient = msg.protocol ? r.protocol : r.creator;
            assert (in.senderAddress == recipient) throw 73;
            assert (in.valueCoins >= ton("0.2")) throw 48;
            val native = msg.protocol ? s.protocolTon : s.creatorTon;
            val tokens = msg.protocol ? s.protocolTokens : s.creatorTokens;
            if (msg.protocol) {
                s.protocolTon = 0;
                s.protocolTokens = 0;
            } else {
                s.creatorTon = 0;
                s.creatorTokens = 0;
            }
            if (native > 0) {
                createMessage({ bounce: false, dest: recipient, value: native, body: ReturnExcessesBack {
                        queryId: msg.queryId,
                    } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
            }
            if (tokens > 0) {
                val id = s.nextId;
                s.nextId += 1;
                s
                    .pending
                    .set(
                        id,
                        TokenPayout {
                            protocol: msg.protocol,
                            amount: tokens,
                            recipient,
                        },
                    );
                val out = createMessage({ bounce: true, dest: wallet, value: ton("0.1"), body: AskToTransferTracked {
                        queryId: id,
                        jettonAmount: tokens,
                        transferRecipient: recipient,
                        sendExcessesTo: contract.getAddress(),
                        customPayload: null,
                        forwardTonAmount: 0,
                        forwardPayload: beginCell().storeUint(0, 1).toSlice(),
                    } });
                checkAmountIsEnoughToTransfer(
                    ton("0.1"),
                    0,
                    out.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY),
                );
                out.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
            }
        }
        ReturnExcessesBack => {}
        TransferDelivered => {
            val pending = s.pending.get(msg.queryId);
            if (pending.isFound) {
                val p = pending.loadValue();
                val recipientWallet = calcAddressOfJettonWallet(
                    p.recipient,
                    c.minter,
                    jettonWalletV2CompiledCode(),
                );
                if (in.senderAddress == recipientWallet && msg.amount == p.amount) {
                    s.pending.delete(msg.queryId);
                }
            }
        }
        TransferFailed => {
            assert (in.senderAddress == wallet) throw 73;
            restorePayout(mutate s, msg.queryId, msg.amount);
        }
        TopUpTons => {}
        else => throw 65535,
    }
    contract.setData(s.toCell());
}

fun onBouncedMessage(in: InMessageBounced) {
    var s = SplitterStorage.fromCell(contract.getData());
    val c = s.config.load();
    assert (
        in.senderAddress ==
        calcAddressOfJettonWallet(contract.getAddress(), c.minter, jettonWalletV2CompiledCode())
    ) throw 73;
    in.bouncedBody.skipBouncedPrefix();
    val msg = lazy AskToTransferTracked.fromSlice(in.bouncedBody);
    restorePayout(mutate s, msg.queryId, msg.jettonAmount);
    contract.setData(s.toCell());
}

fun restorePayout(mutate s: SplitterStorage, id: uint64, amount: coins) {
    val pending = s.pending.get(id);
    if (pending.isFound) {
        val p = pending.loadValue();
        assert (amount == p.amount) throw 73;
        if (p.protocol) {
            s.protocolTokens += p.amount;
        } else {
            s.creatorTokens += p.amount;
        }
        s.pending.delete(id);
    }
}

get fun get_splitter_data(): SplitterStorage {
    return SplitterStorage.fromCell(contract.getData());
}
