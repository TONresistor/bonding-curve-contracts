<div align="center">

# bonding-curve-contracts

[![Version](https://img.shields.io/badge/version-V2.1%20in%20development-0098EA)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](./LICENSE)

</div>

> The contracts have not been independently audited or validated on live mainnet at full scale.

TON token launchpad with a bonding curve and automatic migration to DeDust CPMM v2. Initial liquidity is fully locked.

## Launch options

| Option              | Choices                                            |
| ------------------- | -------------------------------------------------- |
| Supply              | Custom token quantity                              |
| Migration threshold | Custom amount from 500 to 10,000 TON                |
| Creator fee         | 0–10%, in 0.1% steps                                |
| Fee destination     | Up to 8 wallets with fixed shares, or buyback & burn |
| Buy limits          | Optional minimum and maximum, in % of initial supply |

The sold share is configurable; the contract derives the virtual reserve and validates migration liquidity. Launch settings are fixed; contracts cannot be upgraded.

## Creation and fees

Creation uses a factory quote covering the **0.2 TON protocol fee**, execution, reserves and any dev buy. Trading opens after creation settles; refundable surplus is returned once to the creator.

Missing confirmations can be recovered without reminting; confirmed mint failures cancel the launch. [Creation and recovery](docs/v2/README.md#launches).

Curve fees are **1% protocol + creator fee**. Migration costs **20 TON**, charged after liquidity confirmation. Read DeDust fee shares through `get_fee_rates`.

Buyback uses creator fees to buy and burn tokens after migration. Anyone can trigger it; swaps enforce 3% slippage against a pool quote valid for 60 seconds.

## Tests

Local validation with Acton 1.2.0 / Tolk 1.4.2 and real DeDust libraries:

- **549 migration scenarios** across supply, fee, dev buy and threshold settings.
- **3 percentage-limit checks**.
- **2 finalization checks**, verifying fully locked initial LP tokens and a single migration fee.

Contract tests cover launches, trades, refunds, recovery and buyback. All runs are emulated. [Test guide](tests/README.md).

## SDK

The [`SDK source`](sdk/) targets V2.1 and prepares transactions for TON Connect or a backend sender. `prepareLaunch` uses the factory quote. [Build and usage](docs/v2/README.md#sdk).

## Development

Requires [Acton 1.2.0](https://ton-blockchain.github.io/acton/) and Python 3.9+.

```sh
acton build BondingCurveMasterV2
python3 scripts/shared/run-market-simulation.py v2 --prepare-only
acton test tests/v2
acton run v2-simulation
```

[Contracts](contracts/v2/)  [Tests](tests/v2/)  [Scripts](scripts/v2/)  [Contributing](CONTRIBUTING.md) [Changelog](CHANGELOG.md)  [MIT license](LICENSE)

Documentation: [V2 guide](docs/v2/README.md) | [V1 reference](docs/v1/README.md).
