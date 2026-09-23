#!/usr/bin/env bash
# Merge-refresh sandbox token lines in web/.env.local.
# Preserves TIDL_SESSION_SECRET, PRESCRIBERX_WEBHOOK_SECRET, and other keys.
# Tokens rotate every 12h: https://demo.prescribe-rx.com/api/docs/tokens
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/web"
ENV_FILE="$WEB/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  if grep -qE '^PRESCRIBERX_SANDBOX=false[[:space:]]*(#.*)?$' "$ENV_FILE"; then
    echo "Refusing to refresh: PRESCRIBERX_SANDBOX=false looks like production cutover."
    echo "Update PRESCRIBERX_API_TOKEN manually or set SANDBOX=true before refresh."
    exit 1
  fi
fi

TOKENS_JSON="$(curl -fsSL https://demo.prescribe-rx.com/api/docs/tokens)"
TOKEN="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["tokens"]["system_admin"])' <<<"$TOKENS_JSON")"

export ENV_FILE TOKEN
python3 <<'PY'
import os
import re
from pathlib import Path

env_file = Path(os.environ["ENV_FILE"])
token = os.environ["TOKEN"]
updates = {
    "PRESCRIBERX_API_BASE": "https://demo.prescribe-rx.com/api/v1",
    "PRESCRIBERX_API_TOKEN": token,
    "PRESCRIBERX_SANDBOX": "true",
}
merge_keys = set(updates.keys())

lines: list[str] = []
if env_file.exists():
    for line in env_file.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)=", line)
        if m and m.group(1) in merge_keys:
            continue
        lines.append(line)
else:
    lines = ["# Local sandbox only. Do not commit."]

while lines and not lines[-1].strip():
    lines.pop()

header = "# Merged by build/tools/refresh-prescriberx-sandbox.sh (token/base/sandbox only)."
if not lines or lines[0] != header:
    lines.insert(0, header)

for key, value in updates.items():
    lines.append(f"{key}={value}")

env_file.parent.mkdir(parents=True, exist_ok=True)
env_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Merged sandbox token into {env_file} (preserved other keys)")
PY
