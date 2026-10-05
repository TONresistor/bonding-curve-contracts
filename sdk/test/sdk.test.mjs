import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { Address, beginCell, Cell, TupleReader } from '@ton/core';
import * as sdk from '../dist/index.js';
import { LaunchOptions, CreateLaunch } from '../dist/generated/BondingCurveMasterV2.gen.js';
import { AskToTransfer } from '../dist/generated/JettonWalletV2.gen.js';
import { BuyJettons } from '../dist/generated/BondingCurveV2.gen.js';
const owner = Address.parseRaw('0:' + '11'.repeat(32));
const curve = Address.parseRaw('0:' + '22'.repeat(32));
const wallet = Address.parseRaw('0:' + '33'.repeat(32));
const config = { supplyTokens: 1_000_000_000, creatorFeeBps: 100 };
const hash = (cell) => BigInt('0x' + cell.hash().toString('hex')).toString();

test('payload hashes match Tolk serializers for all 135 launch presets and trade/fee messages', () => {
  const output = execFileSync('acton', ['script', 'sdk/test/vectors.tolk'], {
    cwd: new URL('../../', import.meta.url),
    encoding: 'utf8',
    timeout: 120000,
  });
  const vectors = new Map([...output.matchAll(/([a-zA-Z]+\d*):(\d+)/g)].map((m) => [m[1], m[2]]));
  assert.equal(vectors.size, 159);
  assert.equal(hash(sdk.buy(curve, sdk.NANO, 123456789n, 42n).body), vectors.get('buy'));
  assert.equal(
    hash(
      sdk.sell({
        jettonWallet: wallet,
        owner,
        curve,
        tokenAmount: 123456789n,
        minTonOut: 987654321n,
        queryId: 42n,
      }).body,
    ),
    vectors.get('sell'),
  );
  assert.equal(hash(sdk.claimFees(curve, false, 42n).body), vectors.get('claim'));
  assert.equal(hash(sdk.executeBuyback(curve, 42n).body), vectors.get('execute'));
  assert.equal(hash(sdk.flushCreatorFees(curve, 42n).body), vectors.get('flush'));
  assert.equal(hash(sdk.collectPoolFees(curve, 42n).body), vectors.get('collect'));
  assert.equal(hash(sdk.sweepCollectedTokens(curve, 123n, 42n).body), vectors.get('sweep'));
  assert.equal(hash(sdk.prepareBuyback(curve, 42n).body), vectors.get('prepare'));
  assert.equal(hash(sdk.claimBuybackFees(curve, 42n).body), vectors.get('claimBurn'));
  assert.equal(hash(sdk.burnAvailable(curve, 42n).body), vectors.get('burnAvailable'));
  assert.equal(hash(sdk.retryMigration(curve, 42n).body), vectors.get('retry'));
  assert.equal(hash(sdk.confirmMigration(curve, 42n).body), vectors.get('confirm'));
  assert.equal(hash(sdk.flushFees(curve, 42n).body), vectors.get('flushProtocol'));
  assert.equal(hash(sdk.graduate(curve, 42n).body), vectors.get('graduate'));
  assert.equal(hash(sdk.retryCollectedFees(curve, 42n).body), vectors.get('retryCollected'));
  assert.equal(hash(sdk.changeMasterAdmin(owner, curve, 42n).body), vectors.get('changeAdmin'));
  assert.equal(hash(sdk.claimMasterAdmin(curve, 42n).body), vectors.get('claimAdmin'));
  assert.equal(hash(sdk.changeTreasury(owner, curve, 42n).body), vectors.get('treasury'));
  assert.equal(hash(sdk.withdrawProtocolFees(owner, 123n, 42n).body), vectors.get('withdraw'));
  assert.equal(hash(sdk.burnTokens(owner, 123n, curve, 42n).body), vectors.get('burnTokens'));
  assert.equal(
    hash(
      sdk.reinitializeCurve(curve, owner, 7n, config, 'https://example.com/token.json', 42n).body,
    ),
    vectors.get('reinitialize'),
  );
  assert.equal(
    hash(
      sdk.transferTokens({
        jettonWallet: owner,
        recipient: curve,
        responseAddress: owner,
        tokenAmount: 123n,
        queryId: 42n,
      }).body,
    ),
    vectors.get('transferTokens'),
  );
  let count = 0;
  for (const supplyTokens of [100_000_000, 1_000_000_000, 10_000_000_000])
    for (const creatorFeeBps of [0, 10, 50, 100, 200])
      for (const graduationTon of [1000, 2000, 3000])
        for (const reserveRatio of [3, 5, 8]) {
          const tx = sdk.createLaunch(
            curve,
            {
              supplyTokens,
              creatorFeeBps,
              graduationTon,
              reserveRatio,
              devBuyAmount: 2n * sdk.NANO,
              minDevTokens: 123n,
            },
            'https://example.com/token.json',
            7n,
            42n,
          );
          assert.equal(hash(tx.body), vectors.get(`launch${count++}`));
          assert.equal(tx.value, 3n * sdk.NANO);
        }
  assert.equal(
    hash(
      LaunchOptions.toCell(
        sdk.launchOptions({ ...config, beneficiaries: [{ address: owner, shareBps: 10000 }] }),
      ),
    ),
    vectors.get('split'),
  );
  assert.equal(
    hash(LaunchOptions.toCell(sdk.launchOptions({ ...config, buybackBurn: true }))),
    vectors.get('burn'),
  );
});

