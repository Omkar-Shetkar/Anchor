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

    // 1. Track tab activation
    if (chrome.tabs?.onActivated) {
      chrome.tabs.onActivated.addListener((activeInfo) => {
        this.setActiveTab(activeInfo.tabId);
      });
    }

    // 2. Track window focus
    if (chrome.windows?.onFocusChanged) {
      chrome.windows.onFocusChanged.addListener((windowId) => {
        this.setWindowFocused(windowId !== chrome.windows.WINDOW_ID_NONE);
      });
    }

    // 3. Track system idle / lock
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
    return this.activeTabId === tabId && this.isWindowFocused && !this.isSystemIdle;
  }

  async recordActiveDwell(tabId: number, secondsElapsed: number): Promise<number | null> {
    if (!this.isTabInForegroundFocus(tabId)) {
      return null;
    }

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
