import { Address } from '@ton/core';
import { FeeCollectorV2 } from './generated/FeeCollectorV2.gen.js';
import { connectContract, ProviderFactory, readJettonData } from './contracts.js';
import { BondingCurveV2 } from './generated/BondingCurveV2.gen.js';
import { BondingCurveMasterV2 } from './generated/BondingCurveMasterV2.gen.js';
import { JettonMinterV2 } from './generated/JettonMinterV2.gen.js';
import { JettonWalletV2 } from './generated/JettonWalletV2.gen.js';
import { FeeSplitterV2 } from './generated/FeeSplitterV2.gen.js';
import { BuybackBurnV2 } from './generated/BuybackBurnV2.gen.js';
import { LaunchConfig, launchOptions, minimumOutput } from './options.js';
import { basechain, coins, uint } from './validation.js';
import { buy, sell } from './operations/index.js';

export class LaunchpadV2 {
  constructor(private readonly provider: ProviderFactory) {}
  master(address: Address) {
    return connectContract(BondingCurveMasterV2, address, this.provider);
  }
  curve(address: Address) {
    return connectContract(BondingCurveV2, address, this.provider);
  }
  collector(address: Address) {
    return connectContract(FeeCollectorV2, address, this.provider);
  }
  splitter(address: Address) {
    return connectContract(FeeSplitterV2, address, this.provider);
  }
  buyback(address: Address) {
    return connectContract(BuybackBurnV2, address, this.provider);
  }
  wallet(address: Address) {
    return connectContract(JettonWalletV2, address, this.provider);
  }
  minter(address: Address) {
    const client = connectContract(JettonMinterV2, address, this.provider);
    const getJettonData = () => readJettonData(this.provider(address));
    return Object.assign(client, { getJettonData }) as Omit<typeof client, 'getJettonData'> & {
      getJettonData: typeof getJettonData;
    };
  }
  getLaunchStatus(curve: Address) {
    return this.curve(curve).getLaunchStatus();
  }
  getCurveData(curve: Address) {
    return this.curve(curve).getCurveData();
  }
  getFeeManagerAddress(curve: Address) {
    return this.curve(curve).getFeeManagerAddress();
  }
  getCollectorAddress(curve: Address) {
    return this.curve(curve).getCollectorAddress();
  }
  getBuybackAddress(curve: Address) {
    return this.curve(curve).getBuybackAddress();
  }
  getMaxSafeSell(curve: Address) {
    return this.curve(curve).getMaxSafeSell();
  }
  getLaunchPreview(master: Address, config: LaunchConfig) {
    return this.master(master).getLaunchPreview({ ref: launchOptions(config) });
  }
  getLaunchAddress(master: Address, creator: Address, salt: bigint, config: LaunchConfig) {
    return this.master(master).getLaunchAddress(basechain(creator), uint(salt, 64, 'salt'), {
      ref: launchOptions(config),
    });
  }
  quoteBuy(curve: Address, tonInGross: bigint) {
    return this.curve(curve).getQuoteBuy(coins(tonInGross, 'buy amount'));
  }
  quoteSell(curve: Address, tokens: bigint) {
    return this.curve(curve).getQuoteSell(coins(tokens, 'token amount'));
  }
  getFeeBalance(splitter: Address, owner: Address, protocol = false) {
    return this.splitter(splitter).getFeeBalance(owner, protocol);
  }
  getBuybackData(burner: Address) {
    return this.buyback(burner).getBuybackData();
  }
  async prepareBuy(curve: Address, tonInGross: bigint, slippageBps: number, queryId = 0n) {
    if ((await this.getLaunchStatus(curve)) !== 1n) throw new Error('Curve is not trading');
    const quote = await this.quoteBuy(curve, tonInGross);
    const minOutput = minimumOutput(quote, slippageBps);
    return { quote, minOutput, transaction: buy(curve, tonInGross, minOutput, queryId) };
  }
  async prepareSell(
    curve: Address,
    owner: Address,
    tokenAmount: bigint,
    slippageBps: number,
    queryId = 0n,
  ) {
    if ((await this.getLaunchStatus(curve)) !== 1n) throw new Error('Curve is not trading');
    const data = await this.getCurveData(curve);
    if (!data.jettonMinter) throw new Error('Minter is not initialized');
    const minter = this.minter(data.jettonMinter);
    const jettonWallet = await minter.getWalletAddress(basechain(owner));
    const curveWallet = await minter.getWalletAddress(curve);
    const minimumForward = await this.wallet(curveWallet).getMinSellNotification();
    const quote = await this.quoteSell(curve, tokenAmount);
    const minOutput = minimumOutput(quote, slippageBps);
    return {
      quote,
      minOutput,
      transaction: sell({
        jettonWallet,
        curve,
        owner,
        tokenAmount,
        minTonOut: minOutput,
        queryId,
        forwardTonAmount: minimumForward > 200_000_000n ? minimumForward : 200_000_000n,
      }),
    };
  }
}
