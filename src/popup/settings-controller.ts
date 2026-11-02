import { defaultStorageService, StorageService } from "../shared/storage";
import type { UserSettings, MindfulDomain } from "../shared/types";

export class SettingsController {
  private storage: StorageService;
  private domainsList: HTMLElement | null;
  private countBadge: HTMLElement | null;
  private sliderPause: HTMLInputElement | null;
  private valPause: HTMLElement | null;
  private sliderQuickCheck: HTMLInputElement | null;
  private valQuickCheck: HTMLElement | null;
  private toggleNotifications: HTMLInputElement | null;
  private formAddDomain: HTMLFormElement | null;
  private inputNewDomain: HTMLInputElement | null;

  constructor(storage: StorageService = defaultStorageService) {
    this.storage = storage;
    this.domainsList = document.getElementById("domains-list");
    this.countBadge = document.getElementById("domains-count-badge");
    this.sliderPause = document.getElementById("slider-pause-duration") as HTMLInputElement;
    this.valPause = document.getElementById("val-pause-duration");
    this.sliderQuickCheck = document.getElementById("slider-quick-check") as HTMLInputElement;
    this.valQuickCheck = document.getElementById("val-quick-check");
    this.toggleNotifications = document.getElementById("toggle-notifications") as HTMLInputElement;
    this.formAddDomain = document.getElementById("form-add-domain") as HTMLFormElement;
    this.inputNewDomain = document.getElementById("input-new-domain") as HTMLInputElement;
  }

  async initialize(): Promise<void> {
    const settings = await this.storage.getSettings();
    this.renderSettings(settings);
    this.bindEvents();
  }

  renderSettings(settings: UserSettings): void {
    if (this.sliderPause && this.valPause) {
      this.sliderPause.value = String(settings.pauseDurationSeconds);
      this.valPause.textContent = `${settings.pauseDurationSeconds}s`;
    }

    if (this.sliderQuickCheck && this.valQuickCheck) {
      this.sliderQuickCheck.value = String(settings.quickCheckDefaultMinutes);
      this.valQuickCheck.textContent = `${settings.quickCheckDefaultMinutes}m`;
    }

    if (this.toggleNotifications) {
      this.toggleNotifications.checked = settings.notificationsEnabled;
    }

    this.renderDomainsList(settings.mindfulDomains);
  }

  renderDomainsList(domains: MindfulDomain[]): void {
    if (!this.domainsList) return;

    if (this.countBadge) {
      this.countBadge.textContent = String(domains.length);
    }

    this.domainsList.innerHTML = "";

    domains.forEach((d) => {
      const li = document.createElement("li");
      li.className = "domain-item";
      li.innerHTML = `
        <span class="domain-item-name">${d.domainPattern}</span>
        <div class="domain-item-actions">
          <label class="switch">
            <input type="checkbox" class="toggle-domain" data-id="${d.id}" ${d.isEnabled ? "checked" : ""} />
            <span class="slider round"></span>
          </label>
          <button type="button" class="btn-remove-domain" data-id="${d.id}" title="Remove domain">
            ✕
          </button>
        </div>
      `;

      const checkbox = li.querySelector(".toggle-domain") as HTMLInputElement;
      checkbox?.addEventListener("change", async () => {
        await this.storage.toggleMindfulDomain(d.id, checkbox.checked);
      });

      const removeBtn = li.querySelector(".btn-remove-domain") as HTMLButtonElement;
      removeBtn?.addEventListener("click", async () => {
        await this.storage.removeMindfulDomain(d.id);
        const updated = await this.storage.getSettings();
        this.renderDomainsList(updated.mindfulDomains);
      });

      this.domainsList?.appendChild(li);
    });
  }

  bindEvents(): void {
    // Add domain
    this.formAddDomain?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const val = this.inputNewDomain?.value.trim();
      if (!val) return;

      try {
        await this.storage.addMindfulDomain(val);
        if (this.inputNewDomain) this.inputNewDomain.value = "";
        const updated = await this.storage.getSettings();
        this.renderDomainsList(updated.mindfulDomains);
      } catch (err) {
        console.error("Failed to add domain", err);
      }
    });

    // Timing Sliders
    this.sliderPause?.addEventListener("input", async () => {
      const seconds = parseInt(this.sliderPause?.value || "3", 10);
      if (this.valPause) this.valPause.textContent = `${seconds}s`;
      await this.storage.updateSettings({ pauseDurationSeconds: seconds });
    });

    this.sliderQuickCheck?.addEventListener("input", async () => {
      const minutes = parseInt(this.sliderQuickCheck?.value || "7", 10);
      if (this.valQuickCheck) this.valQuickCheck.textContent = `${minutes}m`;
      await this.storage.updateSettings({ quickCheckDefaultMinutes: minutes });
    });

    // Notifications toggle
    this.toggleNotifications?.addEventListener("change", async () => {
      const enabled = !!this.toggleNotifications?.checked;
      await this.storage.updateSettings({ notificationsEnabled: enabled });
    });
  }
}
