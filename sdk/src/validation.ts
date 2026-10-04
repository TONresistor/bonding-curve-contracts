import { Address } from '@ton/core';

export function uint(value: bigint, bits: number, name: string): bigint {
  if (typeof value !== 'bigint' || value < 0n || value >= 1n << BigInt(bits))
    throw new Error(`Invalid ${name}`);
  return value;
}
export function coins(value: bigint, name: string): bigint {
  return uint(value, 120, name);
}
export function basechain(address: Address): Address {
  if (address.workChain !== 0) throw new Error('Expected a basechain address');
  return address;
}
export function bps(value: number, name = 'bps'): number {
  if (!Number.isInteger(value) || value < 0 || value > 10000) throw new Error(`Invalid ${name}`);
  return value;
}

export function positiveCoins(value: bigint, name: string): bigint {
  coins(value, name);
  if (value === 0n) throw new Error(`${name} must be positive`);
  return value;
}
