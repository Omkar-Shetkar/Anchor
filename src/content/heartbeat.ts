import { createMessage, type ExtensionResponse } from "../shared/messages";

export interface HeartbeatOptions {
  intervalMs?: number; // default: 5000 (5 seconds)
  onNudgeRequested: (message?: string, thresholdMinutes?: number) => void;
}

export class HeartbeatMonitor {
  private intervalMs: number;
  private timer: any = null;
  private lastActivityTimestamp: number = Date.now();
  private onNudgeRequested: (message?: string, thresholdMinutes?: number) => void;
  private isDestroyed: boolean = false;

  constructor(options: HeartbeatOptions) {
    this.intervalMs = options.intervalMs || 5000;
    this.onNudgeRequested = options.onNudgeRequested;
  }

  private isMediaPlaying(): boolean {
    try {
      const mediaElements = document.querySelectorAll<HTMLMediaElement>("video, audio");
      for (let i = 0; i < mediaElements.length; i++) {
        const el = mediaElements[i];
        if (!el.paused && !el.ended && el.readyState > 2) {
          return true;
        }
      }
    } catch {
      // Ignore DOM access exceptions
    }
    return false;
  }

  start(): void {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Listen to various user interaction events to record activity
    const onActivity = () => {
      this.lastActivityTimestamp = Date.now();
    };

    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });
    window.addEventListener("click", onActivity, { passive: true });
    window.addEventListener("wheel", onActivity, { passive: true });
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });

    // Mark current time as active on start
    this.lastActivityTimestamp = Date.now();

    this.timer = setInterval(() => {
      this.pulse();
    }, this.intervalMs);
  }

  private pulse(): void {
    if (this.isDestroyed || document.hidden) {
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTimestamp;
    const mediaPlaying = this.isMediaPlaying();

    // User is considered engaged if media is actively playing or user interacted within the last 60 seconds
    const isEngaged = mediaPlaying || timeSinceLastActivity <= 60000;

    if (!isEngaged) {
      return;
    }

    const seconds = Math.round(this.intervalMs / 1000);
    const msg = createMessage("HEARTBEAT_ACTIVE_PULSE", {
      activeSecondsElapsed: seconds,
      url: window.location.href
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
