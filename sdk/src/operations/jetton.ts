import { Address, Cell } from '@ton/core';
import { JettonWalletV2 as Wallet, PayloadInRef } from '../generated/JettonWalletV2.gen.js';
import { basechain, coins, positiveCoins } from '../validation.js';
import { query, transaction } from '../transport.js';

export function transferTokens(args: {
  jettonWallet: Address;
  recipient: Address;
  responseAddress: Address;
  tokenAmount: bigint;
  queryId?: bigint;
  forwardTonAmount?: bigint;
  forwardPayload?: Cell;
  walletGas?: bigint;
}) {
  const {
    jettonWallet,
    recipient,
    responseAddress,
    tokenAmount,
    queryId = 0n,
    forwardTonAmount = 1n,
    forwardPayload = Cell.EMPTY,
    walletGas = 200_000_000n,
  } = args;
  coins(forwardTonAmount, 'forward TON');
  if (coins(walletGas, 'wallet gas') < 200_000_000n) throw new Error('Insufficient wallet gas');
  return transaction(
    jettonWallet,
    forwardTonAmount + walletGas,
    Wallet.createCellOfAskToTransfer({
      ...query(queryId),
      jettonAmount: positiveCoins(tokenAmount, 'token amount'),
      transferRecipient: basechain(recipient),
      sendExcessesTo: basechain(responseAddress),
      customPayload: null,
      forwardTonAmount,
      forwardPayload: PayloadInRef.create({ value: { ref: forwardPayload.beginParse() } }),
    }),
  );
}

export function burnTokens(
  jettonWallet: Address,
  tokenAmount: bigint,
  responseAddress: Address,
  queryId = 0n,
) {
  return transaction(
    jettonWallet,
    200_000_000n,
    Wallet.createCellOfAskToBurn({
      ...query(queryId),
      jettonAmount: positiveCoins(tokenAmount, 'token amount'),
      sendExcessesTo: basechain(responseAddress),
      customPayload: null,
    }),
  );
}
