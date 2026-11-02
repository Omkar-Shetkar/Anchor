import { defaultStorageService, StorageService } from "../shared/storage";
import type { SessionRating } from "../shared/types";

export class NotificationManager {
  private storage: StorageService;
  private activeDismissTimers: Map<string, any> = new Map();

  constructor(storage: StorageService = defaultStorageService) {
    this.storage = storage;
  }

  initializeListeners(): void {
    if (typeof chrome === "undefined" || !chrome.notifications) return;

    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      this.handleNotificationButtonClick(notificationId, buttonIndex);
    });

    chrome.notifications.onClosed.addListener((notificationId) => {
      this.clearDismissTimer(notificationId);
    });
  }

  /**
   * Triggers a frictionless 5-second exit micro-reflection notification.
   */
  async showExitMicroReflection(sessionId: string, domain: string): Promise<string | null> {
    const settings = await this.storage.getSettings();
    if (!settings.notificationsEnabled) {
      return null;
    }

    if (typeof chrome === "undefined" || !chrome.notifications?.create) {
      return null;
    }

    const notificationId = `anchor-exit-${sessionId}`;

    const iconUrl = chrome.runtime?.getURL ? chrome.runtime.getURL("assets/icons/icon-48.png") : "assets/icons/icon-48.png";

    chrome.notifications.create(
      notificationId,
      {
        type: "basic",
        iconUrl,
        title: "Anchor • Micro-Reflection",
        message: `How did your time on ${domain} feel?`,
        buttons: [
          { title: "🌿 Nourishing (Productive)" },
          { title: "⚖️ Neutral (Routine)" },
          { title: "🌧️ Draining (Doomscroll)" }
        ],
        priority: 1,
        requireInteraction: false
      },
      () => {
        // Auto-dismiss after 5 seconds to remain non-judgmental and frictionless
        const timer = setTimeout(() => {
          chrome.notifications.clear(notificationId);
          this.clearDismissTimer(notificationId);
        }, 5000);

        this.activeDismissTimers.set(notificationId, timer);
      }
    );

    return notificationId;
  }

  private clearDismissTimer(notificationId: string): void {
    if (this.activeDismissTimers.has(notificationId)) {
      clearTimeout(this.activeDismissTimers.get(notificationId));
      this.activeDismissTimers.delete(notificationId);
    }
  }

  async handleNotificationButtonClick(notificationId: string, buttonIndex: number): Promise<void> {
    if (!notificationId.startsWith("anchor-exit-")) return;

    this.clearDismissTimer(notificationId);
    const sessionId = notificationId.replace("anchor-exit-", "");

    const ratingMap: Record<number, SessionRating> = {
      0: "nourishing",
      1: "neutral",
      2: "draining"
    };

    const rating = ratingMap[buttonIndex] || "unrated";
    await this.storage.updateSessionRating(sessionId, rating);

    if (typeof chrome !== "undefined" && chrome.notifications?.clear) {
      chrome.notifications.clear(notificationId);
    }
  }

  async submitRating(sessionId: string, rating: SessionRating): Promise<void> {
    await this.storage.updateSessionRating(sessionId, rating);
  }
}

export const defaultNotificationManager = new NotificationManager();
