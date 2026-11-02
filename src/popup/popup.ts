import { defaultStorageService } from "../shared/storage";
import { SettingsController } from "./settings-controller";
import { WeeklyStoryView } from "./weekly-story-view";

// Tab Navigation
const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
const tabPanes = document.querySelectorAll<HTMLElement>(".tab-pane");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    tabPanes.forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    const targetPaneId = btn.dataset.tab;
    if (targetPaneId) {
      document.getElementById(targetPaneId)?.classList.add("active");
    }
  });
});

// Format seconds into MM:SS
function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Active Session View Management
async function syncActiveSession() {
  const activeCard = document.getElementById("active-session-card");
  const noSessionCard = document.getElementById("no-session-card");
  const domainText = document.getElementById("session-domain");
  const dwellText = document.getElementById("session-dwell-time");
  const intentionText = document.getElementById("session-intention-text");
  const statusBadge = document.getElementById("header-status-badge");
  const statusText = document.getElementById("header-status-text");
  const btnEndSession = document.getElementById("btn-end-session");

  if (typeof chrome === "undefined" || !chrome.tabs?.query) {
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const currentTab = tabs[0];
    if (!currentTab || !currentTab.id) return;

    const session = await defaultStorageService.getActiveSession(currentTab.id);

    if (session) {
      if (activeCard) activeCard.style.display = "flex";
      if (noSessionCard) noSessionCard.style.display = "none";

      if (domainText) domainText.textContent = session.domain;
      if (intentionText) {
        intentionText.textContent = session.intention.customText
          ? `${session.intention.label}: "${session.intention.customText}"`
          : session.intention.label;
      }

      if (statusBadge && statusText) {
        statusBadge.className = "status-badge active";
        statusText.textContent = "Anchored";
      }

      let currentDwell = session.activeDwellSeconds;
      if (dwellText) dwellText.textContent = formatDuration(currentDwell);

      // Tick live counter
      const interval = setInterval(() => {
        currentDwell++;
        if (dwellText) dwellText.textContent = formatDuration(currentDwell);
      }, 1000);

      btnEndSession?.addEventListener("click", () => {
        clearInterval(interval);
        if (currentTab.id) {
          chrome.tabs.remove(currentTab.id);
          window.close();
        }
      });
    } else {
      if (activeCard) activeCard.style.display = "none";
      if (noSessionCard) noSessionCard.style.display = "flex";

      if (statusBadge && statusText) {
        statusBadge.className = "status-badge idle";
        statusText.textContent = "Freely Browsing";
      }
    }
  });
}

// Initialize popup components
document.addEventListener("DOMContentLoaded", async () => {
  await syncActiveSession();

  const settingsController = new SettingsController(defaultStorageService);
  await settingsController.initialize();

  const weeklyStoryView = new WeeklyStoryView(defaultStorageService);
  await weeklyStoryView.initialize();
});
