import { Address } from '@ton/core';
import { BondingCurveMasterV2 as Master } from '../generated/BondingCurveMasterV2.gen.js';
import { LaunchConfig, launchOptions } from '../options.js';
import { basechain, positiveCoins, uint } from '../validation.js';
import { query, queryOperation, transaction } from '../transport.js';
import { offchainMetadata } from './launch.js';

export const claimMasterAdmin = queryOperation(50_000_000n, Master.createCellOfClaimMasterAdmin);

export function changeMasterAdmin(master: Address, newAdmin: Address, queryId = 0n) {
  return transaction(
    master,
    50_000_000n,
    Master.createCellOfChangeMasterAdmin({ ...query(queryId), newAdmin: basechain(newAdmin) }),
  );
}

export function changeTreasury(master: Address, newTreasury: Address, queryId = 0n) {
  return transaction(
    master,
    50_000_000n,
    Master.createCellOfChangeTreasury({ ...query(queryId), newTreasury: basechain(newTreasury) }),
  );
}

export function withdrawProtocolFees(master: Address, amount: bigint, queryId = 0n) {
  return transaction(
    master,
    100_000_000n,
    Master.createCellOfWithdrawProtocolFees({
      ...query(queryId),
      amount: positiveCoins(amount, 'withdrawal amount'),
    }),
  );
}

export function reinitializeCurve(
  master: Address,
  creator: Address,
  salt: bigint,
  config: LaunchConfig,
  metadataUri: string,
  queryId = 0n,
) {
  return transaction(
    master,
    1_000_000_000n,
    Master.createCellOfReinitializeCurve({
      ...query(queryId),
      creator: basechain(creator),
      salt: uint(salt, 64, 'salt'),
      options: { ref: launchOptions(config) },
      metadata: offchainMetadata(metadataUri),
    }),
  );
}
