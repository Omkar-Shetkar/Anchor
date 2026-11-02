# Anchor: Store Listing Copy, Metadata & Assets

> **Ready-to-use copy, descriptions, keywords, and asset specifications for the Chrome Web Store and Mozilla Firefox Add-ons (AMO).**

---

## 1. Quick Metadata Reference

| Field | Chrome Web Store (CWS) | Firefox Add-ons (AMO) |
| :--- | :--- | :--- |
| **Extension Name** | `Anchor - Mindful Browsing & Time Audit` | `Anchor - Mindful Browsing & Time Audit` |
| **Short Description** | *Max 132 chars*: `Drop anchor before you drift away. A supportive mindful pause interception and reflective attention ledger for your tabs.` | *Max 250 chars*: `Drop anchor before you drift away in a sea of tabs. A supportive digital well-being extension combining mindful pause interception with a reflective attention ledger. 100% offline and private.` |
| **Category** | `Productivity` (Alternative: `Lifestyle`) | `Tabs` and `Privacy & Security` (Alternative: `Lifestyle`) |
| **Content Rating** | Everyone | General Audience |
| **License** | Open Source (MIT) | Open Source (MIT) |
| **Pricing** | Free | Free |
| **Support Link** | GitHub Issues | GitHub Issues |
| **Privacy Policy** | Required link | Required link |

---

## 2. Detailed Description (Chrome Web Store & Firefox AMO)

*Copy and paste the text below into the Detailed Description field on both developer dashboards:*

```markdown
⚓ Drop anchor before you drift away in a sea of tabs.

Most site blockers treat your browser like a battlefield: they aggressively lock you out, slap you with guilt-inducing red screens, or force artificial streaks that eventually cause rebellion.

Anchor takes a fundamentally different path: it acts as a calm, supportive digital well-being coach. 

Instead of rigid restrictions, Anchor pairs **Front-Door Mindful Interception** (pausing automatic, impulsive habits before they begin) with a **Qualitative Attention Ledger** (reflecting on how your time was actually experienced).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ CORE CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🌊 MINDFUL PAUSE INTERCEPTION
When navigating to sites known for habitual distraction (e.g., YouTube, Reddit, social feeds, shopping portals), Anchor pauses the page load for 3 to 4 seconds with a soothing, animated breathing circle. This micro-pause provides the physiological reset needed to break out of automatic click-habits.

2. 🎯 INTENTION SETTING
Anchor asks a simple, grounding question: "What brings you here right now?"
• Quickly select common intentions: "Work / Research", "Quick Check", or "Boredom / Escapism".
• Or type a quick custom note to stay anchored in your purpose.
• Realized you opened the tab on autopilot? Click "Close Tab" with zero judgment.

3. 🌿 GENTLE IN-SESSION REALIGNMENT
If you selected a "Quick Check" session but stay on the site beyond your threshold (default: 7 minutes), Anchor presents a soft, non-blocking check-in:
"You've been browsing for a bit. Still aligned with your original intention?"
No jarring alarms, no frozen screens, and no video interruptions—just a conscious opportunity to keep going or step away.

4. 📊 QUALITATIVE ATTENTION LEDGER (EXIT MICRO-REFLECTION)
Raw screen-time numbers don't tell the real story. An hour of educational research feels very different from an hour of late-night doomscrolling.
When a session concludes, Anchor displays a frictionless 5-second exit micro-reflection:
"How did this session feel?"
• 🟢 Nourishing / Productive
• ⚪ Neutral / Routine
• 🟠 Draining / Doomscrolling
Auto-dismisses in 5 seconds if you are in a rush.

5. 💡 EMPATHETIC WEEKLY REFLECTION STORY
No punitive scorecards. No badges of shame. Anchor synthesizes your week into empathetic coaching insights:
• Understand your ratio of Nourishing vs. Draining time.
• Discover temporal patterns (e.g., "70% of draining sessions occurred after 9 PM").
• Receive supportive coaching suggestions, such as setting a gentle soft cap after 9 PM.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 100% CLIENT-SIDE PRIVACY GUARANTEE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your attention data belongs to you and no one else:
• ZERO Analytics or Tracking Pixels.
• ZERO Telemetry.
• ZERO External Network Requests.
• 100% of your browsing history, intentions, and ratings remain encrypted in your local browser storage (chrome.storage.local).
• Works completely offline.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ FULLY CUSTOMIZABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Add or remove mindful domains at will.
• Tune breathing pause duration (3s to 5s).
• Adjust gentle nudge timing (5m, 7m, 10m, 15m).
• Enable or disable exit notifications.
• Lightweight & fast: built with pure TypeScript and modern CSS with zero heavy UI frameworks.

Take back your attention today. Drop anchor and browse with intention.
```

