import "@gen/FeeCollectorV2.code"
import "fee-storage"

fun collectorAddress(
    minter: address,
    creator: address,
    protocol: address,
    creatorBps: uint16,
): AutoDeployAddress {
    val s = CollectorStorage {
        minter,
        recipients: FeeRecipients { creator, protocol, creatorBps }.toCell(),
        initialized: false,
        nextId: 1,
    };
    return { workchain: 0, stateInit: { code: feeCollectorV2CompiledCode(), data: s.toCell() } };
}
