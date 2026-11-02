import type {
  Intention,
  SessionRating,
  UserSettings,
  BrowsingSession
} from "./types";

export type MessageType =
  | "INTERSTITIAL_INTENTION_SUBMITTED"
  | "INTERSTITIAL_BOUNCE_CLOSE"
  | "HEARTBEAT_ACTIVE_PULSE"
  | "NUDGE_ACTION_SELECTED"
  | "GET_CURRENT_STATE"
  | "GET_WEEKLY_STORY"
  | "UPDATE_SETTINGS"
  | "SUBMIT_EXIT_RATING";

export interface ExtensionMessage<TType extends MessageType = MessageType, TPayload = any> {
  type: TType;
  payload: TPayload;
}

export interface ExtensionResponse<TData = any> {
  success: boolean;
  data?: TData;
  error?: string;
}

export interface InterstitialIntentionPayload {
  targetUrl: string;
  intention: Intention;
}

export interface InterstitialBouncePayload {
  targetUrl: string;
}

export interface HeartbeatPulsePayload {
  sessionId: string;
  activeSecondsElapsed: number;
}

export interface HeartbeatPulseResponse {
  shouldNudge: boolean;
  nudgeMessage?: string;
  thresholdMinutes?: number;
}

export interface NudgeActionPayload {
  sessionId: string;
  action: "keep_going" | "close_tab";
}

export interface CurrentStateResponse {
  isMindfulSite: boolean;
  activeSession?: BrowsingSession;
  settings: UserSettings;
}

export interface SubmitRatingPayload {
  sessionId: string;
  rating: SessionRating;
}

/**
 * Validates and type-checks extension messages
 */
export function isValidMessage(msg: any): msg is ExtensionMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    typeof msg.type === "string" &&
    [
      "INTERSTITIAL_INTENTION_SUBMITTED",
      "INTERSTITIAL_BOUNCE_CLOSE",
      "HEARTBEAT_ACTIVE_PULSE",
      "NUDGE_ACTION_SELECTED",
      "GET_CURRENT_STATE",
      "GET_WEEKLY_STORY",
      "UPDATE_SETTINGS",
      "SUBMIT_EXIT_RATING"
    ].includes(msg.type)
  );
}

export function createMessage<TType extends MessageType, TPayload>(
  type: TType,
  payload: TPayload
): ExtensionMessage<TType, TPayload> {
  return { type, payload };
}

export function createSuccessResponse<TData>(data?: TData): ExtensionResponse<TData> {
  return { success: true, data };
}

export function createErrorResponse(error: string): ExtensionResponse {
  return { success: false, error };
}
