# Repository Guidelines

## Project Structure & Module Organization

`trijbOS` is a Vite + React + TypeScript Web OS MVP. Core source lives in `src/`.

- `src/App.tsx`: top-level shell bootstrap
- `src/system-store.ts`: global runtime state for windows, launcher, files, theme, and notifications
- `src/storage.ts`: Dexie/IndexedDB persistence layer
- `src/apps.tsx`: app registry and pinned apps
- `src/components/`: shell UI, windowing, and app implementations
- `docs/product/`, `docs/architecture/`, `docs/qa/`: scope, architecture, and testing notes
- `dist/`: production build output; do not edit manually

Keep new platform code close to the domain it serves. Prefer small, focused modules over large mixed-responsibility files.

## Build, Test, and Development Commands

- `npm install`: install runtime and dev dependencies
- `npm run dev`: start the local Vite dev server
- `npm run build`: typecheck and create a production bundle in `dist/`
- `npm test`: run Vitest tests once

Example:

```bash
npm install
npm run dev
```

## Coding Style & Naming Conventions

- Use TypeScript with strict typing; avoid `any`
- Use 2-space indentation and semicolons
- Components: `PascalCase` files and exports, for example `WindowLayer.tsx`
- Utilities and stores: `kebab-case` or descriptive lowercase filenames, for example `system-store.ts`
- Keep CSS token-driven through `src/styles.css`; do not hardcode theme colors repeatedly in components

No formatter or linter is configured yet. Match the existing style and keep changes consistent.

## Testing Guidelines

Vitest is the current test runner. Place tests beside the source file when practical using `*.test.ts` naming, for example `src/apps.test.ts`.

Prioritize tests for:
- app registry integrity
- window/store logic
- persistence helpers
- file-system behaviors

Run `npm test` before opening a PR.

## Commit & Pull Request Guidelines

There is no meaningful Git history yet, so no established commit convention exists. Use short, imperative commit messages such as `Add window session persistence` or `Refine launcher search behavior`.

PRs should include:
- a brief summary of user-visible changes
- architecture notes for store, persistence, or windowing changes
- test results (`npm test`, `npm run build`)
- screenshots or short recordings for shell/UI changes

## Architecture Notes

This repo is MVP-first. Preserve these boundaries:
- shell/runtime state in the store
- persistence behind `storage.ts`
- apps registered through `src/apps.tsx`
- window behavior controlled centrally, not inside individual apps

## Internal Agents

The repo uses explicit internal workstreams to coordinate delivery. Their briefs live in `.agents/` and the operating model lives in `docs/contributing/workstreams.md`.

Available agents:

- `repo-audit`
- `product-architecture`
- `ui-ux-systems`
- `frontend-implementation`
- `persistence-data`
- `qa-performance`
- `documentation`

Use them as structured responsibilities, not fake service integrations.
