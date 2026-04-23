#!/usr/bin/env bash
# One-shot setup for husky + lint-staged + prettier.
# Intended to be invoked by Claude after reading SKILL.md.
set -euo pipefail

echo "→ Installing dev dependencies…"
npm install -D husky lint-staged prettier

echo "→ Initializing husky…"
npx husky init

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "→ Copying templates from $SKILL_DIR/templates …"
cp "$SKILL_DIR/templates/.prettierrc.json" .
cp "$SKILL_DIR/templates/.prettierignore" .
cp "$SKILL_DIR/templates/.lintstagedrc.json" .
mkdir -p .husky
cp "$SKILL_DIR/templates/.husky/pre-commit" .husky/pre-commit
chmod +x .husky/pre-commit 2>/dev/null || true

echo "✓ Done. Commit a file to test the hook."
