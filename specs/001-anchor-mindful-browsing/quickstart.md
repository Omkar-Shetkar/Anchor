# Quickstart: Anchor Extension

**Feature**: Anchor - Mindful Browsing & Reflective Time Audit  
**Branch**: `001-anchor-mindful-browsing`  
**Date**: 2026-11-02  

This guide provides step-by-step instructions for setting up, building, running, and testing the Anchor browser extension locally on Google Chrome and Mozilla Firefox.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Browsers**: Google Chrome (v102+) and Mozilla Firefox (v109+)

---

## 2. Setup & Installation

From the project root:

```bash
# Install dependencies
npm install
```

---

## 3. Development & Build

### Development Mode (with Live Reload / Watch)
```bash
# Build with watch mode for Chrome
npm run dev:chrome

# Build with watch mode for Firefox
npm run dev:firefox
```

### Production Build
```bash
# Typecheck and bundle for both browsers
npm run build

# Or browser-specific bundles:
npm run build:chrome   # Outputs to dist/chrome
npm run build:firefox  # Outputs to dist/firefox
```

---

## 4. Loading the Extension in Browsers

### Google Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the build directory: `/Users/omkar/projects/Anchor/dist/chrome`.
5. The Anchor icon will appear in your extensions toolbar.

### Mozilla Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `dist/firefox/manifest.json`.
4. The Anchor add-on is now loaded for testing.

---

## 5. Running Tests

```bash
# Run unit & contract tests with Vitest
npm test

# Run tests with coverage
npm run test:coverage

# Run TypeScript type check
npm run typecheck
```

---

## 6. Manual Verification Flow

1. **Mindful Interception**:
   - Open a new tab and navigate to `https://www.youtube.com` or `https://www.reddit.com`.
   - Verify that Anchor intercepts before page content loads, rendering the 3-second breathing circle animation.
   - Click "Close Tab" to verify intentional bounce (tab closes immediately).
   - Re-open, select the "Quick Check" pill, and verify the site smoothly loads.

2. **In-Session Follow-Up**:
   - Stay active on the site for 7 minutes (or set test threshold to 10 seconds in settings).
   - Verify non-blocking floating reminder slides in from bottom-right.
   - Verify "Keep Going" dismisses without interrupting scrolling.

3. **Exit Micro-Reflection**:
   - Close the mindful site tab.
   - Verify a 5-second notification appears: *"How did this session feel?"*.
   - Click **Nourishing** or **Draining** to rate.
   - Open the Anchor popup icon in the browser toolbar and verify the session appears in the Attention Ledger with the selected sentiment.

4. **Weekly Reflection Story**:
   - Open the Anchor toolbar popup and click **Weekly Story**.
   - Verify that empathetic stats, sentiment distribution, and time-of-day insights display smoothly.
