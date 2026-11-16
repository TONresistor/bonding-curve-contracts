import "../v1/messages"

struct (0xa0a0b087) ResolveLaunchMint {
    queryId: uint64
    leg: uint3
}

struct (0xa0a0b088) InspectLaunchMint {
    queryId: uint64
    leg: uint3
    curve: address
}

struct (0xa0a0b089) LaunchMintInspection {
    queryId: uint64
    leg: uint3
    delivered: bool
    amount: coins
}

struct (0xa0a0b08a) LaunchMintResolved {
    queryId: uint64
    leg: uint3
    delivered: bool
    failed: bool
    amount: coins
}

fun replyLaunchMintResolved(
    to: address,
    queryId: uint64,
    leg: uint3,
    delivered: bool,
    failed: bool,
    amount: coins,
    received: coins,
) {
    reserveToncoinsOnBalance(
        max(contract.getOriginalBalance() - received, 0),
        RESERVE_MODE_EXACT_AMOUNT | RESERVE_MODE_BOUNCE_ON_ACTION_FAIL,
    );
    createMessage({ bounce: false, dest: to, value: 0, body: LaunchMintResolved {
            queryId,
            leg,
            delivered,
            failed,
            amount,
        } }).send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

struct (0xa0a0b085) ProbeLaunchSettlement {
    queryId: uint64
    leg: uint3
}

struct (0xa0a0b086) LaunchSettlementState {
    queryId: uint64
    leg: uint3
    completed: bool
    amount: coins
}

fun replyLaunchSettlement(
    to: address,
    queryId: uint64,
    leg: uint3,
    completed: bool,
    amount: coins,
    received: coins,
    reserve: coins,
) {
    reserveToncoinsOnBalance(
        max(max(contract.getOriginalBalance() - received, 0), reserve),
        RESERVE_MODE_EXACT_AMOUNT | RESERVE_MODE_BOUNCE_ON_ACTION_FAIL,
    );
    createMessage({ bounce: false, dest: to, value: 0, body: LaunchSettlementState {
            queryId,
            leg,
            completed,
            amount,
        } }).send(SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
}

struct (0xa0a0b080) MintLaunchTokens {
    queryId: uint64
    jettonAmount: coins
    mintRecipient: address
}

struct (0xa0a0b081) InternalLaunchMint {
    queryId: uint64
    jettonAmount: coins
    curve: address
    protect: bool
}

struct (0xa0a0b066) MigrationDepositRefundContext {
    depositGeneration: uint64
}

struct (0xa0a0b067) MigrationJettonRefund {
    queryId: uint64
    depositGeneration: uint64
    amount: coins
    closingDeposit: bool = true
}

struct (0xe8db4696) MigrationPayoutPayload {
    exitCode: int32
    payload: cell?
}

fun migrationRefundGeneration(payload: cell?): uint64? {
    if (payload == null) {
        return null;
    }
    try {
        val context = MigrationDepositRefundContext.fromCell(payload!);
        return context.depositGeneration > 0 ? context.depositGeneration : null;
    } catch (_) {
        return null;
    }
}

// Recognized late or contextual payouts must never fall back to a query-only match.
fun migrationPayoutContext(encoded: slice): (bool, bool, uint64?) {
    try {
        var payload = encoded;
        val ref = payload.loadMaybeRef();
        if (ref != null) {
            payload.assertEnd();
            payload = ref!.beginParse();
        }
        if (payload.remainingBitsCount() == 0 && payload.remainingRefsCount() == 0) {
            return (false, false, null);
        }
        if (payload.preloadUint(32) != 0xe8db4696) {
            return (true, false, null);
        }
        val wrapped = MigrationPayoutPayload.fromSlice(payload);
        val late = wrapped.exitCode == 0;
        return (late || wrapped.payload != null, late, migrationRefundGeneration(wrapped.payload));
    } catch (_) {
        return (true, false, null);
    }
}

struct (0xa0a0b055) MintCurveWallet {
    queryId: uint64
    jettonAmount: coins
    tonAmount: coins
}

struct (0xa0a0b056) InternalCurveMint {
    queryId: uint64
    jettonAmount: coins
}

// Mint receipts require a transfer from the minter. Tracked receipts go to the
// authenticated initiator, not the excesses destination.
struct (0xa0a0b050) MintDelivered {
    queryId: uint64
    amount: coins
}

struct (0xa0a0b051) TransferDelivered {
    queryId: uint64
    amount: coins
}

struct (0xa0a0b052) TransferFailed {
    queryId: uint64
    amount: coins
}

struct (0xa0a0b053) AskToTransferTracked {
    queryId: uint64
    jettonAmount: coins
    transferRecipient: address
    sendExcessesTo: address?
    customPayload: cell?
    forwardTonAmount: coins
    forwardPayload: ForwardPayloadRemainder
}

struct (0xa0a0b054) InternalTransferTracked {
    queryId: uint64
    jettonAmount: coins
    transferInitiator: address?
    sendExcessesTo: address?
    forwardTonAmount: coins
    forwardPayload: ForwardPayloadRemainder
}

struct (0xa0a0b057) AskToBurnTracked {
    queryId: uint64
    jettonAmount: coins
}

struct (0xa0a0b058) BurnNotificationTracked {
    queryId: uint64
    jettonAmount: coins
    burnInitiator: address
}

struct (0xa0a0b059) BurnDelivered {
    queryId: uint64
    amount: coins
}

struct (0xa0a0b05a) BurnFailed {
    queryId: uint64
    amount: coins
}

struct (0xa0a0b05b) MinterAdminDropped {
    queryId: uint64
}
