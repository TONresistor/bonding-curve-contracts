import { Address, beginCell, Dictionary } from '@ton/core';
import { BondingCurveMasterV2 as Master } from '../generated/BondingCurveMasterV2.gen.js';
import { LaunchConfig, launchOptions, NANO } from '../options.js';
import { basechain, uint } from '../validation.js';
import { deployment, query, transaction, Transaction } from '../transport.js';

export function createLaunch(
  master: Address,
  config: LaunchConfig,
  metadataUri: string,
  salt: bigint,
  queryId = 0n,
): Transaction {
  const options = launchOptions(config);
  return transaction(
    master,
    options.devBuyAmount + NANO,
    Master.createCellOfCreateLaunch({
      ...query(queryId),
      salt: uint(salt, 64, 'salt'),
      options: { ref: options },
      metadata: offchainMetadata(metadataUri),
    }),
  );
}

export function offchainMetadata(uri: string) {
  if (!uri.trim()) throw new Error('Metadata URI is required');
  return beginCell().storeUint(1, 8).storeRef(beginCell().storeStringTail(uri).endCell()).endCell();
}

export function deployMaster(admin: Address, treasury: Address, value = 2n * NANO) {
  const contract = Master.fromStorage({
    admin: basechain(admin),
    nextAdmin: null,
    treasury: basechain(treasury),
    totalLaunches: 0n,
    feesBalance: 0n,
    launches: Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.BigUint(2)),
  });
  return deployment(contract, value, Master.createCellOfTopUpTons({}));
}
