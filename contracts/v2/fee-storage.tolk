struct FeeRecipients {
    creator: address
    protocol: address
    creatorBps: uint16
}

struct CollectorStorage {
    minter: address
    recipients: Cell<FeeRecipients>
    initialized: bool
    nextId: uint64
}

struct SplitterConfig {
    collector: address
    minter: address
    recipients: Cell<FeeRecipients>
}

struct TokenPayout {
    protocol: bool
    amount: coins
    recipient: address
}

struct SplitterStorage {
    config: Cell<SplitterConfig>
    creatorTon: coins
    protocolTon: coins
    creatorTokens: coins
    protocolTokens: coins
    nextId: uint64
    pending: map<uint64, TokenPayout>
}

struct (0xa0a0b040) CollectPoolFees {
    queryId: uint64
}

struct (0xa0a0b041) SweepCollectedTokens {
    queryId: uint64
    amount: coins
}

struct (0xa0a0b042) CreditNativeFees {
    queryId: uint64
    amount: coins
}

struct (0xa0a0b043) ClaimSplitFees {
    queryId: uint64
    protocol: bool
}

struct (0x3216ca09) DedustNativePayout {
    queryId: uint64
    rest: RemainingBitsAndRefs
}
