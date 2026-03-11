# trijbOS

A browser-based Web OS MVP focused on real shell usability, persistent state, modular apps, and a credible desktop interaction model.

## Stack

- Vite + React + TypeScript
- Zustand for shell and runtime state
- Dexie/IndexedDB for persistence
- `react-rnd` for draggable and resizable window primitives
- Vitest for logic coverage
- Playwright for browser validation across Chromium and WebKit

## Current Status

`trijbOS` is now in a validated MVP state.

Implemented:

- desktop shell with wallpaper, desktop shortcuts, taskbar, and tray/status chips
- draggable, resizable, minimizable, maximizable windows
- launcher/search, keyboard shortcuts, and notification center
- settings with theme, accent, wallpaper, snapshot export/import, and workspace reset
- file explorer with simulated storage, move flows, Trash, restore, and empty Trash
- persistent theme, window session, workspace context, and file system state
- core apps: File Explorer, Notes, Calculator, Media Viewer, Terminal mock, Settings

Validation:

- `npm test`
- `npm run build`
- Playwright matrix prepared and exercised across Chromium and WebKit

## Feature Snapshot

- Window manager: focus, z-order, drag, resize, minimize, maximize, restore
- Shell: launcher, notifications, tray, keyboard commands, desktop shortcuts
- Storage: IndexedDB-backed file system, protected roots, Trash lifecycle
- Preferences: theme mode, accent, wallpaper, workspace/session persistence
- Search: app and file search with ranked launcher results
- Browser validation: Chromium green, WebKit green for core shell flows with one environment-specific snapshot download skip

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

For production-like local validation:

```bash
npm run build
npm run preview
```

For browser validation:

```bash
npm run test:e2e
```

## GitHub Pages Deployment

The repo now includes a Pages workflow at `.github/workflows/deploy-pages.yml` and a checked-in custom domain file at `public/CNAME` for `os.trijbsworld.nl`.

To finish the deployment:

1. In GitHub, open `Settings -> Pages`.
2. Set `Source` to `GitHub Actions`.
3. Set the custom domain to `os.trijbsworld.nl`.
4. In DNS for `trijbsworld.nl`, add a `CNAME` record for `os` pointing to `trijbs.github.io`.
5. After DNS resolves, enable `Enforce HTTPS` in GitHub Pages.

## Roadmap

See:

- `docs/product/mvp-scope.md`
- `docs/product/roadmap-2-weeks.md`
- `docs/architecture/system-overview.md`
- `docs/qa/release-readiness.md`
