#!/usr/bin/env bash
# SpxOpenCode upstream sync — pulls latest OpenCode changes into main.
#
# Usage:
#   ./scripts/upstream-sync.sh          # interactive, shows diff summary before merge
#   ./scripts/upstream-sync.sh --dry-run # fetch and report only, no merge
#
# Requirements: git, bun (for post-sync typecheck)

set -euo pipefail

DRY_RUN=false
for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=true
done

UPSTREAM_REMOTE="upstream"
UPSTREAM_BRANCH="main"
LOCAL_BRANCH="main"
SPX_PLUGIN_DIR="packages/tui/src/feature-plugins/spx"

echo "=== SpxOpenCode upstream sync ==="
echo ""

# --- 1. Sanity checks ---
if ! git remote get-url "$UPSTREAM_REMOTE" &>/dev/null; then
  echo "ERROR: remote '$UPSTREAM_REMOTE' not found."
  echo "Add it with:"
  echo "  git remote add upstream https://github.com/anomalyco/opencode.git"
  exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "$LOCAL_BRANCH" ]]; then
  echo "ERROR: must be on branch '$LOCAL_BRANCH' (currently on '$CURRENT_BRANCH')."
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: working tree is dirty. Commit or stash before syncing."
  exit 1
fi

# --- 2. Fetch ---
echo "Fetching $UPSTREAM_REMOTE/$UPSTREAM_BRANCH..."
git fetch "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH"
echo ""

# --- 3. Diff summary ---
BEHIND=$(git rev-list --count HEAD.."$UPSTREAM_REMOTE/$UPSTREAM_BRANCH")
AHEAD=$(git rev-list --count "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"..HEAD)

echo "Status: $BEHIND commit(s) behind upstream, $AHEAD commit(s) ahead"
echo ""

if [[ "$BEHIND" -eq 0 ]]; then
  echo "Already up to date. Nothing to do."
  exit 0
fi

echo "--- Upstream commits to be merged ---"
git log --oneline HEAD.."$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
echo ""

echo "--- Files changed in upstream ---"
git diff --name-only HEAD.."$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
echo ""

SPX_CHANGED=$(git diff --name-only HEAD.."$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" | grep -c "^$SPX_PLUGIN_DIR" || true)
if [[ "$SPX_CHANGED" -gt 0 ]]; then
  echo "WARNING: $SPX_CHANGED file(s) in $SPX_PLUGIN_DIR changed upstream."
  echo "These are SpxOpenCode-owned — review conflicts carefully."
  echo ""
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry run complete. Run without --dry-run to merge."
  exit 0
fi

# --- 4. Merge ---
echo "Merging $UPSTREAM_REMOTE/$UPSTREAM_BRANCH into $LOCAL_BRANCH..."
echo "(conflicts in packages/ owned by OpenCode should resolve in favor of upstream)"
echo ""

# Use --no-ff so the upstream merge is a distinct commit in git history
if ! git merge --no-ff "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" -m "chore: sync upstream OpenCode $(date +%Y-%m-%d)"; then
  echo ""
  echo "MERGE CONFLICT — resolve conflicts then run:"
  echo "  git add ."
  echo "  git merge --continue"
  echo ""
  echo "Conflict resolution rules:"
  echo "  - packages/tui/src/feature-plugins/spx/*  → keep SpxOpenCode version"
  echo "  - All other packages/*                      → keep upstream version"
  echo "  - ROADMAP.md, CONTRIBUTING.md, docs/        → keep SpxOpenCode version"
  exit 1
fi

# --- 5. Post-merge verification ---
echo ""
echo "Merge complete. Running post-sync checks..."
echo ""

echo "→ Installing dependencies..."
bun install --frozen-lockfile 2>&1 | tail -3

echo "→ TypeScript typecheck..."
pnpm tsc --noEmit

echo ""
echo "=== Sync complete ==="
echo "  Merged $BEHIND upstream commit(s)."
echo "  Review the diff, then push with: git push"
