enum LaunchMintPhase: uint2 {
    Issued = 0
    Delivered = 1
    Failed = 2
}

struct LaunchMintAttempt {
    queryId: uint64
    amount: coins
    recipient: address
    phase: LaunchMintPhase
}

struct LaunchMintJournal {
    curve: address
    attempts: map<uint64, Cell<LaunchMintAttempt>> = []
}

struct MinterStorageV2 {
    totalSupply: coins
    adminAddress: address?
    nextAdminAddress: address?
    metadata: cell
    launchJournal: Cell<LaunchMintJournal>? = null
}

fun MinterStorageV2.load(): MinterStorageV2 {
    return MinterStorageV2.fromCell(contract.getData());
}

fun MinterStorageV2.save(self) {
    contract.setData(self.toCell());
}
