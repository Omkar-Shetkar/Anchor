import { describe, it, expect } from "vitest";
import {
  isValidMessage,
  createMessage,
  createSuccessResponse,
  createErrorResponse
} from "../../src/shared/messages";

describe("Message Protocol Contract", () => {
  it("validates legitimate extension messages", () => {
    const msg = createMessage("INTERSTITIAL_INTENTION_SUBMITTED", {
      targetUrl: "https://youtube.com",
      intention: {
        type: "quick_check",
        label: "Quick Check",
        thresholdMinutes: 7
      }
    });

    expect(isValidMessage(msg)).toBe(true);
    expect(msg.type).toBe("INTERSTITIAL_INTENTION_SUBMITTED");
  });

  it("rejects invalid or unknown messages", () => {
    expect(isValidMessage(null)).toBe(false);
    expect(isValidMessage(undefined)).toBe(false);
    expect(isValidMessage({ type: "UNKNOWN_ACTION", payload: {} })).toBe(false);
    expect(isValidMessage("string message")).toBe(false);
  });

  it("formats success and error responses properly", () => {
    const success = createSuccessResponse({ sessionId: "123" });
    expect(success.success).toBe(true);
    expect(success.data?.sessionId).toBe("123");
    expect(success.error).toBeUndefined();

    const error = createErrorResponse("Domain not found");
    expect(error.success).toBe(false);
    expect(error.error).toBe("Domain not found");
    expect(error.data).toBeUndefined();
  });
});
