# Implementation Plan: Anchor - Mindful Browsing & Reflective Time Audit

**Branch**: `001-anchor-mindful-browsing` | **Date**: 2026-11-02 | **Spec**: [specs/001-anchor-mindful-browsing/spec.md](file:///Users/omkar/projects/Anchor/specs/001-anchor-mindful-browsing/spec.md)  
**Input**: Feature specification from `specs/001-anchor-mindful-browsing/spec.md`

## Summary

Anchor is a digital well-being browser extension for Mozilla Firefox and Google Chrome that operates as a supportive browsing coach rather than an adversary. It intercepts automatic habitual visits to user-defined mindful sites with a 3–4 second animated breathing pause and intention prompt ("What brings you here right now?"), provides gentle non-blocking realignment nudges during "Quick Check" sessions exceeding 7 minutes, captures 5-second exit micro-reflections ("How did this session feel? Nourishing / Neutral / Draining"), and synthesizes local data into an empathetic, non-punitive Weekly Reflection Story.

The technical approach implements a cross-browser WebExtension Manifest V3 application built with TypeScript, modern Vanilla CSS with calm design tokens, and Vite. Interceptions run via a lightweight interstitial extension page preventing heavy network loading, in-session nudges render via isolated Shadow DOM content scripts, and all records persist locally in partitioned `chrome.storage.local` keys with zero outbound telemetry.

## Technical Context

**Language/Version**: TypeScript 5.4+ / Modern ES Modules (ES2022)  
**Primary Dependencies**: `webextension-polyfill` (cross-browser Promise APIs), Vite (build pipeline)  
**Storage**: `chrome.storage.local` (partitioned weekly sessions, settings, local-only)  
**Testing**: Vitest with `@testing-library` / simulated browser API mocks  
**Target Platform**: Google Chrome (v102+) & Mozilla Firefox (v109+) Manifest V3  
**Project Type**: Browser Extension (WebExtension MV3)  
**Performance Goals**: <100ms interstitial pause presentation, <20ms content script injection latency, <15ms weekly aggregation computation, zero background memory leak  
**Constraints**: 100% offline-capable, client-side only (0 external network requests or tracking pixels), non-blocking in-session UI, high-contrast accessibility  
**Scale/Scope**: 5 core components (background coordinator, content script nudges, interstitial pause page, popup & weekly story dashboard, shared storage & coaching engine)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate 1: Client-First Privacy (PASSED)**: Zero network calls or external telemetry. 100% of session durations, declared intentions, and sentiment ratings are stored and processed strictly within the user's local browser storage.
- **Gate 2: Lightweight Simplicity & YAGNI (PASSED)**: Uses standard Vanilla TypeScript and CSS with zero heavy runtime UI frameworks (e.g., no React or Angular bloat), ensuring minimal memory footprint and instant startup.
- **Gate 3: Testability by Design (PASSED)**: Core logic (dwell time calculations, domain matching, intention state machines, weekly reflection heuristics) is strictly isolated from browser globals, allowing 100% test coverage in Vitest without full browser orchestration.
- **Gate 4: Cross-Browser Manifest V3 Standard (PASSED)**: Built on standard WebExtension APIs with `webextension-polyfill`, ensuring identical functionality and appearance across Google Chrome and Mozilla Firefox.

## Project Structure

### Documentation (this feature)

```text
specs/001-anchor-mindful-browsing/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── extension-messages.md
│   ├── storage-api.md
│   └── notifications.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── background/
│   ├── index.ts                 # Service worker / background event coordinator
│   ├── session-tracker.ts       # Active dwell time & idle listener
│   └── notification-manager.ts  # Exit prompt & browser notifications
├── content/
│   ├── index.ts                 # Content script entry point (document_start)
│   ├── heartbeat.ts             # 5s active engagement pulse
│   └── nudge-toast.ts           # Shadow DOM in-page follow-up toast
├── interstitial/
│   ├── interstitial.html        # Clean distraction-free pause screen
│   ├── interstitial.ts          # Breathing animation & intention selector
│   └── interstitial.css         # Soothing aesthetic & breathing keyframes
├── popup/
│   ├── popup.html               # Extension toolbar popup & options
│   ├── popup.ts                 # Controller for dashboard & weekly story
│   └── popup.css                # Premium calm styling & story cards
├── shared/
│   ├── types.ts                 # Data models, intentions, sessions, settings
│   ├── storage.ts               # Local storage service implementation
│   ├── domain-matcher.ts        # URL normalization & mindful site matching
│   └── weekly-story.ts          # Aggregate ledger rollup & coaching heuristics
└── assets/
    ├── icons/                   # Extension icons (16, 32, 48, 128)
    └── styles/                  # Shared design tokens & calm CSS theme

tests/
├── unit/
│   ├── session-tracker.test.ts  # Dwell time & state transitions
│   ├── domain-matcher.test.ts   # Domain parsing and pattern matching
│   └── weekly-story.test.ts     # Aggregate calculation & heuristics
└── contract/
    ├── storage.test.ts          # Storage schema & migration tests
    └── messages.test.ts         # Internal message typing & validation
```

**Structure Decision**: A cohesive, single WebExtension package with cleanly separated execution contexts:
- `src/background/`: Manages global lifecycle, idle states, session timers, and native notifications.
- `src/content/`: Injected into mindful sites to send engagement heartbeats and render the isolated Shadow DOM follow-up nudge.
- `src/interstitial/`: Dedicated tab page intercepting visits before destination loading.
- `src/popup/`: Toolbar popup housing the live session status, quick settings, and the Weekly Reflection Story.
- `src/shared/`: Shared domain logic, TypeScript interfaces, and storage utilities.

## Complexity Tracking

*No constitution violations or unjustified architectural patterns.*
