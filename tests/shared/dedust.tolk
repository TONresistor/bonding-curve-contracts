// Getter layouts: https://hub-beta.dedust.io/docs/cpmm-v2/reference/pool
// Getter stack layout from DeDust CPMM v2's official Pool reference.
struct SimulationPoolData {
    status: int
    depositActive: bool
    swapActive: bool
    assetX: slice
    assetY: slice
    walletsByAssets: cell?
    assetsByWallets: cell?
    walletsResolutions: cell?
    baseFeeBPS: int
    reserveX: coins
    reserveY: coins
    liquidity: coins
    protocolFeeX: coins
    protocolFeeY: coins
    creatorFeeX: coins
    creatorFeeY: coins
    xLPFeePerToken: int
    yLPFeePerToken: int
    rewards: cell?
}

struct SimulationPositionData {
    poolAddress: address
    ownerAddress: address
    liquidity: coins
    lockedLiquidity: coins
    rewards: cell?
    xPending: coins
    yPending: coins
    xFeePerTokenCheckpoint: int
    yFeePerTokenCheckpoint: int
}
