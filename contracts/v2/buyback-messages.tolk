import "buyback-storage"

const BUYBACK_MIN_TON: coins = ton("0.01")
const BUYBACK_SLIPPAGE_BPS = 300
const BUYBACK_QUOTE_TTL = 60
const BUYBACK_TRIGGER_GAS: coins = ton("0.8")
const BUYBACK_BURN_GAS: coins = ton("0.15")

struct (0xa0a0b060) InitBuyback {
    queryId: uint64
    config: Cell<BuybackConfig>
    active: bool
}

struct (0xa0a0b061) ExecuteBuyback {
    queryId: uint64
}

struct (0xa0a0b062) ClaimBuybackFees {
    queryId: uint64
}

struct (0xa0a0b063) BurnAvailable {
    queryId: uint64
}

struct (0xa0a0b064) BuybackRefund {
    queryId: uint64
}

// DeDust CPMM v2 Pool reference; optional state sections are not requested.
struct (0x00d8d379) BuybackProvidePoolState {
    queryId: uint64
    includeConfig: bool = false
    includeFees: bool = false
    includeCodeHash: bool = false
    includeRewards: bool = false
}

struct (0b00) BuybackPoolUninitialized {}

struct (0b01) BuybackPoolInitializing {
    initiatorAddress: address
}

struct (0b10) BuybackPoolInitialized {}

type BuybackPoolStatus = BuybackPoolUninitialized | BuybackPoolInitializing | BuybackPoolInitialized

struct (0x870a9579) BuybackTakePoolState {
    queryId: uint64
    status: BuybackPoolStatus
    depositActive: bool
    swapActive: bool
    liquidity: coins
    reserveX: coins
    reserveY: coins
    rest: RemainingBitsAndRefs
}

struct (0xc442500f) BuybackSwap {
    minimalAmountOut: coins
    deadline: uint40
    next: cell? = null
    partnerAbsent: bool = false
    referrerAbsent: bool = false
}

struct BuybackPayoutOptions {
    destination: address
    extraGas: coins
    payload: cell?
    wrapPayload: bool = false
}

// Only constructed with extraGas <= 0.2 TON: both options fit in one cell.
@overflow1023_policy("suppress")
struct BuybackPayoutConfig {
    fulfill: BuybackPayoutOptions
    reject: BuybackPayoutOptions
    excessesTo: address
}

struct (0xa5a7cbf8) BuybackPayNative {
    queryId: uint64
    amount: coins
    paymentPayload: Cell<BuybackSwap>
    payoutConfig: Cell<BuybackPayoutConfig>
}

struct (0xa0a0b065) PrepareBuyback {
    queryId: uint64
}
