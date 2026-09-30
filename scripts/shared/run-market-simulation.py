#!/usr/bin/env python3
"""Run deterministic, emulation-only market campaigns with replayable artifacts."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
LIBRARIES = {
    "pool": "6045e67b617e73486aac445cfcad0dbead6d315ccc8f4aede3f2e23ad14da4b0",
    "deposit": "2cac3fddd30969d08df036067108c6e7d69780a9459d931d2eb63d95d5ff6825",
    "position": "dd82f24db614798ee7c579f8b3f07f0645d06d65cede368d80d0d74b180d2dd6",
}


def fingerprint():
    files = [ROOT / "Acton.toml", Path(__file__), ROOT / "scripts/v1/simulate-market.tolk"]
    files += sorted((ROOT / "contracts").rglob("*.tolk"))
    files += sorted((ROOT / "tests").rglob("*.tolk"))
    files += [ROOT / "scripts/v2/simulate-migration.tolk"]
    files += [ROOT / "wrappers/utils.tolk"]
    files += sorted((ROOT / "wrappers").glob("*.gen.tolk"))
    return {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("profile", choices=["quick", "campaign", "replay", "v2"])
    parser.add_argument("--seed", type=int, default=20260930)
    parser.add_argument("--operations", type=int)
    parser.add_argument("--actors", type=int)
    parser.add_argument("--seeds", type=int)
    parser.add_argument("--offline", action="store_true", help="Fail if a library is not cached")
    parser.add_argument("--fork-block", type=int, help="Read mainnet at this explicit block; no broadcasting")
    parser.add_argument("--output", type=Path, help="Artifact directory; must be inside this repository")
    args = parser.parse_args()
    count = args.seeds if args.seeds is not None else (20 if args.profile == "campaign" else 1)
    operations = args.operations if args.operations is not None else (10 if args.profile == "v2" else 500 if args.profile == "campaign" else 200)
    actors = args.actors if args.actors is not None else (50 if args.profile == "campaign" else 10)
    if not (1 <= count <= 100 and 1 <= operations <= 10000 and 4 <= actors <= 100
            and 0 <= args.seed < 2**32 - count):
        parser.error("Use 1..100 seeds, 1..10000 operations, 4..100 actors and a uint32 seed")
    if args.offline and args.fork_block:
        parser.error("--offline cannot use an RPC fork")
    version = subprocess.check_output(["acton", "--version"], cwd=ROOT, text=True).strip()
    if not re.match(r"acton 1\.2\.0(?:\s|$)", version):
        parser.error("This campaign requires Acton 1.2.0")
    output = (args.output or ROOT / "build/market-simulation" / f"{args.profile}-{args.seed}").resolve()
    if ROOT not in output.parents:
        parser.error("--output must be inside the repository")
    output.mkdir(parents=True, exist_ok=True)
    (ROOT / "build/market-simulation").mkdir(parents=True, exist_ok=True)
    library_dir = ROOT / "build/cache/market-libraries"
    library_dir.mkdir(parents=True, exist_ok=True)
    for name, lib_hash in LIBRARIES.items():
        target = library_dir / f"{name}.boc"
        if target.exists():
            continue  # The Tolk harness verifies the actual cell hash on every run.
        if args.offline:
            parser.error(f"Missing {target}; run once without --offline")
        temporary = target.with_suffix(".download.boc")
        for attempt in range(3):
            fetched = subprocess.run(["acton", "library", "fetch", lib_hash, "--net", "mainnet",
                                      "--output", str(temporary)], cwd=ROOT)
            if fetched.returncode == 0:
                break
            if attempt == 2:
                raise RuntimeError(f"Cannot fetch public DeDust {name} library")
            time.sleep(2 ** (attempt + 1))
        temporary.replace(target)
    manifest = {
        "acton": version, "timestamp": 1801267200, "seed_start": args.seed,
        "seeds": count, "operations_per_seed": operations, "actors": actors,
        "fork_block": args.fork_block, "library_cell_hashes": LIBRARIES,
        "library_boc_sha256": {name: hashlib.sha256((library_dir / f"{name}.boc").read_bytes()).hexdigest()
                               for name in LIBRARIES},
        "source_sha256": fingerprint(), "runs": [],
    }
    manifest_path = output / "report.json"
    for seed in range(args.seed, args.seed + count):
        if fingerprint() != manifest["source_sha256"]:
            raise RuntimeError("Simulation sources changed during the campaign; start a fresh run")
        command = ["acton", "script"]
        if args.fork_block:
            command += ["--fork-net", "mainnet", "--fork-block-number", str(args.fork_block)]
        if args.profile == "v2":
            command += ["scripts/v2/simulate-migration.tolk", str(operations)]
        else:
            command += ["scripts/v1/simulate-market.tolk", str(seed), str(operations), str(actors)]
        log = output / f"seed-{seed}.log"
        snapshot = ROOT / "build/market-simulation" / f"failure-{seed}.json"
        snapshot.unlink(missing_ok=True)
        start = time.monotonic()
        with log.open("w") as stream:
            result = subprocess.run(command, cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT,
                                    env={**os.environ, "NO_COLOR": "1"})
        contents = log.read_text()
        metrics = dict(re.findall(r"^METRIC (\w+) (\S+)$", contents, re.MULTILINE))
        marker = "V2_MATRIX_PASS scenarios=540 presets=135 wallets=10" if args.profile == "v2" else "MARKET_PASS"
        passed = result.returncode == 0 and marker in contents and "MARKET_FAIL" not in contents
        if args.profile == "v2":
            cases = re.findall(r"^V2_PASS (.*)$", contents, re.MULTILINE)
            metrics = {"scenarios": len(cases), "presets": 135, "migrations": len(cases), "cases": cases}
            finalizations = re.findall(r"^FINALIZATION_PASS mode=(\d+)$", contents, re.MULTILINE)
            metrics["finalization_checks"] = len(finalizations)
            passed = passed and len(cases) == 540 and sorted(finalizations) == ["0", "1"]
        run = {"seed": seed, "passed": passed, "exit_code": result.returncode,
               "seconds": round(time.monotonic() - start, 3), "metrics": metrics,
               "log": str(log.relative_to(ROOT)), "command": command,
               "last_step": (re.findall(r"^STEP \d+ (\d+)", contents, re.MULTILINE) or [None])[-1],
               "snapshot": str(snapshot.relative_to(ROOT)) if snapshot.exists() else None}
        manifest["runs"].append(run)
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
        if args.profile == "v2":
            print(f"V2 {'PASS' if passed else 'FAIL'} scenarios={metrics['scenarios']} "
                  f"finalization={metrics['finalization_checks']}", flush=True)
        else:
            print(f"seed={seed} {'PASS' if passed else 'FAIL'} tx={metrics.get('transactions', '?')} "
                  f"claims={metrics.get('claims', '?')}", flush=True)
        if not passed:
            print("\n".join(contents.splitlines()[-35:]), file=sys.stderr)
            profile = "v2" if args.profile == "v2" else "replay"
            print(f"Replay: python3 scripts/shared/run-market-simulation.py {profile} --seed {seed} "
                  f"--operations {operations} --actors {actors}" +
                  (f" --fork-block {args.fork_block}" if args.fork_block else " --offline"), file=sys.stderr)
            return 1
    print(f"Report: {manifest_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
