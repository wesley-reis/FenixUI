import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
const _FxMultiselect = class _FxMultiselect extends FxElement {
  constructor() {
    super(...arguments);
    this.selected = /* @__PURE__ */ new Set();
  }
  static get observedAttributes() {
    return ["disabled", "placeholder"];
  }
  /** Valores selecionados (CSV no atributo / array na propriedade). */
  get values() {
    const csv = this.getAttr("values");
    return csv ? csv.split(",").map((v) => v.trim()).filter(Boolean) : [];
  }
  set values(list) {
    this.setAttribute("values", list.join(","));
  }
  get disabled() {
    return this.hasAttr("disabled");
  }
  set disabled(value) {
    this.toggleAttr("disabled", Boolean(value));
  }
  get options() {
    return [...this.querySelectorAll("option")].map((o) => ({
      value: o.getAttribute("value") ?? o.textContent?.trim() ?? "",
      label: o.textContent?.trim() ?? ""
    }));
  }
  connectedCallback() {
    this.selected = new Set(this.values);
    super.connectedCallback();
    this.observer = new MutationObserver(() => this.render());
    this.observer.observe(this, { childList: true, subtree: true, characterData: true });
    this.docListener = (e) => {
      if (!this.hasAttr("open")) return;
      if (e.composedPath().includes(this)) return;
      this.removeAttribute("open");
      this.render();
    };
    document.addEventListener("click", this.docListener);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    if (this.docListener) document.removeEventListener("click", this.docListener);
  }
  /** Aplica a seleção, reflete e emite change. */
  commit() {
    this.values = [...this.selected];
    this.render();
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { values: [...this.selected] }
      })
    );
  }
  toggleValue(value) {
    if (this.selected.has(value)) this.selected.delete(value);
    else this.selected.add(value);
    this.commit();
  }
  /** Navegação por teclado entre as opções do listbox (WCAG 2.1.1). */
  _navigateOptions(e) {
    e.preventDefault();
    if (!this.hasAttr("open")) {
      this.toggleAttribute("open");
      this.render();
    }
    const opts = Array.from(this.root.querySelectorAll(".opt"));
    if (!opts.length) return;
    const current = opts.indexOf(this.root.activeElement);
    let next = 0;
    if (e.key === "ArrowDown") next = current === -1 ? 0 : Math.min(current + 1, opts.length - 1);
    else if (e.key === "ArrowUp") next = current === -1 ? opts.length - 1 : Math.max(current - 1, 0);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = opts.length - 1;
    opts[next]?.focus();
  }
  render() {
    const wasOpen = this.hasAttr("open");
    const search = this.root.querySelector(".search")?.value ?? "";
    const opts = this.options;
    for (const v of [...this.selected]) {
      if (!opts.some((o) => o.value === v)) this.selected.delete(v);
    }
    const chips = opts.filter((o) => this.selected.has(o.value));
    const placeholder = this.getAttr("placeholder", "Selecione…");
    const filtered = search ? opts.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : opts;
    this.setTemplate(`
      <span class="trigger" part="trigger" role="button" tabindex="${this.disabled ? -1 : 0}" aria-haspopup="listbox" aria-expanded="${wasOpen}" aria-disabled="${this.disabled}">
        <span class="lead">
        ${chips.length ? chips.map((c) => `
              <span class="chip" data-value="${esc(c.value)}">
                ${esc(c.label)}
                <span class="chip__x" role="button" aria-label="Remover ${esc(c.label)}">×</span>
              </span>`).join("") : `<span class="placeholder">${esc(placeholder)}</span>`}
        </span>
        <span class="trigger-right">
          ${this.hasAttr("clearable") && chips.length ? '<button type="button" class="icon-btn clear" part="clear" aria-label="Limpar seleção">×</button>' : ""}
          <span class="caret">▼</span>
        </span>
      </span>
      <div class="panel" part="panel" role="listbox" aria-multiselectable="true">
        <div class="panel-header">
          <span class="count">${chips.length} selecionado${chips.length === 1 ? "" : "s"}</span>
          ${this.hasAttr("clearable") && chips.length ? '<button type="button" class="clear-all">Limpar tudo</button>' : ""}
        </div>
        ${this.hasAttr("searchable") ? `<input class="search" part="search" type="text" placeholder="${esc(this.getAttr("search-placeholder", "Pesquisar…"))}">` : ""}
        <ul class="list">
          ${filtered.map((o) => `
            <li><button type="button" class="opt" role="option" data-value="${esc(o.value)}"
              aria-selected="${this.selected.has(o.value)}">
              <span class="box" aria-hidden="true"></span>${esc(o.label)}
            </button></li>`).join("")}
          ${filtered.length === 0 ? `<li class="empty">${esc(this.getAttr("no-results", "Nenhum resultado"))}</li>` : ""}
        </ul>
      </div>
    `);
    if (wasOpen) this.setAttribute("open", "");
    const searchInput = this.root.querySelector(".search");
    if (searchInput) {
      searchInput.value = search;
      searchInput.addEventListener("input", () => {
        const pos = searchInput.selectionStart ?? searchInput.value.length;
        this.render();
        const si = this.root.querySelector(".search");
        if (si) {
          si.focus();
          si.setSelectionRange(pos, pos);
        }
      });
      searchInput.addEventListener("click", (e) => e.stopPropagation());
    }
    const trigger = this.root.querySelector(".trigger");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      if (this.disabled) return;
      if (e.target.closest(".clear")) return;
      if (e.target.closest(".chip__x")) return;
      this.toggleAttribute("open");
      if (this.hasAttr("open")) {
        const r = this.getBoundingClientRect();
        this.toggleAttribute("up", r.bottom + 300 > window.innerHeight && r.top > 300);
      } else {
        this.removeAttribute("up");
      }
      this.render();
    });
    trigger.addEventListener("keydown", (e) => {
      if (this.disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return;
      }
      if (e.key === "Escape") {
        if (this.hasAttr("open")) {
          this.removeAttribute("open");
          this.render();
          this.root.querySelector(".trigger")?.focus();
        }
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
        this._navigateOptions(e);
      }
    });
    this.root.querySelector(".clear")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.selected.clear();
      this.commit();
    });
    this.root.querySelector(".clear-all")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.selected.clear();
      this.commit();
    });
    this.root.querySelectorAll(".chip").forEach((chip) => {
      chip.querySelector(".chip__x")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleValue(chip.dataset.value);
      });
    });
    this.root.querySelectorAll(".opt").forEach((opt) => {
      opt.addEventListener("click", () => this.toggleValue(opt.dataset.value));
    });
  }
};
_FxMultiselect.styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      position: relative;
    }
    .trigger {
      display: inline-flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: var(--fx-space-xs);
      width: 240px;
      box-sizing: border-box;
      min-height: var(--fx-size-md);
      padding: var(--fx-space-xs) var(--fx-space-md);
      font: inherit;
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      cursor: pointer;
      text-align: left;
      transition: border-color var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    /* Área dos chips: encolhe e quebra linha internamente,
       mantendo os ícones sempre dentro do componente. */
    .lead {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--fx-space-xs);
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    :host([size='sm']) .trigger { min-height: var(--fx-size-sm); width: 200px; }
    :host([size='lg']) .trigger { min-height: var(--fx-size-lg); width: 280px; font-size: calc(var(--fx-font-size) + 4px); }
    /* Validação */
    :host([error]) .trigger,
    :host([invalid]) .trigger {
      border-color: var(--fx-color-danger, #dc2626);
    }
    :host([error]) .trigger:focus-visible,
    :host([invalid]) .trigger:focus-visible,
    :host([error][open]) .trigger,
    :host([invalid][open]) .trigger {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent);
    }
    :host([success]) .trigger,
    :host([valid]) .trigger {
      border-color: var(--fx-color-success, #16a34a);
    }
    :host([success]) .trigger:focus-visible,
    :host([valid]) .trigger:focus-visible,
    :host([success][open]) .trigger,
    :host([valid][open]) .trigger {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent);
    }
    .trigger:hover { border-color: var(--fx-border-hover); }
    .trigger:focus-visible {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .trigger[aria-expanded='true'] { border-color: var(--fx-color-primary); }
    .placeholder { color: var(--fx-text-muted); }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: color-mix(in srgb, var(--fx-color-primary) 14%, transparent);
      color: var(--fx-color-primary);
      border-radius: var(--fx-radius-sm);
      padding: 2px 6px;
      font-size: calc(var(--fx-font-size) - 2px);
    }
    .chip__x {
      border: none;
      background: none;
      color: inherit;
      cursor: pointer;
      font-size: calc(var(--fx-font-size) - 1px);
      line-height: 1;
      padding: 0;
    }
    .trigger-right {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--fx-text-muted);
    }
    .icon-btn {
      border: none;
      background: none;
      color: inherit;
      cursor: pointer;
      font-size: calc(var(--fx-font-size) + 2px);
      line-height: 1;
      padding: 0 2px;
      border-radius: var(--fx-radius-full);
    }
    .icon-btn:hover { color: var(--fx-color-danger); }
    .caret {
      font-size: calc(var(--fx-font-size) - 3px);
      transition: transform var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([open]) .caret { transform: rotate(180deg); }

    /* Painel (overlay ) */
    .panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: var(--fx-z-dropdown, 1000);
      width: max(100%, 240px);
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      display: none;
      overflow: hidden;
    }
    :host([up]) .panel {
      top: auto;
      bottom: calc(100% + 4px);
    }
    :host([open]) .panel { display: block; }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fx-space-sm);
      padding: var(--fx-space-xs) var(--fx-space-md);
      border-bottom: 1px solid var(--fx-border-default);
      background: var(--fx-surface-surface-hover);
    }
    .count { font-size: calc(var(--fx-font-size) - 2px); color: var(--fx-text-muted); }
    .clear-all {
      border: none;
      background: none;
      font: inherit;
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-color-primary);
      cursor: pointer;
      padding: 0;
    }
    .clear-all:hover { text-decoration: underline; }
    .search {
      width: 100%;
      box-sizing: border-box;
      font: inherit;
      color: var(--fx-text-default);
      background: var(--fx-surface-background);
      border: none;
      border-bottom: 1px solid var(--fx-border-default);
      padding: var(--fx-space-sm) var(--fx-space-md);
      outline: none;
    }
    .list {
      max-height: 240px;
      overflow-y: auto;
      list-style: none;
      margin: 0;
      padding: var(--fx-space-3xs, 4px);
    }
    .opt {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      width: 100%;
      padding: var(--fx-space-xs) var(--fx-space-md);
      border: none;
      background: none;
      font: inherit;
      color: var(--fx-text-default);
      cursor: pointer;
      border-radius: var(--fx-radius-sm);
      text-align: left;
    }
    .opt:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, transparent); }
    .opt[aria-selected='true'] {
      background: color-mix(in srgb, var(--fx-color-primary) 16%, transparent);
      color: var(--fx-color-primary);
      font-weight: var(--fx-font-weight);
    }
    /* Checkbox visual */
    .box {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--fx-border-default);
      border-radius: calc(var(--fx-radius-sm) / 2);
      font-size: 11px;
      line-height: 1;
      color: transparent;
      transition:
        background-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .opt[aria-selected='true'] .box {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
    }
    .opt[aria-selected='true'] .box::after { content: '✓'; }
    .empty { padding: var(--fx-space-md); color: var(--fx-text-muted); text-align: center; }
    :host([disabled]) .trigger { opacity: 0.55; cursor: not-allowed; background: var(--fx-surface-surface-hover); }
  `;
let FxMultiselect = _FxMultiselect;
function defineFxMultiselect() {
  return defineElement("fx-multiselect", FxMultiselect);
}
export {
  FxMultiselect,
  defineFxMultiselect
};
//# sourceMappingURL=multiselect.js.map
