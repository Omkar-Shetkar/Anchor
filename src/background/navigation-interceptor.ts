import { defaultStorageService, StorageService } from "../shared/storage";
import { matchesDomainPattern } from "../shared/domain-matcher";

export class NavigationInterceptor {
  private storage: StorageService;
  private pendingRedirects = new Set<number>();

  constructor(storage: StorageService = defaultStorageService) {
    this.storage = storage;
  }

  /**
   * Evaluates if a navigation target should be paused with the interstitial screen.
   */
  async shouldIntercept(tabId: number, targetUrl: string): Promise<boolean> {
    if (!targetUrl || !targetUrl.startsWith("http")) {
      return false;
    }

    // Do not intercept if already on the interstitial page
    const extensionUrl = typeof chrome !== "undefined" && chrome.runtime?.getURL ? chrome.runtime.getURL("") : "";
    if (extensionUrl && targetUrl.startsWith(extensionUrl)) {
      return false;
    }

    // Check if the URL is a mindful domain
    const { isMindful, domainConfig } = await this.storage.isMindfulUrl(targetUrl);
    if (!isMindful || !domainConfig) {
      return false;
    }

    // Check if an active session already exists for this tab on this domain
    const activeSession = await this.storage.getActiveSession(tabId);
    if (activeSession && matchesDomainPattern(targetUrl, activeSession.domain)) {
      // User is already browsing within an ongoing conscious session on this domain
      return false;
    }

    return true;
  }

  /**
   * Handles tab navigation update and redirects to interstitial pause screen if needed.
   */
  async handleNavigation(tabId: number, targetUrl: string): Promise<boolean> {
    if (this.pendingRedirects.has(tabId)) {
      return false;
    }

    const intercept = await this.shouldIntercept(tabId, targetUrl);
    if (!intercept) {
      return false;
    }

    this.pendingRedirects.add(tabId);

    const interstitialUrl = typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL(`interstitial/interstitial.html?target=${encodeURIComponent(targetUrl)}`)
      : `interstitial/interstitial.html?target=${encodeURIComponent(targetUrl)}`;

    if (typeof chrome !== "undefined" && chrome.tabs?.update) {
      chrome.tabs.update(tabId, { url: interstitialUrl }, () => {
        setTimeout(() => this.pendingRedirects.delete(tabId), 1000);
      });
      return true;
    }

    this.pendingRedirects.delete(tabId);
    return false;
  }
}

export const defaultNavigationInterceptor = new NavigationInterceptor();
