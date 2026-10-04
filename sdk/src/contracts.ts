import { Address, Cell, Contract, ContractProvider, OpenedContract, openContract } from '@ton/core';
import { basechain } from './validation.js';
import { Transaction, transaction } from './transport.js';

export type ProviderFactory = (address: Address) => ContractProvider;
export type MessageBuilders<F> = {
  [K in keyof F as K extends `createCellOf${infer Name}`
    ? Uncapitalize<Name>
    : never]: F[K] extends (...args: infer A) => Cell
    ? (value: bigint, ...args: A) => Transaction
    : never;
};

type Factory = { fromAddress(address: Address): Contract };
export type ContractClient<F extends Factory> = OpenedContract<ReturnType<F['fromAddress']>> & {
  messages: MessageBuilders<F>;
};

export function contractMessages<F extends Factory>(
  factory: F,
  address: Address,
): MessageBuilders<F> {
  basechain(address);
  const builders: Record<string, (value: bigint, ...args: unknown[]) => Transaction> = {};
  for (const key of Object.getOwnPropertyNames(factory)) {
    if (!key.startsWith('createCellOf')) continue;
    const name = key.slice('createCellOf'.length);
    const serialize = Reflect.get(factory, key) as (...args: unknown[]) => Cell;
    builders[name[0].toLowerCase() + name.slice(1)] = (value, ...args) =>
      transaction(address, value, serialize(...args));
  }
  return builders as MessageBuilders<F>;
}

export function connectContract<F extends Factory>(
  factory: F,
  address: Address,
  provider: ProviderFactory,
): ContractClient<F> {
  const contract = factory.fromAddress(basechain(address)) as ReturnType<F['fromAddress']>;
  return Object.assign(
    openContract(contract, () => provider(address)),
    {
      messages: contractMessages(factory, address),
    },
  );
}

export function readJettonData(provider: ContractProvider) {
  return provider.get('get_jetton_data', []).then(({ stack }) => ({
    totalSupply: stack.readBigNumber(),
    mintable: stack.readBoolean(),
    adminAddress: stack.readAddressOpt(),
    jettonContent: stack.readCell(),
    jettonWalletCode: stack.readCell(),
  }));
}
