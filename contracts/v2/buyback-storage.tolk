struct BuybackConfig {
    minter: address
    collector: address
    splitter: address
    creatorFeeBps: uint16
}

struct BuybackPendingSwap {
    id: uint64
    amount: coins
    minimumTokens: coins
}

struct BuybackIdentity {
    curve: address
}

struct BuybackStorage {
    identity: Cell<BuybackIdentity>
    config: Cell<BuybackConfig>? = null
    active: bool = false
    availableTon: coins = 0
    availableTokens: coins = 0
    nextId: uint64 = 1
    quoteId: uint64 = 0
    quoteDeadline: uint40 = 0
    swap: Cell<BuybackPendingSwap>? = null
    burnId: uint64 = 0
    burnAmount: coins = 0
    burned: coins = 0
}

fun BuybackStorage.load(): BuybackStorage {
    return BuybackStorage.fromCell(contract.getData());
}

fun BuybackStorage.save(self) {
    contract.setData(self.toCell());
}
