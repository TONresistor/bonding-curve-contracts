import "@gen/BuybackBurnV2.code"
import "buyback-storage"

fun buybackAddress(curve: address): AutoDeployAddress {
    return {
        workchain: 0,
        stateInit: {
            code: buybackBurnV2CompiledCode(),
            data: BuybackStorage { identity: BuybackIdentity { curve }.toCell() }.toCell(),
        },
    };
}
