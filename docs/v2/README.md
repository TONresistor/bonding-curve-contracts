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

The protocol treasury must use workchain **0**. Deployment, treasury updates and launch initialization enforce this. Wallet V2 storage/transfer estimates use separately tested size bounds; V1 is unchanged. `dropAdminPending` clears only after an authenticated minter acknowledgment, with idempotent retries if it is delayed.

## Launch detection

- Master topic `0xa0a0a001` (`LaunchCreatedEvent`): discovery, before initialization finishes. Read metadata and launch options from the transaction's incoming `CreateLaunch` message.
- Curve topic `0xa0a0b070` (`LaunchInitializedEvent`): inventory and dev buy delivery confirmed. Contains the launch status and both curve reserves at that moment; emitted once, including launches without a dev buy.
- `get_launch_status`: **0** initializing, **1** trading, **2** migrating, **3** migrated, **4** cancelled. Migration includes preparation, retries and liquidity confirmation. `get_state` retains the existing technical state codes.
- Buy/sell logs already contain `realTonReserve` and `curveJettonBalance` after accounting. `GraduateEvent` confirms migration. Authenticate emitters and process transactions in order; initialization can lead directly to migration.

Decoders are generated in the TypeScript wrappers. Load off-chain metadata separately from launch discovery.

## Curve trade events

| Event | TON amounts | Other fields |
| --- | --- | --- |
| `BuyEvent` | `tonInGross`, `tonInNet`, `feeTon` | `buyer`, `jettonsOut`, `migrationStarted` |
| `SellEvent` | `tonOutGross`, `tonOutNet`, `feeTon` | `seller`, `jettonsIn` actually sold |

Both include post-trade `realTonReserve` and `curveJettonBalance`. All amounts use nano-units. Gross = net + `feeTon`; gas and token-transfer budgets are excluded. `feeTon` is the total fee for this trade, not an accumulated balance.

The protocol share is `floor(gross / 100)`; the creator share is `feeTon - protocolShare`. No extra fee fields or RPC reads are needed. `migrationStarted` means the buy reached the threshold, not that liquidity is confirmed; wait for `GraduateEvent` for completion. A buy log does not confirm token delivery.

Use the regenerated V2 decoders: gross amounts and the buy flag extend the payloads; `feeAccrued` is now named `feeTon`, and sell `tonOut` is named `tonOutNet`.

## Buyback

Collect the curve/DeDust fees first, then run:

```sh
acton script scripts/v2/buyback.tolk WALLET CURVE_ADDRESS STEP
```

Steps: **1** prepare/activate after migration, **2** claim fees, **3** buy and burn, **4** retry burn, **0** inspect state. Anyone can trigger them.

Scripts run locally by default. `--net mainnet` broadcasts real transactions.
