import "@stdlib/gas-payments"
// Derived from the pinned reference in ../JettonWallet.upstream.json.
import "wallet-messages"
import "../errors"
import "../fees-management"
import "../jetton-utils"
import "../messages"
import "../sharding"
import "../storage"

contract JettonWalletV2 {
    author: "The Tolk Team; bonding-curve-contracts"
    version: "2.1-v2"
    description: "Reference-derived jetton wallet with authenticated V2 delivery receipts"
    incomingMessages: AllowedMessageToWallet
    storage: WalletStorage
}

type AllowedMessageToWallet =
    | AskToTransfer
    | AskToTransferTracked
    | AskToBurn
    | InternalTransferStep
    | InternalTransferTracked
    | TopUpTons

type BounceOpToHandle = InternalTransferStep | InternalTransferTracked | BurnNotificationForMinter

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();

    val msg = lazy BounceOpToHandle.fromSlice(in.bouncedBody);
    var restoreAmount: coins = 0;
    var tracked = false;
    var id: uint64 = 0;
    match (msg) {
        InternalTransferStep => {
            restoreAmount = msg.jettonAmount;
        }
        InternalTransferTracked => {
            restoreAmount = msg.jettonAmount;
            tracked = true;
            id = msg.queryId;
        }
        BurnNotificationForMinter => {
            restoreAmount = msg.jettonAmount;
        }
    }

    var storage = lazy WalletStorage.load();
    storage.jettonBalance += restoreAmount;
    storage.save();
    if (tracked) {
        createMessage({
            bounce: false,
            dest: storage.ownerAddress,
            value: 0,
            body: TransferFailed {
                queryId: id,
                amount: restoreAmount,
            },
        }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
    }
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessageToWallet.fromSlice(in.body);

    match (msg) {
        InternalTransferStep => {
            receiveTokens(in.senderAddress, in.valueCoins, msg, false);
        }
        InternalTransferTracked => {
            receiveTokens(
                in.senderAddress,
                in.valueCoins,
                InternalTransferStep {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    transferInitiator: msg.transferInitiator,
                    sendExcessesTo: msg.sendExcessesTo,
                    forwardTonAmount: msg.forwardTonAmount,
                    forwardPayload: msg.forwardPayload,
                },
                true,
            );
        }

        AskToTransfer => {
            msg.forwardPayload.checkIsCorrectTlbEither();
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw ERROR_WRONG_WORKCHAIN;
            checkAmountIsEnoughToTransfer(
                in.valueCoins,
                msg.forwardTonAmount,
                in.originalForwardFee,
            );

            var storage = lazy WalletStorage.load();
            assert (in.senderAddress == storage.ownerAddress) throw ERROR_NOT_OWNER;
            assert (storage.jettonBalance >= msg.jettonAmount) throw ERROR_BALANCE_ERROR;
            storage.jettonBalance -= msg.jettonAmount;
            storage.save();

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployedJettonWallet(
                    msg.transferRecipient,
                    storage.minterAddress,
                    contract.getCode(),
                ),
                value: 0,
                body: InternalTransferStep {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    transferInitiator: storage.ownerAddress,
                    sendExcessesTo: msg.sendExcessesTo,
                    forwardTonAmount: msg.forwardTonAmount,
                    forwardPayload: msg.forwardPayload,
                },
            });
            deployMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        AskToTransferTracked => {
            msg.forwardPayload.checkIsCorrectTlbEither();
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw ERROR_WRONG_WORKCHAIN;
            checkAmountIsEnoughToTransfer(
                in.valueCoins,
                msg.forwardTonAmount + ton("0.01"),
                in.originalForwardFee,
            );

            var storage = lazy WalletStorage.load();
            assert (in.senderAddress == storage.ownerAddress) throw ERROR_NOT_OWNER;
            assert (storage.jettonBalance >= msg.jettonAmount) throw ERROR_BALANCE_ERROR;
            storage.jettonBalance -= msg.jettonAmount;
            storage.save();

            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployedJettonWallet(
                    msg.transferRecipient,
                    storage.minterAddress,
                    contract.getCode(),
                ),
                value: 0,
                body: InternalTransferTracked {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    transferInitiator: storage.ownerAddress,
                    sendExcessesTo: msg.sendExcessesTo,
                    forwardTonAmount: msg.forwardTonAmount,
                    forwardPayload: msg.forwardPayload,
                },
            });
            deployMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        AskToBurn => {
            checkAmountIsEnoughToBurn(in.valueCoins);

            var storage = lazy WalletStorage.load();
            assert (in.senderAddress == storage.ownerAddress) throw ERROR_NOT_OWNER;
            assert (storage.jettonBalance >= msg.jettonAmount) throw ERROR_BALANCE_ERROR;
            storage.jettonBalance -= msg.jettonAmount;
            storage.save();

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: storage.minterAddress,
                value: 0,
                body: BurnNotificationForMinter {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    burnInitiator: storage.ownerAddress,
                    sendExcessesTo: msg.sendExcessesTo,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        TopUpTons => {}

        else => throw 0xFFFF,
    }
}

get fun get_wallet_data(): JettonWalletDataReply {
    val storage = lazy WalletStorage.load();

    return {
        jettonBalance: storage.jettonBalance,
        ownerAddress: storage.ownerAddress,
        minterAddress: storage.minterAddress,
        jettonWalletCode: contract.getCode(),
    };
}

fun receiveTokens(sender: address, value: coins, msg: InternalTransferStep, tracked: bool) {
    var storage = lazy WalletStorage.load();
    if (sender != storage.minterAddress) {
        assert (
            sender ==
            calcAddressOfJettonWallet(
                msg.transferInitiator!,
                storage.minterAddress,
                contract.getCode(),
            )
        ) throw ERROR_NOT_VALID_WALLET;
    }
    storage.jettonBalance += msg.jettonAmount;
    storage.save();

    if (msg.forwardTonAmount != 0) {
        val notifyOwnerMsg = createMessage({
            bounce: BounceMode.NoBounce,
            dest: storage.ownerAddress,
            value: msg.forwardTonAmount,
            body: TransferNotificationForRecipient {
                queryId: msg.queryId,
                jettonAmount: msg.jettonAmount,
                transferInitiator: msg.transferInitiator,
                forwardPayload: msg.forwardPayload,
            },
        });
        notifyOwnerMsg.send(
            SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
        );
    }

    if (
        (tracked || sender == storage.minterAddress) && msg.transferInitiator != null &&
        msg.jettonAmount > 0
    ) {
        if (tracked) {
            createMessage({
                bounce: false,
                dest: msg.transferInitiator!,
                value: ton("0.01"),
                body: TransferDelivered {
                    queryId: msg.queryId,
                    amount: msg.jettonAmount,
                },
            }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        } else {
            createMessage({
                bounce: false,
                dest: msg.transferInitiator!,
                value: ton("0.01"),
                body: MintDelivered {
                    queryId: msg.queryId,
                    amount: msg.jettonAmount,
                },
            }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }
    }
    if (msg.sendExcessesTo != null) {
        val toLeaveOnBalance = contract.getOriginalBalance() - value +
            contract.getStorageDuePayment();
        reserveGramsOnBalance(
            max(toLeaveOnBalance, calculateJettonWalletMinStorageFee()),
            RESERVE_MODE_AT_MOST,
        );

        val excessesMsg = createMessage({
            bounce: BounceMode.NoBounce,
            dest: msg.sendExcessesTo,
            value: 0,
            body: ReturnExcessesBack { queryId: msg.queryId },
        });
        // Storage is reserved before forwarding the remaining balance.
        excessesMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
    }
}
