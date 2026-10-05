import { Address, beginCell } from '@ton/core';
import { BondingCurveV2 as Curve, BuyJettons } from '../generated/BondingCurveV2.gen.js';
import { AskToTransfer, PayloadInline } from '../generated/JettonWalletV2.gen.js';
import { basechain, coins } from '../validation.js';
import { query, queryOperation, transaction, Transaction } from '../transport.js';

const SELL_WALLET_GAS = 50_000_000n;

export function buy(
  curve: Address,
  tonInGross: bigint,
  minTokensOut: bigint,
  queryId = 0n,
): Transaction {
  coins(tonInGross, 'buy amount');
  coins(minTokensOut, 'minimum tokens');
  if (tonInGross < 10_000_000n || minTokensOut === 0n)
    throw new Error('Buy requires at least 0.01 TON and a positive minimum output');
  return transaction(
    curve,
    tonInGross + 50_000_000n,
    BuyJettons.toCell(BuyJettons.create({ ...query(queryId), minJettonsOut: minTokensOut })),
  );
}
export function sell(args: {
  jettonWallet: Address;
  curve: Address;
  owner: Address;
  tokenAmount: bigint;
  minTonOut: bigint;
  queryId?: bigint;
  forwardTonAmount?: bigint;
  walletGas?: bigint;
}): Transaction {
  const {
    jettonWallet,
    curve,
    owner,
    tokenAmount,
    minTonOut,
    queryId = 0n,
    forwardTonAmount = 200_000_000n,
    walletGas = SELL_WALLET_GAS,
  } = args;
  coins(tokenAmount, 'token amount');
  coins(minTonOut, 'minimum TON');
  coins(forwardTonAmount, 'forward TON');
  coins(walletGas, 'wallet gas');
  if (
    tokenAmount === 0n ||
    minTonOut === 0n ||
    forwardTonAmount < 200_000_000n ||
    walletGas < SELL_WALLET_GAS
  )
    throw new Error('Invalid sell amount or gas budget');
  const payload = beginCell()
    .storeUint(0xa0a0a020, 32)
    .storeUint(query(queryId).queryId, 64)
    .storeCoins(minTonOut)
    .endCell();
  return transaction(
    jettonWallet,
    forwardTonAmount + walletGas,
    AskToTransfer.toCell(
      AskToTransfer.create({
        ...query(queryId),
        jettonAmount: tokenAmount,
        transferRecipient: basechain(curve),
        sendExcessesTo: basechain(owner),
        customPayload: null,
        forwardTonAmount,
        forwardPayload: PayloadInline.create({ value: payload.beginParse() }),
      }),
    ),
  );
}

export const flushFees = queryOperation(50_000_000n, Curve.createCellOfFlushFees);
export const graduate = queryOperation(100_000_000n, Curve.createCellOfGraduate);
export const retryMigration = queryOperation(500_000_000n, Curve.createCellOfRetryMigration);
export const confirmMigration = queryOperation(100_000_000n, Curve.createCellOfConfirmMigration);
