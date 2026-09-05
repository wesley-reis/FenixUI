import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
const _FxAutocomplete = class _FxAutocomplete extends FxElement {
  static get observedAttributes() {
    return ["size", "placeholder", "source", "disabled", "min-chars"];
  }
  get size() {
    const s = this.getAttr("size", "md");
    return s === "sm" || s === "lg" ? s : "md";
  }
  set size(v) {
    this.setAttribute("size", v);
  }
  get value() {
    return this.getAttr("value");
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  get source() {
    try {
      const raw = JSON.parse(this.getAttr("source", "[]"));
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  }
  /** Setter necessário para o Vue (patchDOMProp seta `source` como
   *  propriedade, pois o getter existe no prototype). */
  set source(value) {
    this.setAttribute("source", typeof value === "string" ? value : JSON.stringify(value));
  }
  connectedCallback() {
    super.connectedCallback();
    this.docListener = (e) => {
      if (!this.contains(e.target)) this.toggleAttr("open", false);
    };
    document.addEventListener("click", this.docListener);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.docListener) document.removeEventListener("click", this.docListener);
    this.docListener = void 0;
  }
  render() {
    const placeholder = this.getAttr("placeholder");
    this.setTemplate(`
      <input class="field" part="input" type="text"
        ${placeholder ? `placeholder="${esc(placeholder)}"` : ""} autocomplete="off"/>
      <div class="list" part="list" role="listbox"></div>
    `);
    const field = this.root.querySelector(".field");
    if (!field) return;
    field.value = this.value;
    if (this.hasAttr("disabled")) field.setAttribute("disabled", "");
    const list = this.root.querySelector(".list");
    const minChars = Number(this.getAttr("min-chars", "1")) || 1;
    const openList = () => {
      if (!list) return;
      const q = field.value.toLowerCase();
      const matches = this.source.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
      list.innerHTML = matches.length ? matches.map((m) => `<button type="button" class="opt" role="option" data-v="${esc(m)}">${esc(m)}</button>`).join("") : '<div class="empty">Nenhum resultado</div>';
      list.querySelectorAll(".opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          field.value = btn.dataset.v ?? "";
          this.value = field.value;
          this.toggleAttr("open", false);
          this.dispatchEvent(new CustomEvent("select", {
            bubbles: true,
            composed: true,
            detail: { value: this.value }
          }));
        });
      });
      this.toggleAttr("open", true);
    };
    field.addEventListener("input", () => {
      this.value = field.value;
      openList();
    });
    field.addEventListener("focus", () => {
      if (field.value.length >= minChars) openList();
    });
    field.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.toggleAttr("open", false);
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      if (!this.hasAttr("open")) openList();
      const opts = Array.from(this.root.querySelectorAll(".opt"));
      if (!opts.length) return;
      const current = opts.indexOf(this.root.activeElement);
      const next = e.key === "ArrowDown" ? current === -1 ? 0 : Math.min(current + 1, opts.length - 1) : current === -1 ? opts.length - 1 : Math.max(current - 1, 0);
      opts[next]?.focus();
    });
  }
};
_FxAutocomplete.styles = css`
    :host {
      position: relative;
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    input {
      font-family: inherit;
      font-size: inherit;
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      width: 260px;
      min-height: var(--fx-size-md);
      box-sizing: border-box;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    input::placeholder { color: var(--fx-text-muted); opacity: 1; }
    input:hover { border-color: var(--fx-border-hover); }
    input:focus-visible {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    :host([size='sm']) input { width: 220px; min-height: var(--fx-size-sm); padding: var(--fx-space-sm) var(--fx-space-md); }
    :host([size='lg']) input { width: 300px; min-height: var(--fx-size-lg); }
    .list {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      z-index: var(--fx-z-dropdown, 1000);
      max-height: 220px;
      overflow-y: auto;
      display: none;
    }
    :host([open]) .list { display: block; }
    .opt {
      display: block;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      color: var(--fx-text-default);
      padding: var(--fx-space-sm) var(--fx-space-md);
      cursor: pointer;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .opt:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, var(--fx-surface-background)); color: var(--fx-color-primary); }
    .empty { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); padding: var(--fx-space-sm) var(--fx-space-md); }
  `;
let FxAutocomplete = _FxAutocomplete;
function defineFxAutocomplete() {
  return defineElement("fx-autocomplete", FxAutocomplete);
}
export {
  FxAutocomplete,
  defineFxAutocomplete
};
//# sourceMappingURL=autocomplete.js.map
