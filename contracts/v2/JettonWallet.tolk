import "@stdlib/gas-payments"
import "wallet-fees"
// Derived from the pinned reference in ../v1/JettonWallet.upstream.json.
import "wallet-messages"
import "wallet-storage"
import "../v1/errors"
import "../v1/fees-management"
import "../v1/jetton-utils"
import "../v1/messages"
import "../v1/sharding"
import "../v1/storage"

contract JettonWalletV2 {
    author: "The Tolk Team; bonding-curve-contracts"
    version: "2.1.0"
    description: "Reference-derived jetton wallet with authenticated V2 delivery receipts"
    incomingMessages: AllowedMessageToWallet
    storage: WalletStorageV2
}

type AllowedMessageToWallet =
    | AskToTransfer
    | AskToTransferTracked
    | AskToBurn
    | AskToBurnTracked
    | InternalTransferStep
    | InternalTransferTracked
    | InternalCurveMint
    | TopUpTons

type BounceOpToHandle =
    | InternalTransferStep
    | InternalTransferTracked
    | BurnNotificationForMinter
    | BurnNotificationTracked

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();

    val msg = lazy BounceOpToHandle.fromSlice(in.bouncedBody);
    var restoreAmount: coins = 0;
    var tracked = false;
    var burn = false;
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
        BurnNotificationTracked => {
            restoreAmount = msg.jettonAmount;
            burn = true;
            id = msg.queryId;
        }
    }

    var storage = lazy WalletStorageV2.load();
    storage.jettonBalance += restoreAmount;
    storage.save();
    if (burn) {
        assert (in.senderAddress == storage.minterAddress) throw ERROR_NOT_VALID_WALLET;
        createMessage({ bounce: false, dest: storage.ownerAddress, value: 0, body: BurnFailed {
                queryId: id,
                amount: restoreAmount,
            } }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
    }
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
        InternalCurveMint => {
            receiveTokens(
                in.senderAddress,
                in.valueCoins,
                InternalTransferStep {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    transferInitiator: null,
                    sendExcessesTo: null,
                    forwardTonAmount: ton("0.05"),
                    forwardPayload: beginCell().storeUint(0, 1).toSlice(),
                },
                false,
                true,
                in.originalForwardFee,
            );
        }
        InternalTransferStep => {
            receiveTokens(
                in.senderAddress,
                in.valueCoins,
                msg,
                false,
                false,
                in.originalForwardFee,
            );
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
                false,
                in.originalForwardFee,
            );
        }

        AskToTransfer => {
            msg.forwardPayload.checkIsCorrectTlbEither();
            assert (
                msg.transferRecipient.getWorkchain() == MY_WORKCHAIN
            ) throw ERROR_WRONG_WORKCHAIN;
            checkWalletTransferBudget(
                in.valueCoins,
                msg.forwardTonAmount,
                in.originalForwardFee,
            );

            var storage = lazy WalletStorageV2.load();
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
            checkWalletTransferBudget(
                in.valueCoins,
                msg.forwardTonAmount + ton("0.01"),
                in.originalForwardFee,
            );

            var storage = lazy WalletStorageV2.load();
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

        AskToBurnTracked => {
            checkWalletBurnBudget(in.valueCoins);
            var storage = WalletStorageV2.load();
            assert (in.senderAddress == storage.ownerAddress) throw ERROR_NOT_OWNER;
            assert (
                msg.jettonAmount > 0 && storage.jettonBalance >= msg.jettonAmount
            ) throw ERROR_BALANCE_ERROR;
            storage.jettonBalance -= msg.jettonAmount;
            storage.save();
            createMessage({ bounce: true, dest: storage.minterAddress, value: 0, body: BurnNotificationTracked {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    burnInitiator: storage.ownerAddress,
                } }).send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }
        AskToBurn => {
            checkWalletBurnBudget(in.valueCoins);

            var storage = lazy WalletStorageV2.load();
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
    val storage = lazy WalletStorageV2.load();

    return {
        jettonBalance: storage.jettonBalance,
        ownerAddress: storage.ownerAddress,
        minterAddress: storage.minterAddress,
        jettonWalletCode: contract.getCode(),
    };
}

fun receiveTokens(
    sender: address,
    value: coins,
    msg: InternalTransferStep,
    tracked: bool,
    protect: bool = false,
    fwdFee: coins = 0,
) {
    var storage = lazy WalletStorageV2.load();
    if (protect) {
        assert (sender == storage.minterAddress) throw ERROR_NOT_VALID_WALLET;
        assert (!storage.isCurveWallet()) throw Errors.InvalidOp;
        storage.protection = beginCell().storeBool(true).toSlice();
    }
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
    if (storage.isCurveWallet() && sender != storage.minterAddress) {
        assert (
            msg.forwardTonAmount >= minimumCurveSellNotification(fwdFee)
        ) throw Errors.NotEnoughGas;
    }
    storage.jettonBalance += msg.jettonAmount;
    storage.save();
    val initiator = protect ? storage.ownerAddress : msg.transferInitiator;
    val excessesTo = protect ? storage.ownerAddress : msg.sendExcessesTo;

    if (msg.forwardTonAmount != 0) {
        val notifyOwnerMsg = createMessage({
            bounce: BounceMode.NoBounce,
            dest: storage.ownerAddress,
            value: msg.forwardTonAmount,
            body: TransferNotificationForRecipient {
                queryId: msg.queryId,
                jettonAmount: msg.jettonAmount,
                transferInitiator: initiator,
                forwardPayload: msg.forwardPayload,
            },
        });
        notifyOwnerMsg.send(
            SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
        );
    }

    if ((tracked || sender == storage.minterAddress) && initiator != null && msg.jettonAmount > 0) {
        if (tracked) {
            createMessage({
                bounce: false,
                dest: initiator!,
                value: ton("0.01"),
                body: TransferDelivered {
                    queryId: msg.queryId,
                    amount: msg.jettonAmount,
                },
            }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        } else {
            createMessage({
                bounce: false,
                dest: initiator!,
                value: ton("0.01"),
                body: MintDelivered {
                    queryId: msg.queryId,
                    amount: msg.jettonAmount,
                },
            }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }
    }
    if (excessesTo != null) {
        val toLeaveOnBalance = contract.getOriginalBalance() - value +
            contract.getStorageDuePayment();
        reserveGramsOnBalance(
            max(toLeaveOnBalance, walletStorageReserve()),
            RESERVE_MODE_AT_MOST,
        );

        val excessesMsg = createMessage({
            bounce: BounceMode.NoBounce,
            dest: excessesTo,
            value: 0,
            body: ReturnExcessesBack { queryId: msg.queryId },
        });
        // Storage is reserved before forwarding the remaining balance.
        excessesMsg.send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_IGNORE_ERRORS);
    }
}

get fun get_min_sell_notification(): coins {
    return WalletStorageV2.load().isCurveWallet() ? minimumCurveSellNotification() : 0;
}
