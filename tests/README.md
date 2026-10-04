# Tests

Acton **1.2.0**, Python **3.9+**. Run from the repository root. Local emulation, no real funds.

## V2

```sh
acton build BondingCurveMasterV2
python3 scripts/shared/run-market-simulation.py v2 --prepare-only
acton test tests/v2
acton run v2-simulation -- --offline
```

**53 tests** cover launches, lifecycle events, trades, refunds, fees and buyback & burn. The local migration runner passed **540 preset scenarios**, **3 buy-limit migrations** and **2 completion checks** (normal flow and concurrent confirmations: locked LP, migration fee paid once).

A previous V2 baseline passed the full migration matrix on mainnet fork **96720714**. Buyback's 12 supply/fee combinations also passed on that fork. Replay the matrix:

```sh
acton run v2-simulation -- --fork-block 96720714
```

Run one case:

```sh
acton test tests/v2/buyback.test.tolk --filter 'slippage'
```

[Launch](v2/launch.test.tolk) | [Events](v2/events.test.tolk) | [Regression checks](v2/practices.test.tolk) | [Options](v2/options.test.tolk) | [Fees](v2/fees.test.tolk) | [Buyback](v2/buyback.test.tolk) | [All V2 tests](v2/)

Reports: `build/market-simulation/`. Check `runs[].passed` in `report.json`; logs contain failure details. Replay with the same source, seed and parameters. Add `--operations 100` for a longer simulation.

## V1 reference

```sh
acton test tests/v1
acton run market-quick
acton run market-campaign
acton run market-replay -- --seed 20260935 --operations 500 --actors 50 --offline
```

Historical run (2026-09-30): 120 tests and 20 seeds passed, covering 60,461 transactions and 20 migrations. [V1 documentation](../docs/v1/README.md).
