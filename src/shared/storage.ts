import type {
  MindfulDomain,
  BrowsingSession,
  UserSettings,
  SessionRating,
  SessionTerminationReason
} from "./types";
import { findMatchingMindfulDomain, normalizeDomain } from "./domain-matcher";

export interface IStorageBackend {
  get(keys?: string | string[] | null): Promise<Record<string, any>>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

class MemoryStorageBackend implements IStorageBackend {
  private store: Map<string, any> = new Map();

  async get(keys?: string | string[] | null): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    if (!keys || keys === null) {
      for (const [key, val] of this.store.entries()) {
        result[key] = JSON.parse(JSON.stringify(val));
      }
      return result;
    }
    const keyArray = Array.isArray(keys) ? keys : [keys];
    for (const key of keyArray) {
      if (this.store.has(key)) {
        result[key] = JSON.parse(JSON.stringify(this.store.get(key)));
      }
    }
    return result;
  }

  async set(items: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      this.store.set(key, JSON.parse(JSON.stringify(value)));
    }
  }

  async remove(keys: string | string[]): Promise<void> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    for (const key of keyArray) {
      this.store.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

class ExtensionStorageBackend implements IStorageBackend {
  private getStorageArea() {
    if (typeof chrome !== "undefined" && chrome?.storage?.local) {
      return chrome.storage.local;
    }
    // @ts-ignore
    if (typeof browser !== "undefined" && browser?.storage?.local) {
      // @ts-ignore
      return browser.storage.local;
    }
    return null;
  }

  async get(keys?: string | string[] | null): Promise<Record<string, any>> {
    const storage = this.getStorageArea();
    if (!storage) return {};
    return new Promise((resolve) => {
      storage.get(keys || null, (items: any) => resolve(items || {}));
    });
  }

  async set(items: Record<string, any>): Promise<void> {
    const storage = this.getStorageArea();
    if (!storage) return;
    return new Promise((resolve) => {
      storage.set(items, () => resolve());
    });
  }

  async remove(keys: string | string[]): Promise<void> {
    const storage = this.getStorageArea();
    if (!storage) return;
    return new Promise((resolve) => {
      storage.remove(keys, () => resolve());
    });
  }

  async clear(): Promise<void> {
    const storage = this.getStorageArea();
    if (!storage) return;
    return new Promise((resolve) => {
      storage.clear(() => resolve());
    });
  }
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  version: 1,
  pauseDurationSeconds: 3,
  quickCheckDefaultMinutes: 7,
  idleTimeoutMinutes: 15,
  notificationsEnabled: true,
  softCapsEnabled: true,
  soundEnabled: false,
  mindfulDomains: [
    {
      id: "domain-youtube",
      domainPattern: "youtube.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 7,
      lateNightSoftCapHour: 21,
      createdAt: 1700000000000,
      updatedAt: 1700000000000
    },
    {
      id: "domain-reddit",
      domainPattern: "reddit.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 7,
      lateNightSoftCapHour: 21,
      createdAt: 1700000000000,
      updatedAt: 1700000000000
    },
    {
      id: "domain-x",
      domainPattern: "x.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 7,
      createdAt: 1700000000000,
      updatedAt: 1700000000000
    },
    {
      id: "domain-instagram",
      domainPattern: "instagram.com",
      isEnabled: true,
      quickCheckThresholdMinutes: 5,
      createdAt: 1700000000000,
      updatedAt: 1700000000000
    }
  ],
  intentionPresets: [
    { id: "preset-work", type: "work_research", label: "Work / Research" },
    { id: "preset-quick", type: "quick_check", label: "Quick Check", defaultMinutes: 7 },
    { id: "preset-escape", type: "boredom_escapism", label: "Boredom / Escapism", defaultMinutes: 15 }
  ]
};

const SETTINGS_KEY = "anchor:settings";
const ACTIVE_SESSIONS_KEY = "anchor:active_sessions";

export function getWeekPartitionKey(timestampMs: number): string {
  const date = new Date(timestampMs);
  const year = date.getUTCFullYear();
  // ISO Week calculation
  const target = new Date(date.valueOf());
  const dayNr = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `anchor:sessions:${year}_${String(weekNumber).padStart(2, "0")}`;
}

export class StorageService {
  private backend: IStorageBackend;

  constructor(backend?: IStorageBackend) {
    if (backend) {
      this.backend = backend;
    } else if (
      (typeof chrome !== "undefined" && chrome?.storage?.local) ||
      // @ts-ignore
      (typeof browser !== "undefined" && browser?.storage?.local)
    ) {
      this.backend = new ExtensionStorageBackend();
    } else {
      this.backend = new MemoryStorageBackend();
    }
  }

  async initialize(): Promise<UserSettings> {
    const existing = await this.backend.get(SETTINGS_KEY);
    if (!existing[SETTINGS_KEY]) {
      await this.backend.set({ [SETTINGS_KEY]: DEFAULT_USER_SETTINGS });
      return DEFAULT_USER_SETTINGS;
    }
    return existing[SETTINGS_KEY];
  }

  async getSettings(): Promise<UserSettings> {
    const existing = await this.backend.get(SETTINGS_KEY);
    return existing[SETTINGS_KEY] || (await this.initialize());
  }

  async updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated: UserSettings = {
      ...current,
      ...patch,
      version: current.version
    };
    await this.backend.set({ [SETTINGS_KEY]: updated });
    return updated;
  }

  async addMindfulDomain(
    domainPattern: string,
    options?: Partial<MindfulDomain>
  ): Promise<MindfulDomain> {
    const settings = await this.getSettings();
    const normalized = normalizeDomain(domainPattern);

    if (!normalized) {
      throw new Error("Invalid domain pattern");
    }

    // Check if domain already exists
    const existingIndex = settings.mindfulDomains.findIndex(
      (d) => d.domainPattern === normalized
    );

    const now = Date.now();
    const domainRecord: MindfulDomain = {
      id: options?.id || `domain-${normalized.replace(/[^a-z0-9]/g, "-")}-${now}`,
      domainPattern: normalized,
      isEnabled: options?.isEnabled ?? true,
      quickCheckThresholdMinutes: options?.quickCheckThresholdMinutes,
      lateNightSoftCapHour: options?.lateNightSoftCapHour,
      createdAt: now,
      updatedAt: now,
      ...options
    };

    if (existingIndex >= 0) {
      settings.mindfulDomains[existingIndex] = {
        ...settings.mindfulDomains[existingIndex],
        ...domainRecord,
        updatedAt: now
      };
    } else {
      settings.mindfulDomains.push(domainRecord);
    }

    await this.updateSettings({ mindfulDomains: settings.mindfulDomains });
    return domainRecord;
  }

  async removeMindfulDomain(domainId: string): Promise<void> {
    const settings = await this.getSettings();
    const filtered = settings.mindfulDomains.filter((d) => d.id !== domainId);
    await this.updateSettings({ mindfulDomains: filtered });
  }

  async toggleMindfulDomain(domainId: string, isEnabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    const domain = settings.mindfulDomains.find((d) => d.id === domainId);
    if (domain) {
      domain.isEnabled = isEnabled;
      domain.updatedAt = Date.now();
      await this.updateSettings({ mindfulDomains: settings.mindfulDomains });
    }
  }

  async isMindfulUrl(url: string): Promise<{ isMindful: boolean; domainConfig?: MindfulDomain }> {
    const settings = await this.getSettings();
    const match = findMatchingMindfulDomain(url, settings.mindfulDomains);
    return {
      isMindful: !!match,
      domainConfig: match || undefined
    };
  }

  async getActiveSessions(): Promise<Record<string, BrowsingSession>> {
    const data = await this.backend.get(ACTIVE_SESSIONS_KEY);
    return data[ACTIVE_SESSIONS_KEY] || {};
  }

  async getActiveSession(tabId: number): Promise<BrowsingSession | null> {
    const sessions = await this.getActiveSessions();
    return sessions[String(tabId)] || null;
  }

  async startSession(tabId: number, session: BrowsingSession): Promise<void> {
    const sessions = await this.getActiveSessions();
    sessions[String(tabId)] = session;
    await this.backend.set({ [ACTIVE_SESSIONS_KEY]: sessions });
  }

  async updateSessionDwellTime(tabId: number, additionalSeconds: number): Promise<BrowsingSession | null> {
    const sessions = await this.getActiveSessions();
    const session = sessions[String(tabId)];
    if (!session) return null;

    session.activeDwellSeconds += additionalSeconds;
    await this.backend.set({ [ACTIVE_SESSIONS_KEY]: sessions });
    return session;
  }

  async endSession(
    tabId: number,
    terminationReason: SessionTerminationReason,
    rating: SessionRating = "unrated"
  ): Promise<BrowsingSession | null> {
    const sessions = await this.getActiveSessions();
    const session = sessions[String(tabId)];
    if (!session) return null;

    delete sessions[String(tabId)];
    await this.backend.set({ [ACTIVE_SESSIONS_KEY]: sessions });

    session.endTime = Date.now();
    session.terminationReason = terminationReason;
    session.rating = rating;

    await this.recordSession(session);
    return session;
  }

  async recordSession(session: BrowsingSession): Promise<void> {
    const partitionKey = getWeekPartitionKey(session.startTime);
    const data = await this.backend.get(partitionKey);
    const sessionsList: BrowsingSession[] = data[partitionKey] || [];

    const existingIndex = sessionsList.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      sessionsList[existingIndex] = session;
    } else {
      sessionsList.push(session);
    }

    await this.backend.set({ [partitionKey]: sessionsList });
  }

  async updateSessionRating(sessionId: string, rating: SessionRating): Promise<void> {
    // Check active sessions first
    const activeSessions = await this.getActiveSessions();
    for (const [, session] of Object.entries(activeSessions)) {
      if (session.id === sessionId) {
        session.rating = rating;
        await this.backend.set({ [ACTIVE_SESSIONS_KEY]: activeSessions });
        return;
      }
    }

    // Otherwise check recent partition
    const currentPartition = getWeekPartitionKey(Date.now());
    const data = await this.backend.get(currentPartition);
    const sessionsList: BrowsingSession[] = data[currentPartition] || [];
    const target = sessionsList.find((s) => s.id === sessionId);
    if (target) {
      target.rating = rating;
      await this.backend.set({ [currentPartition]: sessionsList });
      return;
    }

    // Fallback: search across all session partitions
    const allData = await this.backend.get(null);
    for (const [key, value] of Object.entries(allData)) {
      if (key.startsWith("anchor:sessions:") && Array.isArray(value)) {
        const found = value.find((s: BrowsingSession) => s.id === sessionId);
        if (found) {
          found.rating = rating;
          await this.backend.set({ [key]: value });
          return;
        }
      }
    }
  }

  async getSessionsForPeriod(startDateMs: number, endDateMs: number): Promise<BrowsingSession[]> {
    const partitionKeyStart = getWeekPartitionKey(startDateMs);
    const partitionKeyEnd = getWeekPartitionKey(endDateMs);

    const keysToFetch = Array.from(new Set([partitionKeyStart, partitionKeyEnd]));
    const data = await this.backend.get(keysToFetch);

    const allSessions: BrowsingSession[] = [];
    for (const key of keysToFetch) {
      if (Array.isArray(data[key])) {
        allSessions.push(...data[key]);
      }
    }

    return allSessions.filter(
      (s) => s.startTime >= startDateMs && s.startTime <= endDateMs
    );
  }

  async getWeeklySessions(year: number, weekNumber: number): Promise<BrowsingSession[]> {
    const partitionKey = `anchor:sessions:${year}_${String(weekNumber).padStart(2, "0")}`;
    const data = await this.backend.get(partitionKey);
    return data[partitionKey] || [];
  }
}

export const defaultStorageService = new StorageService();
