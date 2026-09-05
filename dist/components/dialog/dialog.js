import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
const _FxDialog = class _FxDialog extends FxElement {
  constructor() {
    super(...arguments);
    this._previouslyFocused = null;
  }
  static get observedAttributes() {
    return ["open", "size", "heading"];
  }
  get open() {
    return this.hasAttr("open");
  }
  set open(value) {
    this.toggleAttr("open", value);
  }
  render() {
    const isOpen = this.open;
    const heading = this.getAttr("heading");
    this.setTemplate(`
      <div class="overlay" part="overlay" ${isOpen ? "" : "hidden"}>
        <div class="dialog" role="dialog" aria-modal="true" aria-label="${esc(heading)}" tabindex="-1">
          <header>
            <h2>${esc(heading)}</h2>
            <button type="button" class="close" part="close" aria-label="Fechar">×</button>
          </header>
          <div class="body"><slot></slot></div>
          <footer part="footer"><slot name="footer"></slot></footer>
        </div>
      </div>
    `);
    if (!isOpen) return;
    const overlay = this.root.querySelector(".overlay");
    const closeBtn = this.root.querySelector(".close");
    const close = () => {
      this.open = false;
      this._cleanup?.();
      this._cleanup = void 0;
      this._restoreFocus();
      this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
    };
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn?.addEventListener("click", close);
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key === "Tab") this._trapFocus(e);
    };
    document.addEventListener("keydown", onKey);
    this._cleanup = () => document.removeEventListener("keydown", onKey);
    requestAnimationFrame(() => {
      this._previouslyFocused = document.activeElement;
      this.root.querySelector(".dialog")?.focus();
    });
    this.dispatchEvent(new CustomEvent("open", { bubbles: true, composed: true }));
  }
  /** Mantém o foco dentro do modal (WCAG 2.4.3 / 2.1.2). */
  _trapFocus(e) {
    const dialog = this.root.querySelector(".dialog");
    if (!dialog) return;
    const focusables = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.root.activeElement;
    if (e.shiftKey && (active === first || active === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
  _restoreFocus() {
    if (this._previouslyFocused?.isConnected) this._previouslyFocused.focus();
    this._previouslyFocused = null;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup?.();
    this._cleanup = void 0;
    this._restoreFocus();
  }
};
_FxDialog.styles = css`
    :host { display: contents; }
    .overlay {
      position: fixed;
      inset: 0;
      background: color-mix(in srgb, var(--fx-text-default, #000) 45%, transparent);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--fx-z-modal, 1100);
      animation: fade var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .overlay[hidden] { display: none; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    .dialog {
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-lg);
      box-shadow: var(--fx-shadow-xl);
      width: min(560px, calc(100vw - 32px));
      max-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      font-family: var(--fx-font-family);
      animation: pop var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    @keyframes pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    :host([size='sm']) .dialog { width: min(400px, calc(100vw - 32px)); }
    :host([size='lg']) .dialog { width: min(800px, calc(100vw - 32px)); }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--fx-space-lg) var(--fx-space-xl);
      border-bottom: 1px solid var(--fx-border-default);
    }
    h2 {
      margin: 0;
      font-size: calc(var(--fx-font-size) + 2px);
      font-weight: 600;
      color: var(--fx-text-default);
    }
    .close {
      border: none;
      background: transparent;
      color: var(--fx-text-muted);
      font-size: calc(var(--fx-font-size) + 6px);
      cursor: pointer;
      line-height: 1;
      padding: 0 var(--fx-space-xs);
      border-radius: var(--fx-radius-full);
    }
    .close:hover { color: var(--fx-color-danger); }
    .body {
      padding: var(--fx-space-lg) var(--fx-space-xl);
      overflow-y: auto;
      color: var(--fx-text-default);
      font-size: var(--fx-font-size);
    }
    footer {
      padding: var(--fx-space-md) var(--fx-space-xl);
      border-top: 1px solid var(--fx-border-default);
      display: flex;
      justify-content: flex-end;
      gap: var(--fx-space-sm);
    }
    footer[hidden] { display: none; }
  `;
let FxDialog = _FxDialog;
function defineFxDialog() {
  return defineElement("fx-dialog", FxDialog);
}
export {
  FxDialog,
  defineFxDialog
};
//# sourceMappingURL=dialog.js.map
