# repo-map

**Understand any codebase in 5 minutes.**

[![npm](https://img.shields.io/badge/npx-repo--map-3B82F6?style=flat-square)](https://www.npmjs.com/package/repo-map)
[![zero-config](https://img.shields.io/badge/zero--config-yes-22c55e?style=flat-square)](#)
[![no API keys](https://img.shields.io/badge/no%20API%20keys-required-22c55e?style=flat-square)](#)
[![works offline](https://img.shields.io/badge/works-offline-22c55e?style=flat-square)](#)
[![license](https://img.shields.io/badge/license-MIT-gray?style=flat-square)](LICENSE)

```
  REPO-MAP  v1.0.0

  ── Quick Stats ──────────────────────────────────────
  Files: 147  │  LOC: 12,847  │  Languages: TypeScript, CSS, JSON
  Contributors: 5  │  Last commit: 2 hours ago
  Dependencies: 12 direct, 24 dev  (npm)

  ── Key Files (read these first) ─────────────────────
  1. src/index.ts            Entry point  245 LOC │ 8 imports
  2. src/api/router.ts                    189 LOC │ 12 imports
  3. src/db/schema.ts                     312 LOC │ 5 imports
  4. src/components/App.tsx               201 LOC │ 14 imports
  5. src/config.ts                        98 LOC  │ 3 imports

  ── Hotspots (most volatile) ─────────────────────────
  ⚡ src/api/router.ts         38 changes
  ⚡ src/components/Form.tsx   29 changes
  ⚡ src/db/migrations/        21 changes

  ── Complexity Warnings ──────────────────────────────
  ⚠  src/legacy/parser.js     847 lines (consider splitting)
  ⚠  src/utils/helpers.ts     612 lines

  ── Start Here Path ──────────────────────────────────
  1 → README.md
  2 → src/index.ts
  3 → src/api/router.ts
  4 → src/db/schema.ts
  5 → src/components/App.tsx

  ✓ Report saved to ONBOARDING.md
```

---

## The Problem

You join a new project. There are 500 files. Nobody wrote docs. The last dev left. Where do you even start?

You could spend a day clicking through files. Or you could run one command and get a ranked, structured map of the entire codebase in under a minute.

---

## Install & Run

```bash
# No install needed
npx repo-map .

# Or install globally
npm install -g repo-map
repo-map .
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `repo-map .` | Map current directory, print to terminal |
| `repo-map /path/to/repo` | Map any repo |
| `repo-map . --depth 3` | Limit directory tree depth (default: 4) |
| `repo-map . --format md` | Output as markdown |
| `repo-map . --output ONBOARDING.md` | Save to specific file |
| `repo-map . --json` | Output raw JSON (pipe to other tools) |

---

## What It Analyzes

### Quick Stats
Total files, total LOC, languages detected, last commit date, contributor count.

### Architecture Overview
Entry points, config files, test directories, CI/build files, directory tree.

### Key Files (Top 10)
Ranked by composite score: LOC weight + import depth + function count. These are the files a new dev should read first.

### Change Hotspots (Top 10)
Most frequently modified files in the last 100 commits. High-churn files are flagged automatically.

### Dependency Map
Direct and dev dependencies with version ranges. Flags packages with old major versions.

### Complexity Warnings
Files over 500 lines, deeply nested directories (>5 levels), circular import hints.

### Start Here Path
An ordered reading list — the 5-7 files that unlock the entire codebase.

---

## Why Not CodeSee / GitHub Copilot?

| | repo-map | CodeSee | GitHub Copilot |
|--|---------|---------|----------------|
| Free | Yes | No | No |
| Works offline | Yes | No | No |
| No account required | Yes | No | No |
| No API keys | Yes | No | No |
| CI/CD friendly | Yes | Partial | No |
| Instant results | Yes | Minutes | N/A |

repo-map is pure static analysis + git log parsing. No AI, no network requests, no telemetry.

---

## Works With

Any language in any git repo:

| Ecosystem | Package file detected |
|-----------|-----------------------|
| Node.js / Bun | `package.json` |
| Python | `requirements.txt`, `pyproject.toml` |
| Rust | `Cargo.toml` |
| Go | `go.mod` |
| Ruby | `Gemfile` |
| Java / Kotlin | detected by file extensions |
| PHP | `composer.json` |
| And more | any git repo with source files |

---

## Requirements

- Node.js 18+
- git (for hotspot analysis — optional, degrades gracefully without it)

---

## License

MIT — Nicholas Ashkar, 2026
