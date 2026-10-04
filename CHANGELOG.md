# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

## [Unreleased]

- V2 TypeScript SDK: all contract methods, transaction builders, admin/jetton helpers and TON Connect.

- V2: dev buy, supply/fee presets, configurable curves and optional buy limits in % of initial supply.
- Shared curve/DeDust fee manager: up to 8 fixed beneficiaries or permissionless buyback & burn.
- Confirmed migration, delivery receipts and token returns for underfunded or malformed sells.
- Launch initialization event, readable statuses, explicit gross/net trade logs and a migration-start flag.
- Basechain-only protocol treasury, calibrated V2 wallet storage reserves and confirmed admin removal.
- 53 V2 tests, 543 migration simulations and 2 finalization checks.

## [1.0.0] (2026-05-19)

Initial public release.

### Added: protocol

- Bonding-curve launchpad: permissionless memecoin creation, `x*y=k` AMM, auto-graduation to DeDust CPMM v2.
- 100% LP lock at graduation; 1% creator fee routed to the launch creator for life.
- TEP-74 / TEP-89 / TEP-64 conformant jetton minter + wallet.
- 2-phase Graduate (Phase A flips state, Phase B seeds the pool on the async callback).
- Auto-generated Tolk + TypeScript wrappers (`wrappers/`, `wrappers-ts/`) for off-chain integration. The TypeScript SDK ships separately as `bonding-curve-sdk`.
