# Feature Specification: Anchor - Mindful Browsing & Reflective Time Audit

**Feature Branch**: `001-anchor-mindful-browsing`  
**Created**: 2026-11-02  
**Status**: Draft  
**Input**: User description: "We want to create a browser extension for Firefox and Chrome for digital well-being. Combining Mindful Pause with Reflective Time Awareness creates a powerful, well-rounded digital well-being extension. Instead of treating the browser like an adversary, this combination acts as a supportive coach: it intercepts automatic habits at the front door (Mindful Pause) and provides gentle, non-judgmental clarity on how time was actually experienced at the back end (Attention Ledger). Let’s look at how these two concepts can merge into a cohesive browser extension concept, along with a blueprint for how to build it. Concept Blueprint: 'Anchor & Audit' 1. The Interception Engine (Mindful Pause) Trigger: Whenever you navigate to a user-defined 'mindful site' (e.g., YouTube, Reddit, news outlets, shopping sites). The Interstitial Screen: Instead of a hard block, the page load is paused for 3–4 seconds, displaying a clean, distraction-free card. Core Interaction: The Intention Prompt: 'What brings you here right now?' with quick-select pills (Work/Research, Quick Check, Boredom/Escapism) or a short text box. The Breath/Gaze Prompt: A subtle animated breathing circle that expands and contracts for 3 seconds, forcing a physiological reset from automatic clicking. The Gentle Follow-Up: If you selected 'Quick Check' but stay on the site for more than a set threshold (e.g., 7 minutes), a soft, non-blocking notification slides in: 'You've been browsing for a bit. Still aligned with your original intention?' with options to Keep Going or Close Tab. 2. The Qualitative Time Audit (Total Time & Energy) Beyond Raw Timers: Instead of just saying 'You spent 2 hours on this site,' it captures context by asking for a micro-reflection when a session ends (detected when you close the tab, switch away for >15 minutes, or lock the screen). The 5-Second Exit Prompt: A tiny, frictionless toast notification pops up: 'How did this session feel?' -> Nourishing / Productive (Green), -> Neutral / Routine (Gray), -> Draining / Doomscrolling (Red/Muted Orange). The Weekly Reflection Story: Rather than a punitive dashboard of shame, the extension compiles this data into a weekly insight card: 'You spent 4 hours on X site this week. 70% of it felt draining, mostly occurring during late-night hours. Would you like to set a soft cap for after 9 PM?' We will call this extension 'Anchor' - Evokes the idea of dropping anchor so you don't drift away in a sea of tabs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mindful Interception & Intention Setting (Priority: P1)

When a user navigates to a designated mindful site (such as YouTube, Reddit, or a shopping platform), rather than immediately rendering distracting feeds or triggering a hostile hard block, Anchor presents a soothing interstitial card. The user experiences a 3-second animated breathing circle that encourages a brief physiological reset, along with an intention prompt asking "What brings you here right now?". The user can quickly click an intention pill (such as "Work/Research", "Quick Check", or "Boredom/Escapism") or type a brief custom note before proceeding, or choose to close the tab immediately.

**Why this priority**: Intercepting automatic habitual clicks at the point of entry is the foundational coaching mechanism of Anchor. Without this, impulsive browsing continues unchecked.

**Independent Test**: Configure a test domain (e.g., `reddit.com`), navigate to it, verify the interstitial overlay pauses page interaction, displays the breathing animation for 3 seconds, captures an intention selection, and smoothly reveals the site upon completion or closes the tab on exit.

**Acceptance Scenarios**:

