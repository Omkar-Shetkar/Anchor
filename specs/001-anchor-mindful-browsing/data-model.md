# Data Model: Anchor

**Feature**: Anchor - Mindful Browsing & Reflective Time Audit  
**Branch**: `001-anchor-mindful-browsing`  
**Date**: 2026-11-02  

This document formalizes the data models, state transitions, validation rules, and storage schemas for Anchor.

---

## 1. Entities & Type Definitions

### 1.1 `MindfulDomain`
Represents a website or domain pattern configured for mindful coaching interception.

```typescript
interface MindfulDomain {
  id: string;                         // Unique identifier (UUIDv4)
  domainPattern: string;              // Normalized domain (e.g., "youtube.com", "reddit.com")
  isEnabled: boolean;                 // Whether interception is active for this domain
  quickCheckThresholdMinutes?: number;// Optional custom threshold override (default: uses global setting)
  lateNightSoftCapHour?: number;      // Optional soft cap start hour (0-23, e.g., 21 for 9 PM)
  createdAt: number;                  // Creation timestamp (epoch ms)
  updatedAt: number;                  // Last modification timestamp (epoch ms)
}
```

**Validation Rules**:
- `domainPattern` must be normalized to lowercase, stripped of protocol (`http://`, `https://`), path, port, and leading `www.`.
- `domainPattern` must match a valid hostname regex (`^[a-z0-9-]+(\.[a-z0-9-]+)+$`).
- `quickCheckThresholdMinutes` (if specified) must be an integer between `1` and `60`.
- `lateNightSoftCapHour` (if specified) must be an integer between `0` and `23`.

---

### 1.2 `Intention`
Represents the user's declared purpose when entering a mindful domain.

```typescript
type IntentionType = "work_research" | "quick_check" | "boredom_escapism" | "custom";

interface Intention {
  type: IntentionType;
  label: string;                      // Display text (e.g., "Work/Research", "Quick Check")
  customText?: string;                // User-entered text when type === "custom" (max 140 chars)
  thresholdMinutes?: number;          // Active threshold before triggering follow-up nudge (null if open-ended)
}
```

**Validation Rules**:
- `customText` is required when `type === "custom"` and must be between 1 and 140 characters.
- Pre-configured intention types map to defaults:
  - `"work_research"`: `thresholdMinutes = null` (no automatic timer interruption)
  - `"quick_check"`: `thresholdMinutes = UserSettings.quickCheckDefaultMinutes` (default: 7)
  - `"boredom_escapism"`: `thresholdMinutes = 15`
  - `"custom"`: `thresholdMinutes = UserSettings.quickCheckDefaultMinutes`

---

### 1.3 `SessionRating`
Qualitative feedback captured at session termination.

```typescript
type SessionRating = "nourishing" | "neutral" | "draining" | "unrated";
```

- `"nourishing"`: Productive, energizing, meaningful, or fulfilling (Green).
- `"neutral"`: Routine, utilitarian, unremarkable (Gray).
- `"draining"`: Doomscrolling, compulsive, fatigue-inducing, regretful (Red/Orange).
- `"unrated"`: User dismissed or did not respond to the 5-second exit micro-reflection toast.

---

### 1.4 `BrowsingSession`
A discrete period of engagement on a mindful domain.

```typescript
type SessionTerminationReason = 
  | "tab_closed" 
  | "inactivity_timeout" 
  | "navigated_away" 
  | "browser_quit"
  | "intentional_bounce";

interface NudgeResponse {
  timestamp: number;                  // Epoch ms when nudge was acknowledged
  action: "keep_going" | "close_tab" | "ignored";
}

interface BrowsingSession {
  id: string;                         // UUIDv4
  domain: string;                     // Normalized domain (e.g., "reddit.com")
  targetUrl: string;                  // Destination URL visited
  startTime: number;                  // Session start timestamp (epoch ms)
  endTime: number | null;             // Session termination timestamp (epoch ms, null if active)
  activeDwellSeconds: number;         // Cumulative foreground, active attention time (seconds)
  intention: Intention;               // Declared intention at entry
  nudgeCount: number;                 // Number of in-session nudges displayed
  nudgeResponses: NudgeResponse[];    // Log of interactions with follow-up nudges
  rating: SessionRating;              // Micro-reflection rating
  terminationReason: SessionTerminationReason | null;
  isBounce: boolean;                  // True if user clicked "Close Tab" on the interstitial screen
  isLateNight: boolean;               // True if session occurred between 21:00 and 04:00 local time
}
```

