# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

## [1.0.0] (2026-05-19)

Initial public release.

### Added: protocol

- Bonding-curve launchpad: permissionless memecoin creation, `x*y=k` AMM, auto-graduation to DeDust CPMM v2.
- 100% LP lock at graduation; 1% creator fee routed to the launch creator for life.
- TEP-74 / TEP-89 / TEP-64 conformant jetton minter + wallet.
- 2-phase Graduate (Phase A flips state, Phase B seeds the pool on the async callback).
- Auto-generated Tolk + TypeScript wrappers (`wrappers/`, `wrappers-ts/`) for off-chain integration. The TypeScript SDK ships separately as `bonding-curve-sdk`.