# Workstreams

`trijbOS` uses internal agent-style workstreams as planning and execution boundaries. These are not external APIs. They are a structured way to split ownership so the Web OS can move quickly without cross-domain drift.

## Execution Order

1. Repo audit
2. Targeted research
3. Architecture and milestone plan
4. Build core shell
5. Build window manager
6. Build taskbar, launcher, settings, and theme
7. Build file explorer and storage
8. Add core apps
9. QA, performance, cleanup, and docs

## Active Workstreams

### Repo Audit

- Owns current-state inspection, technical debt review, reusable component discovery, and regression spotting.
- Produces findings with file references and concrete risks.
- Must run before major refactors or subsystem additions.

### Product Architecture

- Owns subsystem boundaries, MVP scope control, delivery sequencing, and ADR-level decisions.
- Protects the project from feature creep and weak contracts.
- Resolves cross-cutting decisions involving shell, apps, storage, and runtime.

### UI/UX Systems

- Owns visual language, desktop ergonomics, design tokens, interaction rules, and accessibility baselines.
- Defines shell primitives, window anatomy, taskbar behavior, launcher behavior, and settings information architecture.
- Keeps theming token-driven instead of component-specific.

### Frontend Implementation

- Owns React/Vite implementation, module boundaries, component assembly, and shell/windowing behavior.
- Builds against architecture and UI contracts rather than redefining them in code.
- Keeps runtime logic centralized and avoids app-specific platform drift.

### Persistence/Data

- Owns IndexedDB schema, storage bootstrap, migrations, simulated file system, import/export, and session restore.
- Guards data integrity and keeps persistence behind explicit interfaces.
- Treats corrupted state and migration failure as product risks, not edge cases.

### QA/Performance

- Owns validation strategy, critical flow coverage, regression checks, and interaction-performance budgets.
- Prioritizes shell correctness, window management, persistence safety, and cross-browser sanity.
- Defines release gates for the MVP.

### Documentation

- Owns scope docs, architecture docs, contributor guidance, roadmap maintenance, and change summaries.
- Updates source-of-truth docs when architecture or workflow changes land.
- Keeps implementation aligned with written contracts.

## Operating Rules

- One workstream can lead a task, but cross-domain changes require explicit handoff notes in the PR or commit summary.
- Workstreams should produce concise outputs: findings, decisions, risks, changed files, and next step.
- No workstream bypasses architecture or persistence boundaries by convenience.
- If scope conflicts with the 2-week MVP deadline, ruthlessly prioritize shell usability and persistence correctness first.

## Required Reporting Format

All major work should report:

- `A. Current understanding`
- `B. Repo findings`
- `C. Research conclusions`
- `D. Architecture decisions`
- `E. Current build task`
- `F. Files changed`
- `G. Risks/blockers`
- `H. Next highest-value step`
