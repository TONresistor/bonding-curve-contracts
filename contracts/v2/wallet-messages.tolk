import "../messages"

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
