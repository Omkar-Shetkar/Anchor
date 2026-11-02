import { createMessage, type ExtensionResponse } from "../shared/messages";

export interface HeartbeatOptions {
  intervalMs?: number; // default: 5000 (5 seconds)
  onNudgeRequested: (message?: string, thresholdMinutes?: number) => void;
}

export class HeartbeatMonitor {
  private intervalMs: number;
  private timer: any = null;
  private hasRecentActivity: boolean = false;
  private onNudgeRequested: (message?: string, thresholdMinutes?: number) => void;
  private isDestroyed: boolean = false;

  constructor(options: HeartbeatOptions) {
    this.intervalMs = options.intervalMs || 5000;
    this.onNudgeRequested = options.onNudgeRequested;
  }

  start(): void {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Activity listeners (throttled)
    const onActivity = () => {
      this.hasRecentActivity = true;
    };

    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });
    window.addEventListener("click", onActivity, { passive: true });

    // Initial activity assumption on page load
    this.hasRecentActivity = true;

    this.timer = setInterval(() => {
      this.pulse();
    }, this.intervalMs);
  }

  private pulse(): void {
    if (this.isDestroyed || document.hidden || !this.hasRecentActivity) {
      return;
    }

    // Reset activity flag until next user interaction
    this.hasRecentActivity = false;

    const seconds = Math.round(this.intervalMs / 1000);
    const msg = createMessage("HEARTBEAT_ACTIVE_PULSE", {
      activeSecondsElapsed: seconds
    });

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(msg, (response: ExtensionResponse) => {
        if (chrome.runtime.lastError) {
          // Extension reloaded or disconnected
          return;
        }

        if (response && response.success && response.data?.shouldNudge) {
          this.onNudgeRequested(response.data.nudgeMessage, response.data.thresholdMinutes);
        }
      });
    }
  }

  stop(): void {
    this.isDestroyed = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
