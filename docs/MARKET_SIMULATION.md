# Market simulation

Requires Acton **1.2.0** and Python **3.9+**. Uses simulated wallets and no real funds.

## Run

```sh
acton run market-quick       # 10 traders, 200 requests
acton run market-campaign    # 20 seeds, 50 traders, 10,000 requests

# Replay one campaign seed:
acton run market-replay -- --seed 20260935 --operations 500 --actors 50 --offline
```

The first run downloads three DeDust libraries and checks their hashes. Later runs can use `-- --offline`. For a mainnet fork, use `--fork-block <block>` instead of `--offline`.

Replay requires the same code, seed, parameters and optional fork block. Reports and traces are saved under `build/market-simulation/` and excluded from Git. CI runs the quick scenario and saves its reports.

## Checks

- Buys and sells across wallets, with up to five message chains interleaved.
- Stale quotes, insufficient gas, overspending and refunds.
- Token supply, reserves, fees and exact payments received by each trader.
- Migration during pending trades, one migration fee and fully locked LP.
- DeDust swaps, repeated/concurrent creator claims and unauthorized claims.
- Protocol fee collection and withdrawals.

This tests contract execution and message ordering, not wallet signatures or network throughput.

## Results 2026-09-30

**120/120 tests; 20/20 campaign seeds passed:** 60,461 transactions, 20 migrations, 260 DeDust swaps, 420 creator claims (including empty/duplicate claims) and 60 protocol withdrawals.

The quick scenario also passed on mainnet fork block **95930979**.
