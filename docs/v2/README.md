# V2

[Options and fees](../../README.md) | [Tests](../../tests/README.md) | [TypeScript wrappers](../../wrappers-ts/)

## Scripts

Run with `acton script <file> <args>` from the repository root. Arguments are defined in each script's `main()`.

- [Create token](../../scripts/v2/create-launch.tolk)
- [Sell tokens](../../scripts/v2/sell-jettons.tolk)
- [Collect and claim fees](../../scripts/v2/claim-fees.tolk)
- [Retry migration](../../scripts/v2/retry-migration.tolk)
- [Buyback & burn](../../scripts/v2/buyback.tolk)

For buys, use `sendBuyJettons` in the [curve wrapper](../../wrappers/BondingCurveV2.gen.tolk).

Amounts use nano-TON/nano-tokens; `supplyTokens` and `graduationTon` use whole units. Rates use bps: 100 = 1%.

## Buyback

Collect the curve/DeDust fees first, then run:

```sh
acton script scripts/v2/buyback.tolk WALLET CURVE_ADDRESS STEP
```

Steps: **1** prepare/activate after migration, **2** claim fees, **3** buy and burn, **4** retry burn, **0** inspect state. Anyone can trigger them.

Scripts run locally by default. `--net mainnet` broadcasts real transactions.
