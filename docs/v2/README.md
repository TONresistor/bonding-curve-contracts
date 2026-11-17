# V2.1

[Options and fees](../../README.md) | [Tests](../../tests/README.md) | [TypeScript wrappers](../../wrappers-ts/)

## Launches

Contracts accept custom [launch options](../../README.md#launch-options). `LaunchOptions.soldSupplyBps` sets the target share sold before migration. Amounts use nano-TON/nano-tokens; rates use bps: 100 = 1%.

Use the factory's `get_create_launch_quote(creator, request)` and attach `minimumCreateValue`. The [creation script](../../scripts/v2/create-launch.tolk) and SDK `prepareLaunch` do this automatically.

Trading waits for mint delivery, factory confirmation, minter admin removal and settlement. Refundable surplus returns to the creator in one payment; the 0.2 TON creation fee, dev buy principal and required reserves remain protected.

If initialization stalls, the creator can send `RetryLaunchSettlement` with at least `minimumRetryValue` from `get_launch_settlement`. Completed mints are never repeated; confirmed mint failures cancel the launch.

The protocol treasury must use workchain **0**. The DeDust config sets `depositActivation` to the curve, preventing other deposits before migration. The pool address (`get_pool_address`) depends on the curve address.

## Scripts

Run with `acton script <file> <args>` from the repository root. Arguments are defined in each script's `main()`. Scripts run locally by default; `--net mainnet` broadcasts real transactions.

- [Create token](../../scripts/v2/create-launch.tolk)
- [Sell tokens](../../scripts/v2/sell-jettons.tolk)
- [Collect and claim fees](../../scripts/v2/claim-fees.tolk)
- [Retry migration](../../scripts/v2/retry-migration.tolk)
- [Buyback & burn](../../scripts/v2/buyback.tolk)

For buys, use `sendBuyJettons` in the [curve wrapper](../../wrappers/BondingCurveV2.gen.tolk).

## Launch detection

- Master topic `0xa0a0a001` (`LaunchCreatedEvent`): discovery, before initialization finishes. Read metadata and launch options from the transaction's incoming `CreateLaunch` message.
- Curve topic `0xa0a0b070` (`LaunchInitializedEvent`): creation settled, including mint delivery and admin removal. Contains the launch status and both curve reserves; emitted once, including launches without a dev buy.
- `get_launch_status`: **0** initializing, **1** trading, **2** migrating, **3** migrated, **4** cancelled. Migration includes preparation, retries and liquidity confirmation. `get_state` retains the existing technical state codes.
- Buy/sell logs already contain `realTonReserve` and `curveJettonBalance` after accounting. `GraduateEvent` confirms migration. Authenticate emitters and process transactions in order; initialization can lead directly to migration.

Decoders are generated in the TypeScript wrappers. Load off-chain metadata separately from launch discovery.

## Curve trade events

| Event | TON amounts | Other fields |
| --- | --- | --- |
| `BuyEvent` | `tonInGross`, `tonInNet`, `feeTon` | `buyer`, `jettonsOut`, `migrationStarted` |
| `SellEvent` | `tonOutGross`, `tonOutNet`, `feeTon` | `seller`, `jettonsIn` actually sold |

Both include post-trade `realTonReserve` and `curveJettonBalance`. Amounts use nano-units; gross = net + `feeTon`. This is the fee for that trade, excluding gas and transfer budgets.

The protocol share is `floor(gross / 100)`; the creator share is the remainder. `migrationStarted` signals the threshold was reached; wait for `GraduateEvent` to confirm liquidity. A buy log does not confirm token delivery.

## Buyback

Collect the curve/DeDust fees first, then run:

```sh
acton script scripts/v2/buyback.tolk WALLET CURVE_ADDRESS STEP
```

Steps: **1** prepare/activate after migration, **2** claim fees, **3** buy and burn, **4** retry burn, **0** inspect state. Anyone can trigger them.

## SDK

Build this checkout for the V2.1 APIs below. npm releases may target a different ABI.

Build with `npm ci --prefix sdk && npm run build --prefix sdk` (Node.js 22+).

`prepareLaunch` returns the quote and a funded transaction. `getLaunchSettlement` exposes creation progress and retry funding. `LaunchConfig` keeps presets, mapping `reserveRatio` to `soldSupplyBps`; use generated `LaunchOptions` and message builders for custom values.

```ts
import { LaunchpadV2, toTonConnect } from '@tonresistor/bonding-curve-sdk';

const sdk = new LaunchpadV2(address => tonClient.provider(address));
const { transaction } = await sdk.prepareBuy(curveAddress, 1_000_000_000n, 300);
await tonConnectUI.sendTransaction(toTonConnect(transaction, {
  validUntil: Math.floor(Date.now() / 1000) + 300,
  network: '-239',
  from: connectedWalletAddress,
}));
```

Your app supplies the RPC client, connected wallet and parsed addresses. Browser builds need the Buffer support required by `@ton/core`.

| API | Coverage |
| --- | --- |
| `sdk.master/curve/minter/wallet/collector/splitter/buyback(address)` | All generated getters and `send*` methods, with the provider bound |
| `client.messages.messageName(value, body)` | Every ABI message as a transaction, without sending; explicit gas budget |
| `contractMessages(ContractClass, address)` | Same builders without an RPC provider |
| `prepareLaunch`, `createLaunch`, `prepareBuy`, `prepareSell`, `buy`, `sell` | Launch and trading helpers |
| `flushCreatorFees`, `collectPoolFees`, `sweepCollectedTokens`, `retryCollectedFees`, `claimFees` | Fee collection, recovery and individual claims |
| `prepareBuyback`, `claimBuybackFees`, `executeBuyback`, `burnAvailable` | Buyback and burn |
| `flushFees`, `graduate`, `retryMigration`, `confirmMigration` | Protocol fees and migration |
| `changeMasterAdmin`, `claimMasterAdmin`, `changeTreasury`, `withdrawProtocolFees`, `reinitializeCurve` | Master administration |
| `transferTokens`, `burnTokens`, `deployMaster`, `deployment` | Jetton operations and deployment payloads with StateInit |

Builders prepare transactions; sender authorization still applies. `reinitializeCurve` does not upgrade code.

SDK amounts are bigint nano-units; `supplyTokens` and `graduationTon` use whole units. Beneficiary shares total 10,000 bps. `prepareSell` reads the wallet's current minimum notification funding; low-level message builders require explicit TON values.

Submit fee collection and claims separately and confirm delivery. Quotes neither reserve prices nor bypass buy limits. Sells above `getMaxSafeSell` can return excess tokens.

`sdk.minter(address).getJettonData()` returns `jettonContent` as a raw Cell. Generated bindings and event decoders are available under `@tonresistor/bonding-curve-sdk/contracts/<ContractName>`.
