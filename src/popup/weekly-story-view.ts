import { defaultStorageService, StorageService } from "../shared/storage";
import { synthesizeWeeklyStory } from "../shared/weekly-story";
import type { WeeklyReflectionStory } from "../shared/types";

export class WeeklyStoryView {
  private storage: StorageService;
  private container: HTMLElement | null;

  constructor(storage: StorageService = defaultStorageService) {
    this.storage = storage;
    this.container = document.getElementById("story-container");
  }

  async initialize(): Promise<void> {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;
    const sessions = await this.storage.getSessionsForPeriod(sevenDaysAgo, now);

    const story = synthesizeWeeklyStory("current-week", sessions);
    this.render(story);
  }

  render(story: WeeklyReflectionStory): void {
    if (!this.container) return;

    const totalHours = (story.totalDwellSeconds / 3600).toFixed(1);
    const { nourishingPercent, neutralPercent, drainingPercent } = story.sentimentBreakdown;

    this.container.innerHTML = `
      <div class="story-card">
        <div class="story-metric-row">
          <div class="metric-block">
            <span class="metric-num">${totalHours}h</span>
            <span class="metric-sub">Conscious Time</span>
          </div>
          <div class="metric-block">
            <span class="metric-num">${story.totalBounces}</span>
            <span class="metric-sub">Mindful Pauses Turned Away</span>
          </div>
        </div>

        <!-- Sentiment Distribution Progress Bar -->
        <div class="sentiment-section">
          <div class="sentiment-label-row">
            <span>How Time Felt</span>
            <span class="sentiment-total-sessions">${story.totalSessions} visits</span>
          </div>

          <div class="sentiment-bar-track">
            <div class="bar-segment nourishing" style="width: ${nourishingPercent}%;" title="Nourishing: ${nourishingPercent}%"></div>
            <div class="bar-segment neutral" style="width: ${neutralPercent}%;" title="Neutral: ${neutralPercent}%"></div>
            <div class="bar-segment draining" style="width: ${drainingPercent}%;" title="Draining: ${drainingPercent}%"></div>
          </div>

          <div class="sentiment-legend">
            <div class="legend-item nourishing">
              <span class="legend-dot"></span>
              <span>${nourishingPercent}% Nourishing</span>
            </div>
            <div class="legend-item neutral">
              <span class="legend-dot"></span>
              <span>${neutralPercent}% Neutral</span>
            </div>
            <div class="legend-item draining">
              <span class="legend-dot"></span>
              <span>${drainingPercent}% Draining</span>
            </div>
          </div>
        </div>

        <!-- Coaching Suggestions -->
        <div class="coaching-section">
          ${story.coachingSuggestions
            .map((s) => `
              <div class="suggestion-card ${s.type}">
                <div class="suggestion-header">
                  <span class="suggestion-badge">Coach Insight</span>
                  <h4>${s.headline}</h4>
                </div>
                <p class="suggestion-body">${s.message}</p>
                ${
                  s.type === "late_night_soft_cap" && s.actionableDomain
                    ? `<button type="button" class="btn btn-sm btn-primary btn-apply-cap" data-domain="${s.actionableDomain}">
                        Set 9 PM Soft Cap
                       </button>`
                    : ""
                }
              </div>
            `)
            .join("")}
        </div>
      </div>
    `;

    // Bind soft cap buttons
    const capButtons = this.container.querySelectorAll<HTMLButtonElement>(".btn-apply-cap");
    capButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const domain = btn.dataset.domain;
        if (!domain) return;

        await this.storage.addMindfulDomain(domain, { lateNightSoftCapHour: 21 });
        btn.textContent = "✓ 9 PM Soft Cap Active";
        btn.disabled = true;
        btn.style.background = "#10b981";
      });
    });
  }
}
