struct WalletStorageV2 {
    jettonBalance: coins
    ownerAddress: address
    minterAddress: address
    // Empty in the standard StateInit; set by the authenticated curve mint.
    protection: RemainingBitsAndRefs
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
