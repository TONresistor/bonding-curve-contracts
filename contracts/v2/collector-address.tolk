import "@gen/FeeCollectorV2.code"
import "fee-storage"

fun collectorAddress(
    minter: address,
    creator: address,
    protocol: address,
    creatorBps: uint16,
    curve: address? = null,
    beneficiaries: Cell<FeeBeneficiaries>? = null,
): AutoDeployAddress {
    val s = CollectorStorage {
        minter,
        recipients: FeeRecipients { creator, protocol, creatorBps, curve, beneficiaries }.toCell(),
        initialized: false,
        nextId: 1,
    };
    return { workchain: 0, stateInit: { code: feeCollectorV2CompiledCode(), data: s.toCell() } };
}
