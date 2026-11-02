import { describe, it, expect, beforeEach } from "vitest";
import { StorageService } from "../../src/shared/storage";

describe("User Story 5: Mindful Site & Coach Preference Management", () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService();
  });

  it("adds and normalizes a new mindful domain", async () => {
    const domain = await storage.addMindfulDomain("https://www.tiktok.com/@user", {
      quickCheckThresholdMinutes: 5
    });

    expect(domain.domainPattern).toBe("tiktok.com");
    expect(domain.quickCheckThresholdMinutes).toBe(5);

    const settings = await storage.getSettings();
    expect(settings.mindfulDomains.some((d) => d.domainPattern === "tiktok.com")).toBe(true);
  });

  it("updates existing domain instead of creating duplicate", async () => {
    await storage.addMindfulDomain("youtube.com", { quickCheckThresholdMinutes: 10 });
    const settings = await storage.getSettings();
    const matches = settings.mindfulDomains.filter((d) => d.domainPattern === "youtube.com");

    expect(matches.length).toBe(1);
    expect(matches[0].quickCheckThresholdMinutes).toBe(10);
  });

  it("toggles mindful domain enabled state", async () => {
    const settings = await storage.getSettings();
    const youtube = settings.mindfulDomains.find((d) => d.domainPattern === "youtube.com");
    expect(youtube).toBeDefined();

    await storage.toggleMindfulDomain(youtube!.id, false);
    const updated = await storage.getSettings();
    const updatedYoutube = updated.mindfulDomains.find((d) => d.id === youtube!.id);

    expect(updatedYoutube?.isEnabled).toBe(false);
  });

  it("removes a mindful domain", async () => {
    const settings = await storage.getSettings();
    const reddit = settings.mindfulDomains.find((d) => d.domainPattern === "reddit.com");
    expect(reddit).toBeDefined();

    await storage.removeMindfulDomain(reddit!.id);
    const updated = await storage.getSettings();
    expect(updated.mindfulDomains.some((d) => d.id === reddit!.id)).toBe(false);
  });

  it("updates coach timing preferences (pause duration, quick check threshold)", async () => {
    await storage.updateSettings({
      pauseDurationSeconds: 4,
      quickCheckDefaultMinutes: 10,
      notificationsEnabled: false
    });

    const settings = await storage.getSettings();
    expect(settings.pauseDurationSeconds).toBe(4);
    expect(settings.quickCheckDefaultMinutes).toBe(10);
    expect(settings.notificationsEnabled).toBe(false);
  });
});
