import test from 'node:test';
import assert from 'node:assert/strict';
import { Address, beginCell, Cell, contractAddress, loadStateInit, TupleReader } from '@ton/core';
import * as sdk from '../dist/index.js';
import { AskToBurn, AskToTransfer } from '../dist/generated/JettonWalletV2.gen.js';

const address = Address.parseRaw('0:' + '11'.repeat(32));
const recipient = Address.parseRaw('0:' + '22'.repeat(32));
const factories = {
  master: sdk.BondingCurveMasterV2,
  curve: sdk.BondingCurveV2,
  collector: sdk.FeeCollectorV2,
  splitter: sdk.FeeSplitterV2,
  buyback: sdk.BuybackBurnV2,
  minter: sdk.JettonMinterV2,
  wallet: sdk.JettonWalletV2,
};

test('every generated getter, sender and message builder is available on all seven clients', () => {
  const client = new sdk.LaunchpadV2(() => ({}));
  for (const [name, factory] of Object.entries(factories)) {
    const connected = client[name](address);
    const constructors = Object.getOwnPropertyNames(factory).filter((key) =>
      key.startsWith('createCellOf'),
    );
    assert.equal(Object.keys(connected.messages).length, constructors.length);
    for (const method of Object.getOwnPropertyNames(factory.prototype).filter((key) =>
      /^(get|send)/.test(key),
    )) {
      assert.equal(typeof connected[method], 'function', `${name}.${method}`);
      if (method.startsWith('send') && method !== 'sendDeploy') {
        const message = method.slice(4);
        assert.equal(
          typeof connected.messages[message[0].toLowerCase() + message.slice(1)],
          'function',
          method,
        );
      }
    }
    assert.ok(connected.address.equals(address));
  }
});

test('generic builders use the destination, value and generated serializer without broadcasting', () => {
  let writes = 0;
  const client = new sdk.LaunchpadV2(() => ({
    internal: () => {
      writes++;
    },
  }));
  for (const [name, factory] of Object.entries(factories)) {
    const result = client[name](address).messages.topUpTons(123n, {});
    assert.equal(result.value, 123n);
    assert.ok(result.to.equals(address));
    assert.ok(result.body.equals(factory.createCellOfTopUpTons({})));
  }
  const args = { queryId: 42n, minJettonsOut: 123n };
  const tx = client.curve(address).messages.buyJettons(1_050_000_000n, args);
  assert.ok(tx.body.equals(sdk.BondingCurveV2.createCellOfBuyJettons(args)));
  assert.throws(() => client.curve(address).messages.buyJettons(-1n, args));
  assert.equal(writes, 0);
});

test('connected getters and senders bind the provider correctly', async () => {
  const calls = [];
  const provider = {
    get: async (method, args) => {
      calls.push([method, args]);
      return { stack: new TupleReader([{ type: 'int', value: 123n }]) };
    },
    internal: async (sender, message) => {
      calls.push([sender, message]);
    },
  };
  const client = new sdk.LaunchpadV2(() => provider);
  assert.equal(await client.curve(address).getProgressBps(), 123n);
  assert.equal(calls[0][0], 'get_progress_bps');
  const sender = { send: async () => {} };
  await client.collector(address).sendRetryCollectedFees(sender, 50_000_000n, { queryId: 42n });
  assert.equal(calls[1][0], sender);
  assert.ok(calls[1][1].body.equals(sdk.retryCollectedFees(address, 42n).body));
});

test('jetton data accepts off-chain and on-chain metadata without parsing it as the wrong format', async () => {
  for (const content of [
    sdk.offchainMetadata('https://example.com/token.json'),
    beginCell().storeUint(0, 8).storeDict(null).endCell(),
  ]) {
    for (const admin of [address, null]) {
      const provider = {
        get: async (method) => {
          assert.equal(method, 'get_jetton_data');
          return {
            stack: new TupleReader([
              { type: 'int', value: 123n },
              { type: 'int', value: admin ? -1n : 0n },
              { type: 'slice', cell: beginCell().storeAddress(admin).endCell() },
              { type: 'cell', cell: content },
              { type: 'cell', cell: Cell.EMPTY },
            ]),
          };
        },
      };
      const data = await new sdk.LaunchpadV2(() => provider).minter(address).getJettonData();
      assert.equal(data.totalSupply, 123n);
      assert.equal(data.mintable, admin !== null);
      assert.equal(data.adminAddress?.toRawString() ?? null, admin?.toRawString() ?? null);
      assert.ok(data.jettonContent.equals(content));
    }
  }
});

test('deployment carries matching StateInit through TON Connect and Sender', async () => {
  const tx = sdk.deployMaster(address, recipient);
  assert.equal(tx.value, 2_000_000_000n);
  assert.equal(tx.bounce, false);
  assert.ok(tx.to.equals(contractAddress(0, tx.init)));
  const request = sdk.toTonConnect(tx, {
    network: '-239',
    validUntil: Math.floor(Date.now() / 1000) + 300,
  });
  assert.equal(Address.parseFriendly(request.messages[0].address).isBounceable, false);
  const init = loadStateInit(Cell.fromBase64(request.messages[0].stateInit).beginParse());
  assert.ok(init.code.equals(tx.init.code));
  assert.ok(init.data.equals(tx.init.data));
  let sent;
  await sdk.sendTransaction(
    {
      send: async (args) => {
        sent = args;
      },
    },
    tx,
  );
  assert.equal(sent.init, tx.init);
  assert.equal(sent.bounce, false);
  assert.throws(() => sdk.deployment(sdk.BondingCurveV2.fromAddress(address), 1n, Cell.EMPTY));
});

test('transfer and burn preserve the requested amount, owner destination and payload', () => {
  const payload = beginCell().storeUint(123, 32).endCell();
  const tx = sdk.transferTokens({
    jettonWallet: address,
    recipient,
    responseAddress: address,
    tokenAmount: 100n,
    forwardPayload: payload,
  });
  const transfer = AskToTransfer.fromSlice(tx.body.beginParse());
  assert.equal(transfer.jettonAmount, 100n);
  assert.ok(transfer.transferRecipient.equals(recipient));
  assert.ok(beginCell().storeSlice(transfer.forwardPayload.value.ref).endCell().equals(payload));
  assert.equal(tx.value, 200_000_001n);
  const burn = AskToBurn.fromSlice(sdk.burnTokens(address, 100n, recipient).body.beginParse());
  assert.equal(burn.jettonAmount, 100n);
  assert.ok(burn.sendExcessesTo.equals(recipient));
  assert.throws(() => sdk.burnTokens(address, 0n, recipient));
  assert.throws(() =>
    sdk.transferTokens({
      jettonWallet: address,
      recipient,
      responseAddress: address,
      tokenAmount: 1n,
      walletGas: 0n,
    }),
  );
  assert.throws(() => sdk.changeTreasury(address, Address.parseRaw('-1:' + '11'.repeat(32))));
  assert.throws(() => sdk.withdrawProtocolFees(address, 0n));
});
