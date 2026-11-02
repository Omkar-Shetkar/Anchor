# Research & Architectural Decisions: Anchor

**Feature**: Anchor - Mindful Browsing & Reflective Time Audit  
**Branch**: `001-anchor-mindful-browsing`  
**Date**: 2026-11-02  

This document consolidates architectural research, technology selections, and trade-off evaluations for Anchor across Chrome and Firefox.

---

## 1. Interception Engine Architecture (Mindful Pause)

### Decision
Use a **hybrid interception model**:
1. A dedicated standalone Interstitial Extension Page (`interstitial.html`) invoked for initial navigation to a mindful domain when no active session exists.
2. In-page content script injected at `document_start` with an isolated Shadow DOM container for the in-session follow-up nudges (7-minute "Quick Check" reminder) and in-page notifications.

### Rationale
- **Zero Resource Waste & Anti-Distraction**: By redirecting initial requests to `interstitial.html?target=<url>` before the destination site loads, heavy scripts, tracking pixels, video players, and autoplay feeds (like YouTube or Reddit) are completely prevented from loading during the 3-second breathing reset. If the user chooses "Close Tab", zero bandwidth or algorithmic stimuli were ever loaded.
- **Visual Stability (Zero FOUC)**: Avoids flashes of unstyled content or jarring page flashes that occur when trying to hide an already rendering DOM using CSS injection.
- **Clean Session Handoff**: Once the user selects an intention ("Work/Research", "Quick Check", "Boredom/Escapism" or custom text), the interstitial page messages the background service worker to create an `ActiveSession` record and redirects the tab to the target URL. Subsequent page clicks within that domain (e.g. sub-pages) are recognized as part of the existing session and pass through without interruption.

### Alternatives Considered
- *In-Page DOM Overlay Only*: Injected via content scripts. Rejected because target pages still load heavy network assets in the background, autoplay media can start playing audio under the modal, and sites with complex CSS/z-index or Content Security Policies (CSP) can interfere with overlay styling.
- *Blocking declarativeNetRequest rules only*: MV3 `declarativeNetRequest` can redirect, but dynamically passing intentions and handling state transitions without extension pages is awkward and inflexible across Chrome and Firefox differences.

---

## 2. Cross-Browser WebExtension Platform & Manifest V3

### Decision
Target **WebExtension Manifest V3** with cross-browser abstraction:
- Use `webextension-polyfill` (`browser.*` namespace with Promise support).
- Manifest structure tailored for cross-browser packaging:
  - Chrome: Service worker background (`background.service_worker`).
  - Firefox: Event background script (`background.scripts`).
- Build step generates target-specific manifests (`manifest.chrome.json` and `manifest.firefox.json`) or a unified build using standard MV3 manifest conventions supported by both modern Chrome (102+) and Firefox (109+).

### Rationale
- Firefox and Chrome both support WebExtension MV3 with slight differences in background execution. Using `webextension-polyfill` guarantees clean, asynchronous `async/await` syntax without callback hell.
- Standardized APIs (`storage.local`, `tabs`, `idle`, `notifications`, `alarms`) behave consistently when accessed via the polyfill.

### Alternatives Considered
- *Manifest V2*: Deprecated in Chrome Web Store; will be permanently removed. Building on MV2 would create immediate technical debt.
- *Browser-specific codebases*: Maintaining two separate codebases increases maintenance cost by 2x. A shared codebase with a single build step is industry standard.

---

## 3. Active Dwell Time & Session State Engine

### Decision
Maintain an event-driven session manager inside the background context tracking:
1. `chrome.tabs.onActivated` and `chrome.windows.onFocusChanged` to measure true foreground attention time vs passive background tabs.
2. `chrome.idle.onStateChanged` with a detection threshold of 60 seconds of user inactivity (or system lock).
3. Heartbeat pings from the active tab content script every 5 seconds to verify user engagement (scrolling, mouse movement, keystrokes).
4. Auto-closing sessions after 15 minutes of inactivity or tab closure.

### Rationale
- Traditional screen-time trackers count time as long as a tab is open, erroneously logging 8 hours of YouTube if a tab was forgotten in the background.
- Anchor's philosophy is "Attention Awareness", which demands measuring only genuine human attention.
- Heartbeats coupled with browser focus and idle listeners ensure high fidelity without excessive CPU usage.

