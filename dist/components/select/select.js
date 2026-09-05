import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
const _FxSelect = class _FxSelect extends FxElement {
  // `value` fica FORA da observação: refleti-lo no change não pode
  // re-renderizar o template e fechar o dropdown.
  static get observedAttributes() {
    return ["size", "disabled", "placeholder", "searchable", "clearable", "error", "success"];
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
  get options() {
    return [...this.querySelectorAll("option")].map((o) => ({
      value: o.getAttribute("value") ?? o.textContent?.trim() ?? "",
      label: o.textContent?.trim() ?? ""
    }));
  }
  connectedCallback() {
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
  select(value) {
    this.value = value;
    this.removeAttribute("open");
    this.render();
    this.dispatchEvent(
      new CustomEvent("change", { bubbles: true, composed: true, detail: { value } })
    );
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
    const prevOpen = this.hasAttr("open");
    const prevSearch = this.root.querySelector(".search");
    const search = prevSearch?.value ?? "";
    const searchFocused = prevSearch != null && this.root.activeElement === prevSearch;
    const caretPos = searchFocused ? prevSearch.selectionStart : null;
    const opts = this.options;
    let current = this.getAttr("value");
    if (!current) {
      const explicit = this.querySelector("option[selected]");
      current = explicit?.getAttribute("value") ?? explicit?.textContent?.trim() ?? "";
    }
    const selectedLabel = opts.find((o) => o.value === current)?.label ?? "";
    const placeholder = this.getAttr("placeholder", "Selecione…");
    const filtered = search ? opts.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : opts;
    this.setTemplate(`
      <span class="trigger" part="trigger" role="button" tabindex="${this.disabled ? -1 : 0}" aria-haspopup="listbox" aria-expanded="${prevOpen}">
        <span class="${selectedLabel ? "label" : "placeholder"}">${esc(selectedLabel) || esc(placeholder)}</span>
        <span class="actions">
          ${this.hasAttr("clearable") && current ? '<button type="button" class="clear" part="clear" aria-label="Limpar">×</button>' : ""}
          <span class="caret">▼</span>
        </span>
      </span>
      <div class="panel" part="panel" role="listbox">
        ${this.hasAttr("searchable") ? `<input class="search" part="search" type="text" placeholder="${esc(this.getAttr("search-placeholder", "Pesquisar…"))}">` : ""}
        ${filtered.map((o) => `
          <button type="button" class="opt" role="option" data-value="${esc(o.value)}"
            aria-selected="${o.value === current}">${esc(o.label)}</button>`).join("")}
        ${filtered.length === 0 ? `<div class="empty">${esc(this.getAttr("no-results", "Nenhum resultado"))}</div>` : ""}
      </div>
    `);
    if (prevOpen) this.setAttribute("open", "");
    const searchInput = this.root.querySelector(".search");
    if (searchInput) {
      searchInput.value = search;
      searchInput.addEventListener("input", () => this.render());
      searchInput.addEventListener("click", (e) => e.stopPropagation());
      if (searchFocused) {
        searchInput.focus();
        try {
          searchInput.setSelectionRange(caretPos, caretPos);
        } catch {
        }
      }
    }
    const trigger = this.root.querySelector(".trigger");
    if (!trigger) return;
    if (this.disabled) trigger.setAttribute("aria-disabled", "true");
    trigger.addEventListener("click", (e) => {
      if (this.disabled) return;
      if (e.target.closest(".clear")) return;
      this.toggleAttribute("open");
      this.render();
      this.root.querySelector(".search")?.focus();
    });
    trigger.addEventListener("keydown", (e) => {
      if (this.disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        trigger.click();
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
      this.value = "";
      this.removeAttribute("open");
      this.render();
      this.dispatchEvent(
        new CustomEvent("change", { bubbles: true, composed: true, detail: { value: "" } })
      );
    });
    this.root.querySelectorAll(".opt").forEach((opt) => {
      opt.addEventListener("click", () => this.select(opt.dataset.value));
    });
  }
};
_FxSelect.styles = css`
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
      justify-content: space-between;
      gap: var(--fx-space-sm);
      box-sizing: border-box;
      min-height: var(--fx-size-md);
      min-width: 200px;
      font: inherit;
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      text-align: left;
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-xs) var(--fx-space-md);
      cursor: pointer;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .trigger:hover { border-color: var(--fx-border-hover); }
    .trigger:focus-visible,
    :host([open]) .trigger {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
        :host([size='sm']) .trigger { min-width: 180px; min-height: var(--fx-size-sm); }
    :host([size='lg']) .trigger { min-height: var(--fx-size-lg); font-size: calc(var(--fx-font-size) + 4px); }
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
    :host([disabled]) .trigger,
    .trigger[aria-disabled='true'] { opacity: 0.55; cursor: not-allowed; background-color: var(--fx-surface-surface-hover); }
    /* O rótulo encolhe (ellipsis) e os ícones NUNCA saem do campo. */
    .label,
    .placeholder {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .placeholder { color: var(--fx-text-muted); }
    .actions {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-xs, 8px);
      flex-shrink: 0;
    }
    .caret { font-size: calc(var(--fx-font-size) - 3px); color: var(--fx-text-muted); pointer-events: none; }

    /* Painel do dropdown */
    .panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: var(--fx-z-dropdown, 1000);
      width: max(100%, 220px);
      max-height: 260px;
      overflow-y: auto;
      display: none;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
    }
    :host([open]) .panel { display: block; }
    .search {
      position: sticky;
      top: 0;
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
    .opt {
      display: block;
      width: 100%;
      text-align: left;
      font: inherit;
      color: var(--fx-text-default);
      background: none;
      border: none;
      padding: var(--fx-space-sm) var(--fx-space-md);
      cursor: pointer;
    }
    /* Hover e selecionado com a cor primária do tema (igual ao multiselect). */
    .opt:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, transparent); }
    .opt[aria-selected='true'] {
      background: color-mix(in srgb, var(--fx-color-primary) 18%, transparent);
      color: var(--fx-color-primary);
      font-weight: var(--fx-font-weight);
    }
    .empty { padding: var(--fx-space-sm) var(--fx-space-md); color: var(--fx-text-muted); }

    /* Clearable */
    .clear {
      border: none;
      background: transparent;
      color: var(--fx-text-muted);
      font-size: calc(var(--fx-font-size) + 2px);
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
    .clear:hover { color: var(--fx-color-danger); }
    .clear[hidden] { display: none; }
  `;
let FxSelect = _FxSelect;
function defineFxSelect() {
  return defineElement("fx-select", FxSelect);
}
export {
  FxSelect,
  defineFxSelect
};
//# sourceMappingURL=select.js.map
