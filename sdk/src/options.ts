import { Address, Dictionary } from '@ton/core';
import { LaunchOptions, FeeBeneficiaries } from './generated/BondingCurveMasterV2.gen.js';

import { basechain, bps, coins } from './validation.js';

export const NANO = 1_000_000_000n;
export interface LaunchConfig {
  supplyTokens: 100_000_000 | 1_000_000_000 | 10_000_000_000;
  creatorFeeBps: 0 | 10 | 50 | 100 | 200;
  graduationTon?: 1000 | 2000 | 3000;
  reserveRatio?: 3 | 5 | 8;
  devBuyAmount?: bigint;
  minDevTokens?: bigint;
  minBuyBps?: number;
  maxBuyBps?: number;
  beneficiaries?: readonly { address: Address; shareBps: number }[];
  buybackBurn?: boolean;
}
export function launchOptions(config: LaunchConfig): LaunchOptions {
  const {
    supplyTokens,
    creatorFeeBps,
    graduationTon = 2000,
    reserveRatio = 5,
    devBuyAmount = 0n,
    minDevTokens = 0n,
    minBuyBps = 0,
    maxBuyBps = 0,
    beneficiaries,
    buybackBurn = false,
  } = config;
  if (
    ![100_000_000, 1_000_000_000, 10_000_000_000].includes(supplyTokens) ||
    ![0, 10, 50, 100, 200].includes(creatorFeeBps) ||
    ![1000, 2000, 3000].includes(graduationTon) ||
    ![3, 5, 8].includes(reserveRatio)
  )
    throw new Error('Invalid launch preset');
  bps(minBuyBps);
  bps(maxBuyBps);
  if (maxBuyBps !== 0 && minBuyBps >= maxBuyBps) throw new Error('Minimum must be below maximum');
  coins(devBuyAmount, 'dev buy');
  coins(minDevTokens, 'minimum dev tokens');
  const supply = BigInt(supplyTokens) * NANO;
  const threshold = BigInt(graduationTon) * NANO;
  const virtual = threshold / BigInt(reserveRatio);
  if (
    (supply * BigInt(minBuyBps) + 9999n) / 10000n >
    (virtual * supply) / (virtual + threshold) - supply / 10n
  )
    throw new Error('Minimum buy is incompatible with curve');
  if (buybackBurn && (beneficiaries !== undefined || creatorFeeBps === 0))
    throw new Error('Buyback requires creator fees and no beneficiaries');
  let recipients: LaunchOptions['beneficiaries'] = null;
  if (beneficiaries !== undefined) {
    if (beneficiaries.length < 1 || beneficiaries.length > 8)
      throw new Error('Expected 1 to 8 beneficiaries');
    const shares = Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.BigUint(16));
    let total = 0;
    for (const { address, shareBps } of beneficiaries) {
      basechain(address);
      bps(shareBps);
      if (shareBps === 0 || shares.has(address))
        throw new Error('Invalid or duplicate beneficiary');
      shares.set(address, BigInt(shareBps));
      total += shareBps;
    }
    if (total !== 10000) throw new Error('Shares must total 10000 bps');
    recipients = { ref: FeeBeneficiaries.create({ shares }) };
  }
  return LaunchOptions.create({
    supply,
    creatorFeeBps: BigInt(creatorFeeBps),
    devBuyAmount,
    minDevTokens,
    graduationThreshold: threshold,
    reserveRatio: BigInt(reserveRatio),
    minBuyBps: BigInt(minBuyBps),
    maxBuyBps: BigInt(maxBuyBps),
    beneficiaries: recipients,
    buybackBurn,
  });
}
export function minimumOutput(quote: bigint, slippageBps: number): bigint {
  coins(quote, 'quote');
  bps(slippageBps, 'slippage');
  const result = (quote * BigInt(10000 - slippageBps)) / 10000n;
  if (result === 0n) throw new Error('Minimum output must be positive');
  return result;
}
