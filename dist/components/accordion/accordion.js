import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
const _FxAccordionPanel = class _FxAccordionPanel extends FxElement {
  constructor() {
    super(...arguments);
    this._mo = null;
    this._clickListenerAttached = false;
  }
  static get observedAttributes() {
    return ["header", "expanded", "disabled"];
  }
  get header() {
    return this.getAttr("header", "");
  }
  set header(v) {
    this.setAttribute("header", v);
  }
  get value() {
    return this.getAttr("value", "");
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  get expanded() {
    return this.hasAttr("expanded");
  }
  set expanded(v) {
    this.toggleAttr("expanded", v);
  }
  get disabled() {
    return this.hasAttr("disabled");
  }
  set disabled(v) {
    this.toggleAttr("disabled", v);
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this._clickListenerAttached) {
      this._clickListenerAttached = true;
      this.addEventListener("click", (e) => {
        const path = e.composedPath();
        if (!path.some((el) => el.classList?.contains("header"))) return;
        if (this.disabled) return;
        this.dispatchEvent(
          new CustomEvent("fx-accordion-toggle", {
            bubbles: true,
            composed: true,
            detail: { panel: this }
          })
        );
      });
    }
    this._mo = new MutationObserver(() => this.render());
    this._mo.observe(this, { attributes: true, attributeFilter: ["expanded", "header", "disabled"] });
  }
  disconnectedCallback() {
    this._mo?.disconnect();
    this._mo = null;
  }
  render() {
    this.setTemplate(`
      <div class="panel" part="panel">
        <button type="button" class="header" part="header" role="button"
          aria-expanded="${this.expanded}"
          ${this.disabled ? 'aria-disabled="true"' : ""}>
          <span class="header-text" part="header-text">
            <slot name="header">${esc(this.header)}</slot>
          </span>
          <span class="chevron" part="chevron" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </button>
        <div class="content" part="content" role="region">
          <div class="content-inner">
            <div class="content-pad" part="content-pad"><slot></slot></div>
          </div>
        </div>
      </div>
    `);
  }
};
_FxAccordionPanel.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    /* A borda fica no wrapper interno (nao no :host): regras do documento
       externo (ex.: preflight do Tailwind com border-width: 0) vencem as
       regras :host do shadow tree, o que apagaria a linha divisoria. */
    .panel {
      border-bottom: 1px solid var(--fx-border-default);
    }
    :host(:last-child) .panel { border-bottom: none; }
    :host([disabled]) { opacity: 0.6; pointer-events: none; }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fx-space-md);
      width: 100%;
      box-sizing: border-box;
      padding: var(--fx-space-lg, 20px) var(--fx-space-md, 14px);
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      font-weight: 500;
      color: var(--fx-text-muted);
      text-align: left;
      cursor: pointer;
      transition: color var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease),
        background var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease);
    }
    .header:hover { color: var(--fx-text-default); }
    .header:focus-visible {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
      border-radius: var(--fx-radius-sm, 4px);
    }
    :host([expanded]) .header {
      color: var(--fx-text-default);
      font-weight: 700;
    }
    .header-text { flex: 1; min-width: 0; }
    .chevron {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--fx-text-muted);
      transition: transform var(--fx-motion-duration-normal, 250ms) var(--fx-motion-easing, ease);
    }
    :host([expanded]) .chevron { transform: rotate(180deg); color: var(--fx-color-primary); }
    .content {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows var(--fx-motion-duration-normal, 250ms) var(--fx-motion-easing, ease);
    }
    :host([expanded]) .content { grid-template-rows: 1fr; }
    .content-inner { overflow: hidden; }
    .content-pad {
      padding: 0 var(--fx-space-md, 14px) var(--fx-space-lg, 20px);
      color: var(--fx-text-muted);
      line-height: 1.6;
    }
  `;
let FxAccordionPanel = _FxAccordionPanel;
const _FxAccordion = class _FxAccordion extends FxElement {
  constructor() {
    super(...arguments);
    this._observer = null;
    this._initialized = false;
    this._listenersAttached = false;
  }
  static get observedAttributes() {
    return ["value", "multiple"];
  }
  get multiple() {
    return this.hasAttr("multiple");
  }
  set multiple(v) {
    this.toggleAttr("multiple", v);
  }
  /** Valores ativos como array. */
  get values() {
    return this.getAttr("value", "").split(",").map((s) => s.trim()).filter(Boolean);
  }
  set values(v) {
    this.setAttribute("value", v.join(","));
  }
  connectedCallback() {
    this._observer = new MutationObserver(() => this._sync());
    this._observer.observe(this, { childList: true, subtree: true });
    super.connectedCallback();
    queueMicrotask(() => this._sync());
  }
  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = null;
  }
  render() {
    this.setTemplate(`
      <div class="accordion" part="accordion">
        <slot></slot>
      </div>
    `);
    this._sync();
    this._attachListeners();
  }
  /** Painéis do accordion (filhos diretos ou descendentes). */
  get panels() {
    return Array.from(this.querySelectorAll("fx-accordion-panel"));
  }
  _sync() {
    const actives = this.values;
    const panels = Array.from(this.querySelectorAll("fx-accordion-panel"));
    if (!this._initialized && actives.length === 0 && panels.length > 0) {
      this._initialized = true;
      const first = panels.find((p) => !p.hasAttribute("disabled"));
      if (first) {
        this.values = [first.getAttribute("value") || "0"];
        return;
      }
    }
    this._initialized = true;
    panels.forEach((p, i) => {
      const v = p.getAttribute("value") || String(i);
      if (!p.hasAttribute("value")) p.setAttribute("value", v);
      p.toggleAttribute("expanded", actives.includes(v));
    });
  }
  _attachListeners() {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    this.addEventListener("fx-accordion-toggle", (e) => {
      const panel = e.detail?.panel;
      if (!panel || panel.disabled) return;
      this.toggle(panel);
    });
  }
  /** Abre/fecha um painel respeitando o modo (single | multiple). */
  toggle(panel) {
    const v = panel.value;
    let actives = this.values;
    if (panel.expanded) {
      actives = actives.filter((a) => a !== v);
    } else if (this.multiple) {
      actives = [...actives, v];
    } else {
      actives = [v];
    }
    this.values = actives;
    this._sync();
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: actives }
      })
    );
  }
  /** Abre um painel pelo valor. */
  open(value) {
    const panel = this.panels.find((p, i) => (p.value || String(i)) === value);
    if (panel && !panel.expanded) this.toggle(panel);
  }
  /** Fecha um painel pelo valor. */
  close(value) {
    const panel = this.panels.find((p, i) => (p.value || String(i)) === value);
    if (panel && panel.expanded) this.toggle(panel);
  }
};
_FxAccordion.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .accordion {
      background: var(--fx-surface-background, #ffffff);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md, 8px);
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }
  `;
let FxAccordion = _FxAccordion;
function defineFxAccordion() {
  return defineElement("fx-accordion", FxAccordion);
}
function defineFxAccordionPanel() {
  return defineElement("fx-accordion-panel", FxAccordionPanel);
}
export {
  FxAccordion,
  FxAccordionPanel,
  defineFxAccordion,
  defineFxAccordionPanel
};
//# sourceMappingURL=accordion.js.map
