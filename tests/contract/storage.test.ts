import { describe, it, expect, beforeEach } from "vitest";
import { StorageService } from "../../src/shared/storage";
import type { BrowsingSession } from "../../src/shared/types";

describe("StorageService Contract", () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService(); // Uses MemoryStorageBackend in test environment
  });

  describe("Settings & Domain Management", () => {
    it("initializes default settings with seed domains", async () => {
      const settings = await storage.getSettings();
      expect(settings.version).toBe(1);
      expect(settings.pauseDurationSeconds).toBe(3);
      expect(settings.quickCheckDefaultMinutes).toBe(7);
      expect(settings.mindfulDomains.length).toBeGreaterThan(0);
      expect(settings.mindfulDomains.some((d) => d.domainPattern === "youtube.com")).toBe(true);
    });

    it("adds a new mindful domain and updates settings", async () => {
      await storage.addMindfulDomain("news.ycombinator.com", {
        quickCheckThresholdMinutes: 5
      });
      const settings = await storage.getSettings();
      const match = settings.mindfulDomains.find((d) => d.domainPattern === "news.ycombinator.com");
      expect(match).toBeDefined();
      expect(match?.quickCheckThresholdMinutes).toBe(5);
      expect(match?.isEnabled).toBe(true);
    });

    it("toggles and removes mindful domains", async () => {
      const added = await storage.addMindfulDomain("tiktok.com");
      await storage.toggleMindfulDomain(added.id, false);
      let settings = await storage.getSettings();
      let match = settings.mindfulDomains.find((d) => d.id === added.id);
      expect(match?.isEnabled).toBe(false);

      await storage.removeMindfulDomain(added.id);
      settings = await storage.getSettings();
      match = settings.mindfulDomains.find((d) => d.id === added.id);
      expect(match).toBeUndefined();
    });

    it("verifies isMindfulUrl correctly", async () => {
      const result = await storage.isMindfulUrl("https://www.youtube.com/watch?v=123");
      expect(result.isMindful).toBe(true);
      expect(result.domainConfig?.domainPattern).toBe("youtube.com");

      const nonMindful = await storage.isMindfulUrl("https://docs.google.com");
      expect(nonMindful.isMindful).toBe(false);
    });
  });

  describe("Session Lifecycle & Attention Ledger", () => {
    const sampleSession: BrowsingSession = {
      id: "session-1",
      domain: "youtube.com",
      targetUrl: "https://youtube.com",
      startTime: Date.now() - 60000,
      endTime: null,
      activeDwellSeconds: 0,
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

    it("tracks active session and updates dwell time", async () => {
      await storage.startSession(101, sampleSession);
      let active = await storage.getActiveSession(101);
      expect(active).not.toBeNull();
      expect(active?.id).toBe("session-1");

      await storage.updateSessionDwellTime(101, 15);
      active = await storage.getActiveSession(101);
      expect(active?.activeDwellSeconds).toBe(15);
    });

    it("ends session and writes to Attention Ledger partition", async () => {
      await storage.startSession(102, { ...sampleSession, id: "session-2" });
      await storage.updateSessionDwellTime(102, 120);

      const ended = await storage.endSession(102, "tab_closed", "nourishing");
      expect(ended).not.toBeNull();
      expect(ended?.rating).toBe("nourishing");
      expect(ended?.terminationReason).toBe("tab_closed");

      // Verify active session is removed
      const active = await storage.getActiveSession(102);
      expect(active).toBeNull();

      // Verify recorded in partition
      const sessions = await storage.getSessionsForPeriod(Date.now() - 100000, Date.now() + 10000);
      expect(sessions.some((s) => s.id === "session-2")).toBe(true);
    });

    it("updates session rating retroactively", async () => {
      await storage.startSession(103, { ...sampleSession, id: "session-3" });
      await storage.endSession(103, "tab_closed", "unrated");

      await storage.updateSessionRating("session-3", "draining");
      const sessions = await storage.getSessionsForPeriod(Date.now() - 100000, Date.now() + 10000);
      const target = sessions.find((s) => s.id === "session-3");
      expect(target?.rating).toBe("draining");
    });
  });
});
