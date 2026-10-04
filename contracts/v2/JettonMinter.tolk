import "@gen/JettonWalletV2.code"
import "bonding-messages"
import "wallet-fees"
import "wallet-messages"
import "../v1/errors"
import "../v1/jetton-utils"
import "../v1/messages"
import "../v1/sharding"
import "../v1/storage"

contract JettonMinterV2 {
    author: "Digital Resistance"
    version: "2.0.0"
    description: "Standard Jetton Minter. TEP-74 and TEP-89 compliant"
    storage: MinterStorage
    incomingMessages: AllowedMessageToMinter
}

type AllowedMessageToMinter =
    | MintNewJettons
    | MintCurveWallet
    | BurnNotificationForMinter
    | BurnNotificationTracked
    | RequestWalletAddress
    | ChangeMinterAdmin
    | ClaimMinterAdmin
    | DropMinterAdmin
    | ChangeMinterMetadata
    | TopUpTons

type BounceableMinterOps = InternalTransferStep | InternalCurveMint

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();
    val parsed = lazy BounceableMinterOps.fromSlice(in.bouncedBody);

    val (id, amount) = match (parsed) {
        InternalTransferStep => (parsed.queryId, parsed.jettonAmount),
        InternalCurveMint => (parsed.queryId, parsed.jettonAmount),
    };
    var storage = lazy MinterStorage.load();
    storage.totalSupply -= amount;
    storage.save();
    if (storage.adminAddress != null) {
        createMessage({
            bounce: false,
            dest: storage.adminAddress!,
            value: 0,
            body: LaunchMintFailed { queryId: id },
        }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
    }
}