test('reject invalid presets, shares, limits and integer amounts', () => {
  for (const change of [
    { supplyTokens: 42 },
    { creatorFeeBps: 99 },
    { graduationTon: 42 },
    { reserveRatio: 4 },
    { minBuyBps: 100, maxBuyBps: 100 },
    { minBuyBps: 10000 },
    { minBuyBps: 0.5 },
    { devBuyAmount: -1n },
    { devBuyAmount: 1 },
    { minDevTokens: 1n << 120n },
    { beneficiaries: [] },
    { beneficiaries: [{ address: owner, shareBps: 9999 }] },
    {
      beneficiaries: [
        { address: owner, shareBps: 5000 },
        { address: owner, shareBps: 5000 },
      ],
    },
    { beneficiaries: [{ address: Address.parseRaw('-1:' + '11'.repeat(32)), shareBps: 10000 }] },
    { buybackBurn: true, creatorFeeBps: 0 },
    { buybackBurn: true, beneficiaries: [] },
  ])
    assert.throws(() => sdk.launchOptions({ ...config, ...change }));
  assert.throws(() => sdk.minimumOutput(100n, 10000));
  assert.throws(() => sdk.minimumOutput(100n, -1));
  assert.equal(sdk.minimumOutput(101n, 300), 97n);
  assert.throws(() => sdk.buy(curve, 9_999_999n, 1n));
  assert.throws(() => sdk.buy(curve, sdk.NANO, 0n));
  assert.throws(() => sdk.buy(curve, sdk.NANO, 1n, 1n << 64n));
  assert.throws(() => sdk.sweepCollectedTokens(curve, 0n), /must be positive/);
  assert.throws(() => sdk.sweepCollectedTokens(curve, -1n));
  assert.throws(() =>
    sdk.sell({
      jettonWallet: wallet,
      owner,
      curve,
      tokenAmount: 1n,
      minTonOut: 1n,
      forwardTonAmount: 1n,
    }),
  );
});

test('gas and sell routing stay separate from trading amounts', () => {
  assert.equal(sdk.buy(curve, sdk.NANO, 1n).value, 1_050_000_000n);
  const args = { jettonWallet: wallet, owner, curve, tokenAmount: 123n, minTonOut: 456n };
  const tx = sdk.sell(args);
  assert.ok(tx.to.equals(wallet));
  assert.equal(tx.value, 250_000_000n);
  assert.throws(() => sdk.sell({ ...args, walletGas: 49_999_999n }));
  assert.equal(sdk.sell({ ...args, walletGas: 100_000_000n }).value, 300_000_000n);
  const body = AskToTransfer.fromSlice(tx.body.beginParse());
  assert.ok(body.transferRecipient.equals(curve));
  assert.ok(body.sendExcessesTo.equals(owner));
  assert.equal(body.forwardTonAmount, 200_000_000n);
  assert.equal(body.jettonAmount, 123n);
});

