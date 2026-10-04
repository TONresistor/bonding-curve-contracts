import {
  Address,
  Cell,
  Contract,
  Sender,
  SendMode,
  StateInit,
  beginCell,
  storeStateInit,
} from '@ton/core';
import { basechain, coins, positiveCoins, uint } from './validation.js';

export interface Transaction {
  to: Address;
  value: bigint;
  body: Cell;
  bounce: boolean;
  init?: StateInit;
}

export function transaction(to: Address, value: bigint, body: Cell): Transaction {
  return { to: basechain(to), value: coins(value, 'message value'), body, bounce: true };
}

export function deployment(contract: Contract, value: bigint, body: Cell): Transaction {
  if (!contract.init) throw new Error('Deployment requires StateInit');
  return {
    ...transaction(contract.address, positiveCoins(value, 'deployment value'), body),
    bounce: false,
    init: contract.init,
  };
}

export function query(queryId: bigint) {
  return { queryId: uint(queryId, 64, 'query id') };
}

export function queryOperation(value: bigint, serialize: (body: { queryId: bigint }) => Cell) {
  return (to: Address, queryId = 0n) => transaction(to, value, serialize(query(queryId)));
}

export function sendTransaction(sender: Sender, tx: Transaction): Promise<void> {
  return sender.send({ ...tx, sendMode: SendMode.PAY_GAS_SEPARATELY });
}

export function toTonConnect(
  tx: Transaction,
  options: { validUntil: number; network: '-239' | '-3'; from?: Address },
) {
  if (
    !Number.isSafeInteger(options.validUntil) ||
    options.validUntil <= Math.floor(Date.now() / 1000)
  )
    throw new Error('Expiry must be a future Unix timestamp');
  if (!['-239', '-3'].includes(options.network)) throw new Error('Invalid network');
  return {
    validUntil: options.validUntil,
    network: options.network,
    ...(options.from ? { from: options.from.toRawString() } : {}),
    messages: [
      {
        address: tx.to.toString({ bounceable: tx.bounce, testOnly: options.network === '-3' }),
        amount: tx.value.toString(),
        payload: tx.body.toBoc().toString('base64'),
        ...(tx.init
          ? {
              stateInit: beginCell()
                .store(storeStateInit(tx.init))
                .endCell()
                .toBoc()
                .toString('base64'),
            }
          : {}),
      },
    ],
  };
}
