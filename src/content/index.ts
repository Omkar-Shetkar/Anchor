import { HeartbeatMonitor } from "./heartbeat";
import { NudgeToast } from "./nudge-toast";
import { createMessage, type ExtensionResponse } from "../shared/messages";

const toast = new NudgeToast();

function initializeMindfulMonitoring(retries = 3): void {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return;
  }

  const queryMsg = createMessage("GET_CURRENT_STATE", {
    url: window.location.href
  });

  chrome.runtime.sendMessage(queryMsg, (response: ExtensionResponse) => {
    if (chrome.runtime.lastError) {
      return;
    }

    const { isMindfulSite, activeSession } = response?.data || {};

    if (!isMindfulSite || !activeSession) {
      if (retries > 0) {
        // Retry in case background session registration was slightly asynchronous
        setTimeout(() => initializeMindfulMonitoring(retries - 1), 600);
      }
      return;
    }

    const intentionLabel = activeSession.intention?.label || "Quick Check";
    const thresholdMinutes = activeSession.intention?.thresholdMinutes || undefined;

    // Start heartbeat monitor
    const monitor = new HeartbeatMonitor({
      intervalMs: 5000,
      onNudgeRequested: (message, nudgeThreshold) => {
        toast.show({
          intentionLabel,
          thresholdMinutes: nudgeThreshold || thresholdMinutes,
          message,
          onKeepGoing: () => {
            chrome.runtime.sendMessage(
              createMessage("NUDGE_ACTION_SELECTED", { action: "keep_going" })
            );
          },
          onCloseTab: () => {
            chrome.runtime.sendMessage(
              createMessage("NUDGE_ACTION_SELECTED", { action: "close_tab" })
            );
          }
        });
      }
    });

    monitor.start();
  });
}

initializeMindfulMonitoring();