**State Transitions**:
```text
[Initial Navigation]
       │
       ▼
 [INTERSTITIAL] ──(Click "Close Tab")──► [BOUNCED] ──► (Session logged with isBounce=true, 0 dwell time)
       │
  (Intention selected + 3s breath complete)
       │
       ▼
   [ACTIVE] ──(Active dwell reaches threshold)──► [NUDGED] ──("Keep Going")──► [ACTIVE]
       │                                             │
       │                                      ("Close Tab")
       │                                             │
       ├─────────────────────────────────────────────┘
       │
 (Tab closed / >15m idle / Navigated away)
       │
       ▼
 [MICRO_REFLECTION] ──(Rating selected within 5s)──► [RATED] ──► (Attention Ledger updated)
       │
  (5s timeout without response)
       │
       ▼
   [UNRATED] ──────────────────────────────────────────────────► (Attention Ledger updated)
```

---

### 1.5 `UserSettings`
Global extension configuration stored locally.

```typescript
interface IntentionPreset {
  id: string;
  type: IntentionType;
  label: string;
  defaultMinutes?: number;
}

interface UserSettings {
  version: number;                    // Schema version for future migrations (current: 1)
  pauseDurationSeconds: number;       // Breathing animation duration (default: 3, allowed: 3-5)
  quickCheckDefaultMinutes: number;   // Default threshold for "Quick Check" (default: 7)
  idleTimeoutMinutes: number;         // Idle time before session auto-closes (default: 15)
  notificationsEnabled: boolean;      // Whether exit micro-reflections & nudges show native notifications
  softCapsEnabled: boolean;           // Whether late-night soft cap reminders trigger
  soundEnabled: boolean;              // Audio chime toggle (default: false, silent by default)
  mindfulDomains: MindfulDomain[];    // Monitored domain configurations
  intentionPresets: IntentionPreset[];// Presets shown on the interstitial screen
}
```

---

### 1.6 `WeeklyReflectionStory`
Aggregated insights synthesized from historical `BrowsingSession` records.

```typescript
interface DomainSummary {
  domain: string;
  totalActiveSeconds: number;
  sessionCount: number;
  nourishingPercentage: number;
  neutralPercentage: number;
  drainingPercentage: number;
}

interface CoachingSuggestion {
  id: string;
  type: "late_night_soft_cap" | "quick_check_runaway" | "positive_reinforcement";
  headline: string;
  message: string;
  actionableDomain?: string;
  proposedCapHour?: number;           // e.g. 21 (9 PM)
}

interface WeeklyReflectionStory {
  weekIdentifier: string;             // ISO year + week (e.g., "2026-W44")
  startDate: string;                  // ISO 8601 string
  endDate: string;                    // ISO 8601 string
  totalDwellSeconds: number;          // Total active conscious time spent
  totalSessions: number;              // Total number of visits
  totalBounces: number;               // Number of times user turned back at the interstitial screen
  sentimentBreakdown: {
    nourishingCount: number;
    nourishingPercent: number;
    neutralCount: number;
    neutralPercent: number;
    drainingCount: number;
    drainingPercent: number;
    unratedCount: number;
    unratedPercent: number;
  };
  topDomains: DomainSummary[];
  lateNightDrainingPercent: number;   // % of late-night browsing that felt draining
  coachingSuggestions: CoachingSuggestion[];
}
```

---

## 2. Local Storage Schema (`chrome.storage.local`)

All data is stored exclusively in `chrome.storage.local` with prefixed, partitioned keys to ensure rapid lookups and zero database latency:

| Storage Key | Type | Description |
| :--- | :--- | :--- |
| `anchor:settings` | `UserSettings` | User configuration and mindful domain registry. |
| `anchor:active_sessions` | `Record<string, BrowsingSession>` | Map of active `tabId` to in-progress `BrowsingSession`. |
| `anchor:sessions:<year>_<week>` | `BrowsingSession[]` | Weekly partitions of historical session records (e.g., `anchor:sessions:2026_44`). Partitioned to avoid large single reads. |
| `anchor:last_weekly_story` | `WeeklyReflectionStory` | Cached weekly story object, regenerated weekly or on-demand. |

### Retention Policy
- Session partitions older than 90 days are automatically pruned during weekly rollups to prevent storage bloat.
- Settings and aggregate weekly totals remain indefinitely.
