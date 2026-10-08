# V2.1

[Options and fees](../../README.md) | [Tests](../../tests/README.md) | [TypeScript wrappers](../../wrappers-ts/)

## Scripts

Run with `acton script <file> <args>` from the repository root. Arguments are defined in each script's `main()`.

- [Create token](../../scripts/v2/create-launch.tolk)
- [Sell tokens](../../scripts/v2/sell-jettons.tolk)
- [Collect and claim fees](../../scripts/v2/claim-fees.tolk)
- [Retry migration](../../scripts/v2/retry-migration.tolk)
- [Buyback & burn](../../scripts/v2/buyback.tolk)

For buys, use `sendBuyJettons` in the [curve wrapper](../../wrappers/BondingCurveV2.gen.tolk).

Launch options use `soldSupplyBps` instead of `reserveRatio`. Contracts accept custom supply, thresholds and creator rates; see [V2.1 specs](../../SPECS-V2.1.md). The curve wallet exposes its network-dependent minimum sell notification.

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

## SDK (V2.0)

The published SDK 0.1.1 targets V2.0. Its adaptation to V2.1 is outside this contract change; V2.1 changes the launch options ABI.

Build with `npm ci --prefix sdk && npm run build --prefix sdk` (Node.js 22+).
Install with `npm install @tonresistor/bonding-curve-sdk @ton/core`.

```ts
import { LaunchpadV2, toTonConnect } from '@tonresistor/bonding-curve-sdk';

const sdk = new LaunchpadV2(address => tonClient.provider(address));
const rates = await sdk.curve(curveAddress).getFeeRates();
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
| `createLaunch`, `prepareBuy`, `prepareSell`, `buy`, `sell` | Launch and trading helpers |
| `flushCreatorFees`, `collectPoolFees`, `sweepCollectedTokens`, `retryCollectedFees`, `claimFees` | Fee collection, recovery and individual claims |
| `prepareBuyback`, `claimBuybackFees`, `executeBuyback`, `burnAvailable` | Buyback and burn |
| `flushFees`, `graduate`, `retryMigration`, `confirmMigration` | Protocol fees and migration |
| `changeMasterAdmin`, `claimMasterAdmin`, `changeTreasury`, `withdrawProtocolFees`, `reinitializeCurve` | Master administration |
| `transferTokens`, `burnTokens`, `deployMaster`, `deployment` | Jetton operations and deployment payloads with StateInit |

For example, `sdk.collector(address).messages.retryCollectedFees(50_000_000n, { queryId: 42n })` prepares the recovery message. Builders use the generated serializers; callback/admin messages still require the sender authorized by the contract. `reinitializeCurve` does not upgrade code.

Amounts are bigint nano-units, except launch `supplyTokens` and `graduationTon` in whole units. Rates and slippage use bps; beneficiary shares sum to 10,000. Buys attach gross TON plus 0.05 TON. Sells target the owner's jetton wallet with at least 0.2 TON forwarded and 0.05 TON wallet gas (0.25 TON total by default). Generic builders require an explicit total message value. These budgets are not live fee estimates.

Fee collection and claims are separate transactions; verify each outcome before the next step. Wallet submission is not delivery confirmation. Quotes do not reserve a price or bypass buy limits; sells above `getMaxSafeSell` can return excess tokens. Buyback slippage remains enforced by the contract.

`sdk.minter(address).getJettonData()` returns `jettonContent` as a raw Cell for both metadata formats ([TEP-74](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)). Other getters retain generated return types. All bindings and event decoders remain available under `@tonresistor/bonding-curve-sdk/contracts/<ContractName>`. No keys, endpoint or deployed address are bundled.
