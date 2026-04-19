# Contributing

## Prerequisites

- **Node.js 20 or newer** (CI runs Node 20 and 22; see `[.nvmrc](.nvmrc)` if you use nvm/fnm).
- **npm 10.9.2**, the version pinned in the root `[package.json](package.json)` via `"packageManager": "npm@10.9.2"` and `"engines": { "npm": "10.9.2" }`. Enable [Corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) so that when you run `npm` from this repository, Node uses that pinned release instead of the npm bundled with your Node install.
- After enabling Corepack, confirm with `npm --version` (expect **10.9.2**) before changing dependencies or the lockfile.

## First-time setup

1. Clone the repository.
2. Enable Corepack if you have not already: `corepack enable`.
3. From the repo root, install dependencies:
  ```bash
   npm ci
  ```
4. Before opening a pull request, run the same checks CI runs. The root `**npm run verify**` script runs lint, knip, typecheck (which builds workspaces first), test coverage, and `docs:build` — matching the CI job in one command.
  To run the same steps individually:
   Use `**npm run build**` if you only need production builds without the full verify pass.

## Monorepo layout

- **Root** — shared devDependencies (Biome, TypeScript, Vitest), workspace scripts, and `[package-lock.json](package-lock.json)`.
- `**[packages/aleatoric](packages/aleatoric)`** — core library (music primitives, RNG, generators, MIDI player).
- `**[packages/docs](packages/docs)**` (`aleatoric-docs`) — Vite + React interactive documentation.
- `**[packages/playground](packages/playground)**` (`aleatoric-playground`) — private Vite + React app using Tone.js to try generators and playback helpers against the workspace `aleatoric` package.

CI runs `**npm run docs:build**` at the repo root, which builds the docs app.

## Package manager and CI

GitHub Actions enables Corepack, activates **npm 10.9.2**, then runs `**npm ci`** against the root `[package-lock.json](package-lock.json)`. That is the same npm and lockfile format you get locally when Corepack is enabled and `npm --version` reports **10.9.2**.

For the same dependency graph as CI, use npm locally (with Corepack, as above):

```bash
npm ci
```

When you add or upgrade dependencies, refresh the lockfile with the same npm CI uses:

```bash
npm run lockfile
```

You may use **pnpm** instead; a root `[pnpm-workspace.yaml](pnpm-workspace.yaml)` defines the monorepo packages. If you use pnpm, keep in mind the lockfile is npm's unless you adopt pnpm in CI and commit `pnpm-lock.yaml`.

## Scripts (repository root)


| Command                 | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run lint`          | Biome check                                                                 |
| `npm run knip`          | Unused exports, files, and dependency mismatches (`[knip.json](knip.json)`) |
| `npm run lint:fix`      | Biome check with auto-fix                                                   |
| `npm run format`        | Biome format (write)                                                        |
| `npm run typecheck`     | TypeScript (all workspaces)                                                 |
| `npm run test`          | Vitest (all workspaces)                                                     |
| `npm run test:coverage` | Vitest with coverage (matches CI)                                           |
| `npm run build`         | Build published packages                                                    |
| `npm run clean`         | Clean build artifacts (per workspace `clean` scripts)                       |
| `npm run verify`        | Lint, knip, typecheck, test coverage, and docs build (CI-equivalent)        |
| `npm run lockfile`      | Regenerate `package-lock.json` using npm 10.9.2 (matches CI)                |
| `npm run docs:dev`      | Dev server: docs (default Vite port 5173)                                   |
| `npm run docs:build`    | Production build of the docs site                                           |
| `npm run docs:preview`  | Preview the production docs build                                           |


Per-workspace equivalents (from repo root): `npm run docs:dev -w aleatoric-docs`, `npm run docs:build -w aleatoric-docs`, `npm run dev -w aleatoric-playground` for the playground dev server.

## Commit message conventions

This repository enforces [Conventional Commits](https://www.conventionalcommits.org/) via `commitlint`. All commit messages must follow this format:

```
type(scope): subject
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scopes:** `aleatoric`, `docs`, `playground`, `ci`, `deps`, `repo`

**Examples:**

- `feat(aleatoric): add SeededRng support for deterministic generation`
- `fix(docs): correct MidiPlayer example in homepage`
- `docs(playground): update setup instructions`
- `refactor(aleatoric): simplify scale normalization logic`
- `test(aleatoric): add edge case coverage for gaussian distribution`
- `chore(deps): upgrade TypeScript to 5.8`
- `chore(ci): update GitHub Actions workflow`

Subject line should be lowercase, imperative mood ("add" not "added"), and under 50 characters. If your commit needs more detail, add a blank line and then a body paragraph.

The `commit-msg` hook (via Husky) will reject commits that don't follow this format.

## Running commands for one workspace

For faster iteration you can target a single package:

```bash
npm run test -w aleatoric
npm run typecheck -w aleatoric
npm run dev -w aleatoric-playground
```

## Docs development

From the **repository root**:

```bash
npm run docs:dev      # Vite port 5173
npm run docs:build
npm run docs:preview
```

Shared layout styles and reusable UI live under `[packages/docs/src](packages/docs/src)` (`shared/` for cross-app components such as `CodeExample` and the piano-roll canvas helpers).

### Production build preview

```bash
npm run docs:build
npm run docs:preview
```

