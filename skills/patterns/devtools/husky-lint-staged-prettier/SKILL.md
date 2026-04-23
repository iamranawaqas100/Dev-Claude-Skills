---
name: husky-lint-staged-prettier
description: Set up husky + lint-staged + prettier (and optionally eslint) in the current project so staged files are auto-formatted and linted on every commit. Use when the user asks to "set up pre-commit hooks", "add husky", "enforce formatting on commit", or onboard a fresh project.
tags: [devtools, husky, lint-staged, prettier, eslint, git-hooks]
version: 1.0.0
---

# husky-lint-staged-prettier

Bootstraps pre-commit formatting + linting in any Node project.

## Ask first

1. Confirm the target project has a `package.json` (this is the current working directory unless the user says otherwise).
2. Include ESLint integration? (default yes if `eslint` is already in `devDependencies`, else ask).
3. Prettier config: use shipped defaults, or user has preferences (print width, single quotes, etc.)?

## Steps

Run these in order, stopping if any step fails:

1. **Install dev dependencies**:
   ```bash
   npm install -D husky lint-staged prettier
   ```
   If ESLint was requested and not installed: also `npm install -D eslint`.

2. **Initialize husky**:
   ```bash
   npx husky init
   ```
   This creates `.husky/pre-commit` with a placeholder.

3. **Copy template files** from this skill's `templates/` folder into the project root:
   - `.prettierrc.json`
   - `.prettierignore`
   - `.lintstagedrc.json`
   - `.husky/pre-commit`
   (Overwrite the placeholder husky created.)

4. **Edit `package.json`**:
   - Add `"prepare": "husky"` to `scripts` (if not already present).
   - Note: husky init may already have done this — check before adding a duplicate.

5. **Make the hook executable** (skip on Windows):
   ```bash
   chmod +x .husky/pre-commit
   ```

6. **Smoke test**: create a deliberately unformatted JS file, `git add` it, `git commit -m "test"`, and verify prettier reformatted it before the commit landed. Delete the test file.

## Output files (from templates/)

- `.husky/pre-commit` → runs `npx lint-staged`
- `.lintstagedrc.json` → maps `*.{js,ts,jsx,tsx,json,md}` → prettier, `*.{js,ts,jsx,tsx}` → eslint --fix
- `.prettierrc.json` → sensible defaults (singleQuote, trailingComma: all, printWidth: 100)
- `.prettierignore` → node_modules, build artifacts, lockfiles

## Rules

- Don't overwrite an existing `.prettierrc*` — ask the user first.
- If the project uses yarn or pnpm, use those instead of npm.
- Don't commit the test file from step 6.

## Report

Tell the user:
- What was installed
- What files were added
- How to skip the hook in an emergency (`git commit --no-verify`) and why they shouldn't make a habit of it
