import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxCheckbox = class _FxCheckbox extends FxElement {
  static get observedAttributes() {
    return ["checked", "disabled", "indeterminate"];
  }
  get checked() {
    return this.hasAttr("checked");
  }
  set checked(value) {
    this.toggleAttr("checked", Boolean(value));
  }
  get indeterminate() {
    return this.hasAttr("indeterminate");
  }
  set indeterminate(value) {
    this.toggleAttr("indeterminate", Boolean(value));
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
    if (!this.style.getPropertyValue("--fx-size-checkbox")) {
      this.style.setProperty("--fx-size-checkbox", px);
    }
    this.setTemplate(`
      <span class="box" part="box" role="checkbox" tabindex="0"
        aria-checked="${this.indeterminate ? "mixed" : this.checked}"
        aria-disabled="${this.disabled}">
        <span class="control" part="control">
          <span class="mark">${this.indeterminate ? "–" : "✓"}</span>
        </span>
        <span class="label" part="label"><slot></slot></span>
      </span>
    `);
    const box = this.root.querySelector(".box");
    if (!box) return;
    box.addEventListener("click", () => this.toggle());
    box.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  toggle() {
    if (this.disabled) return;
    this.indeterminate = false;
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { checked: this.checked, value: this.getAttr("value") }
      })
    );
  }
};
_FxCheckbox.styles = css`
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
      width: var(--fx-size-checkbox, 18px);
      height: var(--fx-size-checkbox, 18px);
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--fx-border-hover);
      border-radius: calc(var(--fx-radius-sm) + 2px);
      background: var(--fx-surface-background);
      color: #fff;
      font-size: calc(var(--fx-size-checkbox, 18px) - 6px);
      line-height: 1;
      transition:
        background-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .box:hover .control { border-color: var(--fx-color-primary); }
    .box:focus-visible .control {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    :host([checked]) .control {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
    }
        :host([indeterminate]) .control {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
    }
    /* Validação */
    :host([error]) .control,
    :host([invalid]) .control { border-color: var(--fx-color-danger, #dc2626); }
    :host([success]) .control,
    :host([valid]) .control { border-color: var(--fx-color-success, #16a34a); }
    .mark { visibility: hidden; }
    :host([checked]) .mark,
    :host([indeterminate]) .mark { visibility: visible; }
    .label { display: inline-flex; align-items: center; }
    :host([disabled]) .box {
      opacity: 0.55;
      cursor: not-allowed;
      pointer-events: none;
    }
  `;
let FxCheckbox = _FxCheckbox;
function defineFxCheckbox() {
  return defineElement("fx-checkbox", FxCheckbox);
}
export {
  FxCheckbox,
  defineFxCheckbox
};
//# sourceMappingURL=checkbox.js.map
