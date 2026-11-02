import { describe, it, expect } from "vitest";
import {
  normalizeDomain,
  extractDomainFromUrl,
  matchesDomainPattern,
  findMatchingMindfulDomain
} from "../../src/shared/domain-matcher";
import type { MindfulDomain } from "../../src/shared/types";

describe("domain-matcher", () => {
  describe("normalizeDomain", () => {
    it("strips https, path, and trailing slashes", () => {
      expect(normalizeDomain("https://youtube.com/watch?v=123")).toBe("youtube.com");
      expect(normalizeDomain("http://reddit.com/r/technology/")).toBe("reddit.com");
    });

    it("strips leading www.", () => {
      expect(normalizeDomain("www.nytimes.com")).toBe("nytimes.com");
      expect(normalizeDomain("https://www.youtube.com")).toBe("youtube.com");
    });

    it("strips port numbers", () => {
      expect(normalizeDomain("localhost:3000/app")).toBe("localhost");
      expect(normalizeDomain("http://example.com:8080/")).toBe("example.com");
    });

    it("handles whitespace and case insensitivity", () => {
      expect(normalizeDomain("  YOUTUBE.COM  ")).toBe("youtube.com");
    });
  });

  describe("extractDomainFromUrl", () => {
    it("extracts hostname from valid URLs", () => {
      expect(extractDomainFromUrl("https://news.ycombinator.com/item?id=1")).toBe("news.ycombinator.com");
    });

    it("returns null for internal browser schemes", () => {
      expect(extractDomainFromUrl("chrome://extensions")).toBeNull();
      expect(extractDomainFromUrl("about:debugging")).toBeNull();
      expect(extractDomainFromUrl("moz-extension://abc-123/page.html")).toBeNull();
    });
  });

  describe("matchesDomainPattern", () => {
    it("matches exact domains", () => {
      expect(matchesDomainPattern("https://reddit.com/hot", "reddit.com")).toBe(true);
      expect(matchesDomainPattern("https://www.reddit.com", "reddit.com")).toBe(true);
    });

    it("matches subdomains correctly", () => {
      expect(matchesDomainPattern("https://m.youtube.com/watch", "youtube.com")).toBe(true);
      expect(matchesDomainPattern("https://music.youtube.com", "youtube.com")).toBe(true);
    });

    it("rejects false positives and suffix attacks", () => {
      expect(matchesDomainPattern("https://fakeyoutube.com", "youtube.com")).toBe(false);
      expect(matchesDomainPattern("https://youtube.com.attacker.com", "youtube.com")).toBe(false);
      expect(matchesDomainPattern("https://myreddit.com", "reddit.com")).toBe(false);
    });
  });

  describe("findMatchingMindfulDomain", () => {
    const mockDomains: MindfulDomain[] = [
      {
        id: "1",
        domainPattern: "youtube.com",
        isEnabled: true,
        createdAt: 1000,
        updatedAt: 1000
      },
      {
        id: "2",
        domainPattern: "reddit.com",
        isEnabled: false, // disabled
        createdAt: 1000,
        updatedAt: 1000
      }
    ];

    it("finds matching enabled domain", () => {
      const match = findMatchingMindfulDomain("https://www.youtube.com/feed", mockDomains);
      expect(match).not.toBeNull();
      expect(match?.domainPattern).toBe("youtube.com");
    });

    it("ignores disabled domains", () => {
      const match = findMatchingMindfulDomain("https://reddit.com/r/all", mockDomains);
      expect(match).toBeNull();
    });

    it("returns null for non-mindful domains", () => {
      const match = findMatchingMindfulDomain("https://github.com", mockDomains);
      expect(match).toBeNull();
    });
  });
});