1. **Given** a user has added `youtube.com` to their mindful sites list, **When** they type `youtube.com` into the address bar or click a link to it, **Then** an interstitial pause card appears immediately, page content is held back from rendering, and a breathing circle animates smoothly for 3 seconds.
2. **Given** the interstitial screen is active, **When** the user clicks the "Quick Check" pill, **Then** the intention is recorded for the session, the overlay gracefully dismisses, and the target website becomes accessible.
3. **Given** the interstitial screen is active, **When** the user realizes they navigated habitually without purpose and clicks "Close Tab", **Then** the browser tab closes immediately without loading the target page content.
4. **Given** the interstitial screen is active, **When** the user inputs a custom text note ("Check printer ink reviews") and presses Enter, **Then** the custom intention is associated with the session and access is granted.

---

### User Story 2 - Exit Micro-Reflection & Attention Ledger (Priority: P1)

When a user concludes a session on a mindful site (detected when the tab is closed, the user switches to another window/app for more than 15 minutes, or the device is locked), Anchor triggers a frictionless 5-second exit micro-reflection asking "How did this session feel?". The user can click one of three qualitative sentiments: "Nourishing / Productive" (Green), "Neutral / Routine" (Gray), or "Draining / Doomscrolling" (Red/Muted Orange). This sentiment, alongside session duration and initial intention, is recorded into the user's private Attention Ledger.

**Why this priority**: Conventional screen-time trackers only measure minutes, failing to distinguish between restorative or productive time and mindless doomscrolling. Capturing qualitative sentiment immediately upon session completion provides the essential data required for meaningful awareness.

**Independent Test**: Open an active session on a mindful site, browse for 2 minutes, close the tab, and confirm that an exit reflection prompt appears for 5 seconds. Selecting "Nourishing" records a completed session entry in the Attention Ledger with duration, intention, and sentiment.

**Acceptance Scenarios**:

1. **Given** an ongoing session on `reddit.com`, **When** the user closes the tab, **Then** a brief 5-second notification appears asking "How did this session feel?" with three qualitative sentiment pills.
2. **Given** the exit reflection prompt is visible, **When** the user clicks "Draining / Doomscrolling", **Then** the session is marked with negative sentiment, logged into the Attention Ledger, and the prompt dismisses instantly.
3. **Given** the exit reflection prompt is visible, **When** the user ignores the prompt for 5 seconds, **Then** the prompt automatically fades away without interrupting the user, and the session is logged as unrated.
4. **Given** the user leaves a mindful site tab open in the background without interaction for 15 minutes, **When** the 15-minute threshold is reached, **Then** the active session is automatically concluded, calculating only the active dwell time.

---

### User Story 3 - Gentle In-Session Follow-Up (Priority: P2)

When a user sets their intention as "Quick Check" (or selects an intention tied to a short duration), but remains actively browsing beyond a predetermined threshold (default: 7 minutes), Anchor presents a soft, non-blocking floating reminder: "You've been browsing for a bit. Still aligned with your original intention?" with quick action buttons to "Keep Going" or "Close Tab".

**Why this priority**: Users frequently open sites with innocent intentions (e.g., checking a single notification) but get pulled into algorithmic feeds. A gentle, non-judgmental checkpoint helps restore metacognitive awareness without punitive lockouts.

**Independent Test**: Start a browsing session with the intention "Quick Check", remain on the site past the configured threshold (e.g., 7 minutes, or 10 seconds in test mode), and confirm that a non-blocking toast slides into view offering "Keep Going" and "Close Tab" actions.

**Acceptance Scenarios**:

1. **Given** a user began a session on `youtube.com` with the intention "Quick Check" (7-minute threshold), **When** active dwell time reaches 7 minutes, **Then** a non-blocking notification unobtrusively slides into the corner of the viewport asking if they are still aligned with their intention.
2. **Given** the follow-up prompt is displayed, **When** the user clicks "Close Tab", **Then** the tab is closed immediately and the exit micro-reflection is triggered.
3. **Given** the follow-up prompt is displayed, **When** the user clicks "Keep Going", **Then** the notification dismisses smoothly, the session continues without interruption, and a secondary reminder is scheduled if configured.
4. **Given** the follow-up prompt is displayed, **When** the user continues scrolling without interacting with the prompt, **Then** the notification remains non-blocking and does not freeze page scrolling or media playback.

