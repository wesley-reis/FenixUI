import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
const _FxInput = class _FxInput extends FxElement {
  // `value` fica FORA da observação: refleti-lo a cada tecla não pode
  // re-renderizar o template, senão o campo perde o foco ao digitar.
  static get observedAttributes() {
    return [
      "type",
      "size",
      "placeholder",
      "disabled",
      "readonly",
      "min",
      "max",
      "step"
    ];
  }
  /** Tamanho do campo. Padrão: `'md'`. */
  get size() {
    const s = this.getAttr("size", "md");
    return s === "sm" || s === "lg" ? s : "md";
  }
  set size(value) {
    this.setAttribute("size", value);
  }
  get value() {
    return this.getAttr("value");
  }
  set value(value) {
    this.setAttribute("value", value);
  }
  get disabled() {
    return this.hasAttr("disabled");
  }
  set disabled(value) {
    this.toggleAttr("disabled", Boolean(value));
  }
  render() {
    const type = this.getAttr("type", "text");
    const placeholder = this.getAttr("placeholder");
    const readonly = this.hasAttr("readonly");
    const disabled = this.hasAttr("disabled");
    const min = this.getAttr("min");
    const max = this.getAttr("max");
    const step = this.getAttr("step");
    this.setTemplate(`
      ${this.hasAttr("clearable") ? '<div class="wrap">' : ""}
      <input class="field" part="input" type="${esc(type)}"
        ${placeholder ? `placeholder="${esc(placeholder)}"` : ""}
        ${min ? `min="${esc(min)}"` : ""} ${max ? `max="${esc(max)}"` : ""} ${step ? `step="${esc(step)}"` : ""}
      />
      ${this.hasAttr("clearable") ? '<button type="button" class="clear" part="clear" aria-label="Limpar" tabindex="-1">×</button></div>' : ""}
    `);
    const field = this.root.querySelector(".field");
    if (!field) return;
    field.value = this.getAttr("value");
    if (disabled) field.setAttribute("disabled", "");
    if (readonly) field.setAttribute("readonly", "");
    const emit = (event) => {
      this.value = field.value;
      this.dispatchEvent(
        new CustomEvent(event, { bubbles: true, composed: true, detail: { value: field.value } })
      );
    };
    field.addEventListener("input", (e) => {
      e.stopPropagation();
      emit("input");
    });
    field.addEventListener("change", (e) => {
      e.stopPropagation();
      emit("change");
    });
    const clearBtn = this.root.querySelector(".clear");
    const syncClear = () => {
      clearBtn?.toggleAttribute("hidden", field.value === "");
    };
    syncClear();
    clearBtn?.addEventListener("click", () => {
      field.value = "";
      syncClear();
      emit("input");
      emit("change");
      field.focus();
    });
    field.addEventListener("input", syncClear);
  }
};
_FxInput.styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .field {
      font-family: inherit;
      font-size: inherit;
      min-height: var(--fx-size-md);
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      width: 260px;
      box-sizing: border-box;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .field::placeholder { color: var(--fx-text-muted); opacity: 1; }
    .field:hover { border-color: var(--fx-border-hover); }
        .field:focus-visible {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .field:disabled,
    .field[readonly] {
      opacity: 0.55;
      cursor: not-allowed;
      background-color: var(--fx-surface-surface-hover);
    }
    /* Validação: sobrescrevem a borda/foco via token do preset. */
    :host([error]) .field,
    :host([invalid]) .field,
    :host([error]) .field:focus-visible,
    :host([invalid]) .field:focus-visible {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent);
    }
    :host([success]) .field,
    :host([valid]) .field,
    :host([success]) .field:focus-visible,
    :host([valid]) .field:focus-visible {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent);
    }
    :host([size='sm']) .field { padding: var(--fx-space-sm) var(--fx-space-md); font-size: var(--fx-font-size); width: 220px; min-height: var(--fx-size-sm); }
    :host([size='lg']) .field { padding: var(--fx-space-lg) var(--fx-space-xl); font-size: calc(var(--fx-font-size) + 4px); width: 300px; min-height: var(--fx-size-lg); }
    /* Clearable */
    :host([clearable]) { position: relative; display: inline-flex; }
    .wrap { position: relative; display: inline-flex; align-items: center; }
    :host([clearable]) .field { padding-right: var(--fx-space-xl); }
    .clear {
      position: absolute;
      right: var(--fx-space-xs);
      border: none;
      background: transparent;
      color: var(--fx-text-muted);
      font-size: calc(var(--fx-font-size) + 4px);
      line-height: 1;
      cursor: pointer;
      padding: 0 var(--fx-space-xs);
      border-radius: var(--fx-radius-full);
    }
    .clear:hover { color: var(--fx-color-danger); }
    .clear[hidden] { display: none; }
  `;
let FxInput = _FxInput;
function defineFxInput() {
  return defineElement("fx-input", FxInput);
}
export {
  FxInput,
  defineFxInput
};
//# sourceMappingURL=input.js.map
