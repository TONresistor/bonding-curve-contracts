#!/usr/bin/env python3
"""Check that the wallet is byte-for-byte identical to its pinned upstream source."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
pin = json.loads((root / "contracts/v1/JettonWallet.upstream.json").read_text())
actual = hashlib.sha256((root / "contracts/v1/JettonWallet.tolk").read_bytes()).hexdigest()
if actual != pin["sha256"]:
    raise SystemExit("JettonWallet differs from its pinned upstream source")
print(f"JettonWallet matches upstream {pin['commit']}")
