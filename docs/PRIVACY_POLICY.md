# Privacy Policy for Anchor

> **Last Updated:** November 2026  
> **Effective Date:** November 2, 2026

Anchor ("we", "our", or "the extension") is an open-source digital well-being browser extension designed to foster intentional browsing through mindful pauses and reflective time tracking.

We believe your attention, habits, and browsing data are deeply personal. **Anchor is engineered from the ground up on a zero-knowledge, 100% client-side privacy architecture.**

---

## 1. Executive Summary

- **Zero Telemetry**: Anchor does not collect, transmit, or monitor analytics, telemetry, or behavioral tracking data.
- **Zero Remote Servers**: Anchor connects to **no external servers or APIs**. There are no tracking scripts, third-party libraries, or analytics SDKs bundled into this extension.
- **100% Local Storage**: All browsing history, declared intentions, session timers, and sentiment ratings stay strictly inside your browser's private local storage (`chrome.storage.local`).
- **No Monetization of Data**: We do not sell, rent, monetize, or share your data with advertisers, data brokers, or third parties under any circumstances.

---

## 2. Information Handled by Anchor

All information managed by Anchor is stored strictly within your browser's local sandbox:

| Data Type | Description | Where It Is Stored |
| :--- | :--- | :--- |
| **Mindful Sites List** | The list of website domain names (e.g. `youtube.com`) configured for mindful interception. | Local browser storage only (`chrome.storage.local`). |
| **Session Timers** | Active dwell time and start/end timestamps on configured mindful sites. | Local browser storage only (`chrome.storage.local`). |
| **User Intentions** | The intention selected or entered during the mindful pause (e.g., "Work/Research", "Quick Check", custom note). | Local browser storage only (`chrome.storage.local`). |
| **Sentiment Ratings** | The reflection rating chosen upon exit ("Nourishing", "Neutral", "Draining"). | Local browser storage only (`chrome.storage.local`). |
| **User Preferences** | Settings such as breathing duration (3–5s), nudge thresholds (5–15 min), and notification toggles. | Local browser storage only (`chrome.storage.local`). |

---

## 3. How Your Information is Used

Data stored locally by Anchor is utilized solely for user-facing extension features on your device:
1. Calculating session durations to present non-blocking follow-up reminders.
2. Generating the weekly Attention Ledger and Weekly Reflection Story in the extension popup.
3. Remembering your personal coaching preferences and configured domains.

Anchor performs all data processing, aggregation, and synthesis directly inside the extension's local background scripts without transmitting anything across the network.

---

## 4. Browser Permissions Rationale

To deliver its core features, Anchor requests specific permissions. Here is exactly why each permission is required:

- **`storage`**: Allows the extension to persist your settings, custom domains, and Attention Ledger records locally on your device via `chrome.storage.local`.
- **`tabs`**: Used to observe tab navigation events to detect when you visit a configured mindful domain and display the pause screen before page rendering begins.
- **`notifications`**: Used to display the brief 5-second exit micro-reflection toast (*"How did this session feel?"*) when you conclude a mindful session.
- **`idle`**: Detects when your computer enters sleep mode or becomes idle (>15 minutes), ensuring inactive time is excluded from active browsing duration.
- **`alarms`**: Used to schedule background timer checks for the 7-minute gentle in-session reminder.
- **`<all_urls>` (Host Permissions)**: Required because Anchor allows users to designate any website of their choice (such as custom forums, personal news feeds, or shopping sites) as a mindful interception domain.

---

## 5. Third-Party Sharing & External Services

Anchor does not integrate with, transmit data to, or interact with any third-party APIs, remote servers, cloud databases, or advertising networks.

---

## 6. Data Retention, Portability & Deletion

- **Local Storage Lifecycle**: Attention Ledger data is stored locally in weekly partition buckets.
- **User Control**: You can delete, reset, or clear your extension data at any time:
  1. Open the Anchor popup ➔ navigate to Settings ➔ click **"Clear History"** (or remove specific entries).
  2. Alternatively, clearing your browser's extension data or uninstalling Anchor instantly deletes all stored records permanently from your hard drive.

---

## 7. Children's Privacy (COPPA & GDPR Compliance)

Anchor does not collect any personal information from anyone, including children under the age of 13. Because all data is retained strictly on the local machine with zero network transmission, Anchor is fully compliant with COPPA and GDPR.

---

## 8. Open Source Verification

Anchor is open-source software licensed under the MIT License. Anyone can inspect, audit, or verify the complete source code to confirm our privacy promises:
- Repository: [github.com/omkar/Anchor](https://github.com/omkar/Anchor)

---

## 9. Contact & Inquiries

If you have questions, feedback, or concerns regarding this Privacy Policy or Anchor's privacy practices, please open an issue in our GitHub repository:
- **GitHub Issues**: [https://github.com/omkar/Anchor/issues](https://github.com/omkar/Anchor/issues)
