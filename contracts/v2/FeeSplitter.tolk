import "@gen/JettonWalletV2.code"
import "fee-storage"
import "wallet-messages"
import "../v1/fees-management"
import "../v1/jetton-utils"
import "../v1/messages"

contract FeeSplitterV2 {
    version: "2.0.0"
    storage: SplitterStorage
    incomingMessages: SplitterMessages
}

type SplitterMessages =
    | CreditNativeFees
    | CreditCurveFees
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
            creditBeneficiaries(mutate s, r, msg.amount - protocol, 0);
        }
        CreditCurveFees => {
            assert (
                r.curve != null && in.senderAddress == r.curve! && in.valueCoins >= msg.amount
            ) throw 73;
            creditBeneficiaries(mutate s, r, msg.amount, 0);
        }
        TransferNotificationForRecipient => {
            assert (
                in.senderAddress == wallet && msg.transferInitiator != null &&
                msg.transferInitiator! == c.collector
            ) throw 73;
            val protocol = msg.jettonAmount * 10 / (10 + r.creatorBps);
            s.protocolTokens += protocol;
            creditBeneficiaries(mutate s, r, 0, msg.jettonAmount - protocol);
        }
        ClaimSplitFees => {
            val recipient = in.senderAddress;
            assert (
                msg.protocol ? recipient == r.protocol : beneficiaryShares(r).exists(recipient)
            ) throw 73;
            assert (in.valueCoins >= ton("0.2")) throw 48;
            val balance = feeBalance(s, recipient);
            val native = msg.protocol ? s.protocolTon : balance.tonAmount;
            val tokens = msg.protocol ? s.protocolTokens : balance.tokenAmount;
            if (msg.protocol) {
                s.protocolTon = 0;
                s.protocolTokens = 0;
            } else {
                s.creatorTon -= native;
                s.creatorTokens -= tokens;
                s.balances.delete(recipient);
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
            var balance = feeBalance(s, p.recipient);
            balance.tokenAmount += p.amount;
            s.balances.set(p.recipient, balance);
        }
        s.pending.delete(id);
    }
}

get fun get_splitter_data(): SplitterStorage {
    return SplitterStorage.fromCell(contract.getData());
}

fun feeBalance(s: SplitterStorage, recipient: address): FeeBalance {
    val found = s.balances.get(recipient);
    return found.isFound
        ? found.loadValue()
        : FeeBalance {
            tonAmount: 0,
            tokenAmount: 0,
        };
}

fun creditBeneficiaries(mutate s: SplitterStorage, r: FeeRecipients, native: coins, tokens: coins) {
    val shares = beneficiaryShares(r);
    var item = shares.findFirst();
    var cumulative = 0;
    var assignedTon: coins = 0;
    var assignedTokens: coins = 0;
    while (item.isFound) {
        cumulative += item.loadValue();
        val nextTon = native * cumulative / 10000;
        val nextTokens = tokens * cumulative / 10000;
        var balance = feeBalance(s, item.getKey());
        balance.tonAmount += nextTon - assignedTon;
        balance.tokenAmount += nextTokens - assignedTokens;
        s.balances.set(item.getKey(), balance);
        assignedTon = nextTon;
        assignedTokens = nextTokens;
        item = shares.iterateNext(item);
    }
    assert (cumulative == 10000) throw 49;
    s.creatorTon += native;
    s.creatorTokens += tokens;
}

get fun get_fee_balance(recipient: address, protocol: bool = false): FeeBalance {
    val s = SplitterStorage.fromCell(contract.getData());
    if (protocol) {
        assert (recipient == s.config.load().recipients.load().protocol) throw 73;
        return { tonAmount: s.protocolTon, tokenAmount: s.protocolTokens };
    }
    return feeBalance(s, recipient);
}

get fun get_beneficiaries(): map<address, uint16> {
    return beneficiaryShares(
        SplitterStorage.fromCell(contract.getData()).config.load().recipients.load(),
    );
}
