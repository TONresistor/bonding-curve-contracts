import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { Address, beginCell, Dictionary } from '@ton/core';
import * as sdk from '../dist/index.js';

const placeholder = Address.parseRaw('0:' + '00'.repeat(32));
const uri = 'https://example.com/sdk-token.json';

function run(transactions, discover) {
  const entries = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell());
  transactions.forEach((tx, index) =>
    entries.set(
      index,
      beginCell()
        .storeAddress(tx.to)
        .storeCoins(tx.value)
        .storeBit(tx.bounce)
        .storeRef(tx.body)
        .endCell(),
    ),
  );
  const bundle = beginCell().storeDict(entries).endCell().toBoc().toString('base64');
  return execFileSync('acton', ['script', 'sdk/test/flows.tolk', bundle, String(discover)], {
    cwd: new URL('../../', import.meta.url),
    encoding: 'utf8',
    timeout: 120000,
  });
}

for (const buybackBurn of [false, true]) {
  test(
    buybackBurn
      ? 'SDK E2E: migration and permissionless buyback burn'
      : 'SDK E2E: dev buy, public buy, sell, slippage refund and creator claim',
    () => {
      const config = {
        supplyTokens: 1_000_000_000,
        creatorFeeBps: 100,
        devBuyAmount: (buybackBurn ? 3000n : 1n) * sdk.NANO,
        buybackBurn,
      };
      const initial = [sdk.createLaunch(placeholder, config, uri, 42n)];
      if (!buybackBurn) initial.push(sdk.buy(placeholder, 10n * sdk.NANO, 1n));
      const output = run(initial, true);
      const fields = Object.fromEntries(
        [...output.matchAll(/^(\w+)=(\S+)/gm)].map((match) => [match[1], match[2]]),
      );
      assert.ok(fields.master, output);
      const address = (key) => Address.parse(fields[key]);
      const transactions = [sdk.createLaunch(address('master'), config, uri, 42n)];
      if (buybackBurn) {
        transactions.push(
          sdk.prepareBuyback(address('curve')),
          sdk.flushCreatorFees(address('curve')),
          sdk.claimBuybackFees(address('burner')),
          sdk.executeBuyback(address('burner')),
          sdk.sell({
            jettonWallet: address('creatorWallet'),
            curve: address('curve'),
            owner: address('creator'),
            tokenAmount: 1_000_000n * sdk.NANO,
            minTonOut: 1n,
          }),
        );
      } else {
        transactions.push(
          sdk.buy(
            address('curve'),
            10n * sdk.NANO,
            sdk.minimumOutput(BigInt(fields.quoteBuy), 300),
          ),
          sdk.sell({
            jettonWallet: address('wallet'),
            curve: address('curve'),
            owner: address('buyer'),
            tokenAmount: 1_000_000n * sdk.NANO,
            minTonOut: sdk.minimumOutput(BigInt(fields.quoteSell), 300),
          }),
          sdk.flushCreatorFees(address('curve')),
          sdk.claimFees(address('manager')),
          sdk.sell({
            jettonWallet: address('wallet'),
            curve: address('curve'),
            owner: address('buyer'),
            tokenAmount: 1_000_000n * sdk.NANO,
            minTonOut: 1000n * sdk.NANO,
          }),
        );
      }
      assert.match(run(transactions, false), buybackBurn ? /SDK_BUYBACK_OK/ : /SDK_TRADING_OK/);
    },
  );
}
