# ⚓ Anchor: Mindful Browsing & Reflective Time Audit

> **Drop anchor before you drift away in a sea of tabs.**  
> A supportive, non-judgmental digital well-being browser extension for Google Chrome and Mozilla Firefox.

---

## Overview

Instead of treating the browser like an adversary with rigid site blockers that provoke rebellion, **Anchor** acts as a supportive digital well-being coach:
1. **Front Door Interception (Mindful Pause)**: Halts automatic, impulsive clicks with a calming 3–4 second animated breathing circle and an intention prompt (*"What brings you here right now?"*).
2. **In-Session Gentle Realignment**: Softly checks in at 7 minutes during quick-check sessions (*"Still aligned with your original intention?"*) with options to keep going or close the tab without blocking your screen.
3. **Qualitative Time Audit (Attention Ledger)**: Captures emotional context upon exit (*Nourishing / Productive*, *Neutral / Routine*, *Draining / Doomscrolling*) with a frictionless 5-second micro-reflection.
4. **Non-Judgmental Weekly Reflection Story**: Synthesizes time and sentiment into an empathetic weekly insight card with proactive suggestions (e.g. setting soft caps after 9 PM) without shame metrics or punitive streaks.
5. **100% Client-Side Privacy**: All browsing records, intentions, and sentiment ratings stay strictly inside your local browser storage (`chrome.storage.local`). Zero analytics, zero external network traffic.

---

## Quickstart & Development

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Development Mode (Watch)

```bash
# Build with watch mode for Chrome
npm run dev:chrome

# Build with watch mode for Firefox
npm run dev:firefox
```

### 3. Production Build

```bash
# Compiles both Chrome (dist/chrome) and Firefox (dist/firefox) extensions
npm run build
```

### 4. Running Tests & Typecheck

```bash
# Run Vitest test suite
npm test

# Run TypeScript type check
npm run typecheck
```

---

## Loading the Extension in Browsers

### Google Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `/dist/chrome` directory in this project.

### Mozilla Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `dist/firefox/manifest.json`.

---

## Architecture & Project Structure

```text
src/
├── background/
│   ├── index.ts                 # Service worker / background event coordinator
│   ├── navigation-interceptor.ts# Mindful URL interception & pause redirection
│   ├── session-coordinator.ts   # Session initialization, heartbeats & bounce logic
│   ├── session-tracker.ts       # Active dwell time & idle listener
│   └── notification-manager.ts  # 5-second exit micro-reflection notifications
├── content/
│   ├── index.ts                 # Content script entry point (document_start)
│   ├── heartbeat.ts             # 5s active engagement pulse
│   └── nudge-toast.ts           # Isolated Shadow DOM in-page follow-up nudge
├── interstitial/
│   ├── interstitial.html        # Clean distraction-free pause screen
│   ├── interstitial.ts          # Breathing animation & intention selector
│   └── interstitial.css         # Soothing aesthetic & breathing keyframes
├── popup/
│   ├── popup.html               # Extension toolbar popup & options
│   ├── popup.ts                 # Controller for dashboard & weekly story
│   ├── popup.css                # Premium calm styling & story cards
│   ├── settings-controller.ts   # Domain management & timing sliders
│   └── weekly-story-view.ts     # Weekly Reflection Story & soft cap action
├── shared/
│   ├── types.ts                 # Data models, intentions, sessions, settings
│   ├── storage.ts               # Local storage service implementation
│   ├── domain-matcher.ts        # URL normalization & mindful site matching
│   ├── messages.ts              # Type-safe extension messaging protocol
│   └── weekly-story.ts          # Aggregate ledger rollup & coaching heuristics
└── assets/
    ├── icons/                   # Extension icons (16, 32, 48, 128)
    └── styles/                  # Shared design tokens & calm CSS theme
```

---

## License

MIT
