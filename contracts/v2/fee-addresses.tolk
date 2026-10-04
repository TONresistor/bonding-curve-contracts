import "@gen/FeeSplitterV2.code"
import "fee-storage"

fun splitterAddress(
    collector: address,
    minter: address,
    recipients: Cell<FeeRecipients>,
): AutoDeployAddress {
    val s = SplitterStorage {
        config: SplitterConfig { collector, minter, recipients }.toCell(),
        creatorTon: 0,
        protocolTon: 0,
        creatorTokens: 0,
        protocolTokens: 0,
        nextId: 1,
        pending: [],
    };
    return { workchain: 0, stateInit: { code: feeSplitterV2CompiledCode(), data: s.toCell() } };
}
