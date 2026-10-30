struct WalletStorageV2 {
    jettonBalance: coins
    ownerAddress: address
    minterAddress: address
    // Empty in the standard StateInit; set by the authenticated curve mint.
    protection: RemainingBitsAndRefs
}

struct CurveWalletRefund {
    pool: address?
    queryId: uint64
    amount: coins
}

fun WalletStorageV2.refund(self): CurveWalletRefund {
    return self.protection.remainingRefsCount() == 0
        ? CurveWalletRefund {
            pool: null,
            queryId: 0,
            amount: 0,
        }
        : CurveWalletRefund.fromCell(self.protection.preloadRef());
}

fun WalletStorageV2.setRefund(mutate self, refund: CurveWalletRefund) {
    self.protection = beginCell().storeBool(true).storeRef(refund.toCell()).toSlice();
}

fun WalletStorageV2.load(): WalletStorageV2 {
    return WalletStorageV2.fromCell(contract.getData());
}

fun WalletStorageV2.save(self) {
    contract.setData(self.toCell());
}

fun WalletStorageV2.isCurveWallet(self): bool {
    return !self.protection.isEmpty() && self.protection.preloadUint(1) != 0;
}
