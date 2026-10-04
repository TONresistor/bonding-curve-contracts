import "../v1/messages"

const MIN_CURVE_SELL_NOTIFICATION: coins = ton("0.2")

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
