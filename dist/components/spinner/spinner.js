import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxSpinner = class _FxSpinner extends FxElement {
  static get observedAttributes() {
    return ["size"];
  }
  /** Tamanho do spinner. Padrão: `'md'`. */
  get size() {
    const s = this.getAttr("size", "md");
    return s === "sm" || s === "lg" ? s : "md";
  }
  set size(value) {
    this.setAttribute("size", value);
  }
  render() {
    this.setTemplate(`<span class="spinner" part="spinner" role="status" aria-label="Carregando"></span>`);
  }
};
_FxSpinner.styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    /* Escala: sm 16px · md 24px (padrão) · lg 32px */
    .spinner {
      display: inline-block;
      width: var(--fx-space-xl, 20px);
      height: var(--fx-space-xl, 20px);
      border: 2px solid var(--fx-border-default, #e2e8f0);
      border-top-color: var(--fx-color-primary, #2563eb);
      border-radius: var(--fx-radius-full, 9999px);
      animation: fx-spin 0.8s linear infinite;
    }
    :host([size='sm']) .spinner { width: var(--fx-space-lg, 16px); height: var(--fx-space-lg, 16px); }
    :host([size='lg']) .spinner { width: 32px; height: 32px; border-width: 3px; }
    @keyframes fx-spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .spinner { animation-duration: 2.5s; }
    }
  `;
let FxSpinner = _FxSpinner;
function defineFxSpinner() {
  return defineElement("fx-spinner", FxSpinner);
}
export {
  FxSpinner,
  defineFxSpinner
};
//# sourceMappingURL=spinner.js.map