---

### User Story 4 - Weekly Reflection Story & Supportive Insights (Priority: P3)

Rather than maintaining a punitive scoreboard of shame with red warnings and streak penalties, Anchor synthesizes Attention Ledger data into an empathetic, supportive weekly insight card. The user can view patterns such as total time spent per site, percentage of time experienced as nourishing versus draining, and temporal correlations (e.g., late-night browsing correlating with draining sessions). The card offers optional, constructive coach suggestions (e.g., establishing a gentle soft cap after 9 PM).

**Why this priority**: Long-term behavioral transformation requires reflection and positive reinforcement rather than anxiety-inducing restriction. The weekly story helps users notice patterns with compassion.

**Independent Test**: Load synthetic session history spanning 7 days with mixed sentiment ratings, open the Weekly Reflection view, and verify that the summary presents empathetic metrics (e.g., "70% felt draining, mostly occurring after 9 PM") with an option to enable a soft cap suggestion.

**Acceptance Scenarios**:

1. **Given** a week of browsing data across multiple mindful sites, **When** the user accesses the Weekly Reflection Story, **Then** they see a card highlighting total time, sentiment breakdown (percentage Nourishing, Neutral, Draining), and key time-of-day trends.
2. **Given** data indicates over 60% of sessions after 9 PM on a specific site were rated "Draining", **When** the weekly story generates, **Then** it presents an actionable, non-demanding prompt: "Would you like to set a soft cap for after 9 PM?"
3. **Given** the user accepts a coach suggestion for a late-night soft cap, **When** navigating to that site after 9 PM in subsequent weeks, **Then** the interstitial screen includes a gentle reminder of their agreed late-night intention.

---

### User Story 5 - Mindful Site & Coach Preference Management (Priority: P2)

Users must be able to configure which sites trigger Anchor, adjust the duration of the breathing animation (e.g., 3 to 5 seconds), customize quick-select intention pills, adjust the "Quick Check" threshold (e.g., 5, 7, 10, or 15 minutes), and manage notification preferences.

**Why this priority**: Digital well-being needs vary widely across individuals; flexibility to personalize sites, timing, and prompts ensures the coach fits into personal workflows rather than causing irritation.

**Independent Test**: Open the extension settings popup or options page, add a new custom domain (e.g., `news.ycombinator.com`), change the follow-up threshold to 5 minutes, navigate to the added domain, and verify that Anchor intercepts the visit using the updated threshold.

**Acceptance Scenarios**:

1. **Given** the extension settings view, **When** the user adds a new domain `shopping-site.com`, **Then** future visits to `shopping-site.com` trigger the Mindful Pause interception.
2. **Given** the extension settings view, **When** the user changes the "Quick Check" duration threshold from 7 minutes to 10 minutes, **Then** subsequent sessions with "Quick Check" intention trigger the follow-up prompt at 10 minutes.
3. **Given** the extension settings view, **When** the user removes a pre-populated site from the mindful list, **Then** that site immediately loads normally without interception.

---

### Edge Cases

