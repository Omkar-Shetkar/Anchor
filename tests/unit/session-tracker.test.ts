import { describe, it, expect, beforeEach } from "vitest";
import { StorageService } from "../../src/shared/storage";
import type { BrowsingSession, Intention } from "../../src/shared/types";

describe("User Story 1: Session Tracking & Lifecycle", () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService();
  });

  it("creates an active session on valid intention submission", async () => {
    const intention: Intention = {
      type: "work_research",
      label: "Work / Research",
      thresholdMinutes: null
    };

    const session: BrowsingSession = {
      id: "session-mvp-1",
      domain: "youtube.com",
      targetUrl: "https://www.youtube.com/watch?v=sample",
      startTime: Date.now(),
      endTime: null,
      activeDwellSeconds: 0,
      intention,
      nudgeCount: 0,
      nudgeResponses: [],
      rating: "unrated",
      terminationReason: null,
      isBounce: false,
      isLateNight: false
    };

    await storage.startSession(1, session);
    const active = await storage.getActiveSession(1);

    expect(active).not.toBeNull();
    expect(active?.domain).toBe("youtube.com");
    expect(active?.intention.type).toBe("work_research");
    expect(active?.isBounce).toBe(false);
  });

  it("records an intentional bounce when user closes tab from interstitial", async () => {
    const intention: Intention = {
      type: "quick_check",
      label: "Quick Check",
      thresholdMinutes: 7
    };

    const bouncedSession: BrowsingSession = {
      id: "session-bounce-1",
      domain: "reddit.com",
      targetUrl: "https://reddit.com",
      startTime: Date.now(),
      endTime: Date.now(),
      activeDwellSeconds: 0,
      intention,
      nudgeCount: 0,
      nudgeResponses: [],
      rating: "unrated",
      terminationReason: "intentional_bounce",
      isBounce: true,
      isLateNight: false
    };

    await storage.recordSession(bouncedSession);

    const sessions = await storage.getSessionsForPeriod(Date.now() - 5000, Date.now() + 5000);
    const recorded = sessions.find((s) => s.id === "session-bounce-1");

    expect(recorded).toBeDefined();
    expect(recorded?.isBounce).toBe(true);
    expect(recorded?.terminationReason).toBe("intentional_bounce");
    expect(recorded?.activeDwellSeconds).toBe(0);
  });
});
