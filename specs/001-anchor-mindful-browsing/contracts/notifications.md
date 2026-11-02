# Interface Contract: Notification & UI Micro-Interactions

**Feature**: Anchor - Mindful Browsing & Reflective Time Audit  
**Branch**: `001-anchor-mindful-browsing`  
**Date**: 2026-11-02  

This contract defines the presentation, lifecycle, and interaction contracts for Anchor's notifications and in-page nudges.

---

## 1. Exit Micro-Reflection Notification (`chrome.notifications`)

Triggered upon tab closure or background session termination.

### Specification
- **Notification ID**: `anchor-exit-${sessionId}`
- **Type**: `"basic"`
- **Title**: `Anchor Micro-Reflection`
- **Message**: `How did your time on ${domain} feel?`
- **Icon**: `assets/icons/anchor-64.png`
- **Buttons**:
  1. `Nourishing (Productive)`
  2. `Neutral (Routine)`
  3. `Draining (Doomscrolling)`
- **Auto-Dismiss Timeout**: 5,000 milliseconds (5 seconds).

### Lifecycle Handlers
```typescript
// Button click handler
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId.startsWith("anchor-exit-")) {
    const sessionId = notificationId.replace("anchor-exit-", "");
    const ratingMap: Record<number, SessionRating> = {
      0: "nourishing",
      1: "neutral",
      2: "draining"
    };
    const rating = ratingMap[buttonIndex] || "unrated";
    storageService.updateSessionRating(sessionId, rating);
    chrome.notifications.clear(notificationId);
  }
});
```

---

## 2. In-Page Follow-Up Nudge (Content Script Floating Toast)

Triggered when active foreground dwell time on a mindful site reaches the intention threshold (e.g. 7 minutes for "Quick Check").

### Specification
- **Host Element**: Custom element `<anchor-nudge-toast>` mounted inside an isolated Shadow DOM (`mode: "closed"`) attached to `document.documentElement` to prevent style leaks from/to the host page.
- **Visual Design**:
  - Soothing, non-punitive card with glassmorphic backdrop.
  - Position: Bottom-right corner (`bottom: 24px; right: 24px; z-index: 2147483647`).
  - Non-blocking: Page remains scrollable; does not steal keyboard focus.
  - Message: *"You've been browsing for a bit. Still aligned with your original intention?"*
  - Intention context chip: e.g. *[Quick Check (7m)]*
- **Action Buttons**:
  - `Keep Going`: Dismisses toast, schedules next reminder (if enabled).
  - `Close Tab`: Immediately messages background worker to close current tab and display exit reflection.
- **Dismissal**:
  - Can be dismissed via click or Esc key.
  - Does NOT lock user interaction or video playback.
