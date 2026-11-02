export interface NudgeToastOptions {
  intentionLabel: string;
  thresholdMinutes?: number;
  message?: string;
  onKeepGoing: () => void;
  onCloseTab: () => void;
}

export class NudgeToast {
  private host: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;

  show(options: NudgeToastOptions): void {
    if (this.host) {
      this.remove();
    }

    this.host = document.createElement("anchor-nudge-toast");
    this.shadow = this.host.attachShadow({ mode: "open" });

    const messageText = options.message || "You've been browsing for a bit. Still aligned with your original intention?";
    const chipText = options.thresholdMinutes ? `${options.intentionLabel} • ${options.thresholdMinutes}m` : options.intentionLabel;

    this.shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          display: block !important;
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .toast-card {
          pointer-events: auto;
          background: rgba(18, 27, 34, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45), 0 0 25px rgba(56, 189, 248, 0.15);
          border-radius: 16px;
          padding: 20px 22px;
          width: 360px;
          max-width: calc(100vw - 48px);
          color: #edf2f4;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          padding: 4px 10px;
          border-radius: 9999px;
        }

        .intention-chip {
          font-size: 11px;
          color: #94a3b8;
        }

        .toast-body {
          font-size: 14px;
          line-height: 1.45;
          color: #edf2f4;
          font-weight: 500;
        }

        .toast-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 4px;
        }

        button {
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-keep {
          background: transparent;
          color: #94a3b8;
        }

        .btn-keep:hover {
          color: #edf2f4;
          background: rgba(255, 255, 255, 0.06);
        }

        .btn-close {
          background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
        }

        .btn-close:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
      </style>

      <div class="toast-card" role="alert">
        <div class="toast-header">
          <div class="brand-chip">
            <span>⚓ Anchor</span>
          </div>
          <span class="intention-chip">${chipText}</span>
        </div>
        <div class="toast-body">
          ${messageText}
        </div>
        <div class="toast-actions">
          <button type="button" class="btn-keep" id="btn-keep">Keep Going</button>
          <button type="button" class="btn-close" id="btn-close">Close Tab</button>
        </div>
      </div>
    `;

    const btnKeep = this.shadow.getElementById("btn-keep");
    const btnClose = this.shadow.getElementById("btn-close");

    btnKeep?.addEventListener("click", () => {
      this.remove();
      options.onKeepGoing();
    });

    btnClose?.addEventListener("click", () => {
      this.remove();
      options.onCloseTab();
    });

    const container = document.body || document.documentElement;
    if (container) {
      container.appendChild(this.host);
    }
  }

  remove(): void {
    if (this.host && this.host.parentNode) {
      this.host.parentNode.removeChild(this.host);
    }
    this.host = null;
    this.shadow = null;
  }
}
