# Contributing to bonding-curve-contracts

Thank you for your interest in contributing. This document covers the dev workflow, style conventions, and PR process specific to this repo.

For a higher-level overview of the architecture, start with [`README.md`](./README.md) and [`SPEC.md`](./SPEC.md).

---

## Requirements

- [Acton CLI](https://ton-blockchain.github.io/acton/) 1.2.0 (`acton up 1.2.0`; installs Tolk compiler + emulator + test framework + script runner)
- TON mainnet RPC access (for `--fork-net mainnet` tests):
  - Free [TonCenter API key](https://t.me/tonapibot) is sufficient
  - Set in `.env`: `TONCENTER_MAINNET_API_KEY=...`
- Node.js 22+ (only for `wrappers-ts/` regeneration)

## Build

```bash
acton build           # compiles all 4 contracts (master + curve + minter + wallet)
acton check           # static analysis
acton fmt --check     # formatter dry-run
```

`acton build` regenerates `build/*.json` artifacts containing the compiled code BoC (base64). The `code_boc64` field is the deployable code cell; deploy scripts in `scripts/` load it when broadcasting the master.

## Test

```bash
# Sandbox tests (fast, no network)
acton test

# Filtered run
acton test --filter "graduate"

# Mainnet-fork tests (slow ~30s, uses real DeDust state)
acton test --fork-net mainnet
```

**Both gates must pass before merging.** 117 tests across 13 files cover:

- AMM math (buy/sell/slippage, k-invariant, dust edge cases)
- State machine transitions (TRADING → FROZEN → GRADUATING → MIGRATED)
- Bounce handlers (4 outbound types with restoration logic)
- Master admin ops + governance
- Audit regressions (H2 / M8 / M9, see [`tests/regression-*.tolk`](./tests/))
- Stress / fuzz tests (100 + 80 + 50 runs with random seeds)
- TEP-74 / TEP-89 wallet behavior
- Gas budget invariants

### Live mainnet testing

The existing sandbox and fork-mainnet tests do not register the DeDust libraries;
their graduation checks validate outbound messages or inject a pool callback.
For a complete emulated migration, run `acton run simulate-migration`. This loads
the real Pool, Deposit, and Position libraries and verifies the actual handshake,
pool reserves, token supply conservation, and fully locked LP position.

For changes that touch the Graduate flow or DeDust integration, **live mainnet
validation is still required**: deploy a scaled mini-master (e.g. `V=2, T=8`)
under a test wallet, execute a real graduation, and verify the pool is seeded.

Two scripts to help:

```bash
acton run demo-full-flow            # sandbox happy path
acton run demo-graduation-reachable # sandbox graduate flow
```

For a fresh mini-master live test, deploy a scaled variant (e.g. V=2, T=8, MIG=1) to mainnet from a fork and exercise the full buy → threshold → Phase A → handshake → Phase B → seed flow against real DeDust state.

---

## Style guide

### Tolk idiomatic patterns

Follow the patterns from the [Tolk documentation](https://docs.ton.org/tolk/idioms-conventions) and [SPEC §3](./SPEC.md#3-storage-layouts):

- Use `struct (0x...) MessageName { ... }` for opcode-bearing message bodies.
- Use `type AllowedMessage = A | B | C` union with `match` dispatch for known inbound families.
- Use `lazy Storage.load()` in handlers; reuse across branches in the same `onInternalMessage`.
- Use `createMessage({ ... })` with typed `body` instead of manual builder cells.
- Use `BounceMode` explicitly on every outbound: `NoBounce` for fire-and-forget, `Only256BitsOfBody` for low-cost recovery (reorder fields if recovery needs more than 256 bits), `RichBounce` only when needed.
- Use fixed-width numeric types (`uint8`, `uint64`, `int32`, `coins`) inside serialized structs.
- Use methods (`fun Type.method(self)`) to avoid global-name collisions and keep behavior near the data shape.
- **Avoid assembler functions and micro-optimizations** unless a measured constraint requires them.
- `onBouncedMessage` MUST NEVER throw (bounces don't bounce). Unknown opcodes silently no-op (`else => {}`).

### Storage layout discipline

`BondingCurveStorage` and `MasterStorage` shapes are **load-bearing**: every change ripples to `get_*_data` getters, every test fixture, every external indexer.

- **Do NOT change the field order or types** of `BondingCurveStorage` or `MasterStorage` without a major version bump.
- **Do NOT add fields between existing ones**. New fields go at the END (in front of the `config: Cell<>` ref for `BondingCurveStorage`).
- If you absolutely need to change the shape, the migration plan must:
  - Bump `get_version()` major (or minor with explicit storage-migration commit).
  - Document the migration in `CHANGELOG.md` with a "Migration notes" section for forks.
  - Add a `regression-*-storage-migration.test.tolk` proving the old → new shape transition.

### Frontend / wrappers compatibility

The TypeScript wrappers in `wrappers-ts/*.gen.ts` are auto-generated from Tolk struct definitions. They include the compiled code BoC inline.

- When you change a Tolk struct that is also a message body, `acton build` regenerates the wrapper. Verify the diff.
- When you change a contract's compiled code, the wrapper's embedded `CodeCell` changes. Off-chain users of the wrapper (e.g. frontend, SDK) will deploy a different contract. Use `overrideContractCode` in `DeployedAddrOptions` if you need to deploy a different binary than the wrapper's embedded one (used by mini-master test deploys).

### Comments

Apply the project's "no slop" rule strictly. Comments earn their existence:

- Lead with WHY, not WHAT. The `match` arm name says what; comment says why this code is here.
- Include a `Why:` / `How to apply:` structure when documenting a non-obvious invariant.
- Don't write a comment that says "see SPEC.md". Link the SPEC section instead: `// see SPEC §6.2 for the timing-race fix`.
- **No em-dash** in copy / comments. Use a colon, a comma, or just a separator word.

### Formatting

```bash
acton fmt              # apply formatter
acton fmt --check      # CI gate
```

If you encounter a formatter quirk that produces something unidiomatic, file an issue rather than working around it in code.

---

## PR process

1. **Fork + branch**: branch off `main` with a descriptive name (`fix-graduate-timing`, `feat-creator-fee-claim-event`).
2. **Test before pushing**:
   ```bash
   acton build && acton check && acton fmt --check && acton test && acton test --fork-net mainnet
   ```
3. **Open a PR** with:
   - A clear summary linking to any related issue.
   - A "Tests" section confirming both gates pass.
   - A "Migration notes" section if the change affects storage or ABI.
4. **Squash-merge or rebase-merge** to keep the history linear.

### PR template

```markdown
## Summary

What does this change do, and why?

## Tests

- [ ] `acton build` clean
- [ ] `acton check` clean
- [ ] `acton fmt --check` clean
- [ ] `acton test` passes
- [ ] `acton test --fork-net mainnet` passes
- [ ] (if Graduate or DeDust path touched) live mainnet mini-master validation: link the chain trace

## Migration notes

(if storage / ABI changed) How do forks adopt this? Any DB / indexer changes required on the off-chain side?

## SPEC update

(if architectural change) Which SPEC section needs updating?
```

### What we look for in review

- Test coverage proportional to the change. New opcodes need new tests in the relevant `tests/*.test.tolk`.
- No silent behavior changes. If the diff alters a path that an indexer or frontend depends on, mention it explicitly.
- Bounce-safety: any new outbound that can bounce must be in `BounceableOutboundOps` (or have an explicit comment explaining why it doesn't).
- Auth model preservation. New handlers must check `sender ==` the expected counterparty.

### Things we will reject (without prejudice)

- Renaming things just for taste.
- Reordering struct fields without a storage migration plan.
- Adding admin-only ops without a security rationale.
- Removing tests without a replacement.
- Code that "should work" but isn't tested (especially Graduate / DeDust paths, where the only reliable validation is mainnet).

---

## Architecture decisions log

The "locked decisions" section in [SPEC §11](./SPEC.md#11-locked-design-decisions-do-not-relitigate) lists positions the project has taken and won't revisit without strong cause. Examples:

- 90% / 10% supply split (no negotiation)
- 1B fixed supply, 9 decimals
- LP 100% locked permanently
- 100% post-grad creator fee to creator (no protocol split)
- No multisig admin in dev phase
- DeDust v2 mainnet-only

If your PR conflicts with these, expect pushback. Open an issue first to discuss the rationale.

---

## Reporting bugs (non-security)

For non-security bugs, open a GitHub issue with:

- Affected version (master `get_version()` if mainnet) or branch.
- Minimal reproduction: Tolk test, chain trace, or `acton run` command sequence.
- Expected vs actual behavior.

For security vulnerabilities, see [`SECURITY.md`](./SECURITY.md).

---

## Code of conduct

Be respectful. We work in public to demonstrate good engineering, and that includes how we treat each other. Disagreement is fine; personal attacks aren't.

---

## Recognition

Significant contributors will be acknowledged in [`CHANGELOG.md`](./CHANGELOG.md). For now there is no formal bounty program (see [SECURITY §3](./SECURITY.md#bug-bounty)).

---

## Questions

For architecture questions: read [`SPEC.md`](./SPEC.md), then open an issue tagged `question`.

For ops / deploy: see the deployment section of [`README.md`](./README.md) and the scripts in `scripts/`.

For SDK / wrappers usage: the auto-generated wrappers in `wrappers-ts/` are documented inline. A higher-level SDK is on the roadmap.
