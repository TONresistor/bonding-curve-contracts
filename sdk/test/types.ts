import { Address, Cell, Sender } from '@ton/core';
import {
  LaunchpadV2,
  MessageBuilders,
  BondingCurveV2,
  toTonConnect,
  buy,
  contractMessages,
} from '../src/index.js';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type BuyBody = Parameters<MessageBuilders<typeof BondingCurveV2>['buyJettons']>[1];
export type PreservedBuyBody = Assert<
  Equal<BuyBody, Parameters<typeof BondingCurveV2.createCellOfBuyJettons>[0]>
>;
export type PreservedQueryType = Assert<Equal<BuyBody['queryId'], bigint>>;
export type PreservedOutput = Assert<
  Equal<
    Awaited<ReturnType<ReturnType<LaunchpadV2['minter']>['getJettonData']>>['jettonContent'],
    Cell
  >
>;

export function integration(sdk: LaunchpadV2, address: Address, sender: Sender) {
  sdk.curve(address).getFeeRates();
  sdk.curve(address).getMigrationData();
  sdk
    .master(address)
    .sendChangeTreasury(sender, 50_000_000n, { queryId: 0n, newTreasury: address });
  sdk.wallet(address).messages.askToBurn(200_000_000n, {
    queryId: 0n,
    jettonAmount: 100n,
    sendExcessesTo: address,
    customPayload: null,
  });
  sdk
    .minter(address)
    .getJettonData()
    .then((data) => data.jettonContent.beginParse());
  contractMessages(BondingCurveV2, address).buyJettons(1_050_000_000n, {
    queryId: 0n,
    minJettonsOut: 1n,
  });
  toTonConnect(buy(address, 1_000_000_000n, 1n), { validUntil: 9999999999, network: '-239' });
}
