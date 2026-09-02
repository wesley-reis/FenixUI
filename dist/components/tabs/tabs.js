import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxTabs = class _FxTabs extends FxElement {
  static get observedAttributes() {
    return ["value"];
  }
  get value() {
    return this.getAttr("value");
  }
  set value(value) {
    this.setAttribute("value", value);
  }
  render() {
    const tabs = Array.from(this.querySelectorAll("fx-tab"));
    const active = this.value || tabs[0]?.getAttribute("tab") || "";
    this.setTemplate(`
      <div class="list" role="tablist">
        ${tabs.map((t) => {
      const tabId = t.getAttribute("tab") ?? "";
      const disabled = t.hasAttribute("disabled");
      return `<button type="button" class="tab" role="tab" part="tab"
            data-tab="${tabId}" aria-selected="${tabId === active}"
            ${disabled ? 'aria-disabled="true" data-disabled="true"' : ""}>${t.textContent?.trim()}</button>`;
    }).join("")}
      </div>
      <slot></slot>
    `);
    this.panels.forEach((p) => {
      const show = p.getAttribute("tab") === active;
      if (show) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
    this.root.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.hasAttribute("data-disabled")) return;
        this.value = btn.dataset.tab ?? "";
        this.dispatchEvent(
          new CustomEvent("change", { bubbles: true, composed: true, detail: { value: this.value } })
        );
      });
    });
  }
  /** Painéis associados: descendentes do host ou irmãos seguintes no DOM. */
  get panels() {
    const inside = Array.from(this.querySelectorAll("fx-tab-panel"));
    if (inside.length) return inside;
    const out = [];
    let el = this.nextElementSibling;
    while (el && !el.matches("fx-tabs")) {
      if (el.matches("fx-tab-panel")) out.push(el);
      else out.push(...Array.from(el.querySelectorAll(":scope > fx-tab-panel")));
      el = el.nextElementSibling;
    }
    return out;
  }
};
_FxTabs.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
    }
    .list {
      display: flex;
      gap: var(--fx-space-xs);
      border-bottom: 2px solid var(--fx-border-default);
    }
    .tab {
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: var(--fx-font-size);
      color: var(--fx-text-muted);
      padding: var(--fx-space-md) var(--fx-space-lg);
      cursor: pointer;
      position: relative;
      transition: color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .tab::after {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: -2px;
      height: 2px;
      background: transparent;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .tab:hover { color: var(--fx-text-default); }
    .tab[data-disabled] {
      color: var(--fx-border-default);
      cursor: not-allowed;
      opacity: 0.6;
    }
    .tab[data-disabled]:hover { color: var(--fx-border-default); }
    .tab[aria-selected='true'] {
      color: var(--fx-color-primary);
      font-weight: 600;
    }
    .tab[aria-selected='true']::after { background: var(--fx-color-primary); }
    .tab:focus-visible {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
      border-radius: var(--fx-radius-sm);
    }
    /* Os <fx-tab> originais são renderizados como botões no shadow DOM.
       Sem isto, o <slot> os projetaria de novo como texto cru abaixo das abas. */
    ::slotted(fx-tab) {
      display: none !important;
    }
  `;
let FxTabs = _FxTabs;
const _FxTabPanel = class _FxTabPanel extends FxElement {
  constructor() {
    super(...arguments);
    this._initialized = false;
  }
  static get observedAttributes() {
    return ["tab"];
  }
  get tab() {
    return this.getAttr("tab");
  }
  /** Setter necessário: o Vue (patchDOMProp) seta `tab` como PROPRIEDADE
   *  (pois o getter existe no prototype) — sem ele o atributo nunca é
   *  aplicado e o painel nunca é exibido. */
  set tab(value) {
    this.setAttribute("tab", value);
  }
  get visible() {
    return !this.hasAttr("hidden");
  }
  set visible(value) {
    this.toggleAttr("hidden", !value);
  }
  render() {
    this.setTemplate("<slot></slot>");
    if (!this._initialized) {
      const owner = this.closest("fx-tabs") ?? (() => {
        let el = this.previousElementSibling;
        while (el) {
          if (el.matches("fx-tabs")) return el;
          el = el.previousElementSibling;
        }
        return null;
      })();
      const active = owner ? owner.getAttribute("value") || "" : "";
      if (this.getAttribute("tab") !== active) this.setAttribute("hidden", "");
      this._initialized = true;
    }
  }
};
_FxTabPanel.styles = css`
    :host { display: block; padding: var(--fx-space-lg) 0; font-family: var(--fx-font-family); color: var(--fx-text-default); }
    :host([hidden]) { display: none; }
  `;
let FxTabPanel = _FxTabPanel;
function defineFxTabs() {
  return defineElement("fx-tabs", FxTabs);
}
function defineFxTabPanel() {
  return defineElement("fx-tab-panel", FxTabPanel);
}
export {
  FxTabPanel,
  FxTabs,
  defineFxTabPanel,
  defineFxTabs
};
//# sourceMappingURL=tabs.js.map
