import "@gen/JettonWalletV2.code"
import "bonding-messages"
import "launch-fees"
import "minter-storage"
import "wallet-fees"
import "wallet-messages"
import "../v1/errors"
import "../v1/jetton-utils"
import "../v1/messages"
import "../v1/sharding"
import "../v1/storage"

contract JettonMinterV2 {
    author: "Digital Resistance"
    version: "2.1.0"
    description: "Standard Jetton Minter. TEP-74 and TEP-89 compliant"
    storage: MinterStorageV2
    incomingMessages: AllowedMessageToMinter
}

type AllowedMessageToMinter =
    | MintNewJettons
    | MintCurveWallet
    | MintLaunchTokens
    | ProbeLaunchSettlement
    | ResolveLaunchMint
    | LaunchMintInspection
    | BurnNotificationForMinter
    | BurnNotificationTracked
    | RequestWalletAddress
    | ChangeMinterAdmin
    | ClaimMinterAdmin
    | DropMinterAdmin
    | ChangeMinterMetadata
    | TopUpTons

type BounceableLegacyMinterOps = InternalTransferStep | InternalCurveMint

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();
    if (in.bouncedBody.preloadUint(32) == 0xa0a0b081) {
        val parsed = lazy InternalLaunchMint.fromSlice(in.bouncedBody);
        var storage = MinterStorageV2.load();
        assert (storage.launchJournal != null) throw Errors.InvalidOp;
        var journal = storage.launchJournal!.load();
        val found = journal.attempts.get(parsed.queryId);
        assert (found.isFound) throw Errors.InvalidMessage;
        var attempt = found.loadValue().load();
        assert (
            in.senderAddress ==
            calcAddressOfJettonWallet(
                attempt.recipient,
                contract.getAddress(),
                jettonWalletV2CompiledCode(),
            ) &&
            parsed.jettonAmount == attempt.amount
        ) throw Errors.NotValidWallet;
        if (attempt.phase != LaunchMintPhase.Issued) {
            return;
        }
        storage.totalSupply -= attempt.amount;
        attempt.phase = LaunchMintPhase.Failed;
        journal.attempts.set(attempt.queryId, attempt.toCell());
        storage.launchJournal = journal.toCell();
        storage.save();
        createMessage({ bounce: false, dest: journal.curve, value: 0, body: LaunchMintFailed {
                queryId: attempt.queryId,
            } }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        return;
    }
    val parsed = lazy BounceableLegacyMinterOps.fromSlice(in.bouncedBody);
    val (id, amount) = match (parsed) {
        InternalTransferStep => (parsed.queryId, parsed.jettonAmount),
        InternalCurveMint => (parsed.queryId, parsed.jettonAmount),
    };
    var storage = lazy MinterStorageV2.load();
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
        ResolveLaunchMint => {
            assert (msg.leg <= 1) throw Errors.InvalidMessage;
            val storage = MinterStorageV2.load();
            val curve = storage.launchJournal != null
                ? storage.launchJournal!.load().curve
                : storage.adminAddress!;
            assert (in.senderAddress == curve) throw Errors.NotOwner;
            if (
                storage.launchJournal == null ||
                !storage.launchJournal!.load().attempts.exists(msg.leg + 1)
            ) {
                // Curve -> minter FIFO proves that the earlier mint request has already been processed.
                replyLaunchMintResolved(
                    curve,
                    msg.queryId,
                    msg.leg,
                    false,
                    true,
                    0,
                    in.valueCoins,
                );
                return;
            }
            val attempt = storage
                .launchJournal!
                .load()
                .attempts
                .get(msg.leg + 1)
                .loadValue()
                .load();
            reserveToncoinsOnBalance(
                max(contract.getOriginalBalance() - in.valueCoins, 0),
                RESERVE_MODE_EXACT_AMOUNT | RESERVE_MODE_BOUNCE_ON_ACTION_FAIL,
            );
            // Always inspect, including terminal records: this drains older inspection replies before the newest result.
            createMessage({ bounce: BounceMode.Only256BitsOfBody, dest: calcDeployedJettonWallet(
                    attempt.recipient,
                    contract.getAddress(),
                    jettonWalletV2CompiledCode(),
                ), value: 0, body: InspectLaunchMint {
                    queryId: msg.queryId,
                    leg: msg.leg,
                    curve,
                } }).send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }
        LaunchMintInspection => {
            assert (msg.leg <= 1) throw Errors.InvalidMessage;
            var storage = MinterStorageV2.load();
            assert (storage.launchJournal != null) throw Errors.InvalidOp;
            var journal = storage.launchJournal!.load();
            val found = journal.attempts.get(msg.leg + 1);
            assert (found.isFound) throw Errors.InvalidMessage;
            var attempt = found.loadValue().load();
            assert (
                in.senderAddress ==
                calcAddressOfJettonWallet(
                    attempt.recipient,
                    contract.getAddress(),
                    jettonWalletV2CompiledCode(),
                )
            ) throw Errors.NotValidWallet;
            if (msg.delivered) {
                assert (
                    msg.amount == attempt.amount && attempt.phase != LaunchMintPhase.Failed
                ) throw Errors.InvalidMessage;
            }
            if (attempt.phase == LaunchMintPhase.Issued) {
                if (!msg.delivered) {
                    storage.totalSupply -= attempt.amount;
                }
                attempt.phase = msg.delivered ? LaunchMintPhase.Delivered : LaunchMintPhase.Failed;
                journal.attempts.set(attempt.queryId, attempt.toCell());
                storage.launchJournal = journal.toCell();
                storage.save();
            }
            // Wallet -> minter FIFO orders this inspection after the original mint and its possible bounce.
            replyLaunchMintResolved(
                journal.curve,
                msg.queryId,
                msg.leg,
                attempt.phase == LaunchMintPhase.Delivered,
                attempt.phase == LaunchMintPhase.Failed,
                attempt.amount,
                in.valueCoins,
            );
        }
        ProbeLaunchSettlement => {
            assert (msg.leg == 3) throw Errors.InvalidMessage;
            val storage = MinterStorageV2.load();
            replyLaunchSettlement(
                in.senderAddress,
                msg.queryId,
                msg.leg,
                storage.adminAddress == null && storage.nextAdminAddress == null,
                0,
                in.valueCoins,
                0,
            );
        }
        MintLaunchTokens => {
            assert (in.valueCoins >= launchGas(LAUNCH_MINTER_MINT_GAS)) throw Errors.NotEnoughGas;
            assert (in.senderAddress.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;
            var storage = MinterStorageV2.load();
            assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
            assert (msg.queryId == 1 || msg.queryId == 2) throw Errors.InvalidMessage;
            assert (msg.jettonAmount > 0) throw Errors.InvalidMessage;
            assert (msg.mintRecipient.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;
            val protect = msg.queryId == 1;
            assert (!protect || msg.mintRecipient == in.senderAddress) throw Errors.InvalidMessage;
            assert (
                in.valueCoins >=
                launchMintFunding(
                    in.senderAddress,
                    contract.getAddress(),
                    msg.mintRecipient,
                    msg.queryId,
                    msg.jettonAmount,
                    protect,
                )
            ) throw Errors.NotEnoughGas;
            var journal = storage.launchJournal != null
                ? storage.launchJournal!.load()
                : LaunchMintJournal { curve: in.senderAddress };
            assert (
                journal.curve == in.senderAddress && !journal.attempts.exists(msg.queryId)
            ) throw Errors.InvalidOp;
            journal
                .attempts
                .set(
                    msg.queryId,
                    LaunchMintAttempt {
                        queryId: msg.queryId,
                        amount: msg.jettonAmount,
                        recipient: msg.mintRecipient,
                        phase: LaunchMintPhase.Issued,
                    }.toCell(),
                );
            storage.launchJournal = journal.toCell();
            storage.totalSupply += msg.jettonAmount;
            storage.save();
            reserveToncoinsOnBalance(
                max(max(contract.getOriginalBalance() - in.valueCoins, 0), LAUNCH_MINTER_RESERVE),
                RESERVE_MODE_EXACT_AMOUNT | RESERVE_MODE_BOUNCE_ON_ACTION_FAIL,
            );
            createMessage({ bounce: BounceMode.Only256BitsOfBody, dest: calcDeployedJettonWallet(
                    msg.mintRecipient,
                    contract.getAddress(),
                    jettonWalletV2CompiledCode(),
                ), value: 0, body: InternalLaunchMint {
                    queryId: msg.queryId,
                    jettonAmount: msg.jettonAmount,
                    curve: in.senderAddress,
                    protect,
                } }).send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }
        BurnNotificationTracked => {
            var storage = lazy MinterStorageV2.load();
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
            var storage = lazy MinterStorageV2.load();
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
            var storage = lazy MinterStorageV2.load();
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
            var storage = lazy MinterStorageV2.load();
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
            var storage = lazy MinterStorageV2.load();
            assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
            storage.nextAdminAddress = msg.newAdminAddress;
            storage.save();
        }

        ClaimMinterAdmin => {
            var storage = lazy MinterStorageV2.load();
            assertSenderIsAdmin(in.senderAddress, storage.nextAdminAddress);
            storage.adminAddress = storage.nextAdminAddress;
            storage.nextAdminAddress = null;
            storage.save();
        }

        DropMinterAdmin => {
            assert (in.valueCoins >= launchGas(LAUNCH_MINTER_DROP_GAS)) throw Errors.NotEnoughGas;
            var storage = lazy MinterStorageV2.load();
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
            var storage = lazy MinterStorageV2.load();
            assertSenderIsAdmin(in.senderAddress, storage.adminAddress);
            storage.metadata = msg.newMetadata;
            storage.save();
        }

        TopUpTons => {}

        else => throw 0xFFFF,
    }
}

get fun get_jetton_data(): JettonDataReply {
    val storage = lazy MinterStorageV2.load();
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
    val storage = lazy MinterStorageV2.load();
    return storage.nextAdminAddress;
}
