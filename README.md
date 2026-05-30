<div align="center">

# bonding-curve-contracts

**Permissionless memecoin launchpad on TON with auto-graduation to DeDust CPMM v2.**

[![Version](https://img.shields.io/badge/version-v1.0.0-0098EA)](./CHANGELOG.md)
[![Tests](https://img.shields.io/badge/tests-119%2F119%20passing-brightgreen)](./tests)
[![Fork-mainnet](https://img.shields.io/badge/fork--mainnet-passing-brightgreen)](./tests)
[![DeDust](https://img.shields.io/badge/integration-DeDust%20CPMM%20v2-9C27B0)](https://hub-beta.dedust.io/docs/cpmm-v2/overview)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](./LICENSE)

</div>

---

Anyone creates a memecoin. Users buy and sell it on a `x*y=k` bonding curve. At the 2,000 TON threshold the curve auto-migrates to a DeDust CPMM v2 pool with LP locked permanently, and the launch creator keeps 100% of the 1% post-graduation creator fee for life. Graduation is hands-free: the buy that crosses the threshold runs the whole migration in one flow (~10 seconds), no human action required.

> [!WARNING]
> **Pre-release. Use at your own risk.** These contracts are **not independently audited** and have **not been validated end-to-end on mainnet at production scale**. The full graduation to DeDust pool-seeding flow has only been exercised live on a scaled-down "mini" deployment. The published contracts are covered by the **119 sandbox tests** only. Do **not** deploy with real funds before a third-party security audit and a full-scale end-to-end mainnet validation.

## Status

v1.0.0 initial release (`get_version() = 0x010000`). A reference implementation: fork it, tune `contracts/bonding-config.tolk`, deploy your own master.

## Quick start

```bash
acton build
acton test                          # 119 / 119 sandbox tests
acton test --fork-net mainnet       # against real DeDust state
acton run demo-full-flow            # end-to-end demo
```

Requires [Acton CLI](https://ton-blockchain.github.io/acton/).

## Architecture

Each launch is three contracts, plus a DeDust pool after graduation:

- **BondingCurveMaster**: protocol-wide factory. Holds admin and treasury, deploys every launch at a deterministic address.
- **BondingCurve**: the per-launch `x*y=k` AMM. Auto-graduates to DeDust once it crosses the threshold.
- **JettonMinter**: TEP-89 minter. Admin is auto-dropped after the init mint, so supply is frozen.
- **JettonWallet**: TEP-74 user wallet.

After graduation a DeDust CPMM v2 pool holds the liquidity, at an address deterministically derived from `(jettonMinter, creator)`. LP is locked 100% and the swap fee is 2% (1% to LPs, 1% to the creator).

Graduation runs in two phases because the pool needs an async wallet-address handshake with the minter before it accepts deposits. Phase A deploys the pool and pays the migration fee. After the handshake the pool calls the curve back, and Phase B seeds both sides and locks LP.

## Tokenomics 

- Supply 1,000,000,000 (9 decimals): 900M sold along the curve, 100M seeded into the DeDust pool at graduation.
- Virtual TON reserve `V` = 400 TON. Graduation threshold `T` = 2,000 TON of real reserve (about 36x price from start to graduation).
- Fees: 1% on each curve buy and sell. After graduation, 2% per DeDust swap (1% to locked LPs, 1% to the creator, forever).
- Launch fee 0.2 TON. One-shot migration fee 20 TON at graduation.

Edit `contracts/bonding-config.tolk` for custom tokenomics, keeping the reachability invariant `V * (S/DEX - 1) > T`.

## Economic model

| Phase | Fee | Recipient |
|---|---|---|
| `CreateLaunch` | 0.2 TON | Protocol admin (master treasury) |
| Curve buy/sell | 1% per trade | 90% protocol admin + 10% migration reserve (self-funded graduation) |
| Migration (one-shot) | 20 TON | Protocol admin |
| DeDust LP fee (post-grad) | 1% per swap | LP holders (locked share stays in the pool forever; future depositors get pro-rata) |
| DeDust creator fee (post-grad) | 1% per swap, forever | Launch creator (claimable via `ClaimCreatorFees`) |

Creators claim accumulated DeDust fees via the standard CPMM v2 op `0xbe3e3179`:

```bash
acton run claim-creator-fees-mainnet
```

## Trust model

- Per-launch flow is trustless: admin cannot rug, censor, pause, or seize user funds on any curve.
- LP is locked 100% at graduation. No Position NFT is issued for the seed share.
- Pool deployment is trustless: the address is deterministic from `(jettonMinter, creator)`, computed on-chain.
- Auto-graduation is permissionless: the threshold-crossing buy self-sends `Graduate`, and anyone can also call it manually.
- The master is immutable once deployed. Admin powers are limited to treasury and protocol-fee management.

## Protocol reference

### Opcodes to `BondingCurveMaster`

| Op | Code | Caller |
|---|---|---|
| `CreateLaunch` | `0xa0a0a001` | anyone (>= 0.5 TON) |
| `ChangeMasterAdmin` / `ClaimMasterAdmin` | `0xa0a0a002` / `0xa0a0a003` | admin / nextAdmin |
| `ChangeTreasury` | `0xa0a0a004` | admin |
| `WithdrawProtocolFees` | `0xa0a0a005` | admin |
| `DepositProtocolFees` | `0xa0a0a006` | curves (sender-auth via deterministic launch address) |
| `ReinitializeCurve` | `0xa0a0a014` | admin |

### Opcodes to `BondingCurve`

| Op | Code | Caller |
|---|---|---|
| `InitializeCurve` | `0xa0a0a010` | master |
| `BuyJettons` | `0xa0a0a011` | anyone (workchain 0) |
| `FlushFees` | `0xa0a0a013` | anyone (permissionless) |
| `Graduate` | `0xa0a0a012` | anyone (state-gated) |
| `InitPoolResultMessage` | `0xce185bd7` | DeDust pool (sender-auth via deterministic pool address) |
| `TransferNotificationForRecipient` (TEP-74) | `0x7362d09c` | curve's own jetton wallet |

### Getters

`BondingCurveMaster`:

| Getter | Returns |
|---|---|
| `get_master_data()` | `{admin, nextAdmin, treasury, totalLaunches, feesBalance}` |
| `get_launch_address(creator, salt)` | `address` (deterministic curve address) |
| `get_storage_reserve()` | `coins` (storage rent floor) |
| `get_version()` | `int` packed `0xMMmmpp` (`0x010000` for v1.0.0) |

`BondingCurve`:

| Getter | Returns |
|---|---|
| `get_curve_data()` | `{state, creator, salt, jettonMinter, virtualTonReserve, realTonReserve, curveJettonBalance, curveSupply, dexReserveSupply, graduationThreshold, feeAccrued, migrationReserve}` |
| `get_state()` | `uint8` (0=Initializing, 1=Trading, 2=Graduating, 3=Migrated, 4=Frozen) |
| `get_quote_buy(tonIn)` | `coins` (jettons received post-fee) |
| `get_quote_sell(jettonIn)` | `coins` (TON received post-fee) |
| `get_max_safe_sell()` | `coins` (max sellable jettons before floor) |
| `get_progress_bps()` | `int` (0 to 10000 basis points to graduation) |
| `get_version()` | `int` (matches master) |

### Events (TVM `external_out`)

| Event | Topic | TL-B body |
|---|---|---|
| `LaunchCreatedEvent` | `0xa0a0a001` | `creator + salt + curveAddress + minterAddress + virtualTonReserve` |
| `BuyEvent` | `0xa0a0a011` | `buyer + tonInNet + jettonsOut + feeAccrued + realTonReserve + curveJettonBalance` |
| `SellEvent` | `0xa0a0a020` | `seller + jettonsIn + tonOut + feeAccrued + realTonReserve + curveJettonBalance` |
| `GraduateEvent` | `0xa0a0a012` | `poolAddress + poolSeedTon + poolSeedJettons + migrationFee + strandedJettons` |

### Error codes

| Code | Name | Meaning |
|---|---|---|
| `47` | `BalanceError` | Insufficient balance or floor violation |
| `48` | `NotEnoughGas` | Attached value below required threshold |
| `49` | `InvalidMessage` | Malformed body or slippage breach |
| `72` | `InvalidOp` | Wrong state for this op |
| `73` | `NotOwner` | Sender is not the admin |
| `74` | `NotValidWallet` | Sender doesn't match expected derived address |
| `333` | `WrongWorkchain` | Sender not on basechain (workchain 0) |
| `0xFFFF` | (TVM unknown) | Unknown opcode (curve only; master silently accepts) |

### DeDust CPMM v2 integration

| Op | Code | Direction |
|---|---|---|
| `Init` | `0xde8402ce` | curve to pool (deploys via stateInit) |
| `PayNative` | `0xa5a7cbf8` | curve to pool (Phase B, TON side) |
| `PayJetton` | `0xcbc33949` | curve wallet to pool wallet (Phase B, jetton side via TEP-74 forward payload, ref mode) |
| `DepositPayload` | `0xc9a015da` | inner payload of `Pay*` |
| `InitPoolResultMessage` | `0xce185bd7` | pool to curve (callback that triggers Phase B) |
| `ClaimCreatorFees` | `0xbe3e3179` | creator to pool |

Library hash (mainnet): `0x6045e67b617e73486aac445cfcad0dbead6d315ccc8f4aede3f2e23ad14da4b0`.

## Deployment

Scripts are wired in `Acton.toml` as `-emulation` / `-fork-mainnet` / `-mainnet` triplets, for example:

```bash
acton run master-deploy-mainnet      # deploy the protocol factory
acton run launch-create-mainnet      # create a new memecoin launch
acton run curve-buy-mainnet          # buy from a curve
acton run curve-graduate-mainnet     # trigger DeDust migration
acton run claim-creator-fees-mainnet # creator claims DeDust fees
```

There is no `acton deploy`. Run the full gate (`acton build && acton check && acton fmt --check && acton test`), dry-run with `--fork-net mainnet`, then broadcast with `--net mainnet`. The master is immutable once deployed, so validate a scaled smoke test first.

## TypeScript SDK

A standalone TypeScript SDK is published separately as `bonding-curve-sdk`: typed contract wrappers, AMM math helpers, tx-body builders, event parsers, and tokenomics presets.

```bash
npm i bonding-curve-sdk @ton/core @ton/crypto
```

Point it at your own master: `new LaunchpadSDK({ client, master: "EQ...yourMaster" })`.

## Reference

The contracts in `contracts/` are the source of truth for opcodes, storage, getters, and events. The typed wrappers in `wrappers/` and `wrappers-ts/` mirror them. DeDust CPMM v2 integration follows the [official docs](https://hub-beta.dedust.io/docs/cpmm-v2/overview). Built with [Tolk](https://docs.ton.org/tolk) and [Acton CLI](https://ton-blockchain.github.io/acton/).

## License

[MIT](./LICENSE). See [`CHANGELOG.md`](./CHANGELOG.md) for release history and [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the build, test, and style guide.
