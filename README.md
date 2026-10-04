<div align="center">

# bonding-curve-contracts

[![Version](https://img.shields.io/badge/version-V2%20in%20development-0098EA)](./CHANGELOG.md)
[![Tests](https://img.shields.io/badge/V2%20tests-53%20passing-brightgreen)](./tests/v2)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](./LICENSE)

</div>

> The contracts have not been independently audited or validated on live mainnet at full scale.

TON token launchpad with a bonding curve and automatic migration to DeDust CPMM v2. Initial liquidity is fully locked.

## Launch options

| Option              | Choices                                              |
| ------------------- | ---------------------------------------------------- |
| Supply              | 100M / 1B / 10B tokens                               |
| Migration threshold | 1,000 / 2,000 / 3,000 TON                            |
| Creator fee         | 0 / 0.1 / 0.5 / 1 / 2%                               |
| Fee destination     | Up to 8 wallets with fixed shares, or buyback & burn |
| Buy limits          | Optional minimum and maximum, in % of initial supply |

An optional dev buy completes before public trading opens. Launch settings are fixed; contracts cannot be upgraded.

On the curve, the protocol charges 1% in addition to the creator fee. Migration costs 20 TON, paid after liquidity is confirmed. DeDust fees also include LP and protocol shares; exact rates are available through `get_fee_rates`.

Buyback mode collects the creator share, buys tokens after migration and burns them to reduce supply. Anyone can trigger it. Swaps allow 3% slippage against a pool quote valid for 60 seconds.

## Tests

Validated with Acton 1.2.0:

- **53 V2 tests** covering launches, lifecycle events, trades, fees, refunds and buyback & burn.
- **543 local migration simulations**, using real DeDust libraries.
- **2 migration completion checks**: normal flow and concurrent confirmations, verifying locked liquidity and a single migration fee.
- Buyback tested across **12 supply/fee combinations** locally. A previous V2 baseline also passed the migration matrix and buyback tests on mainnet fork **96720714**.

All executions were emulated; no real funds were spent. [Commands and results](tests/README.md).

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
