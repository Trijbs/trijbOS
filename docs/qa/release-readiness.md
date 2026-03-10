# Release Readiness

Use this checklist before calling the current `trijbOS` build MVP-ready.

## Automated Checks

- Run `npm test`
- Run `npm run build`
- Run `npm run test:e2e`
- If debugging locally, run `npm run test:e2e:headed`

## Browser Validation

Validate on:

- Chrome desktop
- Safari desktop

## Core Shell Flows

- Desktop boots without runtime errors
- Launcher opens from taskbar and `Cmd/Ctrl + K`
- Settings opens from launcher and `Cmd/Ctrl + ,`
- Notifications open from the tray and unread badge clears when viewed
- Taskbar toggles running apps correctly

## Window Management

- Windows can be dragged
- Windows can be resized
- Minimize and restore work from both titlebar and taskbar
- Maximize toggles from titlebar button and titlebar double-click
- Focus styling clearly tracks the active window
- `Cmd/Ctrl + W` closes the active window
- `Cmd/Ctrl + M` minimizes the active window
- `Cmd/Ctrl + Shift + M` maximizes the active window

## Persistence

- Theme mode persists after reload
- Accent and wallpaper persist after reload
- Open windows restore after reload
- File Explorer active directory restores after reload
- File selection context restores after reload

## File System

- Upload creates files in the expected location
- Files can be moved into valid folders
- Invalid recursive moves are prevented
- Root directories cannot be renamed or deleted
- Delete moves files to Trash first
- Trash restore returns files to the previous location
- Empty Trash removes only trashed items

## Snapshot Flows

- Export snapshot succeeds
- Import snapshot restores theme, files, windows, and workspace context
- Reset workspace returns seeded defaults

## Accessibility / Interaction

- Focus rings are visible on interactive controls
- Window titlebar controls are keyboard reachable
- Launcher result navigation works with arrow keys and Enter
- Notification center controls are keyboard reachable

## Release Blockers

Do not treat the build as ready if any of these remain:

- uncaught runtime errors in core shell flows
- broken drag/resize or broken taskbar restore behavior
- persistence regressions after reload
- file loss outside Trash/restore flows
- browser-specific failures in Chrome or Safari for core shell actions
