import "@stdlib/gas-payments"
import "@gen/JettonWalletV2.code"
import "bonding-dedust"
import "buyback-messages"
import "buyback-storage"
import "fee-storage"
import "wallet-messages"
import "../v1/jetton-utils"
import "../v1/messages"

contract BuybackBurnV2 {
    version: "2.1.0"
    storage: BuybackStorage
    incomingMessages: BuybackMessages
}

type BuybackMessages =
    | InitBuyback
    | ExecuteBuyback
    | ClaimBuybackFees
    | BurnAvailable
    | BuybackTakePoolState
    | BuybackRefund
    | DedustNativePayout
    | TransferNotificationForRecipient
    | ReturnExcessesBack
    | BurnDelivered
    | BurnFailed
    | TopUpTons

fun onInternalMessage(in: InMessage) {
    if (in.body.isEmpty()) {
        return;
    }
    val op = in.body.preloadUint(32);
    var s = BuybackStorage.load();
    if (op == 0xa0a0b060) {
        val msg = lazy InitBuyback.fromSlice(in.body);
        assert (in.senderAddress == s.identity.load().curve) throw 73;
        if (s.config == null) {
            s.config = msg.config;
        } else {
            assert (s.config!.hash() == msg.config.hash()) throw 73;
        }
        s.active = s.active || msg.active;
        s.save();
        return;
    }
    if (op == 0xd372158c) {
        return;
    }
    assert (s.config != null) throw 49;
    val c = s.config!.load();
    val msg = lazy BuybackMessages.fromSlice(in.body);
    match (msg) {
        InitBuyback => throw 65535,
        TopUpTons => {
            return;
        }
        ClaimBuybackFees => {
            assert (in.valueCoins >= ton("0.5")) throw 48;
            createMessage({ bounce: true, dest: c.splitter, value: ton("0.45"), body: ClaimSplitFees {
                    queryId: msg.queryId,
                    protocol: false,
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        ReturnExcessesBack => {
            if (in.senderAddress == c.splitter) {
                s.availableTon += in.valueCoins;
            }
        }
        TransferNotificationForRecipient => {
            assert (in.senderAddress == buybackWallet(c)) throw 73;
            s.availableTokens += msg.jettonAmount;
            if (
                s.swap != null && msg.transferInitiator != null &&
                msg.transferInitiator! == buybackPool(c)
            ) {
                val pending = s.swap!.load();
                if (msg.queryId == pending.id && msg.jettonAmount >= pending.minimumTokens) {
                    s.swap = null;
                }
            }
            // The payer funds the next leg; otherwise BurnAvailable retries it.
            if (in.valueCoins >= ton("0.2")) {
                startBurn(mutate s, buybackWallet(c));
            }
        }
        ExecuteBuyback => {
            assert (s.active && s.swap == null) throw 49;
            assert (s.quoteId == 0 || blockchain.now() > s.quoteDeadline) throw 49;
            assert (s.availableTon >= BUYBACK_MIN_TON) throw 49;
            assert (in.valueCoins >= BUYBACK_TRIGGER_GAS) throw 48;
            s.quoteId = s.nextId;
            s.nextId += 1;
            s.quoteDeadline = blockchain.now() + BUYBACK_QUOTE_TTL;
            createMessage({ bounce: true, dest: buybackPool(
                    c,
                ), value: ton("0.1"), body: BuybackProvidePoolState { queryId: s.quoteId } }).send(
                SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }
        BuybackTakePoolState => {
            assert (in.senderAddress == buybackPool(c)) throw 73;
            if (msg.queryId != s.quoteId || s.quoteId == 0) {
                return;
            }
            s.quoteId = 0;
            if (
                blockchain.now() <= s.quoteDeadline && msg.status is BuybackPoolInitialized &&
                msg.swapActive &&
                msg.reserveX > 0 &&
                msg.reserveY > 0
            ) {
                val amount = s.availableTon;
                if (amount >= BUYBACK_MIN_TON) {
                    val netInput = amount * 10000 / (10000 + poolBaseFeeBps(c.creatorFeeBps));
                    val quote = msg.reserveY * netInput / (msg.reserveX + netInput);
                    val minimum = quote * (10000 - BUYBACK_SLIPPAGE_BPS) / 10000;
                    if (minimum > 0) {
                        val id = s.nextId;
                        s.nextId += 1;
                        s.swap = BuybackPendingSwap {
                            id,
                            amount,
                            minimumTokens: minimum,
                        }.toCell();
                        s.availableTon -= amount;
                        val me = contract.getAddress();
                        createMessage({ bounce: true, dest: buybackPool(c), value: amount +
                                ton("0.5"), body: BuybackPayNative {
                                queryId: id,
                                amount,
                                paymentPayload: BuybackSwap {
                                    minimalAmountOut: minimum,
                                    deadline: s.quoteDeadline,
                                }.toCell(),
                                payoutConfig: BuybackPayoutConfig {
                                    fulfill: {
                                        destination: me,
                                        extraGas: ton("0.2"),
                                        payload: null,
                                    },
                                    reject: {
                                        destination: me,
                                        extraGas: 0,
                                        payload: BuybackRefund { queryId: id }.toCell(),
                                    },
                                    excessesTo: me,
                                }.toCell(),
                            } }).send(
                            SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
                        );
                    }
                }
            }
        }
        BuybackRefund => {
            assert (in.senderAddress == buybackPool(c)) throw 73;
            refundBuyback(mutate s, msg.queryId, in.valueCoins);
        }
        DedustNativePayout => {
            assert (in.senderAddress == buybackPool(c)) throw 73;
            refundBuyback(mutate s, msg.queryId, in.valueCoins);
        }
        BurnAvailable => {
            assert (in.valueCoins >= ton("0.2")) throw 48;
            startBurn(mutate s, buybackWallet(c));
        }
        BurnDelivered => {
            assert (in.senderAddress == c.minter) throw 73;
            if (s.burnId != 0 && msg.queryId == s.burnId && msg.amount == s.burnAmount) {
                s.burned += s.burnAmount;
                s.burnId = 0;
                s.burnAmount = 0;
            }
        }
        BurnFailed => {
            assert (in.senderAddress == buybackWallet(c)) throw 73;
            restoreBurn(mutate s, msg.queryId, msg.amount);
        }
    }
    s.save();
}

fun startBurn(mutate s: BuybackStorage, wallet: address) {
    if (s.burnId != 0 || s.availableTokens == 0) {
        return;
    }
    s.burnId = s.nextId;
    s.nextId += 1;
    s.burnAmount = s.availableTokens;
    s.availableTokens = 0;
    createMessage({ bounce: true, dest: wallet, value: BUYBACK_BURN_GAS, body: AskToBurnTracked {
            queryId: s.burnId,
            jettonAmount: s.burnAmount,
        } }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

fun restoreBurn(mutate s: BuybackStorage, id: uint64, amount: coins) {
    if (s.burnId != 0 && id == s.burnId && amount == s.burnAmount) {
        s.availableTokens += amount;
        s.burnId = 0;
        s.burnAmount = 0;
    }
}

fun refundBuyback(mutate s: BuybackStorage, id: uint64, returned: coins) {
    // Pool payout destinations and query IDs are caller-controlled. Credit actual
    // funds even for late payouts; only full economic settlement clears a swap.
    if (s.swap != null) {
        val pending = s.swap!.load();
        if (id == pending.id && returned >= pending.amount) {
            s.availableTon += pending.amount;
            s.swap = null;
            return;
        }
    }
    // Unsolicited/late refunds fund their own processing, never the fee budget.
    val gas = calculateGasFee(0, 50000);
    if (returned > gas) {
        s.availableTon += returned - gas;
    }
}

fun onBouncedMessage(in: InMessageBounced) {
    var s = BuybackStorage.load();
    if (s.config == null) {
        return;
    }
    val c = s.config!.load();
    in.bouncedBody.skipBouncedPrefix();
    val op = in.bouncedBody.loadUint(32);
    val id = in.bouncedBody.loadUint(64);
    if (op == 0xa0a0b057) {
        assert (
            in.senderAddress ==
            calcAddressOfJettonWallet(contract.getAddress(), c.minter, jettonWalletV2CompiledCode())
        ) throw 73;
        restoreBurn(mutate s, id, in.bouncedBody.loadCoins());
    } else if (op == 0xa5a7cbf8 || op == 0x00d8d379) {
        assert (
            in.senderAddress ==
            calcDeployedCpmmV2Pool(c.minter, c.collector, c.creatorFeeBps).calculateAddress()
        ) throw 73;
        if (op == 0xa5a7cbf8) {
            if (s.swap != null && id == s.swap!.load().id) {
                s.availableTon += min(s.swap!.load().amount, in.valueCoins);
                s.swap = null;
            }
        } else if (id == s.quoteId) {
            s.quoteId = 0;
        }
    }
    s.save();
}

get fun get_buyback_data(): BuybackStorage {
    return BuybackStorage.load();
}

fun buybackPool(c: BuybackConfig): address {
    return calcDeployedCpmmV2Pool(c.minter, c.collector, c.creatorFeeBps).calculateAddress();
}

fun buybackWallet(c: BuybackConfig): address {
    return calcAddressOfJettonWallet(contract.getAddress(), c.minter, jettonWalletV2CompiledCode());
}
