import "@stdlib/exotic-cells"
import "bonding-messages"

const DEDUST_POOL_V2_LIBRARY_HASH: uint256 = 0x6045e67b617e73486aac445cfcad0dbead6d315ccc8f4aede3f2e23ad14da4b0

const DEDUST_CPMM_V2_OP_INIT: uint32 = 0xde8402ce

const DEDUST_CPMM_V2_OP_PAY_NATIVE: uint32 = 0xa5a7cbf8

const DEDUST_CPMM_V2_OP_PAY_JETTON: uint32 = 0xcbc33949

const DEDUST_CPMM_V2_OP_DEPOSIT_PAYLOAD: uint32 = 0xc9a015da

const DEDUST_ASSET_NATIVE: uint4 = 0b0000
const DEDUST_ASSET_JETTON: uint4 = 0b0001

const DEDUST_POOL_BASE_FEE_BPS: uint16 = 100

const DEDUST_POOL_CREATOR_FEE_BPS: uint16 = 100

const DEDUST_LOCKED_LP_SHARE_BPS: uint16 = 10000

const DEDUST_CPMM_V2_PAY_NATIVE_GAS: coins = ton("0.15")

const DEDUST_CPMM_V2_JETTON_TRANSFER_VALUE: coins = ton("0.25")

const DEDUST_CPMM_V2_JETTON_FORWARD_TON: coins = ton("0.2")

const DEDUST_GRADUATE_GAS_BUDGET: coins = ton("0.8")

fun buildNativeAsset(): slice {
    return beginCell().storeUint(DEDUST_ASSET_NATIVE, 4).toSlice();
}

fun buildJettonAsset(minterAddr: address): slice {
    val (wc, hash) = minterAddr.getWorkchainAndHash();
    return beginCell()
        .storeUint(DEDUST_ASSET_JETTON, 4)
        .storeInt(wc, 8)
        .storeUint(hash, 256)
        .toSlice();
}

fun buildEmptyExtendedPayoutConfig(excessesTo: address): cell {
    return beginCell()
        .storeUint(0, 2)
        .storeCoins(0)
        .storeMaybeRef(null)
        .storeBool(false)
        .storeUint(0, 2)
        .storeCoins(0)
        .storeMaybeRef(null)
        .storeBool(false)
        .storeAddress(excessesTo)
        .endCell();
}

fun buildDepositPayload(amountX: coins, amountY: coins): Cell<DedustDepositPayload> {
    val p: DedustDepositPayload = {
        amountX,
        amountY,
        minimalLiquidity: 0,
        lockedLiquidityShare: DEDUST_LOCKED_LP_SHARE_BPS,
    };
    return p.toCell();
}

const DEFAULT_POOL_CONTROLLER: address = address("UQAzZk-YE-C_2TaxMzNi71upLfwLYBWRpWCK6M1vhbAOtJ5S")

const DEDUST_FEE_IN_BOTH: uint2 = 0b00

fun buildCpmmV2PoolCode(): cell {
    return beginCell()
        .storeInt(ExoticCellType.LibraryReference, 8)
        .storeUint(DEDUST_POOL_V2_LIBRARY_HASH, 256)
        .endCellSpecial();
}

fun buildCpmmV2PoolConfig(jettonMinter: address, creator: address): cell {
    return beginCell()
        .storeUint(0, 2)
        .storeAddress(jettonMinter)
        .storeAddress(creator)
        .storeUint(DEDUST_POOL_BASE_FEE_BPS, 16)
        .storeUint(DEDUST_POOL_CREATOR_FEE_BPS, 16)
        .storeBool(false)
        .storeBool(false)
        .storeUint(DEDUST_FEE_IN_BOTH, 2)
        .storeBool(false)
        .storeBool(false)
        .endCell();
}

fun buildCpmmV2PoolFees(): cell {
    return beginCell()
        .storeCoins(0)
        .storeCoins(0)
        .storeCoins(0)
        .storeCoins(0)
        .storeUint(0, 5)
        .storeUint(0, 5)
        .endCell();
}

fun buildCpmmV2PoolExtra(): cell {
    return beginCell()
        .storeAddress(DEFAULT_POOL_CONTROLLER)
        .storeBool(false)
        .storeBool(false)
        .storeBool(false)
        .endCell();
}

fun buildCpmmV2PoolStorage(jettonMinter: address, creator: address): cell {
    return beginCell()
        .storeRef(buildCpmmV2PoolConfig(jettonMinter, creator))
        .storeRef(buildCpmmV2PoolFees())
        .storeRef(buildCpmmV2PoolExtra())
        .storeBool(false)
        .storeUint(0, 2)
        .storeBool(false)
        .storeBool(false)
        .storeCoins(0)
        .storeCoins(0)
        .storeCoins(0)
        .endCell();
}

fun calcDeployedCpmmV2Pool(jettonMinter: address, creator: address): AutoDeployAddress {
    return {
        workchain: 0,
        stateInit: {
            code: buildCpmmV2PoolCode(),
            data: buildCpmmV2PoolStorage(jettonMinter, creator),
        },
    };
}