- **Internal Navigation & Subdomains**: Navigating between internal links or pages on the same mindful domain (e.g., from `reddit.com/r/technology` to `reddit.com/r/books`) during an active session MUST NOT re-trigger the interstitial pause screen.
- **Multiple Concurrent Tabs**: When a user opens multiple tabs belonging to the same mindful domain, Anchor MUST treat them as part of the same coordinated active session or track foreground dwell time accurately without stacking multiple conflicting timers.
- **Background Tabs and Inactivity**: If a user leaves a mindful site tab open in the background or switches to another desktop application, passive time MUST NOT be counted towards active dwell time; after 15 minutes of inactivity, the session auto-closes.
- **Immediate Navigation Reversal**: If a user closes the tab or hits the browser Back button while the interstitial pause screen is still counting down its 3-second breathing cycle, the session MUST be recorded as an intentional bounce (saved time) rather than an uncompleted session.
- **Browser Crash or Abrupt Quit**: If the browser terminates abruptly, incomplete sessions MUST be closed cleanly upon next browser startup without creating orphaned timers or corrupting the Attention Ledger.
- **Private / Incognito Windows**: The extension MUST respect user privacy settings; in private/incognito mode, Anchor MUST NOT track or log sessions unless explicitly granted permission by the user in browser extension settings.
- **Full-Screen Media & Video Playback**: If the user is actively watching a video in full-screen mode on a mindful site, gentle follow-up notifications MUST NOT break full-screen video immersion abruptly; instead, the nudge should appear quietly in the corner or defer until playback pauses or full-screen exits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST intercept page loads on all user-configured mindful domains and present a clean, distraction-free interstitial screen before the destination page content is accessible.
- **FR-002**: Interstitial screen MUST feature a smooth breathing circle animation with a default duration of 3 to 4 seconds to encourage physiological centering before proceeding.
- **FR-003**: Interstitial screen MUST present an Intention Prompt ("What brings you here right now?") featuring quick-select pills ("Work/Research", "Quick Check", "Boredom/Escapism") and an optional text input field for custom intentions.
- **FR-004**: Interstitial screen MUST provide an immediate, prominent "Close Tab" option to allow users to exit without loading page content.
- **FR-005**: System MUST prevent duplicate interstitial triggers when a user navigates between pages or clicks internal links within an ongoing active session on the same domain.
- **FR-006**: System MUST track active dwell time on mindful domains, accumulating time only while the tab is active and the user is engaged, excluding backgrounded or minimized states.
- **FR-007**: When an active session is started with the "Quick Check" intention (or any intention with an active time cap) and active dwell time reaches the configured threshold (default: 7 minutes), the system MUST display a non-blocking in-page follow-up prompt asking: "You've been browsing for a bit. Still aligned with your original intention?".
- **FR-008**: In-session follow-up prompt MUST offer two direct actions: "Keep Going" (which dismisses the notification and allows continuation) and "Close Tab" (which closes the current tab).
- **FR-009**: System MUST detect session termination events, triggered by tab closure, navigation away to a non-mindful site, continuous inactivity exceeding 15 minutes, or system screen lock.
- **FR-010**: Upon session termination, system MUST present a frictionless exit micro-reflection prompt asking: "How did this session feel?" with three qualitative choices:
  - "Nourishing / Productive" (Green)
  - "Neutral / Routine" (Gray)
  - "Draining / Doomscrolling" (Red/Muted Orange)
- **FR-011**: Exit micro-reflection prompt MUST automatically dismiss after 5 seconds if unaddressed, persisting the session as unrated without interrupting subsequent browsing.
- **FR-012**: System MUST maintain an Attention Ledger recording session start time, active duration, domain, declared intention, and qualitative sentiment rating.
- **FR-013**: System MUST provide a Weekly Reflection Story compiling Attention Ledger records into empathetic, qualitative insights highlighting sentiment distribution (% nourishing vs % draining) and time-of-day behavioral correlations.
- **FR-014**: Weekly Reflection Story MUST formulate non-punitive, supportive coaching suggestions based on detected trends (such as suggesting an optional soft cap for late-night hours when draining ratings concentrate past 9 PM).
- **FR-015**: Users MUST be able to manage the mindful domain registry by adding custom domains, toggling existing domains, or deleting domains.
- **FR-016**: Users MUST be able to configure coaching preferences, including breathing pause duration (3-5 seconds), quick-check alert threshold (in minutes), idle timeout duration, and default intention presets.
- **FR-017**: All Attention Ledger data, intention logs, and user preferences MUST remain stored strictly on the local device, ensuring zero transmission of personal browsing history to external servers.
- **FR-018**: System MUST provide identical coaching interactions and data fidelity across both supported web browser environments (Mozilla Firefox and Google Chrome).

