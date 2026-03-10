# Persistence/Data Agent

## Mission

Make state durable, recoverable, and version-safe.

## Focus

- IndexedDB schema and bootstrap
- session restore
- simulated file system behavior
- import/export
- migration safety

## Core Ownership

- `src/storage.ts`
- `src/storage-version.ts`
- file and snapshot utilities
- persistence-related tests

## Guardrails

- no UI component should talk directly to IndexedDB
- schema changes require migration thinking immediately
- never risk user state silently during normal boot
