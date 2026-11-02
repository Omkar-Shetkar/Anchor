import { describe, it, expect, beforeEach } from "vitest";
import { StorageService } from "../../src/shared/storage";
import type { BrowsingSession, SessionRating } from "../../src/shared/types";

describe("User Story 2: Exit Micro-Reflection & Attention Ledger", () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService();
  });

  it("finalizes a session with active dwell time and records to Attention Ledger", async () => {
    const session: BrowsingSession = {
      id: "session-exit-1",
      domain: "youtube.com",
      targetUrl: "https://www.youtube.com",
      startTime: Date.now() - 300000, // 5 mins ago
      endTime: null,
      activeDwellSeconds: 240, // 4 mins active
      intention: {
        type: "work_research",
        label: "Work / Research",
        thresholdMinutes: null
      },
      nudgeCount: 0,
      nudgeResponses: [],
      rating: "unrated",
      terminationReason: null,
      isBounce: false,
      isLateNight: false
    };

    await storage.startSession(201, session);
    const ended = await storage.endSession(201, "tab_closed", "unrated");

    expect(ended).not.toBeNull();
    expect(ended?.terminationReason).toBe("tab_closed");
    expect(ended?.activeDwellSeconds).toBe(240);
    expect(ended?.rating).toBe("unrated");

    // Verify session removed from active sessions
    const active = await storage.getActiveSession(201);
    expect(active).toBeNull();
  });

  it("updates session with qualitative rating (nourishing, neutral, draining)", async () => {
    const session: BrowsingSession = {
      id: "session-exit-2",
      domain: "reddit.com",
      targetUrl: "https://reddit.com",
      startTime: Date.now() - 120000,
      endTime: null,
      activeDwellSeconds: 90,
      intention: {
        type: "quick_check",
        label: "Quick Check",
        thresholdMinutes: 7
      },
      nudgeCount: 0,
      nudgeResponses: [],
      rating: "unrated",
      terminationReason: null,
      isBounce: false,
      isLateNight: false
    };

    await storage.startSession(202, session);
    await storage.endSession(202, "tab_closed", "unrated");

    const ratings: SessionRating[] = ["nourishing", "neutral", "draining"];
    for (const r of ratings) {
      await storage.updateSessionRating("session-exit-2", r);
      const sessions = await storage.getSessionsForPeriod(Date.now() - 200000, Date.now() + 10000);
      const target = sessions.find((s) => s.id === "session-exit-2");
      expect(target?.rating).toBe(r);
    }
  });
});
