# Contributing

Use Acton **1.2.0** and Python **3.9+**. Start with [README.md](README.md).

## Layout

Contracts, tests and scripts are grouped under `v1/` and `v2/`. Shared test helpers and the simulation runner live under `shared/`. Version guides are in `docs/v1/` and `docs/v2/`; test instructions are in `tests/README.md`. Keep V1 changes separate from V2 work.

## Checks

Run the same checks as CI:

```sh
acton build BondingCurveMasterV2
acton fmt --check contracts/v2 scripts/v2 tests/v2 wrappers/*V2.gen.tolk
for source in contracts/v2/*.tolk; do
  acton check "$source" --output-format github
done
python3 scripts/shared/run-market-simulation.py v2 --prepare-only
acton test tests/v2
acton run v2-simulation -- --offline
```

The preparation command downloads pinned DeDust libraries for tests and simulations. Add `-- --offline` once cached. See [test instructions](tests/README.md) for replay and fork options. Broadcasting with `--net` spends real funds and requires explicit deployment approval.

For SDK-only changes (contracts and ABI unchanged):

```sh
npm ci --prefix sdk
npm run check:wrappers --prefix sdk
npm run format:check --prefix sdk
python3 scripts/shared/run-market-simulation.py v2 --prepare-only
npm test --prefix sdk
(cd sdk && npm pack --dry-run)
```

Requires Node.js 22+. The SDK job runs these checks separately from contract simulations.

## Changes

- Use typed Tolk storage, messages and maps. Test changed behavior, authorization, refunds and relevant message ordering.
- Treat storage layouts, opcodes and generated addresses as public interfaces. Existing deployments have no code-upgrade handler.
- Keep the V1 reference wallet identical to its pinned source.
- Keep comments short and explain only non-obvious behavior. No em dashes.
- Explain behavior changes and validation in the PR. Update the existing changelog when needed.

## Wrappers

After ABI or code changes, regenerate affected wrappers and those embedding changed dependencies:

```sh
acton wrapper BondingCurveV2
acton wrapper BondingCurveV2 --ts
```

TypeScript generation requires Node.js. Check the generated diff and embedded `CodeCell`; `acton build` alone does not regenerate TypeScript wrappers.

For bugs, include the affected version, expected behavior and an Acton reproduction or transaction trace.
