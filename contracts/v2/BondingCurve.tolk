import "@gen/JettonWalletV2.code"
import "bonding-dedust"
import "bonding-math"
import "bonding-messages"
import "bonding-storage"
import "buyback-address"
import "buyback-messages"
import "buyback-storage"
import "collector-address"
import "fee-addresses"
import "fee-storage"
import "wallet-fees"
import "wallet-messages"
import "../v1/bonding-config"
import "../v1/errors"
import "../v1/jetton-utils"
import "../v1/messages"
import "../v1/sharding"

contract BondingCurveV2 {
    author: "bonding-curve-contracts"
    version: "2.0.0"
    description: "Per-launch x*y=k bonding curve. Holds fixed Jetton inventory, swaps TON<->Jetton."
    storage: BondingCurveStorage
    incomingMessages: AllowedMessageToCurve
}

type AllowedMessageToCurve =
    | InitializeCurve
    | MintDelivered
    | MinterAdminDropped
    | ReturnExcessesBack
    | LaunchMintFailed
    | ClaimCurveCreatorFees
    | FlushCreatorFees
    | BuyJettons
    | FlushFees
    | Graduate
    | RetryMigration
    | ConfirmMigration
    | PrepareBuyback
    | DepositNotification
    | TakePositionState
    | TransferFailed
    | TransferDelivered
    | InitPoolResultMessage
    | TransferNotificationForRecipient
    | TopUpTons

type BounceableOutboundOps =
    | AskToTransfer
    | AskToTransferTracked
    | MintNewJettons
    | MintCurveWallet
    | DepositProtocolFees
    | DedustPayNative
    | DropMinterAdmin
    | DedustInit
    | ProvidePositionState
    | CreditCurveFees

