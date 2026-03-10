# System Overview

## Core Subsystems

- `shell`: desktop canvas, wallpaper, taskbar, launcher, overlays
- `window-manager`: runtime window instances and geometry control
- `app-registry`: modular app definitions and launch metadata
- `persistence`: IndexedDB-backed preferences, files, notifications, and session
- `theme-engine`: semantic CSS variables and wallpaper selection
- `virtual-fs`: normalized file nodes for explorer and app documents

## Design Decisions

- Client-rendered SPA for fastest MVP delivery
- Single-process app model with centrally managed windows
- IndexedDB for durable data, in-memory runtime for hot interaction state
- Semantic theming so shell and apps share the same token system
