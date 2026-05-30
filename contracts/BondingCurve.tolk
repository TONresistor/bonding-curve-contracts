import "@gen/JettonWallet.code"
import "bonding-config"
import "bonding-dedust"
import "bonding-math"
import "bonding-messages"
import "bonding-storage"
import "errors"
import "fees-management"
import "jetton-utils"
import "messages"
import "sharding"

contract BondingCurve {
    author: "bonding-curve-contracts"
    version: "1.0.0"
    description: "Per-launch x*y=k bonding curve. Holds fixed Jetton inventory, swaps TON<->Jetton."
    storage: BondingCurveStorage
    incomingMessages: AllowedMessageToCurve
}

type AllowedMessageToCurve =
    | InitializeCurve
    | BuyJettons
    | FlushFees
    | Graduate
    | InitPoolResultMessage
    | TransferNotificationForRecipient
    | TopUpTons

type BounceableOutboundOps =
    | AskToTransfer
    | MintNewJettons
    | DepositProtocolFees
    | DedustPayNative
    | DropMinterAdmin
    | DedustInit

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
            assert (storage.state == CURVE_STATE_INITIALIZING) throw Errors.InvalidOp;
            assert (storage.jettonMinter == null) throw Errors.InvalidOp;

            storage.jettonMinter = msg.jettonMinter;
            storage.save();

            val notificationValue = ton("0.05");
            val mintTonAmount = ton("0.1");

            val internalTransfer: InternalTransferStep = {
                queryId: msg.queryId,
                jettonAmount: TOTAL_SUPPLY,
                transferInitiator: contract.getAddress(),
                sendExcessesTo: contract.getAddress(),
                forwardTonAmount: notificationValue,
                forwardPayload: emptyForwardPayload(),
            };

            val mintMsg: MintNewJettons = {
                queryId: msg.queryId,
                mintRecipient: contract.getAddress(),
                tonAmount: mintTonAmount,
                internalTransferMsg: internalTransfer.toCell(),
            };

            val outMintMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: msg.jettonMinter,
                value: mintTonAmount + ton("0.015"),
                body: mintMsg,
            });
            outMintMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
        }

        BuyJettons => {
            var storage = lazy BondingCurveStorage.load();

            assert (in.senderAddress.getWorkchain() == MY_WORKCHAIN) throw Errors.WrongWorkchain;
            val config = storage.config.load();
            assert (storage.state == CURVE_STATE_TRADING) throw Errors.InvalidOp;

            assert (in.valueCoins >= CURVE_TRANSFER_VALUE + ton("0.01")) throw Errors.NotEnoughGas;

            val tonIn = in.valueCoins - CURVE_TRANSFER_VALUE;
            val (jettonsOut, feeTon) = computeBuyOut(
                tonIn,
                storage.virtualTonReserve,
                storage.realTonReserve,
                storage.curveJettonBalance,
            );

            assert (jettonsOut > 0) throw Errors.BalanceError;
            assert (jettonsOut >= msg.minJettonsOut) throw Errors.InvalidMessage;

            assert (
                storage.curveJettonBalance - jettonsOut >= config.dexReserveSupply
            ) throw Errors.BalanceError;

            val tonInNet = tonIn - feeTon;
            storage.realTonReserve += tonInNet;
            storage.curveJettonBalance -= jettonsOut;

            val reserveCap = MIGRATION_RESERVE_TARGET - storage.migrationReserve;
            val migrationCut = reserveCap > 0
                ? min(feeTon * MIGRATION_RESERVE_RATIO_BPS / BPS_DENOMINATOR, reserveCap)
                : 0;
            storage.migrationReserve += migrationCut;
            storage.feeAccrued += (feeTon - migrationCut);

            val crossedThreshold = storage.realTonReserve >= GRADUATION_THRESHOLD_TON;
            if (crossedThreshold) {
                storage.state = CURVE_STATE_FROZEN;
            }
            storage.save();

            val ourWallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                storage.jettonMinter!,
                jettonWalletCompiledCode(),
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
            outBuyMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val buyEventMsg = createExternalLogMessage({
                dest: ExtOutLogBucket { topic: TOPIC_BUY },
                body: BuyEvent {
                    buyer: in.senderAddress,
                    tonInNet,
                    jettonsOut,
                    feeAccrued: feeTon,
                    realTonReserve: storage.realTonReserve,
                    curveJettonBalance: storage.curveJettonBalance,
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
            val _config = storage.config.load();

            if (storage.jettonMinter == null) {
                return;
            }
            val ourWallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                storage.jettonMinter!,
                jettonWalletCompiledCode(),
            );
            if (in.senderAddress != ourWallet) {
                return;
            }

            val initiator = msg.transferInitiator;

            if (storage.state == CURVE_STATE_INITIALIZING) {
                if (initiator == null || initiator! != contract.getAddress()) {
                    return;
                }

                if (msg.jettonAmount != TOTAL_SUPPLY) {
                    storage.jettonMinter = null;
                    storage.save();
                    return;
                }

                storage.state = CURVE_STATE_TRADING;

                storage.curveJettonBalance = TOTAL_SUPPLY;

                storage.dropAdminPending = true;
                storage.save();

                val dropMsg: DropMinterAdmin = { queryId: msg.queryId };
                val outDropMsg = createMessage({
                    bounce: BounceMode.Only256BitsOfBody,
                    dest: storage.jettonMinter!,

                    value: ton("0.05"),
                    body: dropMsg,
                });
                outDropMsg.send(SEND_MODE_PAY_FEES_SEPARATELY);
                return;
            }

            if (storage.state != CURVE_STATE_TRADING) {
                if (initiator != null && msg.jettonAmount > 0) {
                    val ourWalletFrozen = calcAddressOfJettonWallet(
                        contract.getAddress(),
                        storage.jettonMinter!,
                        jettonWalletCompiledCode(),
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

                    val refundValue = calcMinimalTransferAmount(
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
                if (inner.remainingBitsCount() >= 32) {
                    val opcode = inner.loadUint(32);
                    if (opcode == 0xa0a0a020) {
                        if (inner.remainingBitsCount() >= 64) {
                            inner.loadUint(64);
                            minTonOut = inner.loadCoins();
                        } else {
                            slippageParseFailed = true;
                        }
                    }
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
                );

                if (tonOut < minTonOut) {
                    val refundBody: AskToTransfer = {
                        queryId: msg.queryId,
                        jettonAmount: msg.jettonAmount,
                        transferRecipient: initiator!,
                        sendExcessesTo: initiator!,
                        customPayload: null,
                        forwardTonAmount: CURVE_TRANSFER_NOTIFICATION,
                        forwardPayload: emptyForwardPayload(),
                    };
                    val refundValue = calcMinimalTransferAmount(
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

                    val reserveCapSell = MIGRATION_RESERVE_TARGET - storage.migrationReserve;
                    val sellMigrationCut = reserveCapSell > 0
                        ? min(
                            feeTon * MIGRATION_RESERVE_RATIO_BPS / BPS_DENOMINATOR,
                            reserveCapSell,
                        )
                        : 0;
                    storage.migrationReserve += sellMigrationCut;
                    storage.feeAccrued += (feeTon - sellMigrationCut);
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
                            tonOut,
                            feeAccrued: feeTon,
                            realTonReserve: storage.realTonReserve,
                            curveJettonBalance: storage.curveJettonBalance,
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
                val refundValue = calcMinimalTransferAmount(
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

            val tracked = storage.realTonReserve + storage.feeAccrued + storage.migrationReserve;
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
            assert (shouldGraduate(storage.realTonReserve)) throw Errors.InvalidOp;
            assert (
                storage.migrationReserve >= DEDUST_GRADUATE_GAS_BUDGET
            ) throw Errors.NotEnoughGas;

            assert (
                storage.curveJettonBalance >= config.dexReserveSupply
            ) throw Errors.BalanceError;
            assert (storage.jettonMinter != null) throw Errors.InvalidOp;

            assert (storage.realTonReserve > MIGRATION_FEE) throw Errors.BalanceError;

            val jettonMinter = storage.jettonMinter!;
            val poolAuto = calcDeployedCpmmV2Pool(jettonMinter, config.creator);

            storage.realTonReserve -= MIGRATION_FEE;
            storage.state = CURVE_STATE_GRADUATING;
            storage.save();

            val migrationFeeBody: DepositProtocolFees = {
                queryId: msg.queryId,
                creator: config.creator,
                salt: config.salt,
                amount: MIGRATION_FEE,
            };
            val migrationFeeMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: config.master,
                value: MIGRATION_FEE,
                body: migrationFeeBody,
            });
            migrationFeeMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val initBody: DedustInit = { queryId: msg.queryId, customPayload: null };
            val initMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: poolAuto,
                value: ton("0.3"),
                body: initBody,
            });
            initMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

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
            val poolAuto = calcDeployedCpmmV2Pool(jettonMinter, config.creator);
            val poolAddr = poolAuto.calculateAddress();
            if (in.senderAddress != poolAddr) {
                return;
            }

            if (msg.exitCode != 0) {
                return;
            }

            val poolSeedTon = storage.realTonReserve;
            val xMarginal = storage.virtualTonReserve + poolSeedTon + MIGRATION_FEE;
            val poolSeedJettons = (poolSeedTon * storage.curveJettonBalance) / xMarginal;
            val strandedJettons = storage.curveJettonBalance - poolSeedJettons;

            assert (poolSeedJettons > 0) throw Errors.BalanceError;
            assert (poolSeedTon > 0) throw Errors.BalanceError;

            reserveToncoinsOnBalance(CURVE_STORAGE_RESERVE, RESERVE_MODE_EXACT_AMOUNT);

            val depositPayload = buildDepositPayload(poolSeedTon, poolSeedJettons);
            val payoutConfig = buildEmptyExtendedPayoutConfig(config.master);

            val leftoverToCredit: coins = storage.migrationReserve > DEDUST_GRADUATE_GAS_BUDGET
                ? storage.migrationReserve - DEDUST_GRADUATE_GAS_BUDGET
                : 0 as coins;
            storage.feeAccrued += leftoverToCredit;
            storage.migrationReserve = 0;
            storage.state = CURVE_STATE_MIGRATED;
            storage.realTonReserve = 0;
            storage.curveJettonBalance = strandedJettons;
            storage.save();

            val payNativeBody: DedustPayNative = {
                queryId: msg.queryId,
                amount: poolSeedTon,
                paymentPayload: depositPayload,
                payoutConfig,
            };
            val payNativeMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: poolAddr,
                value: poolSeedTon + DEDUST_CPMM_V2_PAY_NATIVE_GAS,
                body: payNativeBody,
            });
            payNativeMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val payJettonInner = beginCell()
                .storeUint(DEDUST_CPMM_V2_OP_PAY_JETTON, 32)
                .storeRef(depositPayload)
                .storeRef(payoutConfig)
                .endCell();

            val payJettonSlice = beginCell().storeUint(1, 1).storeRef(payJettonInner).toSlice();

            val ourWallet = calcAddressOfJettonWallet(
                contract.getAddress(),
                jettonMinter,
                jettonWalletCompiledCode(),
            );

            val transferBody: AskToTransfer = {
                queryId: msg.queryId,
                jettonAmount: poolSeedJettons,
                transferRecipient: poolAddr,
                sendExcessesTo: config.master,
                customPayload: null,
                forwardTonAmount: DEDUST_CPMM_V2_JETTON_FORWARD_TON,
                forwardPayload: payJettonSlice,
            };
            val transferMsg = createMessage({
                bounce: BounceMode.Only256BitsOfBody,
                dest: ourWallet,
                value: DEDUST_CPMM_V2_JETTON_TRANSFER_VALUE,
                body: transferBody,
            });
            transferMsg.send(SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_BOUNCE_ON_ACTION_FAIL);

            val gradEventMsg = createExternalLogMessage({
                dest: ExtOutLogBucket { topic: TOPIC_GRADUATE },
                body: GraduateEvent {
                    poolAddress: poolAddr,
                    poolSeedTon,
                    poolSeedJettons,
                    migrationFee: MIGRATION_FEE,
                    strandedJettons,
                },
            });
            gradEventMsg.send(SEND_MODE_REGULAR);
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
            // A bounced jetton transfer means our jetton wallet did NOT move the
            // jettons, so they are still ours: restore the curve inventory. This is
            // the only safe, source-agnostic compensation. We deliberately do NOT try
            // to "roll back" the TON side of a bounced buy here: the bounce body is
            // truncated (Only256BitsOfBody) and every AskToTransfer (buy delivery,
            // sell/excess/frozen refunds, and the Phase-B pool seed) shares this op,
            // so there is no reliable way to tell which send bounced. Decrementing
            // realTonReserve on a refund/seed bounce would corrupt reserve accounting.
            // On the rare bounced-buy case the buyer's net TON simply stays as curve
            // backing (k grows): a donation to holders, never extractable by admin.
            storage.curveJettonBalance += parsed.jettonAmount;
            storage.save();
        }
        MintNewJettons => {
            storage.jettonMinter = null;
            storage.save();
        }
        DepositProtocolFees => {
            storage.feeAccrued += parsed.amount;
            storage.save();
        }
        DropMinterAdmin => {}
        DedustInit => {
            if (storage.state == CURVE_STATE_GRADUATING) {
                storage.state = CURVE_STATE_FROZEN;
                storage.realTonReserve += MIGRATION_FEE;
                storage.save();
            }
        }
        DedustPayNative => {
            storage.feeAccrued += parsed.amount;
            storage.save();
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

get fun get_quote_buy(tonIn: coins): coins {
    val storage = lazy BondingCurveStorage.load();
    val (out, _fee) = computeBuyOut(
        tonIn,
        storage.virtualTonReserve,
        storage.realTonReserve,
        storage.curveJettonBalance,
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
    return 0x010000;
}

get fun get_progress_bps(): int {
    val storage = lazy BondingCurveStorage.load();
    val raw = storage.realTonReserve * 10000 / GRADUATION_THRESHOLD_TON;
    return raw > 10000 ? 10000 : raw;
}