fun emptyForwardPayload(): slice {
    return beginCell().storeUint(0, 1).toSlice();
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessageToCurve.fromSlice(in.body);

    match (msg) {
        InitializeCurve => {
            var storage = lazy BondingCurveStorage.load();
            val config = storage.config.load();
            assert (in.senderAddress == config.master) throw Errors.NotOwner;
            assert (
                msg.protocolTreasury.getWorkchain() == MY_WORKCHAIN
            ) throw Errors.WrongWorkchain;
            assert (storage.state == CURVE_STATE_INITIALIZING) throw Errors.InvalidOp;
            assert (storage.jettonMinter == null) throw Errors.InvalidOp;

            val o = config.options.load();
            validateLaunchOptions(o);
            storage.jettonMinter = msg.jettonMinter;
            var progress = storage.progress.load();
            progress.protocolTreasury = msg.protocolTreasury;
            if (o.devBuyAmount > 0) {
                val (tokens, fees) = computeBuyOut(
                    o.devBuyAmount,
                    storage.virtualTonReserve,
                    0,
                    o.supply,
                    o.creatorFeeBps,
                );
                assert (tokens > 0 && tokens >= o.minDevTokens) throw Errors.InvalidMessage;
                progress.devTokens = tokens;
                storage.realTonReserve = o.devBuyAmount - fees;
                progress.creatorAccrued = o.devBuyAmount * o.creatorFeeBps / 10000;
                val protocolFee = o.devBuyAmount * PROTOCOL_FEE_BPS / 10000;
                storage.migrationReserve = min(protocolFee / 10, MIGRATION_RESERVE_TARGET);
                storage.feeAccrued = protocolFee - storage.migrationReserve;
            } else {
                progress.devReceived = true;
            }
            storage.progress = progress.toCell();
            storage.save();
            createMessage({ bounce: true, dest: msg.jettonMinter, value: ton("0.22"), body: MintCurveWallet {
                    queryId: 1,
                    jettonAmount: o.supply - progress.devTokens,
                    tonAmount: ton("0.2"),
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        ReturnExcessesBack => {}
        MinterAdminDropped => {
            var storage = BondingCurveStorage.load();
            assert (
                storage.jettonMinter != null && in.senderAddress == storage.jettonMinter!
            ) throw Errors.NotOwner;
            if (storage.dropAdminPending) {
                storage.dropAdminPending = false;
                storage.save();
            }
        }
        MintDelivered => {
            var storage = BondingCurveStorage.load();
            if (storage.state != CURVE_STATE_INITIALIZING || storage.jettonMinter == null) {
                return;
            }
            val config = storage.config.load();
            val creatorWallet = calcAddressOfJettonWallet(
                config.creator,
                storage.jettonMinter!,
                jettonWalletV2CompiledCode(),
            );
            if (in.senderAddress != creatorWallet || msg.queryId != 2) {
                return;
            }
            var progress = storage.progress.load();
            assert (
                msg.amount == progress.devTokens && progress.devTokens > 0
            ) throw Errors.InvalidMessage;
            progress.devReceived = true;
            storage.progress = progress.toCell();
            finishLaunch(mutate storage);
        }

        LaunchMintFailed => {
            var storage = BondingCurveStorage.load();
            assert (
                storage.jettonMinter != null && in.senderAddress == storage.jettonMinter!
            ) throw Errors.NotOwner;
            if (storage.state == CURVE_STATE_INITIALIZING) {
                cancelLaunch(mutate storage);
            }
        }

        ClaimCurveCreatorFees => {
            var storage = BondingCurveStorage.load();
            val config = storage.config.load();
            assert (in.senderAddress == config.creator) throw Errors.NotOwner;
            assert (
                storage.state != CURVE_STATE_INITIALIZING && storage.state != CURVE_STATE_CANCELLED
            ) throw Errors.InvalidOp;
            assert (in.valueCoins >= ton("0.05")) throw Errors.NotEnoughGas;
            flushCreatorFees(mutate storage, msg.queryId);
        }

        FlushCreatorFees => {
            var storage = BondingCurveStorage.load();
            assert (
                storage.state != CURVE_STATE_INITIALIZING && storage.state != CURVE_STATE_CANCELLED
            ) throw Errors.InvalidOp;
            assert (in.valueCoins >= ton("0.05")) throw Errors.NotEnoughGas;
            flushCreatorFees(mutate storage, msg.queryId);
        }

        BuyJettons => {
            var storage = lazy BondingCurveStorage.load();

            assert (in.senderAddress.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;
            val config = storage.config.load();
            assert (storage.state == CURVE_STATE_TRADING) throw Errors.InvalidOp;

            assert (in.valueCoins >= CURVE_TRANSFER_VALUE + ton("0.01")) throw Errors.NotEnoughGas;

            val tonIn = in.valueCoins - CURVE_TRANSFER_VALUE;
            val options = config.options.load();
            val (jettonsOut, feeTon) = computeBuyOut(
                tonIn,
                storage.virtualTonReserve,
                storage.realTonReserve,
                storage.curveJettonBalance,
                options.creatorFeeBps,
            );

            assert (jettonsOut > 0) throw Errors.BalanceError;
            val (minBuyTokens, maxBuyTokens) = buyTokenLimits(options);
            assert (jettonsOut >= minBuyTokens) throw Errors.InvalidMessage;
            assert (
                options.maxBuyBps == 0 || jettonsOut <= maxBuyTokens
            ) throw Errors.InvalidMessage;
            assert (jettonsOut >= msg.minJettonsOut) throw Errors.InvalidMessage;

            assert (
                storage.curveJettonBalance - jettonsOut >= config.dexReserveSupply
            ) throw Errors.BalanceError;

            var progress = storage.progress.load();
            val creatorFee = tonIn * options.creatorFeeBps / 10000;
            val protocolFee = tonIn * PROTOCOL_FEE_BPS / 10000;
            progress.creatorAccrued += creatorFee;
            storage.progress = progress.toCell();
            val tonInNet = tonIn - feeTon;
            storage.realTonReserve += tonInNet;
            storage.curveJettonBalance -= jettonsOut;

            val reserveCap = MIGRATION_RESERVE_TARGET - storage.migrationReserve;
            val migrationCut = reserveCap > 0
                ? min(protocolFee * MIGRATION_RESERVE_RATIO_BPS / BPS_DENOMINATOR, reserveCap)
                : 0;
            storage.migrationReserve += migrationCut;
            storage.feeAccrued += (protocolFee - migrationCut);

            val crossedThreshold = shouldGraduate(
                storage.realTonReserve,
                config.graduationThreshold,
            );
            if (crossedThreshold) {
                storage.state = CURVE_STATE_FROZEN;
            }
            storage.save();

            val ourWallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                storage.jettonMinter!,
                jettonWalletV2CompiledCode(),
            );

            val transferBody: AskToTransfer = {
                queryId: msg.queryId,
                jettonAmount: jettonsOut,
                transferRecipient: in.senderAddress,
                sendExcessesTo: in.senderAddress,
                customPayload: null,
                forwardTonAmount: CURVE_TRANSFER_NOTIFICATION,
                forwardPayload: emptyForwardPayload(),
            };

            val outBuyMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: ourWallet,
                value: CURVE_TRANSFER_VALUE,
                body: transferBody,
            });
            // Reject underfunded delivery; reserve updates roll back on failure.
            checkWalletTransferBudget(
                CURVE_TRANSFER_VALUE,
                CURVE_TRANSFER_NOTIFICATION,
                outBuyMsg.estimateFeeWithoutSending(SEND_MODE_PAY_FEES_SEPARATELY),
            );
            outBuyMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val buyEventMsg = createExternalLogMessage({
                dest: ExtOutLogBucket { topic: TOPIC_BUY },
                body: BuyEvent {
                    buyer: in.senderAddress,
                    tonInNet,
                    jettonsOut,
                    feeTon,
                    realTonReserve: storage.realTonReserve,
                    curveJettonBalance: storage.curveJettonBalance,
                    tonInGross: tonIn,
                    migrationStarted: crossedThreshold,
                },
            });
            buyEventMsg.send(SEND_MODE_REGULAR);

            if (crossedThreshold) {
                val autoGraduateBody: Graduate = { queryId: msg.queryId };
                val autoGraduateMsg = createMessage({
                    bounce: BounceMode.Only256BitsOfBody,
                    dest: contract.getAddress(),
                    value: DEDUST_GRADUATE_GAS_BUDGET,
                    body: autoGraduateBody,
                });
                autoGraduateMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
            }
        }

        TransferNotificationForRecipient => {
            var storage = lazy BondingCurveStorage.load();
            val config = storage.config.load();

            if (storage.jettonMinter == null) {
                return;
            }
            val ourWallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                storage.jettonMinter!,
                jettonWalletV2CompiledCode(),
            );
            if (in.senderAddress != ourWallet) {
                return;
            }

            val initiator = msg.transferInitiator;

            if (
                storage.state == CURVE_STATE_INITIALIZING && initiator != null &&
                initiator! == contract.getAddress()
            ) {
                var progress = storage.progress.load();
                if (progress.curveReceived || msg.queryId != 1) {
                    return;
                }
                assert (
                    msg.jettonAmount == config.options.load().supply - progress.devTokens
                ) throw Errors.InvalidMessage;
                progress.curveReceived = true;
                storage.curveJettonBalance = msg.jettonAmount;
                storage.progress = progress.toCell();
                if (progress.devTokens > 0) {
                    mintLaunchTokens(
                        storage.jettonMinter!,
                        config.creator,
                        progress.devTokens,
                        2,
                        0,
                    );
                }
                finishLaunch(mutate storage);
                return;
            }

            // Ignore late mint notifications after cancellation.
            if (
                storage.state == CURVE_STATE_CANCELLED && initiator != null &&
                initiator! == contract.getAddress()
            ) {
                return;
            }
            if (storage.state != CURVE_STATE_TRADING) {
                if (initiator != null && msg.jettonAmount > 0) {
                    val ourWalletFrozen = calcAddressOfJettonWallet(
                        contract.getAddress(),
                        storage.jettonMinter!,
                        jettonWalletV2CompiledCode(),
                    );
                    val refundBody: AskToTransfer = {
                        queryId: msg.queryId,
                        jettonAmount: msg.jettonAmount,
                        transferRecipient: initiator!,
                        sendExcessesTo: initiator!,
                        customPayload: null,
                        forwardTonAmount: CURVE_TRANSFER_NOTIFICATION,
                        forwardPayload: emptyForwardPayload(),
                    };

                    val refundValue = minimumWalletTransferValue(
                        CURVE_TRANSFER_NOTIFICATION,
                        in.originalForwardFee,
                    ) +
                        REFUND_VALUE_EPSILON;
                    val refundMsg = createMessage({
                        bounce: BounceMode.Only256BitsOfBody,
                        dest: ourWalletFrozen,
                        value: refundValue,
                        body: refundBody,
                    });
                    refundMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
                }
                return;
            }

            if (initiator == null) {
                return;
            }

            val maxSafe = maxSafeSellJettons(
                storage.virtualTonReserve,
                storage.realTonReserve,
                storage.curveJettonBalance,
            );
            val acceptedJettons = msg.jettonAmount <= maxSafe ? msg.jettonAmount : maxSafe;
            val excessJettons = msg.jettonAmount - acceptedJettons;

            var minTonOut: coins = 0;
            var slippageParseFailed: bool = false;
            try {
                var fwdMut: slice = msg.forwardPayload;
                var inner: slice = fwdMut;

                if (fwdMut.remainingBitsCount() >= 1) {
                    val hasRef1 = fwdMut.loadUint(1);
                    if (hasRef1 == 1 && fwdMut.remainingRefsCount() >= 1) {
                        inner = fwdMut.loadRef().beginParse();
                    } else {
                        inner = fwdMut;
                    }
                }

                if (inner.remainingBitsCount() == 1 && inner.remainingRefsCount() == 1) {
                    val hasRef2 = inner.loadUint(1);
                    if (hasRef2 == 1) {
                        inner = inner.loadRef().beginParse();
                    }
                }
                if (inner.remainingBitsCount() >= 32 && inner.preloadUint(32) == 0xa0a0a020) {
                    minTonOut = SellPayload.fromSlice(inner).minTonOut;
                }
            } catch (_e) {
                slippageParseFailed = true;
            }

            if (slippageParseFailed && initiator != null) {
                val parseFailEvent = createExternalLogMessage({
                    dest: ExtOutLogBucket { topic: TOPIC_SLIPPAGE_PARSE_FAILED },
                    body: SlippageParseFailedEvent {
                        seller: initiator!,
                        jettonAmount: msg.jettonAmount,
                    },
                });
                parseFailEvent.send(SEND_MODE_REGULAR);
            }

            if (acceptedJettons > 0) {
                val (tonOut, feeTon) = computeSellOut(
                    acceptedJettons,
                    storage.virtualTonReserve,
                    storage.realTonReserve,
                    storage.curveJettonBalance,
                    config.options.load().creatorFeeBps,
                );

                if (slippageParseFailed || tonOut < minTonOut) {
                    val refundBody: AskToTransfer = {
                        queryId: msg.queryId,
                        jettonAmount: msg.jettonAmount,
                        transferRecipient: initiator!,
                        sendExcessesTo: initiator!,
                        customPayload: null,
                        forwardTonAmount: CURVE_TRANSFER_NOTIFICATION,
                        forwardPayload: emptyForwardPayload(),
                    };
                    val refundValue = minimumWalletTransferValue(
                        CURVE_TRANSFER_NOTIFICATION,
                        in.originalForwardFee,
                    ) +
                        REFUND_VALUE_EPSILON;
                    val refundMsg = createMessage({
                        bounce: BounceMode.Only256BitsOfBody,
                        dest: ourWallet,
                        value: refundValue,
                        body: refundBody,
                    });
                    refundMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
                    return;
                }

                if (storage.realTonReserve >= tonOut + feeTon && tonOut > 0) {
                    storage.curveJettonBalance += acceptedJettons;
                    storage.realTonReserve -= (tonOut + feeTon);

                    var progress = storage.progress.load();
                    val creatorFee = (tonOut + feeTon) * config.options.load().creatorFeeBps /
                        10000;
                    val protocolFee = feeTon - creatorFee;
                    progress.creatorAccrued += creatorFee;
                    storage.progress = progress.toCell();
                    val reserveCapSell = MIGRATION_RESERVE_TARGET - storage.migrationReserve;
                    val sellMigrationCut = reserveCapSell > 0
                        ? min(
                            protocolFee * MIGRATION_RESERVE_RATIO_BPS / BPS_DENOMINATOR,
                            reserveCapSell,
                        )
                        : 0;
                    storage.migrationReserve += sellMigrationCut;
                    storage.feeAccrued += (protocolFee - sellMigrationCut);
                    storage.save();

                    val payoutMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        dest: initiator!,
                        value: tonOut,
                        body: ReturnExcessesBack { queryId: msg.queryId },
                    });
                    payoutMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);

                    val sellEventMsg = createExternalLogMessage({
                        dest: ExtOutLogBucket { topic: TOPIC_SELL },
                        body: SellEvent {
                            seller: initiator!,
                            jettonsIn: acceptedJettons,
                            tonOutNet: tonOut,
                            feeTon,
                            realTonReserve: storage.realTonReserve,
                            curveJettonBalance: storage.curveJettonBalance,
                            tonOutGross: tonOut + feeTon,
                        },
                    });
                    sellEventMsg.send(SEND_MODE_REGULAR);
                }
            }

            if (excessJettons > 0) {
                val refundBody: AskToTransfer = {
                    queryId: msg.queryId,
                    jettonAmount: excessJettons,
                    transferRecipient: initiator!,
                    sendExcessesTo: initiator!,
                    customPayload: null,
                    forwardTonAmount: CURVE_TRANSFER_NOTIFICATION,
                    forwardPayload: emptyForwardPayload(),
                };
                val refundValue = minimumWalletTransferValue(
                    CURVE_TRANSFER_NOTIFICATION,
                    in.originalForwardFee,
                ) +
                    REFUND_VALUE_EPSILON;
                val refundMsg = createMessage({
                    bounce: BounceMode.Only256BitsOfBody,
                    dest: ourWallet,
                    value: refundValue,
                    body: refundBody,
                });
                refundMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
            }
        }

        FlushFees => {
            var storage = lazy BondingCurveStorage.load();
            val config = storage.config.load();
            assert (in.valueCoins >= ton("0.05")) throw Errors.NotEnoughGas;

            assert (
                storage.state != CURVE_STATE_INITIALIZING && storage.state != CURVE_STATE_CANCELLED
            ) throw Errors.InvalidOp;
            val tracked = storage.realTonReserve + storage.feeAccrued + storage.migrationReserve +
                storage.progress.load().creatorAccrued;
            val ownBalance = contract.getOriginalBalance();
            val preInbound = ownBalance > in.valueCoins ? ownBalance - in.valueCoins : 0 as coins;
            val floor = tracked + CURVE_STORAGE_RESERVE;
            if (preInbound > floor) {
                storage.feeAccrued += (preInbound - floor);
            }

            val hasFeesToFlush = storage.feeAccrued > 0;
            val hasDropPending = storage.dropAdminPending && storage.jettonMinter != null;
            assert (hasFeesToFlush || hasDropPending) throw Errors.BalanceError;

            if (hasFeesToFlush) {
                val amount = storage.feeAccrued;
                storage.feeAccrued = 0;
                storage.save();

                val depositBody: DepositProtocolFees = {
                    queryId: msg.queryId,
                    creator: config.creator,
                    salt: config.salt,
                    options: config.options,
                    amount,
                };
                val flushMsg = createMessage({
                    bounce: BounceMode.Only256BitsOfBody,
                    dest: config.master,
                    value: amount,
                    body: depositBody,
                });
                flushMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
            }

            if (hasDropPending) {
                val retryDrop: DropMinterAdmin = { queryId: msg.queryId };
                val retryMsg = createMessage({
                    bounce: BounceMode.Only256BitsOfBody,
                    dest: storage.jettonMinter!,
                    value: ton("0.05"),
                    body: retryDrop,
                });
                retryMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
            }
        }

        Graduate => {
            var storage = lazy BondingCurveStorage.load();
            val config = storage.config.load();

            assert (
                storage.state == CURVE_STATE_TRADING || storage.state == CURVE_STATE_FROZEN
            ) throw Errors.InvalidOp;
            assert (
                shouldGraduate(storage.realTonReserve, config.graduationThreshold)
            ) throw Errors.InvalidOp;
            assert (
                storage.migrationReserve >= DEDUST_GRADUATE_GAS_BUDGET
            ) throw Errors.NotEnoughGas;

            assert (storage.curveJettonBalance > 0) throw Errors.BalanceError;
            assert (storage.jettonMinter != null) throw Errors.InvalidOp;

            assert (storage.realTonReserve > MIGRATION_FEE) throw Errors.BalanceError;

            val jettonMinter = storage.jettonMinter!;
            val poolAuto = calcDeployedCpmmV2Pool(
                jettonMinter,
                curveCollector(storage).calculateAddress(),
                config.options.load().creatorFeeBps,
            );

            storage.state = CURVE_STATE_GRADUATING;
            storage.save();

            val initBody: DedustInit = { queryId: msg.queryId, customPayload: null };
            val initMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: poolAuto,
                value: ton("0.3"),
                body: initBody,
            });
            initMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        RetryMigration => {
            var storage = BondingCurveStorage.load();
            assert (
                storage.state == CURVE_STATE_MIGRATION_RETRY && storage.migration != null
            ) throw Errors.InvalidOp;
            assert (in.valueCoins >= ton("0.5")) throw Errors.NotEnoughGas;
            var migration = storage.migration!.load();
            val retryNative = migration.nativeRetry;
            val retryJettons = migration.jettonRetry;
            assert (retryNative || retryJettons) throw Errors.InvalidOp;
            if (retryNative) {
                migration.nativeQueryId += 1;
                migration.nativeRetry = false;
                storage.realTonReserve -= migration.tonAmount;
            }
            if (retryJettons) {
                migration.jettonQueryId += 1;
                migration.jettonRetry = false;
                storage.curveJettonBalance -= migration.jettonAmount;
            }
            storage.migration = migration.toCell();
            storage.state = CURVE_STATE_AWAITING_LIQUIDITY;
            storage.save();
            if (retryNative) {
                sendMigrationNative(storage);
            }
            if (retryJettons) {
                sendMigrationJettons(storage);
            }
        }

        PrepareBuyback => {
            val s = BondingCurveStorage.load();
            assert (
                s.config.load().options.load().buybackBurn && s.jettonMinter != null &&
                s.state != CURVE_STATE_INITIALIZING &&
                s.state != CURVE_STATE_CANCELLED
            ) throw Errors.InvalidOp;
            assert (in.valueCoins >= ton("0.15")) throw Errors.NotEnoughGas;
            createMessage({ bounce: true, dest: buybackAddress(
                    contract.getAddress(),
                ), value: ton("0.1"), body: InitBuyback {
                    queryId: msg.queryId,
                    config: BuybackConfig {
                        minter: s.jettonMinter!,
                        collector: curveCollector(s).calculateAddress(),
                        splitter: curveFeeManager(s).calculateAddress(),
                        creatorFeeBps: s.config.load().options.load().creatorFeeBps,
                    }.toCell(),
                    active: s.state == CURVE_STATE_MIGRATED,
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        ConfirmMigration => {
            val storage = BondingCurveStorage.load();
            assert (storage.state == CURVE_STATE_AWAITING_LIQUIDITY) throw Errors.InvalidOp;
            assert (in.valueCoins >= ton("0.1")) throw Errors.NotEnoughGas;
            val position = calcMigrationPosition(migrationPool(storage), contract.getAddress());
            createMessage({ bounce: true, dest: position, value: ton("0.07"), body: ProvidePositionState {
                    queryId: msg.queryId,
                    includePoolAddress: false,
                    includeOwnerAddress: false,
                    includeFees: false,
                    includeRewards: false,
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
        DepositNotification => {
            var storage = BondingCurveStorage.load();
            if (storage.state != CURVE_STATE_AWAITING_LIQUIDITY) {
                return;
            }
            assert (
                in.senderAddress ==
                calcMigrationPosition(migrationPool(storage), contract.getAddress())
            ) throw Errors.NotValidWallet;
            confirmLockedMigration(mutate storage, msg.queryId, msg.liquidity, msg.lockedLiquidity);
        }
        TakePositionState => {
            var storage = BondingCurveStorage.load();
            if (storage.state != CURVE_STATE_AWAITING_LIQUIDITY) {
                return;
            }
            assert (
                in.senderAddress ==
                calcMigrationPosition(migrationPool(storage), contract.getAddress())
            ) throw Errors.NotValidWallet;
            confirmLockedMigration(mutate storage, msg.queryId, msg.liquidity, msg.lockedLiquidity);
        }

        TransferFailed => {
            var storage = BondingCurveStorage.load();
            if (storage.jettonMinter == null) {
                return;
            }
            val wallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                storage.jettonMinter!,
                jettonWalletV2CompiledCode(),
            );
            assert (in.senderAddress == wallet) throw Errors.NotValidWallet;
            restoreMigrationJettons(mutate storage, msg.queryId, msg.amount);
        }
        TransferDelivered => {}

        InitPoolResultMessage => {
            var storage = lazy BondingCurveStorage.load();
            val config = storage.config.load();

            if (storage.state != CURVE_STATE_GRADUATING) {
                return;
            }
            if (storage.jettonMinter == null) {
                return;
            }

            val jettonMinter = storage.jettonMinter!;
            val poolAuto = calcDeployedCpmmV2Pool(
                jettonMinter,
                curveCollector(storage).calculateAddress(),
                config.options.load().creatorFeeBps,
            );
            val poolAddr = poolAuto.calculateAddress();
            if (in.senderAddress != poolAddr) {
                return;
            }

            if (msg.exitCode != 0) {
                storage.state = CURVE_STATE_FROZEN;
                storage.save();
                return;
            }
            val poolSeedTon = storage.realTonReserve - MIGRATION_FEE;
            val xMarginal = storage.virtualTonReserve + poolSeedTon + MIGRATION_FEE;
            val poolSeedJettons = (poolSeedTon * storage.curveJettonBalance) / xMarginal;
            val strandedJettons = storage.curveJettonBalance - poolSeedJettons;

            assert (poolSeedJettons > 0) throw Errors.BalanceError;
            assert (poolSeedTon > 0) throw Errors.BalanceError;

            reserveToncoinsOnBalance(CURVE_STORAGE_RESERVE, RESERVE_MODE_EXACT_AMOUNT);

            val leftoverToCredit: coins = storage.migrationReserve > DEDUST_GRADUATE_GAS_BUDGET
                ? storage.migrationReserve - DEDUST_GRADUATE_GAS_BUDGET
                : 0 as coins;
            storage.feeAccrued += leftoverToCredit;
            storage.migrationReserve = 0;
            storage.state = CURVE_STATE_AWAITING_LIQUIDITY;
            storage.migration = MigrationProgress {
                nativeQueryId: 1,
                jettonQueryId: 1,
                tonAmount: poolSeedTon,
                jettonAmount: poolSeedJettons,
                nativeRetry: false,
                jettonRetry: false,
            }.toCell();
            storage.realTonReserve = MIGRATION_FEE;
            storage.curveJettonBalance = strandedJettons;
            storage.save();

            sendMigrationNative(storage);
            sendMigrationJettons(storage);
        }

        TopUpTons => {}

        else => throw 0xFFFF,
    }
}

fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();
    val parsed = lazy BounceableOutboundOps.fromSlice(in.bouncedBody);

    var storage = lazy BondingCurveStorage.load();

    match (parsed) {
        AskToTransfer => {
            // Standard buy/refund transfers share this truncated bounce.
            // Restore tokens only; it cannot identify a TON refund.
            storage.curveJettonBalance += parsed.jettonAmount;
            storage.save();
        }
        AskToTransferTracked => {
            if (storage.jettonMinter == null) {
                return;
            }
            val wallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                storage.jettonMinter!,
                jettonWalletV2CompiledCode(),
            );
            assert (in.senderAddress == wallet) throw Errors.NotValidWallet;
            restoreMigrationJettons(mutate storage, parsed.queryId, parsed.jettonAmount);
        }
        MintNewJettons => {
            if (
                storage.state == CURVE_STATE_INITIALIZING && storage.jettonMinter != null &&
                in.senderAddress == storage.jettonMinter!
            ) {
                cancelLaunch(mutate storage);
            }
        }
        MintCurveWallet => {
            if (
                storage.state == CURVE_STATE_INITIALIZING && storage.jettonMinter != null &&
                in.senderAddress == storage.jettonMinter!
            ) {
                cancelLaunch(mutate storage);
            }
        }
        DepositProtocolFees => {
            storage.feeAccrued += parsed.amount;
            storage.save();
        }
        CreditCurveFees => {
            assert (
                in.senderAddress == curveFeeManager(storage).calculateAddress()
            ) throw Errors.NotOwner;
            var progress = storage.progress.load();
            progress.creatorAccrued += parsed.amount;
            storage.progress = progress.toCell();
            storage.save();
        }
        DropMinterAdmin => {}
        ProvidePositionState => {}
        DedustInit => {
            if (storage.state == CURVE_STATE_GRADUATING) {
                storage.state = CURVE_STATE_FROZEN;
                storage.save();
            }
        }
        DedustPayNative => {
            if (storage.migration == null) {
                return;
            }
            assert (in.senderAddress == migrationPool(storage)) throw Errors.NotValidWallet;
            var migration = storage.migration!.load();
            if (
                !migration.nativeRetry && parsed.queryId == migration.nativeQueryId &&
                parsed.amount == migration.tonAmount
            ) {
                migration.nativeRetry = true;
                storage.realTonReserve += migration.tonAmount;
                storage.state = CURVE_STATE_MIGRATION_RETRY;
                storage.migration = migration.toCell();
                storage.save();
            }
        }
        else => {}
    }
}

get fun get_curve_data(): BondingCurveDataReply {
    val storage = lazy BondingCurveStorage.load();
    val config = storage.config.load();
    return {
        state: storage.state,
        creator: config.creator,
        salt: config.salt,
        jettonMinter: storage.jettonMinter,
        virtualTonReserve: storage.virtualTonReserve,
        realTonReserve: storage.realTonReserve,
        curveJettonBalance: storage.curveJettonBalance,
        curveSupply: config.curveSupply,
        dexReserveSupply: config.dexReserveSupply,
        graduationThreshold: config.graduationThreshold,
        feeAccrued: storage.feeAccrued,
        migrationReserve: storage.migrationReserve,
        dropAdminPending: storage.dropAdminPending,
        pendingBuyTonInNet: storage.pendingBuyTonInNet,
    };
}

get fun get_state(): uint8 {
    val storage = lazy BondingCurveStorage.load();
    return storage.state;
}

get fun get_launch_status(): LaunchStatus {
    return launchStatus(BondingCurveStorage.load().state);
}

get fun get_quote_buy(tonIn: coins): coins {
    val storage = lazy BondingCurveStorage.load();
    val (out, _fee) = computeBuyOut(
        tonIn,
        storage.virtualTonReserve,
        storage.realTonReserve,
        storage.curveJettonBalance,
        storage.config.load().options.load().creatorFeeBps,
    );
    return out;
}

get fun get_quote_sell(jettonIn: coins): coins {
    val storage = lazy BondingCurveStorage.load();
    val maxSafe = maxSafeSellJettons(
        storage.virtualTonReserve,
        storage.realTonReserve,
        storage.curveJettonBalance,
    );
    val safeIn = jettonIn <= maxSafe ? jettonIn : maxSafe;
    if (safeIn == 0) {
        return 0;
    }
    val (out, _fee) = computeSellOut(
        safeIn,
        storage.virtualTonReserve,
        storage.realTonReserve,
        storage.curveJettonBalance,
        storage.config.load().options.load().creatorFeeBps,
    );
    return out;
}

get fun get_max_safe_sell(): coins {
    val storage = lazy BondingCurveStorage.load();
    return maxSafeSellJettons(
        storage.virtualTonReserve,
        storage.realTonReserve,
        storage.curveJettonBalance,
    );
}

get fun get_version(): int {
    return 0x020000;
}

get fun get_progress_bps(): int {
    val storage = lazy BondingCurveStorage.load();
    val raw = storage.realTonReserve * 10000 / storage.config.load().graduationThreshold;
    return raw > 10000 ? 10000 : raw;
}

fun mintLaunchTokens(
    minter: address,
    recipient: address,
    amount: coins,
    id: uint64,
    notification: coins,
) {
    createMessage({ bounce: BounceMode.Only256BitsOfBody, dest: minter, value: ton("0.22"), body: MintNewJettons {
            queryId: id,
            mintRecipient: recipient,
            tonAmount: ton("0.2"),
            internalTransferMsg: InternalTransferStep {
                queryId: id,
                jettonAmount: amount,
                transferInitiator: contract.getAddress(),
                sendExcessesTo: contract.getAddress(),
                forwardTonAmount: notification,
                forwardPayload: emptyForwardPayload(),
            }.toCell(),
        } }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

fun finishLaunch(mutate storage: BondingCurveStorage) {
    val progress = storage.progress.load();
    if (progress.curveReceived && progress.devReceived) {
        storage.state = shouldGraduate(
            storage.realTonReserve,
            storage.config.load().graduationThreshold,
        )
            ? CURVE_STATE_FROZEN
            : CURVE_STATE_TRADING;
        createExternalLogMessage({
            dest: ExtOutLogBucket { topic: TOPIC_LAUNCH_INITIALIZED },
            body: LaunchInitializedEvent {
                status: launchStatus(storage.state),
                realTonReserve: storage.realTonReserve,
                curveJettonBalance: storage.curveJettonBalance,
            },
        }).send(SEND_MODE_REGULAR);
        val collector = curveCollector(storage);
        createMessage({ bounce: false, dest: collector, value: ton("0.15"), body: TopUpTons {} }).send(
            SEND_MODE_PAY_FEES_SEPARATELY,
        );
        val config = storage.config.load();
        createMessage({ bounce: false, dest: config.master, value: ton("0.01"), body: ConfirmLaunch {
                queryId: 0,
                creator: config.creator,
                salt: config.salt,
                options: config.options,
            } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        storage.dropAdminPending = true;
        createMessage({ bounce: true, dest: storage.jettonMinter!, value: ton("0.05"), body: DropMinterAdmin {
                queryId: 3,
            } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        if (storage.state == CURVE_STATE_FROZEN) {
            createMessage({ bounce: true, dest: contract.getAddress(), value: DEDUST_GRADUATE_GAS_BUDGET, body: Graduate {
                    queryId: 4,
                } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
        }
    }
    storage.save();
}

fun cancelLaunch(mutate storage: BondingCurveStorage) {
    storage.state = CURVE_STATE_CANCELLED;
    storage.realTonReserve = 0;
    storage.feeAccrued = 0;
    storage.migrationReserve = 0;
    var progress = storage.progress.load();
    progress.creatorAccrued = 0;
    storage.progress = progress.toCell();
    storage.save();
    val config = storage.config.load();
    createMessage({ bounce: false, dest: config.master, value: ton("0.03"), body: CancelLaunchFees {
            queryId: 0,
            creator: config.creator,
            salt: config.salt,
            options: config.options,
        } }).send(SEND_MODE_PAY_FEES_SEPARATELY);
    reserveToncoinsOnBalance(CURVE_STORAGE_RESERVE, RESERVE_MODE_AT_MOST);
    createMessage({
        bounce: false,
        dest: storage.config.load().creator,
        value: 0,
        body: ReturnExcessesBack { queryId: 0 },
    }).send(SEND_MODE_CARRY_ALL_BALANCE);
}

get fun get_launch_options(): LaunchOptions {
    return BondingCurveStorage.load().config.load().options.load();
}

get fun get_launch_progress(): LaunchProgress {
    return BondingCurveStorage.load().progress.load();
}

fun curveCollector(storage: BondingCurveStorage): AutoDeployAddress {
    val config = storage.config.load();
    return collectorAddress(
        storage.jettonMinter!,
        config.creator,
        storage.progress.load().protocolTreasury!,
        config.options.load().creatorFeeBps,
        contract.getAddress(),
        curveBeneficiaries(config.options.load()),
        config.options.load().buybackBurn,
    );
}

get fun get_collector_address(): address {
    return curveCollector(BondingCurveStorage.load()).calculateAddress();
}

fun curveFeeManager(storage: BondingCurveStorage): AutoDeployAddress {
    val config = storage.config.load();
    val options = config.options.load();
    val recipients = FeeRecipients {
        creator: config.creator,
        protocol: storage.progress.load().protocolTreasury!,
        creatorBps: options.creatorFeeBps,
        curve: contract.getAddress(),
        beneficiaries: curveBeneficiaries(options),
        buybackBurn: options.buybackBurn,
    }.toCell();
    return splitterAddress(
        curveCollector(storage).calculateAddress(),
        storage.jettonMinter!,
        recipients,
    );
}

fun flushCreatorFees(mutate storage: BondingCurveStorage, id: uint64) {
    var progress = storage.progress.load();
    val amount = progress.creatorAccrued;
    if (amount == 0) {
        return;
    }
    progress.creatorAccrued = 0;
    storage.progress = progress.toCell();
    storage.save();
    createMessage({
        bounce: true,
        dest: curveFeeManager(storage),
        value: amount + ton("0.03"),
        body: CreditCurveFees {
            queryId: id,
            amount,
        },
    }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

get fun get_fee_manager_address(): address {
    return curveFeeManager(BondingCurveStorage.load()).calculateAddress();
}

get fun get_launch_preview(): LaunchPreview {
    return previewLaunch(BondingCurveStorage.load().config.load().options.load());
}

get fun get_pool_address(): address {
    val s = BondingCurveStorage.load();
    return calcDeployedCpmmV2Pool(
        s.jettonMinter!,
        curveCollector(s).calculateAddress(),
        s.config.load().options.load().creatorFeeBps,
    ).calculateAddress();
}

get fun get_fee_rates(): FeeRatesReply {
    return effectiveFeeRates(BondingCurveStorage.load().config.load().options.load().creatorFeeBps);
}

fun migrationPool(storage: BondingCurveStorage): address {
    return calcDeployedCpmmV2Pool(
        storage.jettonMinter!,
        curveCollector(storage).calculateAddress(),
        storage.config.load().options.load().creatorFeeBps,
    ).calculateAddress();
}

fun sendMigrationNative(storage: BondingCurveStorage) {
    val m = storage.migration!.load();
    createMessage({ bounce: true, dest: migrationPool(storage), value: m.tonAmount +
            DEDUST_CPMM_V2_PAY_NATIVE_GAS, body: DedustPayNative {
            queryId: m.nativeQueryId,
            amount: m.tonAmount,
            paymentPayload: buildDepositPayload(m.tonAmount, m.jettonAmount),
            payoutConfig: buildMigrationPayoutConfig(storage.config.load().master),
        } }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

fun sendMigrationJettons(storage: BondingCurveStorage) {
    val m = storage.migration!.load();
    val payload = beginCell()
        .storeUint(DEDUST_CPMM_V2_OP_PAY_JETTON, 32)
        .storeRef(buildDepositPayload(m.tonAmount, m.jettonAmount))
        .storeRef(buildMigrationPayoutConfig(storage.config.load().master))
        .endCell();
    val wallet = calcAddressOfJettonWallet(
        contract.getAddress(),
        storage.jettonMinter!,
        jettonWalletV2CompiledCode(),
    );
    createMessage({ bounce: true, dest: wallet, value: DEDUST_CPMM_V2_JETTON_TRANSFER_VALUE, body: AskToTransferTracked {
            queryId: m.jettonQueryId,
            jettonAmount: m.jettonAmount,
            transferRecipient: migrationPool(storage),
            sendExcessesTo: storage.config.load().master,
            customPayload: null,
            forwardTonAmount: DEDUST_CPMM_V2_JETTON_FORWARD_TON,
            forwardPayload: beginCell().storeUint(1, 1).storeRef(payload).toSlice(),
        } }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

fun restoreMigrationJettons(mutate storage: BondingCurveStorage, id: uint64, amount: coins) {
    if (storage.migration == null) {
        return;
    }
    var m = storage.migration!.load();
    if (!m.jettonRetry && id == m.jettonQueryId && amount == m.jettonAmount) {
        m.jettonRetry = true;
        storage.curveJettonBalance += amount;
        storage.state = CURVE_STATE_MIGRATION_RETRY;
        storage.migration = m.toCell();
        storage.save();
    }
}

get fun get_migration_data(): MigrationProgress? {
    val s = BondingCurveStorage.load();
    return s.migration != null ? s.migration!.load() : null;
}

fun confirmLockedMigration(
    mutate storage: BondingCurveStorage,
    id: uint64,
    liquidity: coins,
    locked: coins,
) {
    if (storage.migration == null) {
        return;
    }
    val migration = storage.migration!.load();
    if (
        migration.nativeRetry || migration.jettonRetry || liquidity <= 0 || locked != liquidity ||
        locked <
        migrationMinimumLiquidity(migration.tonAmount, migration.jettonAmount)
    ) {
        return;
    }
    val config = storage.config.load();
    storage.state = CURVE_STATE_MIGRATED;
    storage.realTonReserve -= MIGRATION_FEE;
    storage.save();
    createMessage({ bounce: true, dest: config.master, value: MIGRATION_FEE, body: DepositProtocolFees {
            queryId: id,
            amount: MIGRATION_FEE,
            creator: config.creator,
            salt: config.salt,
            options: config.options,
        } }).send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
    createExternalLogMessage({ dest: ExtOutLogBucket {
            topic: TOPIC_GRADUATE,
        }, body: GraduateEvent {
            poolAddress: migrationPool(storage),
            poolSeedTon: migration.tonAmount,
            poolSeedJettons: migration.jettonAmount,
            migrationFee: MIGRATION_FEE,
            strandedJettons: storage.curveJettonBalance,
        } }).send(SEND_MODE_REGULAR);
}

fun curveBeneficiaries(options: LaunchOptions): Cell<FeeBeneficiaries>? {
    if (!options.buybackBurn) {
        return options.beneficiaries;
    }
    var shares: map<address, uint16> = [];
    shares.set(buybackAddress(contract.getAddress()).calculateAddress(), 10000);
    return FeeBeneficiaries { shares }.toCell();
}

get fun get_buyback_address(): address? {
    return BondingCurveStorage.load().config.load().options.load().buybackBurn
        ? buybackAddress(contract.getAddress()).calculateAddress()
        : null;
}
