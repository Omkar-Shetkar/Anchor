import { defaultStorageService, StorageService } from "../shared/storage";
import { defaultSessionTracker, SessionTracker } from "./session-tracker";
import { normalizeDomain, extractDomainFromUrl, matchesDomainPattern } from "../shared/domain-matcher";
import {
  type ExtensionMessage,
  type ExtensionResponse,
  createSuccessResponse,
  createErrorResponse
} from "../shared/messages";
import type { BrowsingSession, Intention } from "../shared/types";

export class SessionCoordinator {
  private storage: StorageService;
  private tracker: SessionTracker;

  constructor(
    storage: StorageService = defaultStorageService,
    tracker: SessionTracker = defaultSessionTracker
  ) {
    this.storage = storage;
    this.tracker = tracker;
  }

  isLateNightHour(): boolean {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 4;
  }

  async handleIntentionSubmission(
    tabId: number,
    targetUrl: string,
    intention: Intention
  ): Promise<ExtensionResponse> {
    const domain = extractDomainFromUrl(targetUrl) || normalizeDomain(targetUrl);
    const now = Date.now();
    const sessionId = `session-${now}-${Math.random().toString(36).substring(2, 9)}`;

    const session: BrowsingSession = {
      id: sessionId,
      domain,
      targetUrl,
      startTime: now,
      endTime: null,
      activeDwellSeconds: 0,
      intention,
      nudgeCount: 0,
      nudgeResponses: [],
      rating: "unrated",
      terminationReason: null,
      isBounce: false,
      isLateNight: this.isLateNightHour()
    };

    await this.storage.startSession(tabId, session);
    if (tabId > 0) {
      this.tracker.setActiveTab(tabId);
    }

    return createSuccessResponse({
      sessionId,
      targetUrl
    });
  }

  async handleBounceClose(tabId: number, targetUrl: string): Promise<ExtensionResponse> {
    const domain = extractDomainFromUrl(targetUrl) || normalizeDomain(targetUrl);
    const now = Date.now();
    const sessionId = `bounce-${now}-${Math.random().toString(36).substring(2, 9)}`;

    const bouncedSession: BrowsingSession = {
      id: sessionId,
      domain,
      targetUrl,
      startTime: now,
      endTime: now,
      activeDwellSeconds: 0,
      intention: {
        type: "boredom_escapism",
        label: "Bounced / Mindful Reset"
      },
      nudgeCount: 0,
      nudgeResponses: [],
      rating: "unrated",
      terminationReason: "intentional_bounce",
      isBounce: true,
      isLateNight: this.isLateNightHour()
    };

    await this.storage.recordSession(bouncedSession);

    if (typeof chrome !== "undefined" && chrome.tabs?.remove && tabId > 0) {
      chrome.tabs.remove(tabId);
    }

    return createSuccessResponse();
  }

  async handleHeartbeat(
    tabId: number,
    secondsElapsed: number,
    url?: string
  ): Promise<ExtensionResponse> {
    let session = await this.storage.getActiveSession(tabId);

    // Fallback reassociation if tabId changed or was not set
    if (!session && url) {
      const allActive = await this.storage.getActiveSessions();
      for (const [storedTabId, s] of Object.entries(allActive)) {
        if (matchesDomainPattern(url, s.domain)) {
          session = s;
          if (tabId > 0 && storedTabId !== String(tabId)) {
            await this.storage.reassignActiveSession(storedTabId, tabId, s);
            this.tracker.setActiveTab(tabId);
          }
          break;
        }
      }
    }

    if (!session) {
      return createSuccessResponse({ shouldNudge: false });
    }

    const dwell = await this.tracker.recordActiveDwell(tabId, secondsElapsed);
    if (dwell === null) {
      return createSuccessResponse({ shouldNudge: false });
    }

    // Refresh session to get updated dwell time
    session = (await this.storage.getActiveSession(tabId)) || session;

    if (!session.intention.thresholdMinutes) {
      return createSuccessResponse({ shouldNudge: false });
    }

    const thresholdSec = session.intention.thresholdMinutes * 60;
    // Trigger follow-up nudge when dwell time crosses threshold and hasn't nudged yet
    if (session.activeDwellSeconds >= thresholdSec && session.nudgeCount === 0) {
      session.nudgeCount++;
      await this.storage.startSession(tabId, session); // Update session with nudge count

      return createSuccessResponse({
        shouldNudge: true,
        nudgeMessage: "You've been browsing for a bit. Still aligned with your original intention?",
        thresholdMinutes: session.intention.thresholdMinutes
      });
    }

    return createSuccessResponse({ shouldNudge: false });
  }

