import { defaultStorageService } from "../shared/storage";
import { defaultNavigationInterceptor } from "./navigation-interceptor";
import { defaultSessionCoordinator } from "./session-coordinator";
import { defaultSessionTracker } from "./session-tracker";
import { defaultNotificationManager } from "./notification-manager";
import { isValidMessage } from "../shared/messages";

// 1. Extension Installation & Setup
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[Anchor] Extension installed / updated:", details.reason);
  await defaultStorageService.initialize();
});

// Initialize background listeners
defaultSessionTracker.initializeListeners();
defaultNotificationManager.initializeListeners();

// 2. Navigation Interception Listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = changeInfo.url || tab.url;
  if (targetUrl && changeInfo.status === "loading") {
    defaultNavigationInterceptor.handleNavigation(tabId, targetUrl);
  }
});

// 3. Tab Closure & Exit Reflection Listener
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const endedSession = await defaultSessionCoordinator.handleTabClosed(tabId);
  defaultSessionTracker.clearTab(tabId);

  if (endedSession && !endedSession.isBounce) {
    await defaultNotificationManager.showExitMicroReflection(
      endedSession.id,
      endedSession.domain
    );
  }
});

// 4. Message Routing Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isValidMessage(message)) {
    return false;
  }

  const senderTabId = sender.tab?.id;

  defaultSessionCoordinator
    .processMessage(message, senderTabId)
    .then((response) => {
      sendResponse(response);
    })
    .catch((err) => {
      console.error("[Anchor] Error handling message:", err);
      sendResponse({ success: false, error: err.message });
    });

  return true; // Keep asynchronous message channel open
});

console.log("[Anchor] Background service worker initialized with trackers.");
