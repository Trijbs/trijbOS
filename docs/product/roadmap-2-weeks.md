# 2-Week Roadmap

## Outcome

The roadmap goals have been substantially completed in the current MVP branch. The repo now contains the shell, window manager, persistence layer, explorer/storage model, core apps, and browser-validation prep that this plan targeted.

## Week 1

### Days 1-2

- Audit repo and nearby references
- Lock architecture, stack, folder structure, and persistence model
- Scaffold app, theme tokens, app registry, and state layer

### Days 3-4

- Build desktop shell
- Build taskbar, launcher, notification center
- Seed virtual file system and preferences

### Days 5-7

- Build window manager
- Add drag/resize/minimize/maximize/restore
- Persist session state and verify reload behavior

## Week 2

### Days 8-10

- Build Settings app and theme engine
- Build File Explorer and file CRUD flows
- Connect launcher search to apps and files

### Days 11-12

- Add Notes, Calculator, Media Viewer, Terminal mock
- Add notifications and storage warnings

### Days 13-14

- QA pass on shell workflows
- Performance pass on window and startup behavior
- Cleanup docs and prepare backlog for post-MVP

## Completion Notes

Delivered against this plan:

- shell, taskbar, launcher, window manager, and theme engine
- IndexedDB-backed persistence and workspace/session restore
- file explorer with upload, move, Trash, restore, and empty Trash flows
- notes, calculator, media viewer, terminal mock, and settings
- browser-level E2E coverage across Chromium and WebKit

Remaining follow-up after the roadmap:

- rerun full Playwright/browser QA whenever environment or deployment changes
- fix only browser-specific issues surfaced by real validation
- prioritize post-MVP polish based on actual usage and bug reports
