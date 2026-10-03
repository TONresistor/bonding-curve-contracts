# V1 reference

Tokens trade on an `x*y=k` bonding curve. At 2,000 TON of real reserves, migration seeds a DeDust CPMM v2 pool and locks its initial liquidity. The creator can claim their share of pool fees.

## Contracts

| Contract | Role |
| --- | --- |
| [BondingCurveMaster](../../contracts/v1/BondingCurveMaster.tolk) | Launches, protocol fees and treasury |
| [BondingCurve](../../contracts/v1/BondingCurve.tolk) | Buys, sells and migration |
| [JettonMinter](../../contracts/v1/JettonMinter.tolk) | Initial supply and minting permissions |
| [JettonWallet](../../contracts/v1/JettonWallet.tolk) | Transfers and burns |

The repository's V1 wallet follows the pinned TON reference. Attribution and checksum are in [JettonWallet.upstream.json](../../contracts/v1/JettonWallet.upstream.json).

## Parameters

| Parameter           | Value                        |
| ------------------- | ---------------------------- |
| Initial supply      | 1 billion tokens, 9 decimals |
| Virtual TON reserve | 400 TON                      |
| Migration threshold | 2,000 TON                    |
| Curve fee           | 1%                           |
| Launch fee          | 0.2 TON                      |
| Migration fee       | 20 TON                       |

[Curve parameters](../../contracts/v1/bonding-config.tolk) | [DeDust configuration](../../contracts/v1/bonding-dedust.tolk) | [Scripts](../../scripts/v1/)

See [tests and historical results](../../tests/README.md#v1-reference). This documents the repository's V1 source, not a verification of deployed bytecode.

[Project](../../README.md) | [Changelog](../../CHANGELOG.md)
