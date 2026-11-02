import type { MindfulDomain } from "./types";

/**
 * Normalizes a domain pattern or input string.
 * Strips protocol, paths, www prefix, port, and trailing slashes.
 */
export function normalizeDomain(input: string): string {
  if (!input) return "";

  let cleaned = input.trim().toLowerCase();

  // Remove protocol
  cleaned = cleaned.replace(/^[a-z]+:\/\//i, "");

  // Remove port and path
  cleaned = cleaned.split("/")[0].split(":")[0];

  // Remove leading www.
  cleaned = cleaned.replace(/^www\./, "");

  return cleaned;
}

/**
 * Extracts and normalizes hostname from a full URL.
 * Returns null if the URL is invalid or an internal browser scheme.
 */
export function extractDomainFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Ignore non-http/https schemes (e.g. chrome://, about:, moz-extension://)
    if (!parsed.protocol.startsWith("http")) {
      return null;
    }

    return normalizeDomain(parsed.hostname);
  } catch {
    // If not a valid URL, try normalizing directly
    return normalizeDomain(url) || null;
  }
}

/**
 * Checks if a given URL matches a domain pattern.
 * Supports exact domain and subdomains (e.g., m.youtube.com matches youtube.com),
 * while preventing partial false matches (e.g. notyoutube.com does not match youtube.com).
 */
export function matchesDomainPattern(url: string, domainPattern: string): boolean {
  const urlDomain = extractDomainFromUrl(url);
  const targetPattern = normalizeDomain(domainPattern);

  if (!urlDomain || !targetPattern) {
    return false;
  }

  if (urlDomain === targetPattern) {
    return true;
  }

  // Check for subdomain match (e.g. *.targetPattern)
  if (urlDomain.endsWith("." + targetPattern)) {
    return true;
  }

  return false;
}

/**
 * Searches a list of MindfulDomains to find an enabled matching rule for a URL.
 */
export function findMatchingMindfulDomain(
  url: string,
  mindfulDomains: MindfulDomain[]
): MindfulDomain | null {
  if (!url || !Array.isArray(mindfulDomains)) {
    return null;
  }

  for (const item of mindfulDomains) {
    if (item.isEnabled && matchesDomainPattern(url, item.domainPattern)) {
      return item;
    }
  }

  return null;
}
