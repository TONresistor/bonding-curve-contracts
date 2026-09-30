<div align="center">

# bonding-curve-contracts

**TON token launchpad with a bonding curve and automatic migration to DeDust CPMM v2.**

[![Version](https://img.shields.io/badge/version-v1.0.0-0098EA)](./CHANGELOG.md)
[![Tests](https://img.shields.io/badge/tests-120%2F120%20passing-brightgreen)](./tests)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](./LICENSE)

</div>

> The contracts have not been independently audited or validated on live mainnet at full scale.

Anyone can launch a token. Users buy and sell on an `x*y=k` curve. At 2,000 TON of real reserves, the curve automatically seeds a DeDust pool and locks its initial liquidity. The creator can claim their share of the pool's trading fees.

## Run

Requires [Acton 1.2.0](https://ton-blockchain.github.io/acton/) and Python 3.9+ for the market runner.

```sh
acton build
acton test
acton run market-quick       # 10 traders, 200 requests, migration and claims
acton run market-campaign    # 20 seeds, 50 traders, 10,000 requests
```

The first market run downloads the DeDust libraries and verifies their hashes. Reports and traces are saved in `build/market-simulation/`. CI runs the quick scenario and saves its reports.

## Contracts

| Contract | Role |
| --- | --- |
| [BondingCurveMaster](contracts/BondingCurveMaster.tolk) | Creates launches and manages protocol fees and treasury. |
| [BondingCurve](contracts/BondingCurve.tolk) | Handles buys, sells and migration to DeDust. |
| [JettonMinter](contracts/JettonMinter.tolk) | Mints the initial supply, then drops its admin. |
| [JettonWallet](contracts/JettonWallet.tolk) | Handles token transfers and burns. |

Migration deploys the pool, resolves its jetton wallet, then deposits TON and tokens. The initial LP position is fully locked.

## Parameters

| Parameter | Value |
| --- | --- |
| Initial supply | 1 billion tokens, 9 decimals |
| Virtual TON reserve | 400 TON |
| Migration threshold | 2,000 TON in real reserves |
| Curve buy/sell fee | 1% |
| Launch fee | 0.2 TON |
| Migration fee | 20 TON |

Tokenomics are defined in [bonding-config.tolk](contracts/bonding-config.tolk). Pool configuration and fee settings are in [bonding-dedust.tolk](contracts/bonding-dedust.tolk). The token amount deposited at migration is calculated from the curve's final reserves.

## Test

**120/120 tests and 20/20 simulation seeds passed.** The market campaign used 50 traders per seed, with up to five message chains interleaved:

- **10,000 buy/sell requests** and **60,461 transactions**.
- **20 migrations** and **260 DeDust swaps**.
- **420 creator claims**, including empty and duplicate claims, and **60 protocol withdrawals**.

The tests checked balances, actual payouts, fees, slippage, unauthorized claims and locked liquidity. Two replays produced identical metrics and logical schedule hashes. The quick scenario also passed on mainnet fork block **95930979**.

These runs executed the contracts and real DeDust libraries in the Acton emulator. No real funds were spent. See [commands and replay instructions](docs/MARKET_SIMULATION.md).


[Changelog](CHANGELOG.md) · [MIT license](LICENSE)
