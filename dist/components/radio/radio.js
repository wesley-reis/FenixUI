import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxRadio = class _FxRadio extends FxElement {
  static get observedAttributes() {
    return ["checked", "disabled"];
  }
  get checked() {
    return this.hasAttr("checked");
  }
  set checked(value) {
    this.toggleAttr("checked", Boolean(value));
  }
  get disabled() {
    return this.hasAttr("disabled");
  }
  set disabled(value) {
    this.toggleAttr("disabled", Boolean(value));
  }
  /** Tamanho do controle. Padrão: `'md'`. */
  get size() {
    const s = this.getAttr("size", "md");
    return s === "sm" || s === "lg" ? s : "md";
  }
  set size(value) {
    this.setAttribute("size", value);
  }
  render() {
    const px = this.size === "sm" ? "14px" : this.size === "lg" ? "22px" : "18px";
    if (!this.style.getPropertyValue("--fx-size-radio")) {
      this.style.setProperty("--fx-size-radio", px);
    }
    this.setTemplate(`
      <span class="box" part="box" role="radio" tabindex="0"
        aria-checked="${this.checked}" aria-disabled="${this.disabled}">
        <span class="control" part="control"><span class="dot" part="dot"></span></span>
        <span class="label" part="label"><slot></slot></span>
      </span>
    `);
    const box = this.root.querySelector(".box");
    if (!box) return;
    box.addEventListener("click", () => this.select());
    box.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.select();
      }
    });
  }
  select() {
    if (this.disabled || this.checked) return;
    const name = this.getAttr("name");
    if (name) {
      document.querySelectorAll(`fx-radio[name="${CSS.escape(name)}"]`).forEach((r) => {
        r.checked = false;
      });
    }
    this.checked = true;
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { checked: true, value: this.getAttr("value") }
      })
    );
  }
};
_FxRadio.styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .box {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-sm);
      cursor: pointer;
      user-select: none;
      color: var(--fx-text-default);
      -webkit-tap-highlight-color: transparent;
    }
    .control {
      width: var(--fx-size-radio, 18px);
      height: var(--fx-size-radio, 18px);
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--fx-border-hover);
      border-radius: var(--fx-radius-full);
      background: var(--fx-surface-background);
      transition:
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .box:hover .control { border-color: var(--fx-color-primary); }
    .box:focus-visible .control {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .dot {
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      border-radius: var(--fx-radius-full);
      background: var(--fx-color-primary);
      transform: scale(0);
      transition: transform var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    :host([checked]) .control { border-color: var(--fx-color-primary); }
    :host([checked]) .dot { transform: scale(1); }
    /* Validação */
    :host([error]) .control,
    :host([invalid]) .control { border-color: var(--fx-color-danger, #dc2626); }
    :host([success]) .control,
    :host([valid]) .control { border-color: var(--fx-color-success, #16a34a); }
    .label { display: inline-flex; align-items: center; }
    :host([disabled]) .box {
      opacity: 0.55;
      cursor: not-allowed;
      pointer-events: none;
    }
  `;
let FxRadio = _FxRadio;
function defineFxRadio() {
  return defineElement("fx-radio", FxRadio);
}
export {
  FxRadio,
  defineFxRadio
};
//# sourceMappingURL=radio.js.map
