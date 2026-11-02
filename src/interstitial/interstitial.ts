import { extractDomainFromUrl, findMatchingMindfulDomain } from "../shared/domain-matcher";
import { defaultStorageService } from "../shared/storage";
import { createMessage } from "../shared/messages";
import type { Intention, IntentionType } from "../shared/types";

// Parse destination URL & tabId from query params
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get("target") || "https://www.google.com";
const domainName = extractDomainFromUrl(targetUrl) || "mindful site";

let currentTabId: number | undefined = urlParams.get("tabId")
  ? parseInt(urlParams.get("tabId")!, 10)
  : undefined;

// Also attempt to get tab from chrome.tabs.getCurrent in extension context
if (!currentTabId && typeof chrome !== "undefined" && chrome.tabs?.getCurrent) {
  chrome.tabs.getCurrent((tab) => {
    if (tab?.id) {
      currentTabId = tab.id;
    }
  });
}

// DOM Elements
const domainDisplay = document.getElementById("target-domain-name") as HTMLElement;
const breathingCue = document.getElementById("breathing-cue") as HTMLElement;
const pills = document.querySelectorAll<HTMLButtonElement>(".intention-pill");
const customInput = document.getElementById("custom-intention-input") as HTMLInputElement;
const btnCloseTab = document.getElementById("btn-close-tab") as HTMLButtonElement;
const btnProceed = document.getElementById("btn-proceed") as HTMLButtonElement;

// State
let selectedIntention: Intention | null = null;
let effectiveQuickCheckMinutes = 7;

// Initialize View
if (domainDisplay) {
  domainDisplay.textContent = domainName;
}

// Load dynamic thresholds from user settings
defaultStorageService.getSettings().then((settings) => {
  const match = findMatchingMindfulDomain(targetUrl, settings.mindfulDomains);
  if (match?.quickCheckThresholdMinutes) {
    effectiveQuickCheckMinutes = match.quickCheckThresholdMinutes;
  } else if (settings.quickCheckDefaultMinutes) {
    effectiveQuickCheckMinutes = settings.quickCheckDefaultMinutes;
  }

  // Update UI pill with configured duration
  const quickCheckPill = document.querySelector<HTMLButtonElement>('.intention-pill[data-type="quick_check"]');
  if (quickCheckPill) {
    quickCheckPill.dataset.threshold = String(effectiveQuickCheckMinutes);
    const span = quickCheckPill.querySelector("span:last-child");
    if (span) {
      span.textContent = `Quick Check (${effectiveQuickCheckMinutes}m)`;
    }
  }
});

// Gentle Breathing Cycle Cues (every 1.75 seconds to match 3.5s cycle)
const cues = ["Breathe in...", "Hold gently...", "Breathe out...", "Find clarity..."];
let cueIndex = 0;
setInterval(() => {
  cueIndex = (cueIndex + 1) % cues.length;
  if (breathingCue) {
    breathingCue.textContent = cues[cueIndex];
  }
}, 1750);

function updateProceedButton() {
  if (btnProceed) {
    btnProceed.disabled = !selectedIntention;
  }
}

// Handle Pill Selection
pills.forEach((pill) => {
  pill.addEventListener("click", () => {
    pills.forEach((p) => p.classList.remove("selected"));
    pill.classList.add("selected");

    const type = pill.dataset.type as IntentionType;
    const label = pill.dataset.label || "Quick Check";
    const thresholdRaw = pill.dataset.threshold;
    const thresholdMinutes = thresholdRaw && thresholdRaw !== "null"
      ? parseInt(thresholdRaw, 10)
      : (type === "quick_check" ? effectiveQuickCheckMinutes : null);

    selectedIntention = {
      type,
      label,
      thresholdMinutes
    };

    if (customInput) {
      customInput.value = "";
    }

    updateProceedButton();
  });
});

// Handle Custom Input
if (customInput) {
  customInput.addEventListener("input", () => {
    const text = customInput.value.trim();
    if (text.length > 0) {
      pills.forEach((p) => p.classList.remove("selected"));
      selectedIntention = {
        type: "custom",
        label: "Custom Intention",
        customText: text,
        thresholdMinutes: effectiveQuickCheckMinutes
      };
    } else {
      selectedIntention = null;
    }
    updateProceedButton();
  });

  customInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && selectedIntention) {
      proceedWithIntention();
    }
  });
}

// Handle Close Tab (Bounce)
if (btnCloseTab) {
  btnCloseTab.addEventListener("click", () => {
    const msg = createMessage("INTERSTITIAL_BOUNCE_CLOSE", {
      targetUrl,
      tabId: currentTabId
    });

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(msg, () => {
        window.close();
      });
    } else {
      window.close();
    }
  });
}

// Handle Proceed Action
async function proceedWithIntention() {
  if (!selectedIntention) return;

  btnProceed.disabled = true;
  btnProceed.textContent = "Anchoring...";

  const msg = createMessage("INTERSTITIAL_INTENTION_SUBMITTED", {
    targetUrl,
    intention: selectedIntention,
    tabId: currentTabId
  });

  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(msg, () => {
      window.location.href = targetUrl;
    });
  } else {
    window.location.href = targetUrl;
  }
}

if (btnProceed) {
  btnProceed.addEventListener("click", proceedWithIntention);
}
