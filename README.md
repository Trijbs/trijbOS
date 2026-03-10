# trijbOS

A browser-based Web OS MVP focused on real shell usability, persistent state, modular apps, and a credible desktop interaction model.

## Stack

- Vite + React + TypeScript
- Zustand for shell and runtime state
- Dexie/IndexedDB for persistence
- `react-rnd` for draggable and resizable window primitives
- Vitest for the first logic-test layer

## MVP Scope

- Desktop shell with wallpaper, desktop shortcuts, and a taskbar
- Draggable, resizable, minimizable, maximizable windows
- Launcher/search and notification center
- Settings app with theme and wallpaper customization
- Persistent user preferences and restored window sessions
- File Explorer backed by a simulated file system
- Core apps: Notes, Calculator, Media Viewer, Terminal mock, Settings

## Local Setup

```bash
npm install
npm run dev
```

## Roadmap

See:

- `docs/product/mvp-scope.md`
- `docs/product/roadmap-2-weeks.md`
- `docs/architecture/system-overview.md`
- `docs/contributing/workstreams.md`

## Internal Agent Workstreams

The repo includes an explicit multi-agent operating model for:

- repo audit
- product architecture
- UI/UX systems
- frontend implementation
- persistence/data
- QA/performance
- documentation

Agent briefs live in `.agents/`.
