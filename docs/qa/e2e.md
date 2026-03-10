# E2E Notes

Use Playwright for browser-level shell validation.

## Commands

- `npm run test:e2e`
- `npm run test:e2e:headed`

The E2E suite is configured to run against a production preview build and targets:

- Chromium
- WebKit

## Current Coverage

- desktop boot
- launcher open/search
- window minimize/restore from taskbar
- theme persistence after reload
- file upload and open-with routing
- snapshot import/reset flows
- notification badge clearing
- Trash restore flow

## Safari Notes

- WebKit is included as a first-class project because pointer, focus, and viewport behaviors are more fragile there.
- Snapshot download/import remains partially environment-sensitive; the download-based snapshot flow is already skipped for WebKit in the current suite where needed.
- If a test only fails in WebKit, prioritize checking:
  - titlebar focus and keyboard routing
  - taskbar button targeting
  - upload/download flows
  - drag/resize pointer behavior
