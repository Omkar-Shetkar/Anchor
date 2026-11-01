# Tasks: Anchor - Mindful Browsing & Reflective Time Audit

**Input**: Design documents from `specs/001-anchor-mindful-browsing/`  
**Prerequisites**: [plan.md](file:///Users/omkar/projects/Anchor/specs/001-anchor-mindful-browsing/plan.md), [spec.md](file:///Users/omkar/projects/Anchor/specs/001-anchor-mindful-browsing/spec.md), [research.md](file:///Users/omkar/projects/Anchor/specs/001-anchor-mindful-browsing/research.md), [data-model.md](file:///Users/omkar/projects/Anchor/specs/001-anchor-mindful-browsing/data-model.md), [contracts/](file:///Users/omkar/projects/Anchor/specs/001-anchor-mindful-browsing/contracts/)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Exact file paths are specified for every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and build configuration for Chrome and Firefox WebExtension MV3.

- [ ] T001 Initialize package configuration with dependencies (`webextension-polyfill`, `vite`, `typescript`, `vitest`, `@types/chrome`, `@types/webextension-polyfill`) in `package.json`
- [ ] T002 [P] Configure TypeScript compiler options for modern WebExtension development in `tsconfig.json`
- [ ] T003 [P] Configure Vite build configuration for multi-target Chrome and Firefox builds in `vite.config.ts`
- [ ] T004 [P] Create WebExtension Manifest V3 templates in `src/manifest.chrome.json` and `src/manifest.firefox.json`
- [ ] T005 [P] Setup extension assets, logo icons (16, 32, 48, 128), and soothing design tokens in `src/assets/styles/tokens.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models, domain matching, typed storage layer, and message contracts that all user stories depend on.

- [ ] T006 Define shared TypeScript data models and interfaces (`MindfulDomain`, `Intention`, `BrowsingSession`, `UserSettings`, `WeeklyReflectionStory`) in `src/shared/types.ts`
- [ ] T007 [P] Implement domain matching, URL normalization, and subdomain handling utilities in `src/shared/domain-matcher.ts`
- [ ] T008 [P] Unit tests for domain matching in `tests/unit/domain-matcher.test.ts`
- [ ] T009 Implement typed local storage service (`IStorageService`) with initial default domains seed in `src/shared/storage.ts`
- [ ] T010 [P] Contract tests for storage service operations and schema migrations in `tests/contract/storage.test.ts`
- [ ] T011 Define internal messaging types and protocol contracts in `src/shared/messages.ts`
- [ ] T012 [P] Contract tests for message payload validation in `tests/contract/messages.test.ts`

**Checkpoint**: Core foundation ready — User Story implementation can now proceed independently.

---

## Phase 3: User Story 1 - Mindful Interception & Intention Setting (Priority: P1) 🎯 MVP

**Goal**: Intercept navigation to configured mindful sites before destination loads, display a 3-second breathing circle animation and intention prompt ("Work/Research", "Quick Check", "Boredom/Escapism", or custom text), and either proceed with an active session or close the tab immediately.

**Independent Test**: Navigate to `youtube.com` or `reddit.com`. Verify the interstitial pause page opens instantly, page content is held back from loading, the breathing circle animates for 3 seconds, clicking "Close Tab" bounces the visit, and selecting an intention pill creates a session and redirects to the site.

### Tests for User Story 1
- [ ] T013 [P] [US1] Create unit tests for session lifecycle transitions and intention recording in `tests/unit/session-tracker.test.ts`

### Implementation for User Story 1
- [ ] T014 [P] [US1] Build interstitial page HTML structure in `src/interstitial/interstitial.html`
- [ ] T015 [P] [US1] Implement interstitial CSS styling, soothing colors, and 3-second breathing circle keyframe animation in `src/interstitial/interstitial.css`
- [ ] T016 [US1] Implement intention pill selection, custom text box handling, and "Close Tab" bounce action in `src/interstitial/interstitial.ts`
- [ ] T017 [US1] Implement background navigation listener to intercept unauthenticated mindful navigations and redirect to `interstitial.html` in `src/background/navigation-interceptor.ts`
- [ ] T018 [US1] Implement background session initializer handling `INTERSTITIAL_INTENTION_SUBMITTED` and `INTERSTITIAL_BOUNCE_CLOSE` messages in `src/background/session-coordinator.ts`
- [ ] T019 [US1] Register background service worker entry point wiring navigation interceptor and session coordinator in `src/background/index.ts`

**Checkpoint**: At this point, User Story 1 is fully functional and delivers the core mindful pause MVP.

---

## Phase 4: User Story 2 - Exit Micro-Reflection & Attention Ledger (Priority: P1)

**Goal**: Detect session termination (tab closed, >15m inactivity, screen lock), present a 5-second frictionless exit micro-reflection toast asking "How did this session feel?" with three qualitative choices (Nourishing, Neutral, Draining), and persist the session record with active dwell time into the Attention Ledger.

**Independent Test**: Complete a browsing session on a mindful site, close the tab, verify a 5-second notification appears with 3 sentiment buttons, click "Nourishing", and verify the session is stored in local storage with the correct dwell time, intention, and sentiment.

### Tests for User Story 2
- [ ] T020 [P] [US2] Create unit tests for session termination events, dwell time accumulation, and micro-reflection auto-dismissal in `tests/unit/exit-reflection.test.ts`

### Implementation for User Story 2
- [ ] T021 [US2] Implement active foreground dwell time tracking and idle state detection (`chrome.idle`, window focus listeners) in `src/background/session-tracker.ts`
- [ ] T022 [US2] Implement exit micro-reflection notification generator with 3 action buttons and 5-second auto-clear timer in `src/background/notification-manager.ts`
- [ ] T023 [US2] Wire tab removal (`chrome.tabs.onRemoved`) and idle timeout listeners to finalize sessions and trigger micro-reflection in `src/background/session-coordinator.ts`
- [ ] T024 [US2] Implement session rating submission handler and Attention Ledger persistence in `src/background/notification-manager.ts`

**Checkpoint**: Both User Story 1 and User Story 2 operate together, creating the complete "Anchor & Audit" feedback loop.

---

## Phase 5: User Story 3 - Gentle In-Session Follow-Up (Priority: P2)

**Goal**: For sessions initiated with "Quick Check" (or capped intention), monitor active dwell time and display a gentle, non-blocking in-page reminder ("You've been browsing for a bit. Still aligned with your original intention?") at 7 minutes with "Keep Going" and "Close Tab" actions.

**Independent Test**: Start a session with the "Quick Check" intention, browse until active dwell time exceeds threshold (or test duration), verify non-blocking toast slides in, verify "Keep Going" dismisses without interrupting scrolling, and verify "Close Tab" closes the tab.

### Tests for User Story 3
- [ ] T025 [P] [US3] Create unit tests for active dwell time pulse evaluation and nudge triggering in `tests/unit/heartbeat.test.ts`

### Implementation for User Story 3
- [ ] T026 [P] [US3] Implement isolated Shadow DOM in-page follow-up nudge component and CSS animations in `src/content/nudge-toast.ts`
- [ ] T027 [US3] Implement user activity heartbeat monitor (5s throttled pulse for active engagement) in `src/content/heartbeat.ts`
- [ ] T028 [US3] Implement content script entry point registering heartbeat and rendering nudge toast upon background command in `src/content/index.ts`
- [ ] T029 [US3] Implement background heartbeat responder and nudge threshold trigger in `src/background/session-coordinator.ts`
- [ ] T030 [US3] Handle `NUDGE_ACTION_SELECTED` ("keep_going" or "close_tab") in `src/background/session-coordinator.ts`

**Checkpoint**: User Stories 1, 2, and 3 are all independently testable and functional.

---

## Phase 6: User Story 5 - Mindful Site & Coach Preference Management (Priority: P2)

**Goal**: Allow users to manage the mindful domain registry (add/remove/toggle domains), customize breathing pause duration (3-5s), adjust the quick-check threshold minutes, and configure notification preferences in the toolbar popup.

**Independent Test**: Open extension popup, add a new domain (e.g. `news.ycombinator.com`), change quick check duration to 5 minutes, navigate to the newly added domain, and verify Anchor intercepts the visit using the new duration.

### Tests for User Story 5
- [ ] T031 [P] [US5] Create unit tests for settings validation and domain list mutations in `tests/unit/settings.test.ts`

### Implementation for User Story 5
- [ ] T032 [P] [US5] Build popup toolbar UI layout for live session status and settings tabs in `src/popup/popup.html`
- [ ] T033 [P] [US5] Style popup UI with mindful theme, domain list toggles, and duration sliders in `src/popup/popup.css`
- [ ] T034 [US5] Implement settings controller for adding/removing domains and persisting user preferences in `src/popup/settings-controller.ts`
- [ ] T035 [US5] Wire popup lifecycle and live session status synchronization in `src/popup/popup.ts`

**Checkpoint**: User preferences can be customized and dynamically update background and interstitial behavior.

---

## Phase 7: User Story 4 - Weekly Reflection Story & Supportive Insights (Priority: P3)

**Goal**: Compile historical Attention Ledger records into a non-judgmental, empathetic weekly reflection card highlighting total conscious time, sentiment breakdown (% nourishing vs % draining), temporal trends (late-night sessions), and proactive coaching suggestions (e.g., soft caps after 9 PM).

**Independent Test**: Load synthetic session history spanning 7 days, open Weekly Story view in the popup, verify empathetic stats and late-night draining trends render smoothly, and verify accepting a soft cap suggestion updates settings.

### Tests for User Story 4
- [ ] T036 [P] [US4] Create unit tests for weekly session aggregation, sentiment calculations, and late-night coaching heuristics in `tests/unit/weekly-story.test.ts`

### Implementation for User Story 4
- [ ] T037 [US4] Implement weekly aggregation engine and supportive coaching heuristics in `src/shared/weekly-story.ts`
- [ ] T038 [P] [US4] Build Weekly Reflection Story card view and narrative visual presentation in `src/popup/weekly-story-view.ts`
- [ ] T039 [US4] Integrate soft cap recommendation acceptance workflow (applying domain-specific late-night soft cap) in `src/popup/weekly-story-view.ts`

**Checkpoint**: All user stories from specification are complete, creating a comprehensive digital well-being extension.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cross-browser packaging, dark/light theme support, automated verification, and documentation.

- [ ] T040 [P] Create packaging script for automated Chrome and Firefox ZIP bundles in `scripts/package-extension.js`
- [ ] T041 Implement dark mode / light mode system preference detection and accessible contrast styles in `src/assets/styles/tokens.css`
- [ ] T042 Perform cross-browser manifest verification and full test suite execution per `quickstart.md`
- [ ] T043 [P] Update developer documentation and release checklist in `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately; no dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (Foundation ready).
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion; can run in parallel with or following US1.
- **User Story 3 (Phase 5)**: Depends on Phase 3 and Phase 4 completion (requires active session tracking).
- **User Story 5 (Phase 6)**: Depends on Phase 2 completion (settings storage interface).
- **User Story 4 (Phase 7)**: Depends on Phase 4 completion (requires Attention Ledger session records).
- **Polish (Phase 8)**: Depends on all user stories being implemented.

### Parallel Opportunities

```bash
# Parallel setup tasks:
Task: "Configure TypeScript in tsconfig.json"
Task: "Configure Vite in vite.config.ts"
Task: "Create Manifests in src/manifest.chrome.json and src/manifest.firefox.json"
Task: "Setup CSS tokens in src/assets/styles/tokens.css"

# Parallel foundational tests & utilities:
Task: "Unit tests in tests/unit/domain-matcher.test.ts"
Task: "Contract tests in tests/contract/storage.test.ts"
Task: "Contract tests in tests/contract/messages.test.ts"

# Parallel User Story 1 frontend components:
Task: "HTML structure in src/interstitial/interstitial.html"
Task: "CSS animations in src/interstitial/interstitial.css"
Task: "Unit tests in tests/unit/session-tracker.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1: Mindful Interception & Breathing Reset).
3. **Validate MVP**: Load extension in Chrome/Firefox, navigate to YouTube or Reddit, and verify mindful pause and intention pill selection.

### Incremental Delivery
1. Foundation + US1 ➔ Working mindful pause interceptor (MVP).
2. Add US2 ➔ Full "Anchor & Audit" loop (exit micro-reflection + local attention ledger).
3. Add US3 ➔ Gentle 7-minute in-session follow-up nudges.
4. Add US5 ➔ Popup settings and domain customization.
5. Add US4 ➔ Empathetic weekly reflection stories and late-night soft cap coaching.
