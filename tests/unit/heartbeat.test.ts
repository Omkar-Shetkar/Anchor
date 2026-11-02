import { describe, it, expect } from "vitest";
import type { BrowsingSession } from "../../src/shared/types";

describe("User Story 3: Gentle In-Session Follow-Up & Heartbeats", () => {
  function evaluateNudgeThreshold(session: BrowsingSession): { shouldNudge: boolean; message?: string } {
    const thresholdMinutes = session.intention.thresholdMinutes;
    if (!thresholdMinutes) {
      return { shouldNudge: false };
    }

    const thresholdSeconds = thresholdMinutes * 60;
    // Nudge triggers when dwell time meets threshold and hasn't already been nudged for this interval
    if (session.activeDwellSeconds >= thresholdSeconds && session.nudgeCount === 0) {
      return {
        shouldNudge: true,
        message: "You've been browsing for a bit. Still aligned with your original intention?"
      };
    }

    return { shouldNudge: false };
  }

  it("triggers nudge when active dwell time meets intention threshold (7 mins)", () => {
    const session: BrowsingSession = {
      id: "session-nudge-1",
      domain: "youtube.com",
      targetUrl: "https://youtube.com",
      startTime: Date.now() - 500000,
      endTime: null,
      activeDwellSeconds: 420, // 7 minutes
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

    const result = evaluateNudgeThreshold(session);
    expect(result.shouldNudge).toBe(true);
    expect(result.message).toContain("Still aligned with your original intention?");
  });

  it("does not trigger nudge if under threshold (e.g. 4 minutes into 7 minute threshold)", () => {
    const session: BrowsingSession = {
      id: "session-nudge-2",
      domain: "youtube.com",
      targetUrl: "https://youtube.com",
      startTime: Date.now() - 240000,
      endTime: null,
      activeDwellSeconds: 240, // 4 minutes
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

    const result = evaluateNudgeThreshold(session);
    expect(result.shouldNudge).toBe(false);
  });

  it("does not trigger nudge for open-ended Work/Research sessions without cap", () => {
    const session: BrowsingSession = {
      id: "session-nudge-3",
      domain: "reddit.com",
      targetUrl: "https://reddit.com/r/programming",
      startTime: Date.now() - 3600000,
      endTime: null,
      activeDwellSeconds: 3600, // 1 hour
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

    const result = evaluateNudgeThreshold(session);
    expect(result.shouldNudge).toBe(false);
  });

  it("reassigns orphaned session on GET_CURRENT_STATE and triggers nudge on heartbeat crossing cap", async () => {
    const { StorageService } = await import("../../src/shared/storage");
    const { SessionTracker } = await import("../../src/background/session-tracker");
    const { SessionCoordinator } = await import("../../src/background/session-coordinator");

    const storage = new StorageService();
    const tracker = new SessionTracker(storage);
    const coordinator = new SessionCoordinator(storage, tracker);

    // Simulate Firefox interstitial submitting intention with tabId 0 (orphaned extension context)
    await coordinator.handleIntentionSubmission(0, "https://www.youtube.com/watch?v=abc", {
      type: "quick_check",
      label: "Quick Check",
      thresholdMinutes: 5
    });

    // Content script runs in real tabId 42 and queries state with URL
    const stateResp = await coordinator.handleGetCurrentState(42, "https://www.youtube.com/watch?v=abc");
    expect(stateResp.success).toBe(true);
    expect(stateResp.data.isMindfulSite).toBe(true);
    expect(stateResp.data.activeSession.domain).toBe("youtube.com");

    // Verify session was reassigned to tabId 42
    const sessionInTab42 = await storage.getActiveSession(42);
    expect(sessionInTab42).not.toBeNull();

    // Heartbeat under 5m cap (295s < 300s)
    const hb1 = await coordinator.handleHeartbeat(42, 295, "https://www.youtube.com/watch?v=abc");
    expect(hb1.success).toBe(true);
    expect(hb1.data.shouldNudge).toBe(false);

    // Heartbeat crossing 5m cap (total 305s >= 300s)
    const hb2 = await coordinator.handleHeartbeat(42, 10, "https://www.youtube.com/watch?v=abc");
    expect(hb2.success).toBe(true);
    expect(hb2.data.shouldNudge).toBe(true);
    expect(hb2.data.thresholdMinutes).toBe(5);
  });
});
