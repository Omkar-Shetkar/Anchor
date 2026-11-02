import { describe, it, expect } from "vitest";
import { synthesizeWeeklyStory } from "../../src/shared/weekly-story";
import type { BrowsingSession } from "../../src/shared/types";

describe("User Story 4: Weekly Reflection Story & Coaching Heuristics", () => {
  it("synthesizes sentiment breakdown and total dwell time accurately", () => {
    const mockSessions: BrowsingSession[] = [
      {
        id: "s1",
        domain: "youtube.com",
        targetUrl: "https://youtube.com",
        startTime: Date.now() - 3600000,
        endTime: Date.now() - 3500000,
        activeDwellSeconds: 600, // 10m
        intention: { type: "work_research", label: "Work" },
        nudgeCount: 0,
        nudgeResponses: [],
        rating: "nourishing",
        terminationReason: "tab_closed",
        isBounce: false,
        isLateNight: false
      },
      {
        id: "s2",
        domain: "reddit.com",
        targetUrl: "https://reddit.com",
        startTime: Date.now() - 1800000,
        endTime: Date.now() - 1200000,
        activeDwellSeconds: 600, // 10m
        intention: { type: "boredom_escapism", label: "Boredom" },
        nudgeCount: 0,
        nudgeResponses: [],
        rating: "draining",
        terminationReason: "tab_closed",
        isBounce: false,
        isLateNight: false
      },
      {
        id: "s3",
        domain: "reddit.com",
        targetUrl: "https://reddit.com",
        startTime: Date.now() - 600000,
        endTime: Date.now() - 300000,
        activeDwellSeconds: 300, // 5m
        intention: { type: "quick_check", label: "Quick Check" },
        nudgeCount: 0,
        nudgeResponses: [],
        rating: "neutral",
        terminationReason: "tab_closed",
        isBounce: false,
        isLateNight: false
      }
    ];

    const story = synthesizeWeeklyStory("2026-W44", mockSessions);

    expect(story.totalDwellSeconds).toBe(1500); // 25 mins
    expect(story.totalSessions).toBe(3);
    expect(story.sentimentBreakdown.nourishingCount).toBe(1);
    expect(story.sentimentBreakdown.neutralCount).toBe(1);
    expect(story.sentimentBreakdown.drainingCount).toBe(1);
    expect(story.sentimentBreakdown.nourishingPercent).toBe(33);
    expect(story.sentimentBreakdown.drainingPercent).toBe(33);
  });

  it("triggers late-night soft cap coaching suggestion when draining sessions concentrate late-night", () => {
    const lateNightSessions: BrowsingSession[] = [
      {
        id: "ln-1",
        domain: "youtube.com",
        targetUrl: "https://youtube.com",
        startTime: Date.now() - 7200000,
        endTime: Date.now() - 3600000,
        activeDwellSeconds: 3600,
        intention: { type: "boredom_escapism", label: "Boredom" },
        nudgeCount: 0,
        nudgeResponses: [],
        rating: "draining",
        terminationReason: "tab_closed",
        isBounce: false,
        isLateNight: true
      },
      {
        id: "ln-2",
        domain: "youtube.com",
        targetUrl: "https://youtube.com",
        startTime: Date.now() - 3600000,
        endTime: Date.now() - 1800000,
        activeDwellSeconds: 1800,
        intention: { type: "quick_check", label: "Quick Check" },
        nudgeCount: 0,
        nudgeResponses: [],
        rating: "draining",
        terminationReason: "tab_closed",
        isBounce: false,
        isLateNight: true
      }
    ];

    const story = synthesizeWeeklyStory("2026-W44", lateNightSessions);

    expect(story.lateNightDrainingPercent).toBe(100);
    const suggestion = story.coachingSuggestions.find((s) => s.type === "late_night_soft_cap");
    expect(suggestion).toBeDefined();
    expect(suggestion?.actionableDomain).toBe("youtube.com");
    expect(suggestion?.proposedCapHour).toBe(21);
    expect(suggestion?.message).toContain("Would you like to set a soft cap for after 9 PM?");
  });
});