---

## 3. Keywords & Search Tags

### Chrome Web Store Tags:
`mindful browsing`, `digital wellbeing`, `time tracker`, `screen time`, `productivity`, `focus`, `breathing exercise`, `attention ledger`, `tab manager`, `habit tracker`

### Firefox AMO Tags:
`mindfulness`, `productivity`, `tabs`, `wellbeing`, `focus`, `time-tracker`, `privacy`

---

## 4. Permissions Justification Copy (For CWS Privacy Tab)

When submitting to the Google Chrome Web Store, paste the following statements in the **Privacy Practices** declaration:

### Single Purpose Description:
> "Anchor empowers users to practice mindful digital well-being by pausing impulsive tab navigation, facilitating gentle in-session check-ins, and recording reflective session sentiment in a 100% client-side attention ledger."

### Permission Rationale Table:

| Permission | Justification Text to Paste |
| :--- | :--- |
| **`storage`** | "Used exclusively to persist user-configured mindful domains, coaching thresholds, and private session records locally on the user's device via chrome.storage.local." |
| **`tabs`** | "Used to detect when navigation begins towards a user-configured mindful domain so Anchor can display the mindful pause interstitial before the website loads." |
| **`notifications`** | "Used to display the frictionless 5-second exit micro-reflection ('How did this session feel?') when a user closes or concludes a session on a mindful site." |
| **`idle`** | "Used to detect computer sleep, lock, or user inactivity (>15 min) so inactive time is accurately excluded from active session dwell calculations." |
| **`alarms`** | "Used to schedule in-session gentle realignment check-ins and periodic local ledger rollups in the background service worker." |
| **`<all_urls>` (Host Permissions)** | "Required because users have the freedom to configure any custom domain (e.g. personal news blogs, specific forums, niche shopping sites) as a mindful interception domain." |

---

## 5. Reviewer Notes (Firefox AMO & CWS)

Paste this into the **Information for Reviewers** box during submission:

```text
Hello Mozilla / Chrome Extension Review Team,

Thank you for reviewing Anchor!

Key Architectural Notes for Review:
1. Pure Client-Side Application: Anchor makes ZERO external network requests. There are no tracking scripts, analytics SDKs, or remote endpoints. All data persists strictly in local browser storage (chrome.storage.local).
2. Manifest V3: Built strictly adhering to Manifest V3 standards with no dynamic code execution (no eval, no external CDNs, local CSP).
3. Host Permissions (<all_urls>): Anchor allows users to add arbitrary websites to their mindful interception list via the options popup. Host permissions are required solely for the content script heartbeat and navigation interception to operate on user-selected domains.
4. Testing Instructions:
   - Navigate to youtube.com or reddit.com (configured as default mindful sites).
   - The interstitial pause page will appear displaying a 3-second breathing animation and intention prompt.
   - Click "Quick Check" to proceed to the website.
   - After browsing, close the tab to observe the 5-second exit micro-reflection prompt.
   - Click the Anchor toolbar icon to inspect the Attention Ledger and Weekly Reflection Story.
```

---

## 6. Screenshot Specifications & Storyboard

High-resolution screenshots are crucial for store conversion. Prepare 5 screenshots at **1280 x 800 px** (PNG, 24-bit):

### Slide 1: Mindful Pause & Breathing Reset
- **Heading**: Drop Anchor Before You Drift
- **Subheading**: Automatic clicking halts with a calming 3-second breathing reset.
- **Visual**: The clean dark-mode interstitial screen featuring the teal glowing breathing circle and tranquil typography.

### Slide 2: Set Your Intention
- **Heading**: Browse with Purpose
- **Subheading**: Quick-select intention pills (Work, Quick Check, Boredom) or custom notes.
- **Visual**: The interstitial card with intention pill selection and the "Close Tab" instant exit button highlighted.

### Slide 3: Gentle In-Session Realignment
- **Heading**: Soft Check-Ins, Never Lockouts
- **Subheading**: Non-blocking Shadow DOM nudge checks in after 7 minutes without interrupting your work.
- **Visual**: A typical webpage (e.g. video or article) with the soft Anchor floating card in the bottom-right corner.

### Slide 4: Exit Micro-Reflection
- **Heading**: Audit Quality, Not Just Quantity
- **Subheading**: Frictionless 5-second sentiment check-in: Nourishing, Neutral, or Draining.
- **Visual**: The desktop notification toast with the three colored sentiment pills.

### Slide 5: Empathetic Weekly Story
- **Heading**: Insights Without Shame
- **Subheading**: Understand time-of-day patterns and receive supportive coaching tips.
- **Visual**: The popup dashboard showing the Weekly Reflection card, sentiment ratio bar, and late-night soft cap toggle.
