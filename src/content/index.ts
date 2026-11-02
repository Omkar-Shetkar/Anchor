import { HeartbeatMonitor } from "./heartbeat";
import { NudgeToast } from "./nudge-toast";
import { createMessage, type ExtensionResponse } from "../shared/messages";

const toast = new NudgeToast();

// Query background whether current page is an active mindful session
if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
  const queryMsg = createMessage("GET_CURRENT_STATE", undefined);

  chrome.runtime.sendMessage(queryMsg, (response: ExtensionResponse) => {
    if (chrome.runtime.lastError || !response || !response.success) {
      return;
    }

    const { isMindfulSite, activeSession } = response.data || {};
    if (!isMindfulSite || !activeSession) {
      return;
    }

    const intentionLabel = activeSession.intention?.label || "Conscious Session";
    const thresholdMinutes = activeSession.intention?.thresholdMinutes || undefined;

    // Start heartbeat monitor
    const monitor = new HeartbeatMonitor({
      intervalMs: 5000,
      onNudgeRequested: (message) => {
        toast.show({
          intentionLabel,
          thresholdMinutes,
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
