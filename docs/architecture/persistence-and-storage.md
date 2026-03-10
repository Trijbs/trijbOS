# Persistence and Storage

## Storage Model

- `IndexedDB` via `src/storage.ts` stores preferences, files, notifications, and restored windows
- Zustand manages active runtime state and hydrates from storage on boot
- Session persistence is debounced so window drag and resize remain responsive

## Virtual File System

- Root folders: `Desktop`, `Documents`, `Downloads`, `Pictures`, `Trash`
- Nodes are flat records keyed by `id` with `parentId` links
- Current file types: `folder`, `text`, `image`
- File-to-app routing is resolved centrally through `src/file-utils.ts`

## MVP Constraints

- No cloud sync
- No real host filesystem access
- No full migration framework yet beyond idempotent seeding and durable record storage

## Next Step

Add import/reset flows and formal storage migrations before widening the app surface.
