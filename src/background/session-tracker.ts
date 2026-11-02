import { defaultStorageService, StorageService } from "../shared/storage";

export class SessionTracker {
  private storage: StorageService;
  private activeTabId: number | null = null;
  private isWindowFocused: boolean = true;
  private isSystemIdle: boolean = false;
  private lastActiveTimestamp: Map<number, number> = new Map();

  constructor(storage: StorageService = defaultStorageService) {
    this.storage = storage;
  }

  initializeListeners(): void {
    if (typeof chrome === "undefined") return;

    // 1. Initial active tab detection on startup
    if (chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]?.id) {
          this.setActiveTab(tabs[0].id);
        }
      });
    }

    // 2. Track tab activation
    if (chrome.tabs?.onActivated) {
      chrome.tabs.onActivated.addListener((activeInfo) => {
        this.setActiveTab(activeInfo.tabId);
      });
    }

    // 3. Track tab update navigation
    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === "complete") {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]?.id === tabId) {
              this.setActiveTab(tabId);
            }
          });
        }
      });
    }

    // 4. Track window focus
    if (chrome.windows?.onFocusChanged) {
      chrome.windows.onFocusChanged.addListener((windowId) => {
        this.setWindowFocused(windowId !== chrome.windows.WINDOW_ID_NONE);
      });
    }

    // 5. Track system idle / lock
    if (chrome.idle?.onStateChanged) {
      chrome.idle.setDetectionInterval(60); // 60 seconds detection
      chrome.idle.onStateChanged.addListener((newState) => {
        this.setSystemIdle(newState !== "active");
      });
    }
  }

  setActiveTab(tabId: number): void {
    this.activeTabId = tabId;
    this.lastActiveTimestamp.set(tabId, Date.now());
  }

  setWindowFocused(focused: boolean): void {
    this.isWindowFocused = focused;
  }

  setSystemIdle(idle: boolean): void {
    this.isSystemIdle = idle;
  }

  isTabInForegroundFocus(tabId: number): boolean {
    return (this.activeTabId === null || this.activeTabId === tabId) && this.isWindowFocused && !this.isSystemIdle;
  }

  async recordActiveDwell(tabId: number, secondsElapsed: number): Promise<number | null> {
    if (this.isSystemIdle) {
      return null;
    }

    // Content script already verifies document is visible (!document.hidden).
    this.activeTabId = tabId;
    this.lastActiveTimestamp.set(tabId, Date.now());

    const updated = await this.storage.updateSessionDwellTime(tabId, secondsElapsed);
    return updated ? updated.activeDwellSeconds : null;
  }

  getLastActive(tabId: number): number {
    return this.lastActiveTimestamp.get(tabId) || Date.now();
  }

  clearTab(tabId: number): void {
    this.lastActiveTimestamp.delete(tabId);
    if (this.activeTabId === tabId) {
      this.activeTabId = null;
    }
  }
}

export const defaultSessionTracker = new SessionTracker();
