# MVP Scope

## Status

Most of the MVP scope below is implemented in the current repository. Remaining work is primarily release hardening, browser verification follow-up, and post-MVP polish rather than missing platform fundamentals.

## Must Have

- Desktop shell with wallpaper and desktop shortcuts
- Window manager with drag, resize, focus, minimize, maximize, restore, close
- Taskbar with launcher, pinned apps, running apps, clock, notifications
- Settings app for theme, wallpaper, and shell preferences
- Persistent preferences and session restore
- Simulated file system with root folders and file CRUD
- Modular app registry
- Core apps: File Explorer, Notes, Calculator, Media Viewer, Terminal mock, Settings

## Explicit Deferrals

- Real command execution
- Multi-workspace and multi-monitor support
- Tiling/snapping beyond basic maximize
- Cloud sync and authentication
- Plugin marketplace

## Usability Bar

- Desktop boots directly into an interactive shell
- Launcher is usable from keyboard in one step
- Session restore survives reload
- Multiple windows remain manageable without layout collapse

## Current Delivery Snapshot

Implemented:

- shell, taskbar, launcher, notifications, and tray/status surface
- persistent theme, wallpaper, session state, and workspace context
- simulated file system with protected roots and Trash lifecycle
- file explorer, notes, calculator, media viewer, terminal mock, settings
- browser validation coverage for Chromium and WebKit

Still considered follow-up work:

- broader manual browser QA outside the automated suite
- accessibility deep pass beyond the current keyboard/focus support
- non-MVP enhancements such as snapping, cloud sync, and real terminal execution
