# Interface Contract: Extension Internal Messaging

**Feature**: Anchor - Mindful Browsing & Reflective Time Audit  
**Branch**: `001-anchor-mindful-browsing`  
**Date**: 2026-11-02  

This contract defines the strongly-typed message communication across Anchor components: Background Service Worker, Content Scripts, Interstitial Pausing Page, and Popup/Options Dashboard.

All messages conform to the standard discriminated union envelope:

```typescript
interface ExtensionMessage<TType extends string, TPayload = undefined> {
  type: TType;
  payload: TPayload;
}

interface ExtensionResponse<TData = undefined> {
  success: boolean;
  data?: TData;
  error?: string;
}
```

---

## 1. Interstitial Page ➔ Background Worker

### `INTERSTITIAL_INTENTION_SUBMITTED`
Dispatched when the user completes their mindful pause and selects/types their intention.

- **Payload**:
  ```typescript
  {
    targetUrl: string;
    intention: {
      type: "work_research" | "quick_check" | "boredom_escapism" | "custom";
      label: string;
      customText?: string;
      thresholdMinutes?: number;
    };
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    data: {
      sessionId: string;
      targetUrl: string;
    };
  }
  ```
- **Action**: Background worker initializes `BrowsingSession`, associates it with the caller tab, and signals permission to proceed to `targetUrl`.

### `INTERSTITIAL_BOUNCE_CLOSE`
Dispatched when the user chooses "Close Tab" on the interstitial screen.

- **Payload**:
  ```typescript
  {
    targetUrl: string;
  }
  ```
- **Response**: `{ success: boolean }`
- **Action**: Background logs a bounced session (`isBounce: true`, `activeDwellSeconds: 0`), and calls `chrome.tabs.remove(sender.tab.id)`.

---

## 2. Content Script ➔ Background Worker

### `HEARTBEAT_ACTIVE_PULSE`
Dispatched every 5 seconds by the in-page content script while the tab is active, focused, and user interaction (mouse, keyboard, scroll) was observed.

- **Payload**:
  ```typescript
  {
    sessionId: string;
    activeSecondsElapsed: number; // Increment (e.g. 5)
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    data: {
      shouldNudge: boolean;
      nudgeMessage?: string;
      thresholdMinutes?: number;
    };
  }
  ```
- **Action**: Background increments `activeDwellSeconds`. If `activeDwellSeconds >= threshold`, returns `shouldNudge: true` to trigger the in-page reminder.

### `NUDGE_ACTION_SELECTED`
Dispatched when the user clicks an action on the in-page follow-up nudge toast.

- **Payload**:
  ```typescript
  {
    sessionId: string;
    action: "keep_going" | "close_tab";
  }
  ```
- **Response**: `{ success: boolean }`
- **Action**:
  - If `"keep_going"`: Records action in session, resets or extends follow-up interval.
  - If `"close_tab"`: Closes the tab and triggers the exit micro-reflection.

---

## 3. Popup / Options UI ➔ Background Worker

### `GET_CURRENT_STATE`
Queries whether the currently active tab is in a mindful session.

- **Payload**: `undefined`
- **Response**:
  ```typescript
  {
    success: boolean;
    data: {
      isMindfulSite: boolean;
      activeSession?: BrowsingSession;
      settings: UserSettings;
    };
  }
  ```

### `GET_WEEKLY_STORY`
Requests the current week's reflection story and synthesized coaching insights.

- **Payload**: `{ weekIdentifier?: string }` (defaults to current week)
- **Response**:
  ```typescript
  {
    success: boolean;
    data: WeeklyReflectionStory;
  }
  ```

### `UPDATE_SETTINGS`
Persists user configuration changes (adding/removing sites, changing thresholds).

- **Payload**: `Partial<UserSettings>`
- **Response**:
  ```typescript
  {
    success: boolean;
    data: UserSettings;
  }
  ```

---

## 4. Background Worker ➔ Native Notifications

### `SUBMIT_EXIT_RATING`
Triggered via native notification button click or background event listener.

- **Payload**:
  ```typescript
  {
    sessionId: string;
    rating: "nourishing" | "neutral" | "draining";
  }
  ```
- **Action**: Updates session record in `AttentionLedger` and clears notification.
