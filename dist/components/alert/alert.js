import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxAlert = class _FxAlert extends FxElement {
  static get observedAttributes() {
    return ["variant", "title", "dismissible"];
  }
  render() {
    const variant = this.getAttr("variant", "info");
    const title = this.getAttr("title");
    const icons = {
      info: "ℹ",
      success: "✓",
      warning: "⚠",
      danger: "✕"
    };
    this.setTemplate(`
      <div class="alert" part="alert" role="alert">
        <span class="icon">${icons[variant] ?? "ℹ"}</span>
        <div class="content">
          ${title ? `<div class="title">${title}</div>` : ""}
          <div class="body"><slot></slot></div>
        </div>
        ${this.hasAttr("dismissible") ? '<button type="button" class="close" aria-label="Fechar">×</button>' : ""}
      </div>
    `);
    this.root.querySelector(".close")?.addEventListener("click", () => {
      this.hidden = true;
      this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true, composed: true }));
    });
  }
};
_FxAlert.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      --_color: var(--fx-color-primary);
      --_bg: color-mix(in srgb, var(--fx-color-primary) 10%, var(--fx-surface-background));
    }
    :host([variant='info']) { --_color: var(--fx-color-info); --_bg: color-mix(in srgb, var(--fx-color-info) 10%, var(--fx-surface-background)); }
    :host([variant='success']) { --_color: var(--fx-color-success); --_bg: color-mix(in srgb, var(--fx-color-success) 10%, var(--fx-surface-background)); }
    :host([variant='warning']) { --_color: var(--fx-color-warning); --_bg: color-mix(in srgb, var(--fx-color-warning) 12%, var(--fx-surface-background)); }
    :host([variant='danger']) { --_color: var(--fx-color-danger); --_bg: color-mix(in srgb, var(--fx-color-danger) 10%, var(--fx-surface-background)); }
    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--fx-space-md);
      background: var(--_bg);
      border: 1px solid color-mix(in srgb, var(--_color) 30%, transparent);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    :host([hidden]) { display: none; }
    .icon { color: var(--_color); font-weight: bold; line-height: 1.4; }
    .content { flex: 1; }
    .title { font-weight: 600; }
    .body { margin-top: 2px; }
    .close {
      border: none; background: transparent; cursor: pointer;
      color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) + 2px);
      line-height: 1; padding: 0; border-radius: var(--fx-radius-full);
    }
    .close:hover { color: var(--_color); }
  `;
let FxAlert = _FxAlert;
function defineFxAlert() {
  return defineElement("fx-alert", FxAlert);
}
export {
  FxAlert,
  defineFxAlert
};
//# sourceMappingURL=alert.js.map