  async handleNudgeAction(tabId: number, action: "keep_going" | "close_tab"): Promise<ExtensionResponse> {
    const session = await this.storage.getActiveSession(tabId);
    if (session) {
      session.nudgeResponses.push({
        timestamp: Date.now(),
        action
      });
      await this.storage.startSession(tabId, session);
    }

    if (action === "close_tab") {
      if (typeof chrome !== "undefined" && chrome.tabs?.remove && tabId > 0) {
        chrome.tabs.remove(tabId);
      }
    }

    return createSuccessResponse();
  }

  async handleGetCurrentState(tabId: number, url?: string): Promise<ExtensionResponse> {
    let activeSession = await this.storage.getActiveSession(tabId);

    // Fallback search across active sessions if tabId did not match (e.g. extension page tabId vs content script tabId in Firefox)
    if (!activeSession && url) {
      const allActive = await this.storage.getActiveSessions();
      for (const [storedTabId, session] of Object.entries(allActive)) {
        if (matchesDomainPattern(url, session.domain)) {
          activeSession = session;
          if (tabId > 0 && storedTabId !== String(tabId)) {
            await this.storage.reassignActiveSession(storedTabId, tabId, session);
            this.tracker.setActiveTab(tabId);
          }
          break;
        }
      }
    }

    const settings = await this.storage.getSettings();

    return createSuccessResponse({
      isMindfulSite: !!activeSession,
      activeSession: activeSession || undefined,
      settings
    });
  }

  async processMessage(
    message: ExtensionMessage,
    senderTabId?: number
  ): Promise<ExtensionResponse> {
    if (!message || !message.type) {
      return createErrorResponse("Invalid message payload");
    }

    const payloadTabId = message.payload?.tabId;
    const tabId = payloadTabId || senderTabId || 0;

    switch (message.type) {
      case "INTERSTITIAL_INTENTION_SUBMITTED": {
        const { targetUrl, intention } = message.payload || {};
        if (!targetUrl || !intention) {
          return createErrorResponse("Missing targetUrl or intention");
        }
        return this.handleIntentionSubmission(tabId, targetUrl, intention);
      }

      case "INTERSTITIAL_BOUNCE_CLOSE": {
        const { targetUrl } = message.payload || {};
        return this.handleBounceClose(tabId, targetUrl || "");
      }

      case "HEARTBEAT_ACTIVE_PULSE": {
        const seconds = message.payload?.activeSecondsElapsed || 5;
        const url = message.payload?.url;
        return this.handleHeartbeat(tabId, seconds, url);
      }

      case "NUDGE_ACTION_SELECTED": {
        const action = message.payload?.action || "keep_going";
        return this.handleNudgeAction(tabId, action);
      }

      case "GET_CURRENT_STATE": {
        const url = message.payload?.url;
        return this.handleGetCurrentState(tabId, url);
      }

      case "UPDATE_SETTINGS": {
        const updated = await this.storage.updateSettings(message.payload || {});
        return createSuccessResponse(updated);
      }

      case "SUBMIT_EXIT_RATING": {
        const { sessionId, rating } = message.payload || {};
        if (sessionId && rating) {
          await this.storage.updateSessionRating(sessionId, rating);
          return createSuccessResponse();
        }
        return createErrorResponse("Missing sessionId or rating");
      }

      default:
        return createErrorResponse(`Unhandled message type: ${message.type}`);
    }
  }

  async handleTabClosed(tabId: number): Promise<BrowsingSession | null> {
    const session = await this.storage.endSession(tabId, "tab_closed", "unrated");
    return session;
  }
}

export const defaultSessionCoordinator = new SessionCoordinator();
