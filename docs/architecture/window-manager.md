# Window Manager

## Responsibilities

- render window instances from centralized store state
- control focus and z-order
- handle drag, resize, minimize, maximize, restore, and close
- persist window sessions for reload restore

## Current Implementation

- `src/components/WindowLayer.tsx` renders all active windows
- `src/system-store.ts` owns window lifecycle and persistence triggers
- `react-rnd` provides the MVP drag and resize layer

## Behavioral Rules

- focused windows move to the top of the stack
- minimized windows stay in the taskbar and restore in place
- maximized windows occupy the desktop canvas minus system chrome
- geometry changes clear maximize state and are saved after a short debounce

## Next Step

If interaction polish becomes a blocker, replace `react-rnd` with a custom pointer-event compositor while keeping the same store contract.
