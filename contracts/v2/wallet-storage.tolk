import "wallet-messages"

struct LaunchMintReceipt {
    queryId: uint64
    amount: coins
    curve: address
}

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
    depositGeneration: uint64 = 0
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
    val receipt = self.launchReceipt();
    var extra = beginCell().storeBool(true).storeRef(refund.toCell());
    if (receipt != null) {
        extra.storeRef(receipt!);
    }
    self.protection = extra.toSlice();
}

fun WalletStorageV2.launchReceipt(self): Cell<LaunchMintReceipt>? {
    if (self.protection.remainingRefsCount() < 2) {
        return null;
    }
    var extra = self.protection;
    extra.loadRef();
    return extra.loadRef() as Cell<LaunchMintReceipt>;
}

fun WalletStorageV2.setLaunchReceipt(mutate self, receipt: LaunchMintReceipt) {
    self.protection = beginCell()
        .storeBool(self.isCurveWallet())
        .storeRef(self.refund().toCell())
        .storeRef(receipt.toCell())
        .toSlice();
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
