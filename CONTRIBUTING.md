# Contributing

## Prerequisites

- **Node.js 20 or newer** (CI runs Node 20 and 22; see [`.nvmrc`](.nvmrc) if you use nvm/fnm).
- **npm** at the version bundled with your Node install (CI uses `npm ci`).

## First-time setup

1. Clone the repository.
2. From the repo root, install dependencies:

   ```bash
   npm ci
   ```

3. Before opening a pull request, run the same checks CI runs:

   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

   To match CI coverage locally:

   ```bash
   npm run test:coverage
   ```

## Monorepo layout

- **Root** — shared devDependencies (Biome, TypeScript, Vitest), workspace scripts, and [`package-lock.json`](package-lock.json).
- **[`packages/aleatoric`](packages/aleatoric)** — core library (music primitives, RNG, generators, MIDI player).
- **[`packages/aleatoric-web`](packages/aleatoric-web)** — Web Audio engine, Web MIDI output, scheduler, composition helpers, and the **interactive docs** (Vite + React under `docs/`).
- **[`packages/aleatoric-midi`](packages/aleatoric-midi)** — Node.js MIDI output (via easymidi/RtMidi) and CLI for streaming generative music to DAWs.

## Package manager and CI

GitHub Actions runs **`npm ci`** using the root [`package-lock.json`](package-lock.json). For the same dependency graph as CI, use npm locally:

```bash
npm ci
```

You may use **pnpm** instead; a root [`pnpm-workspace.yaml`](pnpm-workspace.yaml) defines the monorepo packages. If you use pnpm, keep in mind the lockfile is npm’s unless you adopt pnpm in CI and commit `pnpm-lock.yaml`.

## Scripts (repository root)

| Command | Purpose |
| --- | --- |
| `npm run lint` | Biome check |
| `npm run lint:fix` | Biome check with auto-fix |
| `npm run format` | Biome format (write) |
| `npm run typecheck` | TypeScript (all workspaces) |
| `npm run test` | Vitest (all workspaces) |
| `npm run test:coverage` | Vitest with coverage (matches CI) |
| `npm run build` | Build published packages |
| `npm run clean` | Clean build artifacts (per workspace `clean` scripts) |
| `npm run docs:dev -w aleatoric-web` | Docs site dev server (Vite) |
| `npm run docs:build -w aleatoric-web` | Production build of the docs site |
| `npm run docs:preview -w aleatoric-web` | Preview the docs build |

The docs scripts live on the **`aleatoric-web`** workspace; from the monorepo root you must pass **`-w aleatoric-web`**.

## Running commands for one workspace

For faster iteration you can target a single package:

```bash
npm run test -w aleatoric
npm run test -w aleatoric-web
npm run test -w aleatoric-midi
npm run typecheck -w aleatoric
```

## Docs development (paths)

From the **repository root**:

```bash
npm run docs:dev -w aleatoric-web
npm run docs:build -w aleatoric-web
npm run docs:preview -w aleatoric-web
```

From **`packages/aleatoric-web`**:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```