### Key Entities *(include if feature involves data)*

- **Mindful Domain Config**: Represents a target website subject to mindful coaching. Key attributes include domain pattern (e.g., `reddit.com`), enabled status, custom session threshold override, and creation date.
- **Browsing Session**: Represents a discrete period of engagement on a mindful domain. Key attributes include unique session ID, target domain, start timestamp, active dwell duration in seconds, stated intention type (pill value or custom text), in-session nudge count, exit sentiment rating (Nourishing, Neutral, Draining, or Unrated), and termination cause (closed tab, timeout, navigation away).
- **Attention Ledger**: An aggregate collection of all historical browsing sessions. Key attributes include time period groupings (daily, weekly), domain aggregates, sentiment distribution percentages, and temporal pattern metadata (e.g., late-night session indicators).
- **Weekly Reflection Insight**: A synthesized coaching summary generated from the Attention Ledger. Key attributes include reporting week date range, total conscious time, dominant sentiment, notable patterns (e.g., late-night fatigue), and proactive coaching suggestions (e.g., suggested soft caps).
- **User Settings**: System configuration containing mindful domain list, breathing pause duration, quick check threshold minutes, idle session timeout minutes, notification display preferences, and custom intention pill definitions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of initial page navigations to designated mindful domains display the interstitial pause screen within 100 milliseconds of navigation start, preventing unintended exposure to algorithmic feeds.
- **SC-002**: Users complete the mindful breathing pause and intention selection in an average of under 4 seconds, maintaining near-zero friction for purposeful work visits.
- **SC-003**: At least 25% of triggered mindful pause interstitials result in intentional tab closure ("Close Tab") before the user ever loads or views the destination site content.
- **SC-004**: Exit micro-reflection prompt achieves at least a 50% voluntary completion rate without using blocking modal dialogs or compulsory confirmations.
- **SC-005**: Users experience a measurable reduction of at least 20% in cumulative browsing time categorized as "Draining / Doomscrolling" over their first 3 weeks of use.
- **SC-006**: In-session follow-up prompts for "Quick Check" visits trigger conscious resolution ("Close Tab" or "Keep Going") within 10 seconds of display in over 85% of occurrences.
- **SC-007**: The weekly reflection story generates and displays within 300 milliseconds from local storage with 100% technology-agnostic, empathetic, non-punitive messaging.
- **SC-008**: 100% of user browsing history, intention records, and sentiment ratings are stored purely on the client device with zero outbound network traffic for analytics.

## Assumptions

- **Browser Platform**: Target environments are modern desktop installations of Google Chrome and Mozilla Firefox adhering to standard WebExtension Manifest V3 (or compatible Firefox WebExtension APIs).
- **Privacy & Storage**: All session logs, intention records, and qualitative sentiments are strictly stored in local browser storage on the user's machine; no remote database or telemetry tracking is required.
- **Notification Presentation**: The exit prompt is rendered using native browser notifications or an unobtrusive in-page toast depending on whether the tab was closed or switched away from, ensuring notifications respect operating system focus modes (e.g., "Do Not Disturb").
- **Default Mindful Sites**: On initial installation, Anchor includes a curated default starter list (e.g., `youtube.com`, `reddit.com`, `x.com`, `instagram.com`) which users can freely edit, disable, or expand at any time.
- **Audio & Accessibility**: The breathing animation and prompts operate silently by default to remain courteous in work and public environments, with high-contrast visual cues and keyboard navigation accessibility.
- **Soft Caps vs Hard Blocks**: In alignment with Anchor's coaching philosophy, "soft caps" suggested in weekly reflection stories do not act as unskippable hard blocks; rather, they serve as gentle prompts acknowledging the user's prior intentions.
