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
});
