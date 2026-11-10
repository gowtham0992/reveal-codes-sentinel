#!/usr/bin/env bash
set -euo pipefail

# reveal-codes main on 2026-11-09, CI green.
REVEAL_CODES_REF=d96bb39c7e4f65aacb2d560d82d3e6347b3a9fa6

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$APP_ROOT/vendor/reveal-codes"
LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT

# Run a step quietly. On failure, print one line and fail the install.
step() {
  local what="$1"
  shift
  if ! "$@" >"$LOG" 2>&1; then
    echo "reveal-codes-sentinel install failed: $what: $(tail -n 1 "$LOG")" >&2
    exit 1
  fi
}

if [ ! -d "$VENDOR" ]; then
  step "clone" git clone --quiet --filter=blob:none https://github.com/gowtham0992/reveal-codes.git "$VENDOR"
fi

step "fetch pinned ref" git -C "$VENDOR" fetch --quiet --depth 1 origin "$REVEAL_CODES_REF"
step "checkout pinned ref" git -C "$VENDOR" checkout --quiet --detach FETCH_HEAD

# Only what the sweep needs: the root package (jiti, used by the CLI runner)
# and the sentinel with its workspace dependencies.
step "pnpm install" pnpm --dir "$VENDOR" install --frozen-lockfile --filter reveal-codes --filter "@reveal-codes/sentinel..."

# Smoke check: no arguments is a usage error, exit code 2.
code=0
pnpm --dir "$VENDOR" sentinel >"$LOG" 2>&1 || code=$?
if [ "$code" -ne 2 ]; then
  echo "reveal-codes-sentinel install failed: smoke check expected exit 2, got $code" >&2
  exit 1
fi