### Alternatives Considered
- *Pure timestamp diffing (`now - startTime`)*: Produces wildly inaccurate metrics whenever the user steps away from the keyboard, locks their laptop, or leaves tabs open overnight.
- *Aggressive DOM event listeners*: Attaching high-frequency listeners to every mousemove on the page degrades site performance. 5-second throttled activity flags completely mitigate performance overhead.

---

## 4. Exit Micro-Reflection Notification Mechanism

### Decision
Use a dual-channel micro-reflection delivery:
1. **On Tab Close**: When the tab is closed, the background worker triggers a native OS/browser notification (`chrome.notifications.create`) with 3 action buttons:
   - Green: Nourishing / Productive
   - Gray: Neutral / Routine
   - Red/Orange: Draining / Doomscrolling
   The notification auto-clears after 5 seconds if ignored, recording the session as unrated.
2. **On In-Page Session End (Inactivity or Domain Navigation Away)**: If the tab remains open but session times out (15 mins) or the user navigates to an untracked site, a gentle, non-intrusive floating toast appears inside the page or on return, allowing one-click rating before vanishing.

### Rationale
- Content scripts are destroyed the moment a tab is closed. Only the background worker can communicate with the user after a tab close via the native notifications API.
- Native notifications with actionable buttons offer instant 1-click rating without taking focus away from whatever the user opened next.
- The 5-second automatic timeout satisfies the core requirement of being non-judgmental and frictionless.

### Alternatives Considered
- *Blocking `beforeunload` dialog*: Standard web browser `beforeunload` prompts are restricted to generic "Do you want to leave this site?" dialogs; browsers do not permit custom HTML or buttons in `beforeunload`.
- *Modal popup on next browser open*: Delays the reflection too far from the actual experience, ruining the micro-reflection's emotional accuracy.

---

## 5. Technology Stack & Build Tooling

### Decision
- **Language**: TypeScript (strict mode) for data models, session state machine, and browser API types (`@types/chrome`, `@types/webextension-polyfill`).
- **Build Tool**: Vite with Vanilla TS and CSS for high speed, zero runtime overhead, and fast HMR during development.
- **CSS Architecture**: Vanilla CSS with modern custom properties (tokens for colors, spacing, typography, transitions) and a soothing wellness aesthetic (warm stone, sage greens, deep slate, soft glassmorphism).
- **Storage**: `chrome.storage.local` with a strongly-typed schema wrapper and indexed query utilities.
- **Testing**:
  - Unit tests: Vitest with simulated browser API mocks for session calculations, attention ledger aggregation, and state transitions.
  - Contract & Integration tests: Testing storage schema migrations, message schemas between content scripts, interstitial pages, popup, and background service worker.

### Rationale
- A digital well-being extension must be featherweight and instant. Heavy UI frameworks (e.g. large React bundles) add unnecessary bundle bloat and page injection latency.
- Vanilla TypeScript + CSS ensures the interstitial pause and follow-up toasts load in <20ms.
- Vitest provides sub-second test execution.

### Alternatives Considered
- *React / Next.js*: Overkill for interstitial cards, small settings popups, and non-blocking in-page toasts. Introduces bundle size overhead (100KB+ runtime) where lightweight components load in <5KB.
- *Webpack*: Slower build and configuration complexity compared to modern Vite.

---

## 6. Weekly Reflection Story Architecture

### Decision
Store raw session records in a rolling 90-day partitioned local log (`sessions_<year>_<week>`). When the user opens the Weekly Reflection view:
1. Aggregate records on-the-fly into summary stats (total minutes, sentiment percentage distribution, hourly distribution).
2. Run rule-based coaching heuristics:
   - *Late-Night Fatigue heuristic*: If >50% of sessions occurring between 21:00 and 04:00 are rated "Draining", produce the soft cap suggestion.
   - *Intention vs Outcome heuristic*: If "Quick Check" sessions frequently exceed 20+ minutes and result in "Draining" ratings, gently highlight the pattern.
3. Render the reflection story using a card-based narrative presentation (clean visual breakdown, supportive copy, zero guilt/shame terminology).

### Rationale
- Running aggregation locally on 90 days of session data takes under 15ms in JS, eliminating the need for complex indexed database engines while guaranteeing total privacy.
- Rule-based heuristics are transparent, deterministic, and easily customizable by the user.
