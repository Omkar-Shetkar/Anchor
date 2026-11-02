# Interface Contract: Storage Service API

**Feature**: Anchor - Mindful Browsing & Reflective Time Audit  
**Branch**: `001-anchor-mindful-browsing`  
**Date**: 2026-11-02  

This contract defines the client-side storage interface for managing settings, active sessions, and historical Attention Ledger records.

---

## `IStorageService` Interface

```typescript
export interface IStorageService {
  /**
   * Initializes default settings if first run.
   */
  initialize(): Promise<UserSettings>;

  /**
   * Retrieves current user settings.
   */
  getSettings(): Promise<UserSettings>;

  /**
   * Updates user settings with a partial patch.
   */
  updateSettings(patch: Partial<UserSettings>): Promise<UserSettings>;

  /**
   * Mindful domain helpers
   */
  addMindfulDomain(domainPattern: string, options?: Partial<MindfulDomain>): Promise<MindfulDomain>;
  removeMindfulDomain(domainId: string): Promise<void>;
  toggleMindfulDomain(domainId: string, isEnabled: boolean): Promise<void>;
  isMindfulUrl(url: string): Promise<{ isMindful: boolean; domainConfig?: MindfulDomain }>;

  /**
   * Active session tracking
   */
  getActiveSession(tabId: number): Promise<BrowsingSession | null>;
  startSession(tabId: number, session: BrowsingSession): Promise<void>;
  updateSessionDwellTime(tabId: number, additionalSeconds: number): Promise<BrowsingSession>;
  endSession(tabId: number, terminationReason: SessionTerminationReason, rating?: SessionRating): Promise<BrowsingSession | null>;

  /**
   * Attention ledger historical queries
   */
  recordSession(session: BrowsingSession): Promise<void>;
  updateSessionRating(sessionId: string, rating: SessionRating): Promise<void>;
  getSessionsForPeriod(startDateMs: number, endDateMs: number): Promise<BrowsingSession[]>;
  getWeeklySessions(year: number, weekNumber: number): Promise<BrowsingSession[]>;
  pruneSessionsOlderThan(cutoffTimestampMs: number): Promise<number>;
}
```

---

## Default Seed Data

On initial install (`version === 0`), the storage service seeds the following defaults:

```typescript
export const DEFAULT_USER_SETTINGS: UserSettings = {
  version: 1,
  pauseDurationSeconds: 3,
  quickCheckDefaultMinutes: 7,
  idleTimeoutMinutes: 15,
  notificationsEnabled: true,
  softCapsEnabled: true,
  soundEnabled: false,
  mindfulDomains: [
    {
      id: "domain-youtube",
      domainPattern: "youtube.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 7,
      lateNightSoftCapHour: 21,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "domain-reddit",
      domainPattern: "reddit.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 7,
      lateNightSoftCapHour: 21,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "domain-x",
      domainPattern: "x.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 7,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "domain-instagram",
      domainPattern: "instagram.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 5,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  intentionPresets: [
    { id: "preset-work", type: "work_research", label: "Work / Research" },
    { id: "preset-quick", type: "quick_check", label: "Quick Check", defaultMinutes: 7 },
    { id: "preset-escape", type: "boredom_escapism", label: "Boredom / Escapism", defaultMinutes: 15 }
  ]
};
```
