---
id: spx.skill.changelog
name: Generate Changelog
description: Generate a CHANGELOG entry from git log since the last tag (conventional commits)
version: 1.0.0
tags: [git, changelog, release, docs]
---

# Changelog Generator

Generates a CHANGELOG entry from git commits since the last tag.

Groups commits by conventional commit type:
- `feat` → Features
- `fix` → Bug Fixes
- `perf` → Performance
- `refactor` → Refactoring
- `docs` → Documentation
- `test` → Tests
- `chore` → Chores
- `ci` → CI/CD
- `build` → Build

Breaking changes (`!` suffix or `BREAKING CHANGE:` footer) are promoted to the top.

## Usage

Run `/skill:changelog` in the SpxOpenCode TUI. Output is copied to clipboard.

## Output format

```
## [Unreleased] — YYYY-MM-DD

### Breaking Changes
- feat(auth)!: drop Node 16 support

### Features
- feat(ui): add branded SpxOpenCode logo overlay
- feat(auto): availability-aware model router (FASE 13)

### Bug Fixes
- fix(dialog-model): wrap Auto description string in <text> JSX element

### Documentation
- docs(auto): rewrite auto-by-spxmiguel.md for FASE 13
```
