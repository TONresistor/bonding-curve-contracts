import { Address } from '@ton/core';
import { BondingCurveV2 as Curve } from '../generated/BondingCurveV2.gen.js';
import { FeeCollectorV2 as Collector } from '../generated/FeeCollectorV2.gen.js';
import { FeeSplitterV2 as Splitter } from '../generated/FeeSplitterV2.gen.js';
import { positiveCoins } from '../validation.js';
import { query, queryOperation, transaction } from '../transport.js';

export const flushCreatorFees = queryOperation(50_000_000n, Curve.createCellOfFlushCreatorFees);
export const collectPoolFees = queryOperation(400_000_000n, Collector.createCellOfCollectPoolFees);
export const retryCollectedFees = queryOperation(
  50_000_000n,
  Collector.createCellOfRetryCollectedFees,
);

export function sweepCollectedTokens(collector: Address, tokenAmount: bigint, queryId = 0n) {
  return transaction(
    collector,
    400_000_000n,
    Collector.createCellOfSweepCollectedTokens({
      ...query(queryId),
      amount: positiveCoins(tokenAmount, 'Token amount'),
    }),
  );
}

export function claimFees(splitter: Address, protocol = false, queryId = 0n) {
  return transaction(
    splitter,
    200_000_000n,
    Splitter.createCellOfClaimSplitFees({ ...query(queryId), protocol }),
  );
}