fun assertSenderIsAdmin(senderAddress: address, adminAddress: address?) {
    assert (senderAddress == adminAddress!) throw Errors.NotOwner;
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessageToMinter.fromSlice(in.body);

    match (msg) {
        BurnNotificationTracked => {
            var storage = MinterStorage.load();
            assert (
                in.senderAddress ==
                calcAddressOfJettonWallet(
                    msg.burnInitiator,
                    contract.getAddress(),
                    jettonWalletV2CompiledCode(),
                )
            ) throw Errors.NotValidWallet;
            assert (
                msg.jettonAmount > 0 && storage.totalSupply >= msg.jettonAmount
            ) throw Errors.BalanceError;
            storage.totalSupply -= msg.jettonAmount;
            storage.save();
            createMessage({ bounce: false, dest: msg.burnInitiator, value: 0, body: BurnDelivered {
                    queryId: msg.queryId,
                    amount: msg.jettonAmount,
                } }).send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }
        BurnNotificationForMinter => {
            var storage = lazy MinterStorage.load();
            val jettonWalletCode = jettonWalletV2CompiledCode();
            assert (
                in.senderAddress ==
                calcAddressOfJettonWallet(
                    msg.burnInitiator,
                    contract.getAddress(),
                    jettonWalletCode,
                )
            ) throw Errors.NotValidWallet;
            storage.totalSupply -= msg.jettonAmount;
            storage.save();

            if (msg.sendExcessesTo == null) {
                return;
            }

            val excessesMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: msg.sendExcessesTo,
                value: 0,
                body: ReturnExcessesBack { queryId: msg.queryId },
            });
            excessesMsg.send(SEND_MODE_IGNORE_ERRORS | SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }

        RequestWalletAddress => {
            val ownerAddress: Cell<address>? = msg.includeOwnerAddress
                ? msg.ownerAddress.toCell()
                : null;

            var walletAddress: address? = null;
            if (msg.ownerAddress.getWorkchain() == MY_WORKCHAIN) {
                val jettonWalletCode = jettonWalletV2CompiledCode();
                walletAddress = calcAddressOfJettonWallet(
                    msg.ownerAddress,
                    contract.getAddress(),
                    jettonWalletCode,
                );
            }

            val respondMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: in.senderAddress,
                value: 0,
                body: ResponseWalletAddress {
                    queryId: msg.queryId,
                    jettonWalletAddress: walletAddress,
                    ownerAddress,
                },
            });
            respondMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }

        MintCurveWallet => {
            var storage = lazy MinterStorage.load();
            assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
            assert (in.senderAddress.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;
            assert (msg.jettonAmount > 0 && msg.queryId == 1) throw Errors.InvalidMessage;
            checkWalletTransferBudget(msg.tonAmount, ton("0.05"), in.originalForwardFee);
            storage.totalSupply += msg.jettonAmount;
            storage.save();
            reserveToncoinsOnBalance(ton("0.01"), RESERVE_MODE_EXACT_AMOUNT);
            createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployedJettonWallet(
                    in.senderAddress,
                    contract.getAddress(),
                    jettonWalletV2CompiledCode(),
                ),
                value: msg.tonAmount,
                body: InternalCurveMint {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                },
            }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        MintNewJettons => {
            var storage = lazy MinterStorage.load();
            assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
            assert (msg.mintRecipient.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;

            val internalTransferMsg = lazy msg
                .internalTransferMsg
                .load({ throwIfOpcodeDoesNotMatch: Errors.InvalidOp });
            val forwardTonAmount = internalTransferMsg.forwardTonAmount;
            internalTransferMsg.forwardPayload.checkIsCorrectTlbEither();

            checkWalletTransferBudget(msg.tonAmount, forwardTonAmount, in.originalForwardFee);

            storage.totalSupply += internalTransferMsg.jettonAmount;
            storage.save();

            reserveToncoinsOnBalance(
                ton("0.01"),
                RESERVE_MODE_EXACT_AMOUNT,
            );

            val jettonWalletCode = jettonWalletV2CompiledCode();
            val deployMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: calcDeployedJettonWallet(
                    msg.mintRecipient,
                    contract.getAddress(),
                    jettonWalletCode,
                ),
                value: msg.tonAmount,
                body: msg.internalTransferMsg,
            });
            deployMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        ChangeMinterAdmin => {
            var storage = lazy MinterStorage.load();
            assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
            storage.nextAdminAddress = msg.newAdminAddress;
            storage.save();
        }

        ClaimMinterAdmin => {
            var storage = lazy MinterStorage.load();
            assertSenderIsAdmin(in.senderAddress, storage.nextAdminAddress);
            storage.adminAddress = storage.nextAdminAddress;
            storage.nextAdminAddress = null;
            storage.save();
        }

        DropMinterAdmin => {
            var storage = lazy MinterStorage.load();
            assert (in.valueCoins >= ton("0.01")) throw Errors.NotEnoughGas;
            if (storage.adminAddress != null) {
                assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
                storage.adminAddress = null;
                storage.nextAdminAddress = null;
                storage.save();
            } else {
                assert (storage.nextAdminAddress == null) throw Errors.InvalidOp;
            }
            createMessage({
                bounce: false,
                dest: in.senderAddress,
                value: 0,
                body: MinterAdminDropped { queryId: msg.queryId },
            }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        ChangeMinterMetadata => {
            var storage = lazy MinterStorage.load();
            assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
            storage.metadata = msg.newMetadata;
            storage.save();
        }

        TopUpTons => {}

        else => throw 0xFFFF,
    }
}

get fun get_jetton_data(): JettonDataReply {
    val storage = lazy MinterStorage.load();
    val jettonWalletCode = jettonWalletV2CompiledCode();

    return {
        totalSupply: storage.totalSupply,
        mintable: storage.adminAddress != null,
        adminAddress: storage.adminAddress,
        jettonContent: storage.metadata as Cell<OnchainMetadataReply>,
        jettonWalletCode,
    };
}

get fun get_wallet_address(ownerAddress: address): address {
    val jettonWalletCode = jettonWalletV2CompiledCode();
    return calcAddressOfJettonWallet(ownerAddress, contract.getAddress(), jettonWalletCode);
}

get fun get_next_admin_address(): address? {
    val storage = lazy MinterStorage.load();
    return storage.nextAdminAddress;
}