test('TON Connect and Sender preserve value, payload and destination', async () => {
  const tx = sdk.buy(curve, sdk.NANO, 123n, 42n);
  const request = sdk.toTonConnect(tx, {
    validUntil: Math.floor(Date.now() / 1000) + 300,
    network: '-239',
    from: owner,
  });
  assert.equal(request.network, '-239');
  assert.equal(request.messages[0].amount, tx.value.toString());
  assert.ok(Cell.fromBase64(request.messages[0].payload).equals(tx.body));
  assert.ok(Address.parse(request.messages[0].address).equals(curve));
  assert.throws(() => sdk.toTonConnect(tx, { validUntil: 1, network: '-239' }));
  let sent;
  await sdk.sendTransaction(
    {
      send: async (args) => {
        sent = args;
      },
    },
    tx,
  );
  assert.equal(sent.bounce, true);
  assert.equal(sent.sendMode, 1);
  assert.ok(sent.body.equals(tx.body));
});

test('prepareBuy uses gross quote, explicit slippage and refuses closed curves', async () => {
  let status = 1n;
  const client = new sdk.LaunchpadV2(() => ({
    get: async (method, args) => {
      if (method === 'get_launch_status')
        return { stack: new TupleReader([{ type: 'int', value: status }]) };
      assert.equal(method, 'get_quote_buy');
      assert.equal(args[0].value, sdk.NANO);
      return { stack: new TupleReader([{ type: 'int', value: 1000n }]) };
    },
  }));
  const prepared = await client.prepareBuy(curve, sdk.NANO, 300, 42n);
  assert.equal(prepared.minOutput, 970n);
  assert.equal(BuyJettons.fromSlice(prepared.transaction.body.beginParse()).minJettonsOut, 970n);
  status = 2n;
  await assert.rejects(client.prepareBuy(curve, sdk.NANO, 300), /not trading/);
});

test('long metadata and 8 recipients serialize without truncation', () => {
  const beneficiaries = Array.from({ length: 8 }, (_, i) => ({
    address: Address.parseRaw('0:' + (i + 1).toString(16).padStart(64, '0')),
    shareBps: 1250,
  }));
  const uri = 'https://example.com/' + 'a'.repeat(400);
  const tx = sdk.createLaunch(curve, { ...config, beneficiaries }, uri, 0n);
  const body = CreateLaunch.fromSlice(tx.body.beginParse());
  const metadata = body.metadata.beginParse();
  assert.equal(metadata.loadUint(8), 1);
  assert.equal(metadata.loadStringTail(), uri);
  assert.equal(body.options.ref.beneficiaries.ref.shares.size, 8);
  assert.throws(() =>
    sdk.launchOptions({
      ...config,
      beneficiaries: [...beneficiaries, { address: wallet, shareBps: 1 }],
    }),
  );
});

test('prepareSell resolves the owner wallet and reads the curve notification budget', async () => {
  const minter = Address.parseRaw('0:' + '44'.repeat(32));
  const curveWallet = Address.parseRaw('0:' + '55'.repeat(32));
  const client = new sdk.LaunchpadV2((address) => ({
    get: async (method, args) => {
      if (method === 'get_wallet_address') {
        assert.ok(address.equals(minter));
        const requestedOwner = args[0].cell.beginParse().loadAddress();
        const result = requestedOwner.equals(owner) ? wallet : curveWallet;
        return {
          stack: new TupleReader([
            { type: 'slice', cell: beginCell().storeAddress(result).endCell() },
          ]),
        };
      }
      assert.ok(address.equals(curveWallet));
      assert.equal(method, 'get_min_sell_notification');
      return { stack: new TupleReader([{ type: 'int', value: 250_000_000n }]) };
    },
  }));
  client.getLaunchStatus = async () => 1n;
  client.getCurveData = async () => ({ jettonMinter: minter });
  client.quoteSell = async (_, amount) => {
    assert.equal(amount, 123n);
    return 1000n;
  };
  const prepared = await client.prepareSell(curve, owner, 123n, 300);
  assert.ok(prepared.transaction.to.equals(wallet));
  assert.equal(prepared.transaction.value, 300_000_000n);
  assert.equal(prepared.minOutput, 970n);
  assert.equal(
    AskToTransfer.fromSlice(prepared.transaction.body.beginParse()).forwardTonAmount,
    250_000_000n,
  );
});
