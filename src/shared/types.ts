/**
 * Anchor: Shared Data Models and Type Definitions
 */

export interface MindfulDomain {
  id: string;
  domainPattern: string;              // e.g. "youtube.com", "reddit.com"
  isEnabled: boolean;
  quickCheckThresholdMinutes?: number;// optional override
  lateNightSoftCapHour?: number;      // e.g. 21 for 9 PM
  createdAt: number;
  updatedAt: number;
}

export type IntentionType = "work_research" | "quick_check" | "boredom_escapism" | "custom";

export interface Intention {
  type: IntentionType;
  label: string;
  customText?: string;
  thresholdMinutes?: number | null;
}

export type SessionRating = "nourishing" | "neutral" | "draining" | "unrated";

export type SessionTerminationReason =
  | "tab_closed"
  | "inactivity_timeout"
  | "navigated_away"
  | "browser_quit"
  | "intentional_bounce";

export interface NudgeResponse {
  timestamp: number;
  action: "keep_going" | "close_tab" | "ignored";
}

export interface BrowsingSession {
  id: string;
  domain: string;
  targetUrl: string;
  startTime: number;
  endTime: number | null;
  activeDwellSeconds: number;
  intention: Intention;
  nudgeCount: number;
  nudgeResponses: NudgeResponse[];
  rating: SessionRating;
  terminationReason: SessionTerminationReason | null;
  isBounce: boolean;
  isLateNight: boolean;
}

export interface IntentionPreset {
  id: string;
  type: IntentionType;
  label: string;
  defaultMinutes?: number;
}

export interface UserSettings {
  version: number;
  pauseDurationSeconds: number;       // default: 3
  quickCheckDefaultMinutes: number;   // default: 7
  idleTimeoutMinutes: number;         // default: 15
  notificationsEnabled: boolean;
  softCapsEnabled: boolean;
  soundEnabled: boolean;
  mindfulDomains: MindfulDomain[];
  intentionPresets: IntentionPreset[];
}

export interface DomainSummary {
  domain: string;
  totalActiveSeconds: number;
  sessionCount: number;
  nourishingPercentage: number;
  neutralPercentage: number;
  drainingPercentage: number;
}

export interface CoachingSuggestion {
  id: string;
  type: "late_night_soft_cap" | "quick_check_runaway" | "positive_reinforcement";
  headline: string;
  message: string;
  actionableDomain?: string;
  proposedCapHour?: number;
}

export interface WeeklyReflectionStory {
  weekIdentifier: string;
  startDate: string;
  endDate: string;
  totalDwellSeconds: number;
  totalSessions: number;
  totalBounces: number;
  sentimentBreakdown: {
    nourishingCount: number;
    nourishingPercent: number;
    neutralCount: number;
    neutralPercent: number;
    drainingCount: number;
    drainingPercent: number;
    unratedCount: number;
    unratedPercent: number;
  };
  topDomains: DomainSummary[];
  lateNightDrainingPercent: number;
  coachingSuggestions: CoachingSuggestion[];
}
