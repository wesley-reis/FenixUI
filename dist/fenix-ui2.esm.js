var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _FxToast_instances, render_fn;
const lightTokens = {
  color: {
    primary: "#c2410c",
    secondary: "#991B1B",
    success: "#10b972",
    warning: "#f59e0b",
    danger: "#f43f5e",
    info: "#0ea5e9"
  },
  surface: {
    background: "#ffffff",
    surface: "#f8fafc",
    "surface-hover": "#eef2f7"
  },
  text: {
    default: "#10182c",
    muted: "#64748b",
    disabled: "#94a3b8"
  },
  border: {
    default: "#e2e8f0",
    hover: "#cbd5e1"
  },
  font: {
    family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    size: "14px",
    weight: "500",
    "line-height": "1.5"
  },
  space: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  radius: { none: "0", sm: "4px", md: "8px", lg: "12px", full: "9999px" },
  size: { sm: "32px", md: "40px", lg: "48px" },
  shadow: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 4px 12px rgba(15, 23, 42, 0.10)",
    lg: "0 12px 32px rgba(15, 23, 42, 0.18)"
  },
  motion: {
    "duration-fast": "120ms",
    "duration-normal": "240ms",
    easing: "cubic-bezier(0.25, 0.1, 0.25, 1)"
  },
  effect: {
    /** '0' desativa o efeito ripple do botão. */
    ripple: "1",
    /** Anel de foco dos campos de formulário. Use 'none' para campos sem sobra. */
    "focus-ring": "0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)"
  },
  z: { base: "auto", dropdown: "1000", modal: "1100", toast: "1200" }
};
const darkTokens = {
  color: { ...lightTokens.color },
  surface: {
    background: "#0f172a",
    surface: "#1e293b",
    "surface-hover": "#334155"
  },
  text: {
    default: "#f8fafc",
    muted: "#94a3b8",
    disabled: "#64748b"
  },
  border: { default: "#334155", hover: "#475569" },
  font: { ...lightTokens.font },
  space: { ...lightTokens.space },
  radius: { ...lightTokens.radius },
  size: { ...lightTokens.size },
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
    md: "0 6px 16px rgba(0, 0, 0, 0.5)",
    lg: "0 16px 40px rgba(0, 0, 0, 0.6)"
  },
  motion: { ...lightTokens.motion },
  effect: { ...lightTokens.effect },
  z: { ...lightTokens.z }
};
const defaultTokens = lightTokens;
const PREFIX = "--fx";
const VERSION = "0.1.0";
let activeTheme = "light";
let activeOverrides = null;
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function deepMerge(base, override) {
  if (!override) return base;
  const out = { ...base };
  for (const key2 of Object.keys(override)) {
    const baseValue = base[key2];
    const overrideValue = override[key2];
    out[key2] = isPlainObject(baseValue) && isPlainObject(overrideValue) ? deepMerge(baseValue, overrideValue) : overrideValue;
  }
  return out;
}
function tokenCssVars(tokens) {
  const out = {};
  for (const [group, values] of Object.entries(tokens)) {
    for (const [key2, value] of Object.entries(values)) {
      out[`${PREFIX}-${group}-${key2}`] = String(value);
    }
  }
  return out;
}
function applyTokens(themeName, overrides, target = document.documentElement) {
  const base = themeName === "dark" ? darkTokens : defaultTokens;
  const finalTokens = deepMerge(base, overrides);
  const vars = tokenCssVars(finalTokens);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("fenix:theme", { detail: { theme: themeName, tokens: finalTokens } }));
  }
}
function configure(options = {}, target = document.documentElement) {
  if (options.theme) activeTheme = options.theme;
  if (options.tokens) activeOverrides = options.tokens;
  applyTokens(activeTheme, activeOverrides, target);
  return { theme: activeTheme };
}
function theme(name) {
  return configure({ theme: name });
}
function setTokens(tokens) {
  return configure({ tokens });
}
function resetTheme() {
  activeTheme = "light";
  activeOverrides = null;
  return configure({ theme: "light" });
}
const FenixUI = {
  version: VERSION,
  configure,
  theme,
  setTokens,
  resetTheme,
  tokenCssVars,
  deepMerge
};
const registry = /* @__PURE__ */ new Map();
function register(preset) {
  registry.set(preset.name, preset);
  return preset;
}
const themePresets = {
  fenix: register({
    name: "fenix",
    label: "Fenix (padrão)",
    tokens: {}
  }),
  seiya: register({
    name: "seiya",
    label: "Seiya",
    tokens: {
      color: {
        primary: "#e11d48",
        secondary: "#fb7185",
        info: "#f43f5e",
        danger: "#be123c"
      },
      radius: { sm: "6px", md: "10px", lg: "16px" },
      effect: {
        "focus-ring": "none"
      }
    }
  }),
  shiryu: register({
    name: "shiryu",
    label: "Shiryu",
    tokens: {
      color: {
        primary: "#0d9488",
        secondary: "#2dd4bf",
        success: "#059669",
        info: "#14b8a6"
      },
      radius: { sm: "4px", md: "8px", lg: "14px" },
      effect: {
        "focus-ring": "none"
      }
    }
  }),
  hyoga: register({
    name: "hyoga",
    label: "Hyoga",
    tokens: {
      color: {
        primary: "#0284c7",
        secondary: "#38bdf8",
        info: "#06b6d4",
        danger: "#e11d48"
      },
      surface: { surface: "#f0f9ff", "surface-hover": "#e0f2fe" },
      radius: { sm: "8px", md: "12px", lg: "18px" }
    }
  }),
  shun: register({
    name: "shun",
    label: "Shun",
    tokens: {
      color: {
        primary: "#db2777",
        secondary: "#f472b6",
        info: "#ec4899",
        warning: "#c026d3"
      },
      radius: { sm: "10px", md: "14px", lg: "20px" }
    }
  }),
  ikki: register({
    name: "ikki",
    label: "Ikki",
    tokens: {
      color: {
        primary: "#ea580c",
        secondary: "#fb923c",
        danger: "#dc2626",
        warning: "#f59e0b"
      },
      radius: { sm: "2px", md: "4px", lg: "6px" }
    }
  }),
  aiolia: register({
    name: "aiolia",
    label: "Aiolia",
    tokens: {
      color: {
        primary: "#b45309",
        secondary: "#f59e0b",
        warning: "#eab308",
        info: "#84cc16"
      },
      radius: { sm: "6px", md: "12px", lg: "20px" },
      effect: {
        "focus-ring": "none"
      }
    }
  })
};
function listPresets() {
  return [...registry.values()];
}
function defineCustomPreset(name, label, tokens) {
  return register({ name, label, tokens });
}
function applyPreset(presetName, mode = "light") {
  const preset = registry.get(presetName) ?? registry.get("fenix");
  const state = configure({ theme: mode, tokens: preset.tokens });
  return { ...state, preset: preset.name };
}
function css(strings, ...values) {
  return strings.reduce((acc, part, i) => acc + part + (i < values.length ? String(values[i]) : ""), "");
}
function kebabToCamel(value) {
  return value.replace(/-+([a-z])/g, (_, c) => c.toUpperCase());
}
const _FxElement = class _FxElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }
  /** Chamado quando um atributo observado muda. */
  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }
  /** Chamado quando o elemento é anexado ao DOM. */
  connectedCallback() {
    this.render();
  }
  /** Chamado quando o elemento é removido do DOM (limpeza de recursos). */
  disconnectedCallback() {
  }
  hasAttr(name) {
    return this.hasAttribute(name);
  }
  getAttr(name, fallback = "") {
    return this.getAttribute(name) ?? fallback;
  }
  toggleAttr(name, on) {
    if (on) this.setAttribute(name, "");
    else this.removeAttribute(name);
  }
  /** Injeta `<style>` + template no Shadow DOM. */
  setTemplate(html) {
    const styles = this.constructor.styles;
    this.root.innerHTML = `<style>${styles}</style>${html}`;
  }
};
_FxElement.styles = "";
let FxElement = _FxElement;
function defineElement(tag, ctor) {
  if (typeof customElements !== "undefined" && !customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
  return customElements.get(tag) ?? ctor;
}
const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
};
const SANITIZE_REGEX = /[&<>"'`=/]/g;
function esc(value) {
  if (value == null) return "";
  return String(value).replace(SANITIZE_REGEX, (char) => HTML_ENTITIES[char] || char);
}
function stripTags(html) {
  return html.replace(/<[^>]*>/g, "");
}
function sanitizeData(data) {
  if (data == null) return data;
  if (typeof data === "string") return esc(data);
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (typeof data === "object") {
    const result = {};
    for (const [key2, value] of Object.entries(data)) {
      result[key2] = sanitizeData(value);
    }
    return result;
  }
  return data;
}
const FX_JSX_TYPES = true;
const _FxButton = class _FxButton extends FxElement {
  constructor() {
    super(...arguments);
    this.spawnRipple = (event) => {
      if (this.hasAttr("disabled") || this.hasAttr("loading")) return;
      const enabled = getComputedStyle(this).getPropertyValue("--fx-effect-ripple").trim();
      if (enabled === "0" || enabled === "false") return;
      const btn = this.root.querySelector(".btn");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "btn__ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    };
  }
  static get observedAttributes() {
    return ["variant", "size", "disabled", "loading", "type", "full"];
  }
  /** Tamanho. Padrão: `'md'`. */
  get size() {
    const s = this.getAttr("size", "md");
    return s === "sm" || s === "lg" ? s : "md";
  }
  set size(value) {
    this.setAttribute("size", value);
  }
  get disabled() {
    return this.hasAttr("disabled");
  }
  set disabled(value) {
    this.toggleAttr("disabled", Boolean(value));
  }
  get loading() {
    return this.hasAttr("loading");
  }
  set loading(value) {
    this.toggleAttr("loading", Boolean(value));
  }
  render() {
    const loading = this.hasAttr("loading");
    const disabled = this.hasAttr("disabled") || loading;
    const btnType = this.getAttr("type", "button");
    this.setTemplate(`
      <button class="btn" part="button" type="${btnType}">
        <span class="btn__icon" part="icon"><slot name="icon"></slot></span>
        <span class="btn__label" part="label"><slot></slot></span>
        ${loading ? '<span class="btn__spinner" aria-hidden="true"></span>' : ""}
      </button>
    `);
    const btn = this.root.querySelector(".btn");
    if (!btn) return;
    const iconSlot = btn.querySelector(".btn__icon slot");
    const iconWrap = this.root.querySelector(".btn__icon");
    const hasIcon = Boolean(iconSlot?.assignedNodes({ flatten: true }).some(
      (n) => n.nodeType === Node.ELEMENT_NODE || (n.textContent ?? "").trim() !== ""
    ));
    iconWrap?.toggleAttribute("hidden", !hasIcon);
    if (disabled) {
      btn.setAttribute("disabled", "");
      btn.setAttribute("aria-disabled", "true");
    } else {
      btn.removeAttribute("disabled");
      btn.removeAttribute("aria-disabled");
    }
    if (loading) btn.setAttribute("aria-busy", "true");
    else btn.removeAttribute("aria-busy");
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.spawnRipple);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("pointerdown", this.spawnRipple);
  }
};
_FxButton.styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: var(--fx-space-sm);
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      font-weight: var(--fx-font-weight);
      line-height: var(--fx-font-line-height);
      padding: var(--fx-space-md) var(--fx-space-xl);
      border-radius: var(--fx-radius-md);
      border: 1px solid transparent;
      color: #fff;
      background: var(--fx-color-primary);
      cursor: pointer;
      user-select: none;
      text-decoration: none;
      transition:
        background-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        transform var(--fx-motion-duration-fast) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .btn:focus-visible {
      outline: 2px solid var(--fx-color-primary);
      outline-offset: 2px;
    }
    .btn:hover { filter: brightness(0.88); }
    .btn:active { transform: translateY(1px); }

    /* Tamanhos — alturas vindas dos tokens (personalizáveis por preset) */
    .btn { min-height: var(--fx-size-md); }
    :host([size='sm']) .btn { padding: var(--fx-space-sm) var(--fx-space-lg); font-size: var(--fx-font-size); min-height: var(--fx-size-sm); }
    :host([size='lg']) .btn { padding: var(--fx-space-lg) var(--fx-space-xl); font-size: calc(var(--fx-font-size) + 4px); min-height: var(--fx-size-lg); }

    /* Full width */
    :host([full]) .btn { width: 100%; }

    /* Variantes */
    :host([variant='secondary']) .btn { background: var(--fx-color-secondary); }
    :host([variant='success']) .btn { background: var(--fx-color-success); }
    :host([variant='warning']) .btn { background: var(--fx-color-warning); }
    :host([variant='danger']) .btn { background: var(--fx-color-danger); }
    :host([variant='info']) .btn { background: var(--fx-color-info); }
    :host([variant='ghost']) .btn { background: transparent; color: var(--fx-text-default); }
    :host([variant='ghost']) .btn:hover { background: var(--fx-surface-surface-hover); filter: none; }
    :host([variant='outline']) .btn { background: transparent; color: var(--fx-color-primary); border-color: var(--fx-color-primary); }
    :host([variant='outline']) .btn:hover { background: var(--fx-surface-surface-hover); filter: none; }

    /* Ícone e spinner */
    .btn__icon { display: inline-flex; }
    .btn__icon[hidden] { display: none; }
    .btn__label { display: inline-flex; align-items: center; justify-content: center; }
    .btn[hidden] { display: none; }
    .btn__spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: var(--fx-radius-full);
      animation: fx-spin var(--fx-motion-duration-normal) linear infinite;
    }
    @keyframes fx-spin { to { transform: rotate(360deg); } }

    /* Estados */
    :host([disabled]) .btn,
    :host([loading]) .btn {
      opacity: 0.55;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Efeito ripple (). Desative com effect.ripple: '0' no preset. */
    .btn {
      position: relative;
      overflow: hidden;
    }
    .btn__ripple {
      position: absolute;
      border-radius: var(--fx-radius-full);
      background: currentColor;
      opacity: 0.28;
      transform: scale(0);
      animation: fx-ripple 600ms var(--fx-motion-easing) forwards;
      pointer-events: none;
    }
    @keyframes fx-ripple {
      to {
        transform: scale(2.6);
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .btn__ripple { display: none; }
    }
  `;
let FxButton = _FxButton;
function defineFxButton() {
  return defineElement("fx-button", FxButton);
}
defineFxButton();
const _FxBadge = class _FxBadge extends FxElement {
  static get observedAttributes() {
    return ["variant", "round"];
  }
  render() {
    this.setTemplate(`<span class="badge" part="badge"><slot></slot></span>`);
  }
};
_FxBadge.styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      font-family: var(--fx-font-family);
      font-size: calc(var(--fx-font-size) - 2px);
      font-weight: var(--fx-font-weight);
      line-height: 1;
      padding: var(--fx-space-xs) var(--fx-space-sm);
      border-radius: var(--fx-radius-full);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface-background);
      color: var(--fx-text-muted);
      white-space: nowrap;
    }
    :host([variant='primary']) .badge { background: var(--fx-color-primary); color: #fff; border-color: transparent; }
    :host([variant='success']) .badge { background: var(--fx-color-success); color: #fff; border-color: transparent; }
    :host([variant='warning']) .badge { background: var(--fx-color-warning); color: #fff; border-color: transparent; }
    :host([variant='danger']) .badge { background: var(--fx-color-danger); color: #fff; border-color: transparent; }
    :host([variant='info']) .badge { background: var(--fx-color-info); color: #fff; border-color: transparent; }
    :host(:not([round])) .badge { border-radius: var(--fx-radius-sm); }
  `;
let FxBadge = _FxBadge;
function defineFxBadge() {
  return defineElement("fx-badge", FxBadge);
}
defineFxBadge();
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
defineFxSpinner();
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
defineFxSelect();
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
defineFxInput();
const _FxSwitch = class _FxSwitch extends FxElement {
  static get observedAttributes() {
    return ["checked", "disabled", "size"];
  }
  /** Tamanho da trilha. Padrão: `'md'`. */
  get size() {
    const s = this.getAttr("size", "md");
    return s === "sm" || s === "lg" ? s : "md";
  }
  set size(value) {
    this.setAttribute("size", value);
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
  render() {
    this.setTemplate(`
      <button class="switch" part="switch" type="button" role="switch"
        aria-checked="${this.checked}" ${this.hasAttr("disabled") ? "disabled" : ""}>
        <span class="track" part="track"><span class="thumb" part="thumb"></span></span>
        <span class="label" part="label"><slot></slot></span>
      </button>
    `);
    const btn = this.root.querySelector(".switch");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (this.hasAttr("disabled")) return;
      this.checked = !this.checked;
      btn.setAttribute("aria-checked", String(this.checked));
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          composed: true,
          detail: { checked: this.checked }
        })
      );
    });
  }
};
_FxSwitch.styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .switch {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-sm);
      cursor: pointer;
      user-select: none;
      background: none;
      border: none;
      padding: 0;
      color: var(--fx-text-default);
      font: inherit;
    }
    .track {
      position: relative;
      width: 40px;
      height: 22px;
      border-radius: var(--fx-radius-full);
      background: var(--fx-border-default);
      flex-shrink: 0;
      transition: background-color var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: var(--fx-radius-full);
      background: #fff;
      box-shadow: var(--fx-shadow-sm);
      transition: transform var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([checked]) .track { background: var(--fx-color-primary); }
    :host([checked]) .thumb { transform: translateX(18px); }
    .switch:focus-visible .track {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .label { display: inline-flex; align-items: center; }
    :host([disabled]) .switch { opacity: 0.55; cursor: not-allowed; pointer-events: none; }
    /* Escala: sm 32×18 · md 40×22 (padrão) · lg 48×26 */
    :host([size='sm']) .track { width: 32px; height: 18px; }
    :host([size='sm']) .thumb { top: 2px; left: 2px; width: 14px; height: 14px; }
    :host([size='sm'][checked]) .thumb { transform: translateX(14px); }
    :host([size='lg']) .track { width: 48px; height: 26px; }
    :host([size='lg']) .thumb { top: 4px; left: 4px; width: 18px; height: 18px; }
    :host([size='lg'][checked]) .thumb { transform: translateX(22px); }
  `;
let FxSwitch = _FxSwitch;
function defineFxSwitch() {
  return defineElement("fx-switch", FxSwitch);
}
defineFxSwitch();
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
defineFxMultiselect();
const key = (y, m1, d) => y * 1e4 + m1 * 100 + d;
function parseBound(raw) {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(raw.trim());
  if (!m) return null;
  const y = +m[1];
  const m1 = m[2] ? +m[2] : 1;
  const d = m[3] ? +m[3] : null;
  if (d !== null) return { lo: key(y, m1, d), hi: key(y, m1, d) };
  if (m[2]) return { lo: key(y, m1, 1), hi: key(y, m1, 31) };
  return { lo: key(y, 1, 1), hi: key(y, 12, 31) };
}
const _FxCalendar = class _FxCalendar extends FxElement {
  constructor() {
    super(...arguments);
    this.view = "days";
    this.cursor = { y: (/* @__PURE__ */ new Date()).getFullYear(), m: (/* @__PURE__ */ new Date()).getMonth() };
    this.pickStart = null;
    this.pickEnd = null;
  }
  static get observedAttributes() {
    return [
      "value",
      "start",
      "end",
      "min",
      "max",
      "range",
      "mode",
      "values",
      "locale",
      "disabled"
    ];
  }
  /** Modo de seleção: 'single' | 'range' | 'multiple'. */
  get mode() {
    const m = this.getAttr("mode");
    if (m === "range" || m === "multiple") return m;
    return this.hasAttr("range") ? "range" : "single";
  }
  set mode(m) {
    this.setAttribute("mode", m);
  }
  get range() {
    return this.mode === "range";
  }
  set range(value) {
    this.toggleAttr("range", Boolean(value));
  }
  /** Datas selecionadas no modo multiple (CSV no atributo). */
  get values() {
    const csv = this.getAttr("values");
    return csv ? csv.split(",").map((v) => v.trim()).filter(Boolean) : [];
  }
  set values(list) {
    this.setAttribute("values", list.join(","));
  }
  get value() {
    return this.getAttr("value");
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  bounds() {
    return {
      min: parseBound(this.getAttr("min", "")),
      max: parseBound(this.getAttr("max", ""))
    };
  }
  locale() {
    return this.getAttr("locale", "pt-BR");
  }
  fmt(opts, d) {
    try {
      return new Intl.DateTimeFormat(this.locale(), opts).format(d);
    } catch {
      return new Intl.DateTimeFormat("pt-BR", opts).format(d);
    }
  }
  dayDisabled(y, m, d) {
    const { min, max } = this.bounds();
    const k = key(y, m + 1, d);
    return min !== null && k < min.lo || max !== null && k > max.hi;
  }
  monthDisabled(y, m1) {
    const { min, max } = this.bounds();
    const lo = key(y, m1, 1);
    const hi = key(y, m1, 31);
    return min !== null && hi < min.lo || max !== null && lo > max.hi;
  }
  yearDisabled(y) {
    const { min, max } = this.bounds();
    const lo = key(y, 1, 1);
    const hi = key(y, 12, 31);
    return min !== null && hi < min.lo || max !== null && lo > max.hi;
  }
  dayKeyOf(date) {
    return key(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }
  keyToDate(k) {
    return new Date(
      Math.floor(k / 1e4),
      Math.floor(k / 100) % 100 - 1,
      k % 100
    );
  }
  iso(k) {
    const d = this.keyToDate(k);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  /** Seleção atual para pintura (chaves). */
  selection() {
    const multi = new Set(
      this.values.map((iso) => parseBound(iso)?.lo ?? 0).filter(Boolean)
    );
    if (this.mode === "range") {
      let s = this.pickStart;
      let e = this.pickEnd;
      const attrS = parseBound(this.getAttr("start", ""));
      const attrE = parseBound(this.getAttr("end", ""));
      if (s === null && attrS) s = attrS.lo;
      if (e === null && attrE) e = attrE.lo;
      return { start: s, end: e, single: null, multi };
    }
    if (this.mode === "multiple") {
      return { start: null, end: null, single: null, multi };
    }
    const v = parseBound(this.getAttr("value", ""));
    return { start: null, end: null, single: v ? v.lo : null, multi };
  }
  emit() {
    if (this.mode === "range") {
      const detail = {
        start: this.pickStart !== null ? this.iso(this.pickStart) : this.getAttr("start", ""),
        end: this.pickEnd !== null ? this.iso(this.pickEnd) : this.getAttr("end", "")
      };
      this.setAttribute("start", detail.start);
      this.setAttribute("end", detail.end);
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          composed: true,
          detail
        })
      );
    } else if (this.mode === "multiple") {
      const values = this.values;
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          composed: true,
          detail: { values }
        })
      );
    } else {
      const value = this.getAttr("value");
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          composed: true,
          detail: { value }
        })
      );
    }
  }
  pickDay(k) {
    if (this.mode === "range") {
      if (this.pickStart === null || this.pickEnd !== null) {
        this.pickStart = k;
        this.pickEnd = null;
        this.setAttribute("start", this.iso(k));
        this.removeAttribute("end");
        this.render();
        return;
      }
      if (k < this.pickStart)
        [this.pickStart, this.pickEnd] = [k, this.pickStart];
      else this.pickEnd = k;
      this.emit();
    } else if (this.mode === "multiple") {
      const set = new Set(this.values);
      const iso = this.iso(k);
      if (set.has(iso)) set.delete(iso);
      else set.add(iso);
      this.values = [...set].sort();
      this.emit();
    } else {
      this.value = this.iso(k);
      this.emit();
    }
    this.render();
  }
  navigate(dir) {
    if (this.view === "days") {
      const d = new Date(this.cursor.y, this.cursor.m + dir, 1);
      this.cursor = { y: d.getFullYear(), m: d.getMonth() };
    } else if (this.view === "months") {
      this.cursor.y += dir;
    } else {
      this.cursor.y += dir * 12;
    }
    this.render();
  }
  render() {
    const todayK = this.dayKeyOf(/* @__PURE__ */ new Date());
    const sel = this.selection();
    const loc = this.locale();
    const titles = {
      days: this.fmt(
        { month: "long", year: "numeric" },
        new Date(this.cursor.y, this.cursor.m, 1)
      ),
      months: String(this.cursor.y),
      years: `${Math.floor(this.cursor.y / 12) * 12} – ${Math.floor(this.cursor.y / 12) * 12 + 11}`
    };
    let cells = "";
    if (this.view === "days") {
      const wds = [...Array(7)].map(
        (_, i) => this.fmt({ weekday: "short" }, new Date(2024, 8, 1 + i))
        // 01/09/2024 foi domingo
      );
      cells = wds.map((w) => `<span class="wd">${w}</span>`).join("") + this.daysHtml(todayK, sel, loc);
    } else if (this.view === "months") {
      cells = [...Array(12)].map((_, i) => {
        const dis = this.monthDisabled(this.cursor.y, i + 1);
        return `<button type="button" class="cell" data-month="${i}" ${dis ? "disabled" : ""}>${this.fmt({ month: "short" }, new Date(this.cursor.y, i, 1))}</button>`;
      }).join("");
    } else {
      const base = Math.floor(this.cursor.y / 12) * 12;
      cells = [...Array(12)].map((_, i) => {
        const y = base + i;
        const dis = this.yearDisabled(y);
        return `<button type="button" class="cell" data-year="${y}" ${dis ? "disabled" : ""}>${y}</button>`;
      }).join("");
    }
    const titleAction = this.view === "days" ? `data-goto="months"` : this.view === "months" ? `data-goto="years"` : "";
    this.setTemplate(`
      <div class="head">
        <button type="button" class="nav" data-nav="-1" aria-label="Anterior">‹</button>
        <button type="button" class="title" part="title" ${titleAction}>${titles[this.view]}</button>
        <button type="button" class="nav" data-nav="1" aria-label="Próximo">›</button>
      </div>
      <div class="grid ${this.view}">${cells}</div>
    `);
    this.root.querySelectorAll("[data-nav]").forEach(
      (b) => b.addEventListener(
        "click",
        () => this.navigate(Number(b.dataset.nav))
      )
    );
    const gotoBtn = this.root.querySelector("[data-goto]");
    gotoBtn?.addEventListener("click", () => {
      this.view = gotoBtn.dataset.goto;
      this.render();
    });
    this.root.querySelectorAll("[data-day]").forEach(
      (b) => b.addEventListener(
        "click",
        () => this.pickDay(Number(b.dataset.day))
      )
    );
    this.root.querySelectorAll("[data-month]").forEach(
      (b) => b.addEventListener("click", () => {
        this.cursor.m = Number(b.dataset.month);
        this.view = "days";
        this.render();
      })
    );
    this.root.querySelectorAll("[data-year]").forEach(
      (b) => b.addEventListener("click", () => {
        this.cursor.y = Number(b.dataset.year);
        this.view = "months";
        this.render();
      })
    );
  }
  /** Grade de dias com preenchimento do mês anterior. */
  daysHtml(todayK, sel, _loc) {
    const { y, m } = this.cursor;
    const first = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    const prevTotal = new Date(y, m, 0).getDate();
    let html = "";
    for (let i = first - 1; i >= 0; i--) {
      html += `<span class="cell muted">${prevTotal - i}</span>`;
    }
    for (let d = 1; d <= total; d++) {
      const k = key(y, m + 1, d);
      const isSel = sel.single === k || sel.start === k || sel.end === k || sel.multi.has(k);
      const inRange = sel.start !== null && sel.end !== null && k > sel.start && k < sel.end;
      const cls = [
        "cell",
        isSel ? "sel" : "",
        inRange ? "in-range" : "",
        k === todayK ? "today" : ""
      ].filter(Boolean).join(" ");
      html += `<button type="button" class="${cls}" data-day="${k}" ${this.dayDisabled(y, m, d) ? "disabled" : ""}>${d}</button>`;
    }
    return html;
  }
};
_FxCalendar.styles = css`
		:host {
			display: inline-block;
			font-family: var(--fx-font-family);
			font-size: var(--fx-font-size);
			color: var(--fx-text-default);
			background: var(--fx-surface-background);
			border: 1px solid var(--fx-border-default);
			border-radius: var(--fx-radius-md);
			box-shadow: var(--fx-shadow-sm);
			padding: var(--fx-space-sm);
			user-select: none;
		}
		:host([disabled]) {
			opacity: 0.55;
			pointer-events: none;
		}
		.head {
			display: flex;
			height: 48px;
			align-items: center;
			justify-content: space-between;
			gap: var(--fx-space-xs);
			margin-bottom: var(--fx-space-xs);
			border-bottom: 1px solid var(--fx-border-default);
		}

		.title {
			min-width: 24px;
			border: none;
			background: none;
			color: var(--fx-text-default);
			cursor: pointer;
			font: inherit;
			border-radius: var(--fx-radius-sm);
		}
    .nav {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: none;
			background: none;
			color: var(--fx-text-muted);
			cursor: pointer;
			border-radius: var(--fx-radius-sm);
    }
		.nav:hover,
		.title:hover {
			background: var(--fx-surface-surface-hover);
		}
		.title {
    	padding: var(--fx-space-3xs, 4px) var(--fx-space-xs);
			font-weight: var(--fx-font-weight);
			text-transform: capitalize;
			flex: 1;
		}
		.grid {
			display: grid;
			grid-template-columns: repeat(7, 34px);
			gap: 2px;
		}
		.grid.months,
		.grid.years {
			grid-template-columns: repeat(4, minmax(52px, 1fr));
		}
		.wd {
			text-align: center;
			color: var(--fx-text-muted);
			font-size: calc(var(--fx-font-size) - 2px);
			padding: var(--fx-space-3xs, 4px) 0;
			text-transform: capitalize;
		}
		.cell {
			position: relative;
			border: none;
			background: none;
			font: inherit;
			color: var(--fx-text-default);
			height: 32px;
			border-radius: var(--fx-radius-sm);
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}
		.cell:hover {
			background: color-mix(
				in srgb,
				var(--fx-color-primary) 12%,
				transparent
			);
		}
		.cell.muted {
			color: var(--fx-text-disabled);
		}
		.cell.today::after {
			content: "";
			position: absolute;
			bottom: 3px;
			width: 4px;
			height: 4px;
			border-radius: var(--fx-radius-full);
			background: var(--fx-color-primary);
		}
		.cell.sel {
			background: var(--fx-color-primary);
			color: #fff;
			font-weight: var(--fx-font-weight);
		}
		.cell.sel::after {
			background: #fff;
		}
		.cell.in-range {
			background: color-mix(
				in srgb,
				var(--fx-color-primary) 16%,
				transparent
			);
			border-radius: 0;
		}
		.grid.months .cell,
		.grid.years .cell {
			height: 40px;
		}
		.cell[disabled] {
			opacity: 0.35;
			cursor: not-allowed;
			pointer-events: none;
		}
	`;
let FxCalendar = _FxCalendar;
function defineFxCalendar() {
  return defineElement("fx-calendar", FxCalendar);
}
defineFxCalendar();
const _FxDatepicker = class _FxDatepicker extends FxElement {
  constructor() {
    super(...arguments);
    this.time = { h: 0, m: 0, s: 0 };
  }
  static get observedAttributes() {
    return ["value", "start", "end", "values", "mode", "min", "max", "placeholder", "disabled", "format", "show-time", "free-text"];
  }
  get mode() {
    const m = this.getAttr("mode", "single");
    return ["single", "range", "multiple"].includes(m) ? m : "single";
  }
  set mode(value) {
    this.setAttribute("mode", value);
  }
  get value() {
    return this.getAttr("value");
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  /** Datas do modo múltiplo (CSV no atributo). */
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
  connectedCallback() {
    super.connectedCallback();
    this.docListener = (e) => {
      if (!this.hasAttr("open")) return;
      if (e.composedPath().includes(this)) return;
      this.removeAttribute("open");
    };
    document.addEventListener("click", this.docListener);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.docListener) document.removeEventListener("click", this.docListener);
  }
  /** Formata uma data ISO ("YYYY-MM-DD" ou com "THH:mm:ss") segundo o atributo format. */
  formatDate(iso) {
    if (!iso) return "";
    const fmt = this.getAttr("format");
    if (!fmt) return iso.split("T")[0];
    const [datePart, timePart] = iso.split("T");
    const [y = "", m = "", d = ""] = datePart.split("-");
    const [H = "00", M = "00", S = "00"] = (timePart ?? "").split(":");
    return fmt.replace(/yyyy/gi, "").replace(/MM/g, "").replace(/mm/g, "").replace(/dd/gi, "").replace(/HH/g, "").replace(/SS/gi, "").replace(/\u0001/g, y).replace(/\u0002/g, m).replace(/\u0003/g, d).replace(/\u0004/g, H).replace(/\u0005/g, M).replace(/\u0006/g, S);
  }
  /** Texto exibido no input conforme o modo. */
  displayText() {
    if (this.mode === "range") {
      const s = this.getAttr("start");
      const e = this.getAttr("end");
      this.hasAttr("show-time") ? " " : " → ";
      if (!s && !e) return "";
      if (this.hasAttr("show-time")) {
        const f = (iso) => iso ? `${this.formatDate(iso)} ${this.timeText()}` : iso ? `${this.formatDate(iso)} …` : "";
        return s && e ? `${f(s)} → ${f(e)}` : f(s);
      }
      return s && e ? `${this.formatDate(s)} → ${this.formatDate(e)}` : s ? `${this.formatDate(s)} → …` : "";
    }
    if (this.mode === "multiple") {
      return this.values.map((v) => this.formatDate(v)).join(", ");
    }
    const base = this.formatDate(this.value);
    return base && this.hasAttr("show-time") ? `${base} ${this.timeText()}` : base;
  }
  /** "HH:MM:SS" do estado interno de show-time. */
  timeText() {
    const p = (n) => String(n).padStart(2, "0");
    return `${p(this.time.h)}:${p(this.time.m)}:${p(this.time.s)}`;
  }
  /** Extrai hora de um valor ISO inicial, se houver. */
  loadTimeFromValue() {
    const src = this.value || this.getAttr("start") || "";
    const t = src.split("T")[1];
    if (!t) return;
    const [h, m, s] = t.split(":").map((n) => parseInt(n, 10));
    this.time = { h: h || 0, m: m || 0, s: s || 0 };
  }
  /** Anexa o horário interno ao ISO puro vindo do calendário. */
  withTime(iso) {
    if (!iso) return iso;
    return this.hasAttr("show-time") ? `${iso}T${this.timeText()}` : iso;
  }
  render() {
    const disabled = this.disabled;
    const clearable = this.hasAttr("clearable");
    const text = this.displayText();
    const hasValue = text.length > 0;
    const showTime = this.hasAttr("show-time");
    this.loadTimeFromValue();
    let calAttrs = `min="${esc(this.getAttr("min"))}" max="${esc(this.getAttr("max"))}"`;
    if (this.mode === "range") {
      calAttrs += ` range start="${esc(this.getAttr("start"))}" end="${esc(this.getAttr("end"))}"`;
    } else if (this.mode === "multiple") {
      const dates = this.values.map((v) => v.split("T")[0]).join(",");
      calAttrs += ` mode="multiple" values="${esc(dates)}"`;
    } else {
      const v = this.value.split("T")[0] ?? "";
      calAttrs += ` value="${esc(v)}"`;
    }
    this.setTemplate(`
      <div class="field" part="field">
        <input class="display" part="display" type="text" ${this.hasAttr("free-text") && !disabled ? "" : "readonly"}
          placeholder="${esc(this.getAttr("placeholder", "dd/mm/aaaa"))}"
          value="${esc(text)}" ${disabled ? "disabled" : ""}>
        <button type="button" class="clear" part="clear" aria-label="Limpar"
          ${clearable && hasValue ? "" : "hidden"}>
          ×
        </button>
        <span class="cal-icon" part="icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </span>
      </div>
      <div class="pop" part="popover">
        <fx-calendar ${calAttrs}></fx-calendar>
        ${showTime ? `<div class="time-row" part="time">
                <input class="t-h" type="number" min="0" max="23" value="${this.time.h}" aria-label="Hora"><span class="sep">:</span>
                <input class="t-m" type="number" min="0" max="59" value="${this.time.m}" aria-label="Minuto"><span class="sep">:</span>
                <input class="t-s" type="number" min="0" max="59" value="${this.time.s}" aria-label="Segundo">
              </div>` : ""}
      </div>
    `);
    const field = this.root.querySelector(".field");
    if (!field) return;
    if (disabled) return;
    field.addEventListener("click", (e) => {
      if (e.target.closest(".clear")) return;
      if (this.hasAttr("free-text") && e.target.classList.contains("display")) return;
      this.toggleAttribute("open");
      if (this.hasAttr("open")) {
        const r = this.getBoundingClientRect();
        this.toggleAttribute("up", r.bottom + 340 > window.innerHeight && r.top > 340);
      } else {
        this.removeAttribute("up");
      }
    });
    this.root.querySelector(".clear")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeAttribute("value");
      this.removeAttribute("start");
      this.removeAttribute("end");
      this.removeAttribute("values");
      this.removeAttribute("open");
      this.render();
      this.emitChange({});
    });
    const cal = this.root.querySelector(".pop fx-calendar");
    cal?.addEventListener("change", (e) => {
      const d = e.detail ?? {};
      if (d.start !== void 0 || d.end !== void 0) {
        if (d.start) this.setAttribute("start", this.withTime(d.start));
        else this.removeAttribute("start");
        if (d.end) this.setAttribute("end", this.withTime(d.end));
        else this.removeAttribute("end");
      }
      if (d.values !== void 0) {
        this.values = d.values.map((v) => this.withTime(v));
      }
      if (d.value !== void 0) {
        if (d.value) this.setAttribute("value", this.withTime(d.value));
        else this.removeAttribute("value");
        if (this.mode === "single") this.removeAttribute("open");
      }
      this.render();
      this.emitChange(d);
    });
    const display = this.root.querySelector(".display");
    if (display && this.hasAttr("free-text") && !disabled) {
      display.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.commitTyped(display);
        }
      });
      display.addEventListener("blur", () => this.commitTyped(display));
    }
    if (showTime) {
      const applyTime = () => {
        const h = this.root.querySelector(".t-h");
        const m = this.root.querySelector(".t-m");
        const s = this.root.querySelector(".t-s");
        const clamp = (v, max) => Math.min(max, Math.max(0, parseInt(v ?? "0", 10) || 0));
        this.time = {
          h: clamp(h?.value, 23),
          m: clamp(m?.value, 59),
          s: clamp(s?.value, 59)
        };
        const reattach = (iso) => iso.split("T")[0] ? `${iso.split("T")[0]}T${this.timeText()}` : iso;
        if (this.value) this.setAttribute("value", reattach(this.value));
        if (this.getAttr("start")) this.setAttribute("start", reattach(this.getAttr("start")));
        if (this.getAttr("end")) this.setAttribute("end", reattach(this.getAttr("end")));
        if (this.values.length) {
          this.values = this.values.map((v) => reattach(v));
        }
        const display2 = this.root.querySelector(".display");
        if (display2) display2.value = this.displayText();
        this.emitChange({ value: this.value });
      };
      [".t-h", ".t-m", ".t-s"].forEach((sel) => {
        this.root.querySelector(sel)?.addEventListener("input", applyTime);
      });
    }
  }
  emitChange(detail) {
    this.dispatchEvent(
      new CustomEvent("change", { bubbles: true, composed: true, detail })
    );
  }
  /**
   * Interpreta o texto digitado livremente e devolve ISO "YYYY-MM-DD"
   * (ou null se inválido). Aceita a máscara do atributo `format`
   * (tokens dd/mm/yyyy) ou ISO direto.
   */
  parseTyped(raw) {
    const text = raw.trim();
    if (!text) return null;
    const fmt = this.getAttr("format", "dd/mm/yyyy").toLowerCase();
    const order = ["dd", "mm", "yyyy"].filter((t) => fmt.includes(t));
    if (order.length < 3) return null;
    const parts = text.split(new RegExp(`[^0-9]+`)).filter(Boolean);
    if (parts.length !== 3) return null;
    const map = {};
    order.forEach((t, i) => map[t] = parts[i]);
    const iso = `${map["yyyy"]}-${(map["mm"] ?? "").padStart(2, "0")}-${(map["dd"] ?? "").padStart(2, "0")}`;
    const d = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const [y, m, day] = iso.split("-").map((n) => parseInt(n, 10));
    if (d.getFullYear() !== y || d.getMonth() + 1 !== m || d.getDate() !== day) return null;
    const cmp = (a, b) => a.split("T")[0].localeCompare(b.split("T")[0]);
    const min = this.getAttr("min");
    const max = this.getAttr("max");
    if (min && cmp(iso, min) < 0) return null;
    if (max && cmp(iso, max) > 0) return null;
    return iso;
  }
  /** Aplica o texto digitado no modo free-text (blur/Enter). */
  commitTyped(input) {
    const parsed = this.parseTyped(input.value);
    if (!parsed) {
      input.classList.add("invalid");
      this.dispatchEvent(
        new CustomEvent("invalid", { bubbles: true, composed: true, detail: { text: input.value } })
      );
      input.value = this.displayText();
      setTimeout(() => input.classList.remove("invalid"), 1500);
      return;
    }
    if (this.mode === "single") {
      this.setAttribute("value", this.withTime(parsed));
      this.emitChange({ value: this.value });
    } else if (this.mode === "range") {
      if (!this.getAttr("start") || this.getAttr("start") && this.getAttr("end")) {
        this.setAttribute("start", this.withTime(parsed));
        this.removeAttribute("end");
      } else {
        const [a, b] = [this.getAttr("start").split("T")[0], parsed].sort();
        this.setAttribute("start", this.withTime(a));
        this.setAttribute("end", this.withTime(b));
      }
      this.emitChange({ start: this.getAttr("start"), end: this.getAttr("end") });
    } else {
      const list = this.values.filter((v) => v.split("T")[0] !== parsed);
      list.push(this.withTime(parsed));
      this.values = list;
      this.emitChange({ values: this.values });
    }
    this.render();
  }
};
_FxDatepicker.styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      position: relative;
    }
    .field {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-xs);
      width: 100%;
      box-sizing: border-box;
      /* Base = tamanho padrão (md): 40px */
      min-height: var(--fx-size-md, 40px);
      min-width: 150px;
      padding: var(--fx-space-xs) var(--fx-space-md);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      cursor: pointer;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([size='sm']) .field { min-height: 32px; min-width: 180px; }
    :host([size='md']) .field { min-height: 40px; }
    :host([size='lg']) .field { min-height: 48px; min-width: 220px; font-size: calc(var(--fx-font-size) + 4px); }
    /* Range e multiple exibem mais de uma data: campo mais largo */
    :host([mode='range']) .field { min-width: 250px; }
    :host([mode='multiple']) .field { min-width: 220px; }
    :host([mode='range'][size='lg']) .field { min-width: 360px; }
    :host([mode='multiple'][size='lg']) .field { min-width: 320px; }
    :host([show-time]) .field { min-width: 250px; }
    /* Validação */
    :host([error]) .field,
    :host([invalid]) .field {
      border-color: var(--fx-color-danger, #dc2626);
    }
    :host([error]) .field:focus-within,
    :host([invalid]) .field:focus-within,
    :host([error][open]) .field,
    :host([invalid][open]) .field {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent);
    }
    :host([success]) .field,
    :host([valid]) .field {
      border-color: var(--fx-color-success, #16a34a);
    }
    :host([success]) .field:focus-within,
    :host([valid]) .field:focus-within,
    :host([success][open]) .field,
    :host([valid][open]) .field {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent);
    }
    .field:hover { border-color: var(--fx-border-hover); }
    .field:focus-within {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .display {
      flex: 1;
      border: none;
      background: none;
      font: inherit;
      color: var(--fx-text-default);
      outline: none;
      cursor: pointer;
      text-align: left;
      padding: 0;
      min-width: 0;
    }
    .display::placeholder { color: var(--fx-text-muted); }
    .cal-icon { color: var(--fx-text-muted); display: inline-flex; pointer-events: none; }
    .clear {
      border: none;
      background: none;
      color: var(--fx-text-muted);
      cursor: pointer;
      font-size: calc(var(--fx-font-size) + 4px);
      line-height: 1;
      padding: 0 2px;
      border-radius: var(--fx-radius-full);
    }
    .clear:hover { color: var(--fx-color-danger); }
    .clear[hidden] { display: none; }
    .pop {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: var(--fx-z-dropdown, 1000);
      display: none;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      overflow: hidden;
    }
    :host([up]) .pop {
      top: auto;
      bottom: calc(100% + 4px);
    }
    :host([open]) .pop { display: block; }
    .time-row {
      display: flex;
      align-items: center;
      gap: var(--fx-space-xs);
      padding: var(--fx-space-sm) var(--fx-space-md);
      border-top: 1px solid var(--fx-border-default);
      background: var(--fx-surface-background);
      border-radius: 0 0 var(--fx-radius-md) var(--fx-radius-md);
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-default);
    }
    .time-row label { color: var(--fx-text-muted); }
    .time-row input {
      width: 38px;
      font: inherit;
      color: var(--fx-text-default);
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-sm);
      padding: 2px 2px;
      outline: none;
      text-align: center;
      -moz-appearance: textfield;
      appearance: textfield;
    }
    .time-row input::-webkit-outer-spin-button,
    .time-row input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .time-row .sep { color: var(--fx-text-muted); font-weight: bold; padding: 0 1px; }
    .time-row input:focus {
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    :host([disabled]) .field { opacity: 0.55; cursor: not-allowed; background: var(--fx-surface-surface-hover); }
    :host([disabled]) .display { cursor: not-allowed; }
    :host([free-text]) .display { cursor: text; }
    :host([free-text]) .display.invalid { border-bottom: 2px solid var(--fx-color-danger); }
  `;
let FxDatepicker = _FxDatepicker;
function defineFxDatepicker() {
  return defineElement("fx-datepicker", FxDatepicker);
}
defineFxDatepicker();
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
defineFxCheckbox();
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
defineFxRadio();
const LOCALE = "pt-BR";
const PIPES = {
  /** Formata como moeda brasileira (R$). */
  currency: (v) => {
    if (v == null || v === "") return "";
    try {
      return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: "BRL"
      }).format(Number(v));
    } catch {
      return String(v);
    }
  },
  /** Formata como data. Estilos: short | medium | long | full (default medium). */
  date: (v, arg) => {
    const d = toDate(v);
    if (!d) return String(v ?? "");
    const styles = {
      short: { dateStyle: "short" },
      medium: { dateStyle: "medium" },
      long: { dateStyle: "long" },
      full: { dateStyle: "full" }
    };
    const opts = arg && styles[arg] ? styles[arg] : styles.medium;
    try {
      return new Intl.DateTimeFormat(LOCALE, opts).format(d);
    } catch {
      return d.toLocaleDateString(LOCALE);
    }
  },
  /** Formata como data + hora (medium/short). */
  dateTime: (v) => {
    const d = toDate(v);
    if (!d) return String(v ?? "");
    try {
      return new Intl.DateTimeFormat(LOCALE, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(d);
    } catch {
      return d.toLocaleString(LOCALE);
    }
  },
  /** Formata como número (pt-BR). Opcional: `number: 2` (casas decimais). */
  number: (v, arg) => {
    if (v == null || v === "") return "";
    try {
      const opt = {};
      if (arg !== void 0) {
        const dec = Number(arg);
        opt.minimumFractionDigits = dec;
        opt.maximumFractionDigits = dec;
      }
      return new Intl.NumberFormat(LOCALE, opt).format(Number(v));
    } catch {
      return String(v);
    }
  }
};
function toDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
const IDENT_START = (ch) => /[a-z_$]/i.test(ch);
const IDENT_PART = (ch) => /[a-z0-9_$]/i.test(ch);
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let str = "";
      i++;
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === "\\" && i + 1 < expr.length) {
          str += expr[i + 1];
          i += 2;
        } else {
          str += expr[i];
          i++;
        }
      }
      i++;
      tokens.push({ type: "str", value: str });
      continue;
    }
    if (ch >= "0" && ch <= "9") {
      let numStr = "";
      while (i < expr.length && (expr[i] >= "0" && expr[i] <= "9" || expr[i] === ".")) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: "num", value: numStr });
      continue;
    }
    if (IDENT_START(ch)) {
      let ident = "";
      while (i < expr.length && IDENT_PART(expr[i])) {
        ident += expr[i];
        i++;
      }
      if (ident === "true" || ident === "false" || ident === "null") {
        tokens.push({ type: "kw", value: ident });
      } else {
        tokens.push({ type: "id", value: ident });
      }
      continue;
    }
    const two = expr.slice(i, i + 2);
    if (two === "==" || two === "!=" || two === ">=" || two === "<=") {
      tokens.push({ type: "cmp", value: two });
      i += 2;
      continue;
    }
    if (ch === "+") {
      tokens.push({ type: "op", value: "+" });
      i++;
      continue;
    }
    if (ch === "-") {
      tokens.push({ type: "op", value: "-" });
      i++;
      continue;
    }
    if (ch === "*") {
      tokens.push({ type: "op", value: "*" });
      i++;
      continue;
    }
    if (ch === "/") {
      tokens.push({ type: "op", value: "/" });
      i++;
      continue;
    }
    if (ch === ">") {
      tokens.push({ type: "cmp", value: ">" });
      i++;
      continue;
    }
    if (ch === "<") {
      tokens.push({ type: "cmp", value: "<" });
      i++;
      continue;
    }
    if (ch === "!") {
      tokens.push({ type: "op", value: "!" });
      i++;
      continue;
    }
    if (ch === "?") {
      tokens.push({ type: "qm", value: "?" });
      i++;
      continue;
    }
    if (ch === ":") {
      tokens.push({ type: "colon", value: ":" });
      i++;
      continue;
    }
    if (ch === "|") {
      tokens.push({ type: "pipe", value: "|" });
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ")" });
      i++;
      continue;
    }
    if (ch === ".") {
      tokens.push({ type: "dot", value: "." });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}
class Parser {
  constructor(tokens, ctx) {
    this.tokens = tokens;
    this.ctx = ctx;
    this.pos = 0;
  }
  peek() {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }
  next() {
    return this.pos < this.tokens.length ? this.tokens[this.pos++] : null;
  }
  matchType(type) {
    if (this.peek()?.type === type) return this.next();
    return null;
  }
  parse() {
    return this.parsePipe();
  }
  /* pipeExpr := ternary ('|' IDENT (':' pipeArg)? )* */
  parsePipe() {
    let val = this.parseTernary();
    while (this.peek()?.type === "pipe") {
      this.next();
      const nameTok = this.matchType("id");
      if (!nameTok) break;
      let arg;
      if (this.peek()?.type === "colon") {
        this.next();
        const argTok = this.peek();
        if (argTok && (argTok.type === "str" || argTok.type === "num" || argTok.type === "id")) {
          arg = argTok.type === "str" ? argTok.value : String(argTok.value);
          this.next();
        }
      }
      val = this.applyPipe(nameTok.value, arg, val);
    }
    return val;
  }
  /* ternary := comparison ('?' pipeExpr ':' pipeExpr)? */
  parseTernary() {
    const cond = this.parseComparison();
    if (this.peek()?.type === "qm") {
      this.next();
      const trueVal = this.parsePipe();
      if (this.peek()?.type === "colon") {
        this.next();
        const falseVal = this.parsePipe();
        return cond ? trueVal : falseVal;
      }
      return trueVal;
    }
    return cond;
  }
  /* comparison := additive (COMP_OP additive)? */
  parseComparison() {
    const left = this.parseAdditive();
    const tok = this.peek();
    if (tok?.type === "cmp") {
      this.next();
      const right = this.parseAdditive();
      return this.compare(left, tok.value, right);
    }
    return left;
  }
  compare(left, op, right) {
    const l = toComparable(left);
    const r = toComparable(right);
    switch (op) {
      case "==":
        return l == r;
      case "!=":
        return l != r;
      case ">":
        return l > r;
      case "<":
        return l < r;
      case ">=":
        return l >= r;
      case "<=":
        return l <= r;
    }
    return false;
  }
  /* additive := multiplicative (('+' | '-') multiplicative)* */
  parseAdditive() {
    let left = this.parseMultiplicative();
    for (; ; ) {
      const tok = this.peek();
      if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
        this.next();
        const right = this.parseMultiplicative();
        left = tok.value === "+" ? this.add(left, right) : this.subtract(left, right);
      } else break;
    }
    return left;
  }
  add(l, r) {
    if (typeof l === "string" || typeof r === "string") {
      return String(l ?? "") + String(r ?? "");
    }
    return Number(l) + Number(r);
  }
  subtract(l, r) {
    return Number(l) - Number(r);
  }
  /* multiplicative := unary (('*' | '/') unary)* */
  parseMultiplicative() {
    let left = this.parseUnary();
    for (; ; ) {
      const tok = this.peek();
      if (tok?.type === "op" && (tok.value === "*" || tok.value === "/")) {
        this.next();
        const right = this.parseUnary();
        left = tok.value === "*" ? Number(left) * Number(right) : Number(left) / Number(right);
      } else break;
    }
    return left;
  }
  /* unary := ('+' | '-' | '!') unary | primary */
  parseUnary() {
    const tok = this.peek();
    if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
      this.next();
      const val = Number(this.parseUnary());
      return tok.value === "-" ? -val : val;
    }
    if (tok?.type === "op" && tok.value === "!") {
      this.next();
      return !this.parseUnary();
    }
    return this.parsePrimary();
  }
  /* primary := STRING | NUMBER | kw | id ( '.' id )* | '(' pipeExpr ')' */
  parsePrimary() {
    const tok = this.peek();
    if (!tok) return void 0;
    if (tok.type === "lparen") {
      this.next();
      const val = this.parsePipe();
      this.matchType("rparen");
      return val;
    }
    if (tok.type === "str") {
      this.next();
      return tok.value;
    }
    if (tok.type === "num") {
      this.next();
      return Number(tok.value);
    }
    if (tok.type === "kw") {
      this.next();
      return tok.value === "true" ? true : tok.value === "false" ? false : null;
    }
    if (tok.type === "id") {
      this.next();
      let result = this.resolveId(tok.value);
      while (this.peek()?.type === "dot") {
        this.next();
        const propTok = this.peek();
        if (propTok?.type === "id") {
          this.next();
          result = result == null ? void 0 : result[propTok.value];
        } else break;
      }
      return result;
    }
    this.next();
    return void 0;
  }
  resolveId(name) {
    switch (name) {
      case "value":
        return this.ctx.value;
      case "row":
        return this.ctx.row;
      case "true":
        return true;
      case "false":
        return false;
      case "null":
        return null;
      default:
        return this.ctx.row[name];
    }
  }
  applyPipe(name, arg, input) {
    const pipe = PIPES[name];
    if (!pipe) return formatDefault(input);
    try {
      return pipe(input, arg);
    } catch {
      return formatDefault(input);
    }
  }
}
function toComparable(v) {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  return String(v ?? "");
}
function formatDefault(v) {
  if (v == null) return "";
  if (typeof v === "object") return "[object Object]";
  return String(v);
}
function evaluate(expr, ctx) {
  try {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, ctx);
    const result = parser.parse();
    return formatDefault(result);
  } catch {
    return "";
  }
}
function renderCell(template, row, field) {
  const ctx = { value: row[field], row };
  return template.replace(/\{\{([^}]+)\}\}/g, (_, expr) => esc(evaluate(decodeEntities(expr.trim()), ctx)));
}
function decodeEntities(str) {
  return str.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
const _FxTable = class _FxTable extends FxElement {
  constructor() {
    super(...arguments);
    this._data = [];
    this.page = 0;
    this.sortField = "";
    this.sortDir = 1;
    this.filters = {};
    this.globalSearch = "";
  }
  static get observedAttributes() {
    return [
      "pagination",
      "rows",
      "rows-options",
      "striped",
      "empty-message",
      "pagination-position",
      "lazy",
      "total",
      "loading",
      "loading-message"
    ];
  }
  get data() {
    return this._data;
  }
  set data(value) {
    this._data = Array.isArray(value) ? value : [];
    this.render();
  }
  get total() {
    return this._total ?? this._data.length;
  }
  set total(value) {
    this._total = value;
    this.setAttribute("total", String(value));
  }
  get rowsPerPage() {
    const r = Number(this.getAttr("rows", "10"));
    return r > 0 ? r : 10;
  }
  set rowsPerPage(value) {
    this.setAttribute("rows", String(value));
  }
  get lazy() {
    return this.hasAttr("lazy");
  }
  get columns() {
    return [...this.querySelectorAll("fx-column")].map((c) => {
      const tpl = c.querySelector("template");
      const direct = tpl ? void 0 : c.innerHTML.trim();
      const align = c.getAttribute("align") ?? "left";
      return {
        field: c.getAttribute("field") ?? "",
        header: c.getAttribute("header") ?? c.getAttribute("field") ?? "",
        sortable: c.hasAttribute("sortable"),
        filterable: c.hasAttribute("filterable"),
        align: ["left", "center", "right", "justify", "start", "end"].includes(align) ? align : "left",
        template: tpl ?? void 0,
        directTemplate: direct || void 0
      };
    });
  }
  get toolbarTemplate() {
    return this.querySelector(
      'template[slot="toolbar"]'
    );
  }
  connectedCallback() {
    this._parseDataAttribute();
    super.connectedCallback();
    this._columnObserver = new MutationObserver(() => this.render());
    this._columnObserver.observe(this, { childList: true, subtree: true });
  }
  disconnectedCallback() {
    this._columnObserver?.disconnect();
    super.disconnectedCallback();
  }
  _parseDataAttribute() {
    if (!this._data.length) {
      try {
        const json = this.getAttr("data");
        if (json) this._data = JSON.parse(json);
      } catch {
      }
    }
    const totalAttr = this.getAttr("total");
    if (totalAttr) {
      const n = Number(totalAttr);
      if (!isNaN(n)) this._total = n;
    }
  }
  computeRows() {
    let out = [...this._data];
    for (const [field, term] of Object.entries(this.filters)) {
      if (!term) continue;
      const t = term.toLowerCase();
      out = out.filter(
        (r) => String(r[field] ?? "").toLowerCase().includes(t)
      );
    }
    if (this.globalSearch) {
      const t = this.globalSearch.toLowerCase();
      const searchFields = this._getSearchFields();
      out = out.filter((r) => {
        const fields = searchFields.length ? searchFields : Object.keys(r);
        return fields.some(
          (f) => String(r[f] ?? "").toLowerCase().includes(t)
        );
      });
    }
    const total = this.lazy ? this.total : out.length;
    if (this.sortField) {
      out.sort((a, b) => {
        const av = a[this.sortField], bv = b[this.sortField];
        if (typeof av === "number" && typeof bv === "number")
          return (av - bv) * this.sortDir;
        return String(av ?? "").localeCompare(String(bv ?? ""), "pt-BR") * this.sortDir;
      });
    }
    if (this.hasAttr("pagination") && !this.lazy) {
      const start = this.page * this.rowsPerPage;
      out = out.slice(start, start + this.rowsPerPage);
    }
    return { rows: out, total };
  }
  _getSearchFields() {
    const input = this.root.querySelector(
      "[data-search-fields]"
    );
    if (!input) return [];
    const attr = input.getAttribute("data-search-fields");
    if (attr === null) return [];
    return attr.split(",").map((s) => s.trim()).filter(Boolean);
  }
  cellHtml(col, row) {
    const template = col.template?.innerHTML ?? col.directTemplate;
    if (template) return renderCell(template, row, col.field);
    return esc(String(row[col.field] ?? ""));
  }
  render() {
    const cols = this.columns.filter((c) => c.field);
    const { rows, total } = this.computeRows();
    const paginated = this.hasAttr("pagination");
    const pages = Math.max(1, Math.ceil(total / this.rowsPerPage));
    if (this.page >= pages) this.page = pages - 1;
    const toolbar = this.toolbarTemplate;
    const toolbarHtml = toolbar ? `<div class="toolbar" part="toolbar">${toolbar.innerHTML}</div>` : "";
    const headHtml = cols.map((c) => {
      const isSorted = this.sortField === c.field;
      const ind = isSorted ? this.sortDir === 1 ? "▲" : "▼" : c.sortable ? "⇅" : "";
      const activeClass = isSorted ? "active" : "";
      return `<th part="header" class="${c.sortable ? "sortable" : ""}" style="text-align:${c.align}" data-field="${esc(c.field)}">${esc(c.header)}${ind ? `<span class="sort-ind ${activeClass}">${ind}</span>` : ""}</th>`;
    }).join("");
    const filterRow = cols.some((c) => c.filterable) ? `<tr class="filter-row">${cols.map((c) => `<th style="text-align:${c.align}">${c.filterable ? `<input class="filter" data-field="${esc(c.field)}" placeholder="${esc("Filtrar…")}" value="${esc(this.filters[c.field] ?? "")}">` : ""}</th>`).join("")}</tr>` : "";
    const bodyHtml = rows.length ? rows.map(
      (row, i) => `<tr part="row" data-index="${i}">${cols.map((c) => `<td part="cell" style="text-align:${c.align}">${this.cellHtml(c, row)}</td>`).join("")}</tr>`
    ).join("") : `<tr><td class="empty" colspan="${cols.length || 1}">${esc(this.getAttr("empty-message", "Nenhum registro encontrado"))}</td></tr>`;
    const pagerHtml = !paginated ? "" : `
      <div class="pager" part="pager">
        <span class="info">Página ${this.page + 1} de ${pages} · ${total} registros</span>
        <button type="button" class="pg-btn" data-pg="first" ${this.page === 0 ? "disabled" : ""}>«</button>
        <button type="button" class="pg-btn" data-pg="prev" ${this.page === 0 ? "disabled" : ""}>‹</button>
        ${Array.from({ length: pages }, (_, p) => `<button type="button" class="pg-btn" data-pg="${p}" aria-current="${p === this.page}">${p + 1}</button>`).join("")}
        <button type="button" class="pg-btn" data-pg="next" ${this.page >= pages - 1 ? "disabled" : ""}>›</button>
        <button type="button" class="pg-btn" data-pg="last" ${this.page >= pages - 1 ? "disabled" : ""}>»</button>
        <label class="info">${esc("Por página:")}
          <fx-select class="rows-sel" size="sm" value="${this.rowsPerPage}" aria-label="Itens por página">${this.getAttr(
      "rows-options",
      "5,10,20,50"
    ).split(",").map((n) => n.trim()).map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("")}</fx-select>
        </label>
      </div>`;
    const loading = this.hasAttr("loading");
    const loadingHtml = loading ? `<div class="loading-overlay" part="loading-overlay"><div class="tbl-spinner" part="spinner"></div><span class="loading-text">${esc(this.getAttr("loading-message", "Carregando…"))}</span></div>` : "";
    this.setTemplate(`
      ${toolbarHtml}
      <div class="table-wrap">
        <div class="scroll">
          <table part="table">
            <thead><tr>${headHtml}</tr>${filterRow}</thead>
            <tbody>${bodyHtml}</tbody>
          </table>
        </div>
        ${loadingHtml}
      </div>
      ${pagerHtml}
    `);
    this.root.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const f = th.dataset.field;
        if (this.sortField === f)
          this.sortDir = this.sortDir === 1 ? -1 : 1;
        else {
          this.sortField = f;
          this.sortDir = 1;
        }
        this.render();
        this.dispatchEvent(
          new CustomEvent("sort-change", {
            bubbles: true,
            composed: true,
            detail: {
              field: this.sortField,
              direction: this.sortDir === 1 ? "asc" : "desc",
              lazy: this.lazy
            }
          })
        );
      });
    });
    this.root.querySelectorAll(".filter").forEach((inp) => {
      inp.addEventListener("input", () => {
        const field = inp.dataset.field;
        const value = inp.value;
        const pos = inp.selectionStart;
        this.filters[field] = value;
        this.page = 0;
        this.render();
        this.dispatchEvent(
          new CustomEvent("filter-change", {
            bubbles: true,
            composed: true,
            detail: { field, value, lazy: this.lazy }
          })
        );
        const again = this.root.querySelector(
          `.filter[data-field="${esc(field)}"]`
        );
        if (again) {
          again.focus();
          again.setSelectionRange(pos, pos);
        }
      });
      inp.addEventListener("click", (e) => e.stopPropagation());
    });
    this.root.querySelectorAll("[data-search-fields]").forEach((inp) => {
      inp.addEventListener("input", () => {
        this.globalSearch = inp.value;
        this.page = 0;
        const pos = inp.selectionStart;
        this.render();
        const again = this.root.querySelector(
          "[data-search-fields]"
        );
        if (again) {
          again.focus();
          again.setSelectionRange(pos, pos);
        }
      });
    });
    this.root.querySelectorAll(".pg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pg = btn.dataset.pg;
        this.page = pg === "first" ? 0 : pg === "prev" ? Math.max(0, this.page - 1) : pg === "next" ? Math.min(pages - 1, this.page + 1) : pg === "last" ? pages - 1 : Number(pg);
        this.render();
        this.dispatchEvent(
          new CustomEvent("page-change", {
            bubbles: true,
            composed: true,
            detail: {
              page: this.page + 1,
              pages,
              rowsPerPage: this.rowsPerPage,
              total,
              lazy: this.lazy
            }
          })
        );
      });
    });
    this.root.querySelector("fx-select.rows-sel")?.addEventListener("change", (e) => {
      const value = Number(e.detail?.value);
      if (!value || value === this.rowsPerPage) return;
      this.rowsPerPage = value;
      this.page = 0;
      this.render();
    });
    this.root.querySelectorAll("tbody tr[data-index]").forEach((tr) => {
      tr.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("row-click", {
            bubbles: true,
            composed: true,
            detail: {
              row: rows[Number(tr.dataset.index)],
              index: Number(tr.dataset.index)
            }
          })
        );
      });
    });
    this._restoreToolbarSearch();
  }
  _restoreToolbarSearch() {
    const input = this.root.querySelector(
      "[data-search-fields]"
    );
    if (input && this.globalSearch) input.value = this.globalSearch;
  }
};
_FxTable.styles = css`
		:host {
			display: block;
			font-family: var(--fx-font-family);
			font-size: var(--fx-font-size);
			color: var(--fx-text-default);
			background: var(--fx-surface-background);
		}
		.table-wrap {
			position: relative;
		}
		.scroll {
			overflow-x: auto;
			border: 1px solid var(--fx-border-default);
			border-radius: var(--fx-radius-md);
		}
		table {
			width: 100%;
			border-collapse: collapse;
		}
		th {
			text-align: left;
			padding: var(--fx-space-sm) var(--fx-space-md);
			background: var(--fx-surface-surface);
			border-bottom: 2px solid var(--fx-border-default);
			white-space: nowrap;
			user-select: none;
		}
		th.sortable {
			cursor: pointer;
		}
		th.sortable:hover {
			color: var(--fx-color-primary);
		}
		.sort-ind {
			font-size: calc(var(--fx-font-size) - 4px);
			margin-left: var(--fx-space-3xs, 2px);
			opacity: 0.45;
			transition: opacity var(--fx-motion-duration-fast)
				var(--fx-motion-easing);
		}
		th.sortable:hover .sort-ind {
			opacity: 0.85;
		}
		.sort-ind.active {
			opacity: 1;
			color: var(--fx-color-primary);
		}
		.filter-row th {
			padding: var(--fx-space-3xs, 4px) var(--fx-space-md) var(--fx-space-sm);
			border-bottom-width: 1px;
		}
		.filter {
			width: 100%;
			box-sizing: border-box;
			font: inherit;
			font-size: calc(var(--fx-font-size) - 2px);
			color: var(--fx-text-default);
			background: var(--fx-surface-background);
			border: 1px solid var(--fx-border-default);
			border-radius: var(--fx-radius-sm);
			padding: var(--fx-space-3xs, 4px) var(--fx-space-xs);
			outline: none;
		}
		.filter:focus {
			border-color: var(--fx-color-primary);
			box-shadow: var(--fx-effect-focus-ring, none);
		}
		td {
			padding: var(--fx-space-sm) var(--fx-space-md);
			border-bottom: 1px solid var(--fx-border-default);
		}
		tbody tr {
			cursor: pointer;
			transition: background-color var(--fx-motion-duration-fast)
				var(--fx-motion-easing);
		}
		tbody tr:hover {
			background: color-mix(
				in srgb,
				var(--fx-color-primary) 8%,
				transparent
			);
		}
		:host([striped]) tbody tr:nth-child(even) {
			background: var(--fx-surface-background);
		}
		:host([striped]) tbody tr:hover {
			background: color-mix(
				in srgb,
				var(--fx-color-primary) 8%,
				transparent
			);
		}
		.empty {
			text-align: center;
			padding: var(--fx-space-xl);
			color: var(--fx-text-muted);
		}
		.pager {
			display: flex;
			align-items: center;
			gap: var(--fx-space-sm);
			flex-wrap: wrap;
			padding: var(--fx-space-sm) 0;
		}
		:host([pagination-position="center"]) .pager {
			justify-content: center;
		}
		:host([pagination-position="right"]) .pager {
			justify-content: flex-end;
		}
		.pager .info {
			color: var(--fx-text-muted);
			font-size: calc(var(--fx-font-size) - 2px);
		}
		.pg-btn {
			min-width: var(--fx-size-sm);
			height: var(--fx-size-sm);
			font: inherit;
			font-size: calc(var(--fx-font-size) - 2px);
			color: var(--fx-text-default);
			background: var(--fx-surface-background);
			border: 1px solid var(--fx-border-default);
			border-radius: var(--fx-radius-sm);
			padding: var(--fx-space-3xs, 4px) var(--fx-space-sm);
			cursor: pointer;
			transition: border-color var(--fx-motion-duration-fast)
				var(--fx-motion-easing);
		}
		.pg-btn:hover:not(:disabled):not([aria-current="true"]) {
			border-color: var(--fx-color-primary);
			color: var(--fx-color-primary);
		}
		.pg-btn:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		.pg-btn[aria-current="true"] {
			background: var(--fx-color-primary);
			border-color: var(--fx-color-primary);
			color: #fff;
			font-weight: var(--fx-font-weight);
		}
		fx-select {
			vertical-align: middle;
		}
		fx-select::part(trigger) {
			min-width: 64px !important;
			min-height: var(--fx-size-sm) !important;
			padding: 0 var(--fx-space-sm) !important;
			border-radius: var(--fx-radius-sm) !important;
			font-size: calc(var(--fx-font-size) - 2px) !important;
		}
		.toolbar {
			display: flex;
			align-items: center;
			gap: var(--fx-space-sm);
			flex-wrap: wrap;
			padding: var(--fx-space-sm) var(--fx-space-md);
			border: 1px solid var(--fx-border-default);
			border-bottom: none;
			border-radius: var(--fx-radius-md) var(--fx-radius-md) 0 0;
			background: var(--fx-surface-background);
		}
		.toolbar:empty {
			display: none;
		}
		.loading-overlay {
			position: absolute;
			inset: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--fx-space-sm);
			background: color-mix(
				in srgb,
				var(--fx-surface-background) 85%,
				transparent
			);
			backdrop-filter: blur(2px);
			z-index: 10;
			border-radius: var(--fx-radius-md);
		}
		.tbl-spinner {
			width: 32px;
			height: 32px;
			border: 3px solid var(--fx-border-default);
			border-top-color: var(--fx-color-primary);
			border-radius: 50%;
			animation: tbl-spin 1s linear infinite;
		}
		@keyframes tbl-spin {
			to {
				transform: rotate(360deg);
			}
		}
		.loading-text {
			color: var(--fx-text-muted);
			font-size: calc(var(--fx-font-size) - 1px);
		}
	`;
let FxTable = _FxTable;
function defineFxTable() {
  return defineElement("fx-table", FxTable);
}
defineFxTable();
const _FxFloatlabel = class _FxFloatlabel extends FxElement {
  constructor() {
    super(...arguments);
    this.targetControl = null;
    this.observer = null;
    this.listenersReady = false;
  }
  static get observedAttributes() {
    return ["variant", "error", "invalid", "success", "valid"];
  }
  render() {
    const control = this.findControl();
    const label = this.findLabel();
    const originalLabel = label;
    const labelText = originalLabel ? originalLabel.textContent?.replace(/\s+/g, " ").trim() : "";
    const labelFor = originalLabel ? originalLabel.getAttribute("for") || "" : "";
    const isOver = this.getAttribute("variant") === "over";
    this.setTemplate(`
      <div class="wrapper" part="wrapper">
        ${isOver ? `<label class="flabel" part="label" for="${labelFor}">${labelText}</label>` : ""}
        <div class="field-box" part="field">
          <slot></slot>
          ${isOver ? "" : `<label class="flabel" part="label" for="${labelFor}">${labelText}</label>`}
        </div>
        <div class="error-message" part="error"></div>
      </div>
    `);
    if (originalLabel) originalLabel.setAttribute("hidden", "");
    this.attachEvents();
    this.syncControlReference(control);
    this.syncState();
    this.applyError();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }
  /** Campo de controle = qualquer filho direto que não seja label. */
  findControl() {
    return Array.from(this.children).find(
      (n) => n.tagName.toLowerCase() !== "label"
    ) ?? null;
  }
  /** Label = filho direto <label>. */
  findLabel() {
    return Array.from(this.children).find(
      (n) => n.tagName.toLowerCase() === "label"
    ) ?? null;
  }
  attachEvents() {
    const slot = this.root.querySelector("slot");
    if (slot) {
      slot.addEventListener("slotchange", () => {
        const control = this.findControl();
        this.syncControlReference(control);
        this.syncState();
        this.applyError();
      });
    }
    if (this.listenersReady) return;
    this.listenersReady = true;
    this.addEventListener("focusin", () => this.syncState());
    this.addEventListener(
      "focusout",
      () => setTimeout(() => this.syncState(), 60)
    );
    this.addEventListener("input", () => this.syncState());
    this.addEventListener("change", () => this.syncState());
  }
  /** Observa mudanças de atributos do controle (value, open, values...). */
  syncControlReference(control = this.targetControl) {
    if (control !== this.targetControl) {
      this.observer?.disconnect();
      this.observer = null;
      this.targetControl = control;
      if (control) {
        this.observer = new MutationObserver(() => this.syncState());
        this.observer.observe(control, {
          attributes: true,
          attributeFilter: ["value", "values", "start", "end", "open"]
        });
      }
    }
  }
  syncState() {
    if (this.targetControl && !this.targetControl.isConnected) {
      this.targetControl = null;
      this.observer?.disconnect();
      this.observer = null;
    }
    if (!this.targetControl) {
      this.removeAttribute("active");
      this.removeAttribute("focus");
      return;
    }
    const c = this.targetControl;
    const attrValue = c.getAttribute ? (c.getAttribute("value") ?? "").trim() : "";
    const attrValues = c.getAttribute ? (c.getAttribute("values") ?? "").trim() : "";
    const hasValue = Boolean(
      typeof c.value === "string" && c.value.trim() !== "" || Array.isArray(c.values) && c.values.length > 0 || attrValue !== "" || attrValues !== "" || c.hasAttribute && (c.hasAttribute("open") || c.hasAttribute("start"))
    );
    const focused = this.isFocusedInside();
    if (hasValue || focused) {
      this.setAttribute("active", "");
      if (focused) this.setAttribute("focus", "");
      else this.removeAttribute("focus");
    } else {
      this.removeAttribute("active");
      this.removeAttribute("focus");
    }
  }
  applyError() {
    const hasError = this.hasAttr("error") || this.hasAttr("invalid");
    const errMsg = this.root.querySelector(
      ".error-message"
    );
    if (errMsg) {
      errMsg.textContent = hasError ? this.getAttribute("error-text")?.trim() || "Valor inválido" : "";
    }
    if (this.targetControl && typeof this.targetControl.setAttribute === "function") {
      const t = this.targetControl;
      if (hasError) {
        t.setAttribute("error", "");
        t.removeAttribute("success");
      } else if (this.hasAttr("success") || this.hasAttr("valid")) {
        t.setAttribute("success", "");
        t.removeAttribute("error");
      } else {
        t.removeAttribute("error");
        t.removeAttribute("success");
      }
    }
  }
  isWithin(activeEl) {
    let current = activeEl;
    while (current && current !== this) {
      current = current.parentElement;
    }
    return current === this;
  }
  isFocusedInside() {
    const activeEl = document.activeElement;
    return Boolean(activeEl && this.isWithin(activeEl));
  }
};
_FxFloatlabel.styles = css`
		:host {
			display: inline-block;
			position: relative;
			font-family: var(--fx-font-family);
			font-size: var(--fx-font-size);
			vertical-align: middle;
		}
		.wrapper {
			position: relative;
			display: inline-block;
			width: 100%;
		}
		/* Caixa do campo: referência de posicionamento da label flutuante
       (isolada da mensagem de erro, que cresce o wrapper). */
		.field-box {
			position: relative;
			display: inline-block;
			width: 100%;
		}
		:host([variant="in"]) .field-box {
			padding-top: var(--fx-space-xs, 6px);
		}

		/* ---- label base (variant="on", padrão): sobre a borda superior ---- */
		.flabel {
			position: absolute;
			left: var(--fx-space-md, 12px);
			top: 0;
			transform: translateY(-50%);
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 600;
			color: var(--fx-text-muted, #94a3b8);
			background-color: var(--fx-surface-background, #fff);
			padding: 0 4px;
			line-height: 1;
			border-radius: 2px;
			pointer-events: none;
			z-index: 2;
			white-space: nowrap;
			transition:
				top var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out),
				transform var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out),
				font-size var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out),
				color var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out);
		}
		:host([active]) .flabel {
			color: var(--fx-color-primary, #4f46e5);
		}

		/* ---- variant="in": label como placeholder dentro, sobe ao focar/valor ---- */
		:host([variant="in"]) .flabel {
			top: 50%;
			transform: translateY(-50%);
			font-size: var(--fx-font-size, 14px);
			font-weight: var(--fx-font-weight, 400);
			background: transparent;
			padding: 0;
		}
		:host([variant="in"][active]) .flabel {
			top: 0;
			transform: translateY(-50%);
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 600;
			background-color: var(--fx-surface-background, #fff);
			padding: 0 5px;
			color: var(--fx-color-primary, #4f46e5);
		}

		/* ---- variant="over": label estática ACIMA do campo (fora, em fluxo) ---- */
		:host([variant="over"]) {
			display: block;
		}
		:host([variant="over"]) .flabel {
			position: static;
			display: block;
			margin-bottom: var(--fx-space-xs, 4px);
			background: transparent;
			padding: 0;
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 600;
			white-space: normal;
		}

		/* ---- estados de erro / sucesso ---- */
		:host([error]) .flabel,
		:host([invalid]) .flabel {
			color: var(--fx-color-danger, #dc2626);
		}
		:host([success]) .flabel,
		:host([valid]) .flabel {
			color: var(--fx-color-success, #10b981);
		}

		/* ---- mensagem de erro sob o campo (fonte menor) ---- */
		.error-message {
			display: none;
			margin-top: var(--fx-space-xs, 4px);
			margin-left: var(--fx-space-md, 12px);
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 500;
			color: var(--fx-color-danger, #dc2626);
			line-height: 1.2;
		}
		:host([error]) .error-message,
		:host([invalid]) .error-message {
			display: block;
		}
	`;
let FxFloatlabel = _FxFloatlabel;
function defineFxFloatlabel() {
  return defineElement("fx-floatlabel", FxFloatlabel);
}
defineFxFloatlabel();
const _FxTextarea = class _FxTextarea extends FxElement {
  static get observedAttributes() {
    return ["size", "placeholder", "disabled", "readonly", "rows", "maxlength"];
  }
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
  render() {
    const placeholder = this.getAttr("placeholder");
    const readonly = this.hasAttr("readonly");
    const disabled = this.hasAttr("disabled");
    const rows = this.getAttr("rows");
    const maxlength = this.getAttr("maxlength");
    this.setTemplate(`<textarea class="field" part="textarea"
      ${placeholder ? `placeholder="${esc(placeholder)}"` : ""}
      ${rows ? `rows="${esc(rows)}"` : ""}
      ${maxlength ? `maxlength="${esc(maxlength)}"` : ""}
    ></textarea>`);
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
  }
};
_FxTextarea.styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .field {
      font-family: inherit;
      font-size: inherit;
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      width: 260px;
      min-height: calc(var(--fx-size-md) + 40px);
      resize: vertical;
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
    :host([error]) .field, :host([invalid]) .field {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent);
    }
    :host([success]) .field, :host([valid]) .field {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent);
    }
    :host([size='sm']) .field { width: 220px; min-height: var(--fx-size-sm); padding: var(--fx-space-sm) var(--fx-space-md); }
    :host([size='lg']) .field { width: 300px; min-height: calc(var(--fx-size-lg) + 80px); }
  `;
let FxTextarea = _FxTextarea;
function defineFxTextarea() {
  return defineElement("fx-textarea", FxTextarea);
}
defineFxTextarea();
const _FxDialog = class _FxDialog extends FxElement {
  constructor() {
    super(...arguments);
    this._previouslyFocused = null;
  }
  static get observedAttributes() {
    return ["open", "size", "heading"];
  }
  get open() {
    return this.hasAttr("open");
  }
  set open(value) {
    this.toggleAttr("open", value);
  }
  render() {
    const isOpen = this.open;
    const heading = this.getAttr("heading");
    this.setTemplate(`
      <div class="overlay" part="overlay" ${isOpen ? "" : "hidden"}>
        <div class="dialog" role="dialog" aria-modal="true" aria-label="${esc(heading)}" tabindex="-1">
          <header>
            <h2>${esc(heading)}</h2>
            <button type="button" class="close" part="close" aria-label="Fechar">×</button>
          </header>
          <div class="body"><slot></slot></div>
          <footer part="footer"><slot name="footer"></slot></footer>
        </div>
      </div>
    `);
    if (!isOpen) return;
    const overlay = this.root.querySelector(".overlay");
    const closeBtn = this.root.querySelector(".close");
    const close = () => {
      this.open = false;
      this._cleanup?.();
      this._cleanup = void 0;
      this._restoreFocus();
      this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
    };
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn?.addEventListener("click", close);
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key === "Tab") this._trapFocus(e);
    };
    document.addEventListener("keydown", onKey);
    this._cleanup = () => document.removeEventListener("keydown", onKey);
    requestAnimationFrame(() => {
      this._previouslyFocused = document.activeElement;
      this.root.querySelector(".dialog")?.focus();
    });
    this.dispatchEvent(new CustomEvent("open", { bubbles: true, composed: true }));
  }
  /** Mantém o foco dentro do modal (WCAG 2.4.3 / 2.1.2). */
  _trapFocus(e) {
    const dialog = this.root.querySelector(".dialog");
    if (!dialog) return;
    const focusables = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.root.activeElement;
    if (e.shiftKey && (active === first || active === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
  _restoreFocus() {
    if (this._previouslyFocused?.isConnected) this._previouslyFocused.focus();
    this._previouslyFocused = null;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup?.();
    this._cleanup = void 0;
    this._restoreFocus();
  }
};
_FxDialog.styles = css`
    :host { display: contents; }
    .overlay {
      position: fixed;
      inset: 0;
      background: color-mix(in srgb, var(--fx-text-default, #000) 45%, transparent);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--fx-z-modal, 1100);
      animation: fade var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .overlay[hidden] { display: none; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    .dialog {
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-lg);
      box-shadow: var(--fx-shadow-xl);
      width: min(560px, calc(100vw - 32px));
      max-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      font-family: var(--fx-font-family);
      animation: pop var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    @keyframes pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    :host([size='sm']) .dialog { width: min(400px, calc(100vw - 32px)); }
    :host([size='lg']) .dialog { width: min(800px, calc(100vw - 32px)); }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--fx-space-lg) var(--fx-space-xl);
      border-bottom: 1px solid var(--fx-border-default);
    }
    h2 {
      margin: 0;
      font-size: calc(var(--fx-font-size) + 2px);
      font-weight: 600;
      color: var(--fx-text-default);
    }
    .close {
      border: none;
      background: transparent;
      color: var(--fx-text-muted);
      font-size: calc(var(--fx-font-size) + 6px);
      cursor: pointer;
      line-height: 1;
      padding: 0 var(--fx-space-xs);
      border-radius: var(--fx-radius-full);
    }
    .close:hover { color: var(--fx-color-danger); }
    .body {
      padding: var(--fx-space-lg) var(--fx-space-xl);
      overflow-y: auto;
      color: var(--fx-text-default);
      font-size: var(--fx-font-size);
    }
    footer {
      padding: var(--fx-space-md) var(--fx-space-xl);
      border-top: 1px solid var(--fx-border-default);
      display: flex;
      justify-content: flex-end;
      gap: var(--fx-space-sm);
    }
    footer[hidden] { display: none; }
  `;
let FxDialog = _FxDialog;
function defineFxDialog() {
  return defineElement("fx-dialog", FxDialog);
}
defineFxDialog();
const KIND_COLOR = {
  success: "var(--fx-color-success, #10b981)",
  error: "var(--fx-color-danger, #f43f5e)",
  info: "var(--fx-color-info, #0ea5e9)",
  warning: "var(--fx-color-warning, #f59e0b)"
};
const KIND_ICON = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i"
};
const CARD_CSS = `
:host { display: contents; }
.card {
  display: flex; align-items: flex-start; gap: 10px;
  min-width: 260px; max-width: 360px;
  background: var(--fx-surface-background, #fff);
  color: var(--fx-text-default, #1e293b);
  border: 1px solid var(--fx-border-default, #e2e8f0);
  border-left: 4px solid var(--kind);
  border-radius: var(--fx-radius-md, 8px);
  box-shadow: var(--fx-shadow-lg, 0 10px 30px rgba(0,0,0,.14));
  padding: var(--fx-space-sm, 8px) var(--fx-space-md, 12px);
  font-family: inherit;
  animation: fx-toast-in .25s ease;
}
@keyframes fx-toast-in { from { opacity: 0; transform: translateY(-6px); } }
.card.leaving { opacity: 0; transition: opacity .2s ease; }
.icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--kind);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex: none; margin-top: 2px;
  user-select: none;
}
.body { flex: 1; min-width: 0; }
.title { font-weight: 600; font-size: 14px; }
.msg { font-size: calc(var(--fx-font-size, 14px) - 2px); color: var(--fx-text-muted, #64748b); margin-top: 2px; word-break: break-word; white-space: pre-line; }
.close {
  all: unset; cursor: pointer; flex: none; line-height: 1;
  color: var(--fx-text-muted, #64748b); font-size: 15px; padding: 2px 4px; border-radius: 4px;
}
.close:hover { color: var(--fx-color-danger, #f43f5e); background: var(--fx-surface-surface-hover, rgba(0,0,0,.05)); }
`;
class FxToast extends HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _FxToast_instances);
    this.timer = null;
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["kind", "title", "message", "duration"];
  }
  connectedCallback() {
    if (!this.shadowRoot.firstChild) __privateMethod(this, _FxToast_instances, render_fn).call(this);
    const dur = Number(this.getAttribute("duration") ?? "4000");
    const safe = dur === 0 ? 0 : Math.max(Number.isNaN(dur) ? 4e3 : dur, 1e3);
    if (!Number.isNaN(safe) && safe > 0 && !this.timer) {
      this.timer = setTimeout(() => this.dismiss(), safe);
    }
  }
  disconnectedCallback() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
  dismiss() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const card = this.shadowRoot.querySelector(".card");
    if (card) {
      card.classList.add("leaving");
      setTimeout(() => this.remove(), 200);
    } else {
      this.remove();
    }
  }
}
_FxToast_instances = new WeakSet();
render_fn = function() {
  const kind = this.getAttribute("kind") || "info";
  const title = this.getAttribute("title") ?? "";
  const msg = this.getAttribute("message") ?? "";
  const color = KIND_COLOR[kind] ?? KIND_COLOR.info;
  this.shadowRoot.innerHTML = `
      <style>${CARD_CSS}</style>
      <div class="card" style="--kind:${color}" role="status" part="card">
        <span class="icon">${KIND_ICON[kind] ?? KIND_ICON.info}</span>
        <div class="body">
          ${title ? '<div class="title"></div>' : ""}
          ${msg ? '<div class="msg"></div>' : ""}
        </div>
        <button class="close" aria-label="Fechar">✕</button>
      </div>`;
  const t = this.shadowRoot.querySelector(".title");
  const m = this.shadowRoot.querySelector(".msg");
  if (t) t.textContent = title;
  if (m) m.textContent = msg;
  this.shadowRoot.querySelector(".close").addEventListener("click", () => this.dismiss());
};
function regionFor(position) {
  let region = document.querySelector(`[data-fx-toast-region="${position}"]`);
  if (!region) {
    region = document.createElement("div");
    region.setAttribute("data-fx-toast-region", position);
    const [vertical, horizontal] = position.split("-");
    const style = region.style;
    style.position = "fixed";
    style[vertical] = "16px";
    if (horizontal === "center") {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    } else {
      style[horizontal] = "16px";
    }
    style.display = "flex";
    style.flexDirection = "column";
    style.gap = "8px";
    style.zIndex = "1100";
    style.pointerEvents = "none";
    new MutationObserver(() => {
      region.querySelectorAll("*").forEach((c) => c.style.pointerEvents = "auto");
    }).observe(region, { childList: true });
    document.body.appendChild(region);
  }
  return region;
}
class ToastApi {
  constructor() {
    this.seq = 0;
    this.map = /* @__PURE__ */ new Map();
    this.success = (t, m, o) => this.push("success", t, m, o);
    this.error = (t, m, o) => this.push("error", t, m, o);
    this.info = (t, m, o) => this.push("info", t, m, o);
    this.warning = (t, m, o) => this.push("warning", t, m, o);
  }
  push(kind, title, messageOrOpts, opts) {
    const id = ++this.seq;
    const message = typeof messageOrOpts === "string" ? messageOrOpts : messageOrOpts?.message;
    const o = { ...typeof messageOrOpts === "object" && messageOrOpts ? messageOrOpts : void 0, ...opts };
    const el = document.createElement("fx-toast");
    el.setAttribute("kind", kind);
    el.setAttribute("title", title);
    if (message) el.setAttribute("message", message);
    el.setAttribute("position", o.position ?? "top-right");
    el.setAttribute("duration", String(o.duration ?? 4e3));
    regionFor(o.position ?? "top-right").appendChild(el);
    this.map.set(id, el);
    return id;
  }
  close(id) {
    this.map.get(id)?.dismiss();
    this.map.delete(id);
  }
}
const FenixToast = new ToastApi();
globalThis.FenixToast = FenixToast;
function defineFxToast() {
  if (!customElements.get("fx-toast")) customElements.define("fx-toast", FxToast);
}
defineFxToast();
const _FxTooltip = class _FxTooltip extends FxElement {
  static get observedAttributes() {
    return ["content", "position"];
  }
  render() {
    const content = this.getAttr("content");
    this.setTemplate(`
      <slot></slot>
      <span class="bubble" part="bubble" role="tooltip">${esc(content)}</span>
    `);
  }
};
_FxTooltip.styles = css`
    :host {
      position: relative;
      display: inline-flex;
      font-family: var(--fx-font-family);
    }
    .bubble {
      position: absolute;
      background: var(--fx-text-default, #1e293b);
      color: var(--fx-surface-background, #fff);
      font-size: calc(var(--fx-font-size, 14px) - 2px);
      line-height: 1.45;
      padding: var(--fx-space-xs) var(--fx-space-md);
      border-radius: var(--fx-radius-sm);
      box-shadow: var(--fx-shadow-md);
      width: max-content;
      min-width: 60px;
      max-width: var(--fx-tooltip-max-width, 320px);
      white-space: normal;
      text-align: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--fx-motion-duration-fast) var(--fx-motion-easing);
      z-index: var(--fx-z-tooltip, 1050);
      pointer-events: none;
    }
    :host(:hover) .bubble,
    :host(:focus-within) .bubble {
      opacity: 1;
      visibility: visible;
    }
    /* position top (padrão) */
    .bubble { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
    .bubble::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: var(--fx-text-default, #1e293b);
    }
    /* bottom */
    :host([position='bottom']) .bubble { bottom: auto; top: calc(100% + 6px); }
    :host([position='bottom']) .bubble::after { top: auto; bottom: 100%; border-top-color: transparent; border-bottom-color: var(--fx-text-default, #1e293b); }
    /* left */
    :host([position='left']) .bubble {
      right: calc(100% + 6px); left: auto; top: 50%; bottom: auto; transform: translateY(-50%);
    }
    :host([position='left']) .bubble::after {
      top: 50%; left: 100%; transform: translateY(-50%);
      border: 5px solid transparent; border-left-color: var(--fx-text-default, #1e293b);
    }
    /* right */
    :host([position='right']) .bubble {
      right: auto; left: calc(100% + 6px); top: 50%; bottom: auto; transform: translateY(-50%);
    }
    :host([position='right']) .bubble::after {
      top: 50%; left: auto; right: 100%; transform: translateY(-50%);
      border: 5px solid transparent; border-right-color: var(--fx-text-default, #1e293b);
    }
  `;
let FxTooltip = _FxTooltip;
function defineFxTooltip() {
  return defineElement("fx-tooltip", FxTooltip);
}
const DEFAULT_CONFIG = {
  position: "top"
};
class TooltipBehavior {
  constructor(element) {
    this.tooltipElement = null;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.show = () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.showTimeout = window.setTimeout(() => {
        if (this.tooltipElement) {
          this.tooltipElement.classList.add("fx-tooltip-visible");
        }
      }, 100);
    };
    this.hide = () => {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
      this.hideTimeout = window.setTimeout(() => {
        if (this.tooltipElement) {
          this.tooltipElement.classList.remove("fx-tooltip-visible");
        }
      }, 50);
    };
    this.element = element;
    this.config = this.parseConfig();
    this.init();
  }
  parseConfig() {
    const position = this.element.getAttribute("fx-tooltip-position");
    return {
      position: position && ["top", "bottom", "left", "right"].includes(position) ? position : DEFAULT_CONFIG.position,
      html: this.element.hasAttribute("fx-tooltip-html")
    };
  }
  init() {
    const computedStyle = window.getComputedStyle(this.element);
    if (computedStyle.position === "static") {
      this.element.style.position = "relative";
    }
    this.createTooltipElement();
    this.element.addEventListener("mouseenter", this.show);
    this.element.addEventListener("mouseleave", this.hide);
    this.element.addEventListener("focus", this.show);
    this.element.addEventListener("blur", this.hide);
  }
  createTooltipElement() {
    const content = this.element.getAttribute("fx-tooltip");
    if (!content) return;
    this.tooltipElement = document.createElement("span");
    this.tooltipElement.setAttribute("role", "tooltip");
    this.tooltipElement.setAttribute("data-fx-tooltip", "");
    this.tooltipElement.className = `fx-tooltip-bubble fx-tooltip-${this.config.position}`;
    if (this.config.html) {
      this.tooltipElement.innerHTML = content;
    } else {
      this.tooltipElement.textContent = content;
    }
    this.element.appendChild(this.tooltipElement);
  }
  update() {
    this.config = this.parseConfig();
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
    this.createTooltipElement();
  }
  destroy() {
    this.element.removeEventListener("mouseenter", this.show);
    this.element.removeEventListener("mouseleave", this.hide);
    this.element.removeEventListener("focus", this.show);
    this.element.removeEventListener("blur", this.hide);
    if (this.showTimeout) clearTimeout(this.showTimeout);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }
}
const _FxTooltipManager = class _FxTooltipManager {
  constructor() {
    this.observer = null;
    this.behaviors = /* @__PURE__ */ new Map();
    this.injectedStyles = null;
    this.injectStyles();
    this.observe();
    this.processExistingElements();
  }
  static getInstance() {
    if (!_FxTooltipManager.instance) {
      _FxTooltipManager.instance = new _FxTooltipManager();
    }
    return _FxTooltipManager.instance;
  }
  injectStyles() {
    if (document.getElementById("fx-tooltip-directive-styles")) return;
    this.injectedStyles = document.createElement("style");
    this.injectedStyles.id = "fx-tooltip-directive-styles";
    this.injectedStyles.textContent = getTooltipStyles();
    document.head.appendChild(this.injectedStyles);
  }
  observe() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.processElement(node);
              node.querySelectorAll("[fx-tooltip]").forEach((el) => this.processElement(el));
            }
          });
        }
        if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          if (target.hasAttribute("fx-tooltip")) {
            this.processElement(target);
          } else if (this.behaviors.has(target)) {
            this.removeBehavior(target);
          }
        }
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["fx-tooltip", "fx-tooltip-position", "fx-tooltip-html"]
    });
  }
  processExistingElements() {
    document.querySelectorAll("[fx-tooltip]").forEach((el) => this.processElement(el));
  }
  processElement(element) {
    if (!element.hasAttribute("fx-tooltip")) {
      this.removeBehavior(element);
      return;
    }
    if (this.behaviors.has(element)) {
      this.behaviors.get(element).update();
    } else {
      this.behaviors.set(element, new TooltipBehavior(element));
    }
  }
  removeBehavior(element) {
    const behavior = this.behaviors.get(element);
    if (behavior) {
      behavior.destroy();
      this.behaviors.delete(element);
    }
  }
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.behaviors.forEach((behavior) => behavior.destroy());
    this.behaviors.clear();
    if (this.injectedStyles) {
      this.injectedStyles.remove();
      this.injectedStyles = null;
    }
    _FxTooltipManager.instance = null;
  }
};
_FxTooltipManager.instance = null;
let FxTooltipManager = _FxTooltipManager;
function getTooltipStyles() {
  return (
    /* css */
    `
    [fx-tooltip] {
      position: relative;
    }

    .fx-tooltip-bubble {
      position: absolute;
      background: var(--fx-text-default, #1e293b);
      color: var(--fx-surface-background, #fff);
      font-family: var(--fx-font-family, system-ui, -apple-system, sans-serif);
      font-size: calc(var(--fx-font-size, 14px) - 2px);
      line-height: 1.45;
      padding: var(--fx-space-xs, 4px) var(--fx-space-md, 12px);
      border-radius: var(--fx-radius-sm, 4px);
      box-shadow: var(--fx-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      width: max-content;
      min-width: 60px;
      max-width: var(--fx-tooltip-max-width, 320px);
      white-space: normal;
      text-align: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease);
      z-index: var(--fx-z-tooltip, 1050);
      pointer-events: none;
    }

    .fx-tooltip-bubble.fx-tooltip-visible {
      opacity: 1;
      visibility: visible;
    }

    .fx-tooltip-top {
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
    }
    .fx-tooltip-top::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: var(--fx-text-default, #1e293b);
    }

    .fx-tooltip-bottom {
      top: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      bottom: auto;
    }
    .fx-tooltip-bottom::after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-bottom-color: var(--fx-text-default, #1e293b);
    }

    .fx-tooltip-left {
      right: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
      left: auto;
      bottom: auto;
    }
    .fx-tooltip-left::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-left-color: var(--fx-text-default, #1e293b);
    }

    .fx-tooltip-right {
      left: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
      right: auto;
      bottom: auto;
    }
    .fx-tooltip-right::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 100%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-right-color: var(--fx-text-default, #1e293b);
    }
  `
  );
}
function defineFxTooltipDirective() {
  if (typeof window === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      FxTooltipManager.getInstance();
    });
  } else {
    FxTooltipManager.getInstance();
  }
}
function destroyFxTooltipDirective() {
  FxTooltipManager.getInstance().destroy();
}
defineFxTooltip();
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
            data-tab="${esc(tabId)}" aria-selected="${tabId === active}"
            ${disabled ? 'aria-disabled="true" data-disabled="true"' : ""}>${esc(t.textContent?.trim() ?? "")}</button>`;
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
defineFxTabs();
defineFxTabPanel();
const _FxProgress = class _FxProgress extends FxElement {
  constructor() {
    super(...arguments);
    this._done = false;
  }
  static get observedAttributes() {
    return ["value", "indeterminate", "variant", "label", "hide-label", "size"];
  }
  get value() {
    return Number(this.getAttr("value", "0")) || 0;
  }
  set value(v) {
    this.setAttribute("value", String(Math.min(100, Math.max(0, v))));
  }
  render() {
    const pct = Math.min(100, Math.max(0, this.value));
    const indeterminate = this.hasAttr("indeterminate");
    const labelText = this.getAttr("label");
    const showPct = !indeterminate && !this.hasAttr("hide-label");
    this.setTemplate(`
      ${labelText ? `<div class="caption" part="caption">${esc(labelText)}</div>` : ""}
      <div class="row">
        <div class="track" part="track" role="progressbar"
          aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="bar" part="bar" style="width: ${indeterminate ? "40%" : `${pct}%`}"></div>
        </div>
        ${showPct ? `<span class="pct">${pct}%</span>` : ""}
      </div>
    `);
    if (!this._done && !this.hasAttr("indeterminate") && pct >= 100) {
      this._done = true;
      this.dispatchEvent(new CustomEvent("complete", { bubbles: true, composed: true }));
    }
    if (pct < 100) this._done = false;
  }
};
_FxProgress.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      --_color: var(--fx-color-primary);
    }
    :host([variant='success']) { --_color: var(--fx-color-success); }
    :host([variant='warning']) { --_color: var(--fx-color-warning); }
    :host([variant='danger']) { --_color: var(--fx-color-danger); }
    .row {
      display: flex;
      align-items: center;
      gap: var(--fx-space-md);
    }
    .track {
      flex: 1;
      height: 8px;
      background: var(--fx-surface-surface-hover);
      border-radius: var(--fx-radius-full);
      overflow: hidden;
    }
    :host([size='sm']) .track { height: 4px; }
    :host([size='lg']) .track { height: 12px; }
    .bar {
      height: 100%;
      width: 0%;
      background: var(--_color);
      border-radius: var(--fx-radius-full);
      transition: width var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([indeterminate]) .bar {
      width: 40%;
      animation: slide 1.2s ease-in-out infinite;
    }
    @keyframes slide {
      from { transform: translateX(-100%); }
      to { transform: translateX(350%); }
    }
    .pct {
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-default);
      font-weight: 600;
      min-width: 34px;
      text-align: right;
    }
    .caption {
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-muted);
      margin-bottom: var(--fx-space-xs);
    }
  `;
let FxProgress = _FxProgress;
function defineFxProgress() {
  return defineElement("fx-progress", FxProgress);
}
defineFxProgress();
const _FxSkeleton = class _FxSkeleton extends FxElement {
  static get observedAttributes() {
    return ["variant", "width", "height", "lines"];
  }
  /** Valida um valor de dimensão CSS, retornando-o seguro ou vazio. */
  safeSize(value) {
    const v = value.trim();
    return /^-?\d*\.?\d+(px|em|rem|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(v) ? v : "";
  }
  render() {
    const variant = this.getAttr("variant", "text");
    const width = this.safeSize(this.getAttr("width"));
    const height = this.safeSize(this.getAttr("height"));
    const style = `${width ? `width:${width};` : ""}${height ? `height:${height};` : ""}`;
    if (variant === "circle") {
      const size = height || width || "40px";
      const diameter = !style.includes("height") ? `width:${size};height:${size};` : style;
      this.setTemplate(`<div class="bone circle" part="bone" style="${diameter}"></div>`);
      return;
    }
    if (variant === "rect") {
      const s = style || "width:100%;height:80px;";
      this.setTemplate(`<div class="bone" part="bone" style="${s}"></div>`);
      return;
    }
    const lines = Number(this.getAttr("lines", "3")) || 3;
    this.setTemplate(`
      ${Array.from({ length: lines }, () => '<div class="bone text"></div>').join("")}
    `);
  }
};
_FxSkeleton.styles = css`
    :host { display: block; width: 100%; min-width: 80px; font-family: var(--fx-font-family); }
    .bone {
      background: linear-gradient(
        90deg,
        var(--fx-surface-surface-hover) 25%,
        color-mix(in srgb, var(--fx-surface-surface-hover) 55%, var(--fx-surface-background)) 50%,
        var(--fx-surface-surface-hover) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: var(--fx-radius-sm);
    }
    @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    .bone[hidden] { display: none; }
    .text { height: 12px; width: 100%; margin-bottom: var(--fx-space-sm); }
    .text:last-of-type { width: 60%; margin-bottom: 0; }
    .circle { border-radius: var(--fx-radius-full); }
  `;
let FxSkeleton = _FxSkeleton;
function defineFxSkeleton() {
  return defineElement("fx-skeleton", FxSkeleton);
}
defineFxSkeleton();
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
          ${title ? `<div class="title">${esc(title)}</div>` : ""}
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
defineFxAlert();
const _FxDropdown = class _FxDropdown extends FxElement {
  constructor() {
    super(...arguments);
    this._listenersAttached = false;
  }
  static get observedAttributes() {
    return ["label", "position", "open"];
  }
  get open() {
    return this.hasAttr("open");
  }
  set open(value) {
    this.toggleAttr("open", value);
  }
  render() {
    const label = this.getAttr("label", "Ações");
    const items = Array.from(this.querySelectorAll("fx-dropdown-item"));
    this.setTemplate(`
      <span class="trigger" role="button" tabindex="0" part="trigger"
        aria-haspopup="menu" aria-expanded="${this.open}">
        ${esc(label)} ▾
      </span>
      <div class="panel" role="menu" part="panel">
        ${items.length ? "" : '<div class="empty">Nenhuma ação</div>'}
        <slot></slot>
      </div>
    `);
    const trigger = this.root.querySelector(".trigger");
    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll("fx-dropdown[open]").forEach((d) => {
        if (d !== this) d.open = false;
      });
      this.open = !this.open;
    });
    trigger?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.open = !this.open;
      } else if (e.key === "Escape") {
        this.open = false;
      }
    });
    this._attachDelegatedListeners();
  }
  /** Delegação de cliques nos itens + fechamento ao clicar fora (registrado uma vez). */
  _attachDelegatedListeners() {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    this.addEventListener("click", (e) => {
      const item = e.composedPath().find(
        (n) => n.tagName?.toLowerCase() === "fx-dropdown-item"
      );
      if (!item) return;
      this.open = false;
      this.dispatchEvent(new CustomEvent("select", {
        bubbles: true,
        composed: true,
        detail: { value: item.getAttribute("value") ?? "" }
      }));
    });
    this.docListener = (e) => {
      if (!this.contains(e.target)) this.open = false;
    };
    document.addEventListener("click", this.docListener);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.docListener) document.removeEventListener("click", this.docListener);
    this.docListener = void 0;
  }
};
_FxDropdown.styles = css`
    :host {
      position: relative;
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .trigger { min-height: var(--fx-size-md); }
    .panel {
      position: absolute;
      top: calc(100% + 4px);
      min-width: 180px;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      padding: var(--fx-space-xs);
      z-index: var(--fx-z-dropdown, 1000);
      display: none;
    }
    :host([open]) .panel { display: block; }
    /* left = alinhado à esquerda do trigger; right = à direita; center = centrado */
    :host([position='left']) .panel,
    :host([position='bottom-left']) .panel { left: 0; right: auto; }
    :host([position='center']) .panel {
      left: 50%;
      transform: translateX(-50%);
    }
    :host([position='right']) .panel,
    :host([position='bottom-right']) .panel { right: 0; left: auto; }
    :host(:not([position])) .panel { left: 0; right: auto; }
    ::slotted(fx-dropdown-item) { display: block; }
    .empty { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); padding: var(--fx-space-sm); }
  `;
let FxDropdown = _FxDropdown;
const _FxDropdownItem = class _FxDropdownItem extends FxElement {
  static get observedAttributes() {
    return ["value"];
  }
  get value() {
    return this.getAttr("value");
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  render() {
    this.setTemplate('<button type="button" class="item" part="item" role="menuitem"><slot></slot></button>');
  }
};
_FxDropdownItem.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .item {
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
      border-radius: var(--fx-radius-sm);
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .item:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, var(--fx-surface-background)); color: var(--fx-color-primary); }
  `;
let FxDropdownItem = _FxDropdownItem;
function defineFxDropdown() {
  return defineElement("fx-dropdown", FxDropdown);
}
function defineFxDropdownItem() {
  return defineElement("fx-dropdown-item", FxDropdownItem);
}
defineFxDropdown();
defineFxDropdownItem();
const _FxDrawer = class _FxDrawer extends FxElement {
  constructor() {
    super(...arguments);
    this._onKeydown = () => {
    };
    this._previouslyFocused = null;
    this._close = () => {
      if (!this.open) return;
      this.open = false;
      this._restoreFocus();
      this.dispatchEvent(
        new CustomEvent("close", { bubbles: true, composed: true })
      );
    };
  }
  static get observedAttributes() {
    return ["open", "title", "position"];
  }
  get open() {
    return this.hasAttr("open");
  }
  set open(value) {
    this.toggleAttr("open", value);
  }
  get title() {
    return this.getAttr("title");
  }
  set title(v) {
    this.setAttribute("title", v);
  }
  get position() {
    const p = this.getAttr("position");
    return ["left", "right", "top", "bottom"].includes(p) ? p : "right";
  }
  set position(v) {
    this.setAttribute("position", v);
  }
  render() {
    const title = this.getAttr("title");
    this.setTemplate(`
      <div class="overlay" part="overlay"></div>
      <div class="panel" part="panel" role="dialog" aria-modal="true" aria-label="${esc(title || "Drawer")}" tabindex="-1">
        ${title !== "" ? `<div class="header" part="header"><span class="title">${esc(title)}</span><button type="button" class="close" part="close" aria-label="Fechar">✕</button></div>` : ""}
        <div class="body" part="body"><slot></slot></div>
      </div>
    `);
    this.root.querySelector(".overlay")?.addEventListener("click", this._close);
    this.root.querySelector(".close")?.addEventListener("click", this._close);
    if (this.open) {
      requestAnimationFrame(() => {
        if (this._previouslyFocused === null) {
          this._previouslyFocused = document.activeElement;
        }
        this.root.querySelector(".panel")?.focus();
      });
    }
  }
  connectedCallback() {
    super.connectedCallback?.();
    this._onKeydown = (e) => {
      if (e.key === "Escape" && this.open) {
        this._close();
      } else if (e.key === "Tab" && this.open) {
        this._trapFocus(e);
      }
    };
    document.addEventListener("keydown", this._onKeydown);
  }
  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeydown);
    this._restoreFocus();
    super.disconnectedCallback?.();
  }
  /** Mantém o foco dentro do drawer (WCAG 2.4.3 / 2.1.2). */
  _trapFocus(e) {
    const panel = this.root.querySelector(".panel");
    if (!panel) return;
    const focusables = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.root.activeElement;
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
  _restoreFocus() {
    if (this._previouslyFocused?.isConnected) this._previouslyFocused.focus();
    this._previouslyFocused = null;
  }
};
_FxDrawer.styles = css`
		:host {
			display: contents;
			font-family: var(--fx-font-family);
			font-size: var(--fx-font-size);
			color: var(--fx-text-default);
		}
		.overlay {
			display: none;
			position: fixed;
			inset: 0;
			background: color-mix(
				in srgb,
				var(--fx-text-default, #000) 45%,
				transparent
			);
			backdrop-filter: blur(3px);
			-webkit-backdrop-filter: blur(3px);
			z-index: var(--fx-z-overlay, 1090);
			animation: fade var(--fx-motion-duration-fast) var(--fx-motion-easing);
		}
		:host([open]) .overlay {
			display: block;
		}

		.panel {
			position: fixed;
			background: var(--fx-surface-background);
			box-shadow: var(--fx-shadow-xl);
			z-index: var(--fx-z-modal, 1000);
			display: flex;
			flex-direction: column;
			overflow: auto;
		}
		:host(:not([open])) .panel {
			display: none;
		}
		:host([open]) .panel {
			display: flex;
		}
		/* left / right — altura total, largura mínima fixa e expansível */
		:host([position="left"]) .panel,
		:host(:not([position])) .panel,
		:host([position="right"]) .panel {
			top: 0;
			bottom: 0;
			width: var(--fx-drawer-width, 360px);
			min-width: 300px;
			max-width: 90vw;
		}
		:host([position="left"]) .panel {
			left: 0;
		}
		:host([position="right"]) .panel,
		:host(:not([position])) .panel {
			right: 0;
		}

		/* top / bottom — largura total, altura mínima fixa e expansível */
		:host([position="top"]) .panel,
		:host([position="bottom"]) .panel {
			left: 0;
			right: 0;
			height: var(--fx-drawer-height, 280px);
			min-height: 180px;
			max-height: 85vh;
		}
		:host([position="top"]) .panel {
			top: 0;
		}
		:host([position="bottom"]) .panel {
			bottom: 0;
		}

		.header {
			display: flex;
			align-items: center;
			gap: var(--fx-space-sm);
			min-height: var(--fx-size-lg);
			padding: var(--fx-space-sm) var(--fx-space-md);
			border-bottom: 1px solid var(--fx-border-default);
			flex: none;
			position: sticky;
			top: 0;
			background: var(--fx-surface-background);
		}
		.title {
			font-weight: 700;
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.close {
			border: none;
			background: transparent;
			cursor: pointer;
			color: var(--fx-text-muted);
			width: 28px;
			height: 28px;
			line-height: 1;
			border-radius: var(--fx-radius-sm);
			font-size: 16px;
			transition: background var(--fx-motion-duration-fast)
				var(--fx-motion-easing);
		}
		.close:hover {
			background: color-mix(
				in srgb,
				var(--fx-color-danger) 14%,
				var(--fx-surface-background)
			);
			color: var(--fx-color-danger);
		}
		.body {
			padding: var(--fx-space-md);
			flex: 1;
		}
	`;
let FxDrawer = _FxDrawer;
function defineFxDrawer() {
  return defineElement("fx-drawer", FxDrawer);
}
defineFxDrawer();
const _FxPagination = class _FxPagination extends FxElement {
  static get observedAttributes() {
    return ["page", "total", "rows", "rows-options", "position"];
  }
  get page() {
    return Number(this.getAttr("page", "1")) || 1;
  }
  set page(v) {
    this.setAttribute("page", String(v));
  }
  get total() {
    return Number(this.getAttr("total", "0")) || 0;
  }
  set total(v) {
    this.setAttribute("total", String(v));
  }
  get rows() {
    return Number(this.getAttr("rows", "10")) || 10;
  }
  set rows(v) {
    this.setAttribute("rows", String(v));
  }
  get pages() {
    return Math.max(1, Math.ceil(this.total / this.rows));
  }
  render() {
    const pages = this.pages;
    const current = Math.min(Math.max(1, this.page), pages);
    const opts = (this.getAttr("rows-options", "5,10,20,50") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const window_ = [];
    for (let p = Math.max(1, current - 2); p <= Math.min(pages, current + 2); p++) window_.push(p);
    const from = total0(current, this.rows);
    const to = Math.min(current * this.rows, this.total);
    this.setTemplate(`
      <span class="info">${this.total ? `${from}-${to} de ${this.total}` : "0 itens"}</span>
      <button type="button" class="nav" part="prev" data-go="${current - 1}" ${current <= 1 ? "disabled" : ""}>‹</button>
      ${window_[0] !== 1 && pages > 5 ? `<button type="button" class="nav" data-go="1">1</button>` : ""}
      ${window_.map((p) => `<button type="button" class="nav ${p === current ? "active" : ""}" data-go="${p}">${p}</button>`).join("")}
      ${window_[window_.length - 1] !== pages && pages > 5 ? `<button type="button" class="nav" data-go="${pages}">${pages}</button>` : ""}
      <button type="button" class="nav" part="next" data-go="${current + 1}" ${current >= pages ? "disabled" : ""}>›</button>
      ${opts.length ? `
        <fx-select class="rows-sel" part="rows" size="sm" value="${this.rows}" aria-label="Itens por página">
          ${opts.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
        </fx-select>` : ""}
    `);
    function total0(page, rows) {
      return (page - 1) * rows + 1;
    }
    this.root.querySelectorAll(".nav[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.dataset.go);
        if (target >= 1 && target <= pages && target !== current) {
          this.page = target;
          this.emit();
        }
      });
    });
    const sel = this.root.querySelector("fx-select.rows-sel");
    sel?.addEventListener("change", (e) => {
      const value = Number(e.detail?.value);
      if (!value || value === this.rows) return;
      this.rows = value;
      this.page = 1;
      this.emit();
    });
  }
  emit() {
    this.dispatchEvent(new CustomEvent("page-change", {
      bubbles: true,
      composed: true,
      detail: { page: this.page, rows: this.rows }
    }));
  }
};
_FxPagination.styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    :host([position='center']) { justify-content: center; }
    :host([position='right']) { justify-content: flex-end; }
    .nav {
      min-width: var(--fx-size-sm);
      height: var(--fx-size-sm);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface-background);
      color: var(--fx-text-default);
      font-family: inherit;
      font-size: calc(var(--fx-font-size) - 2px);
      border-radius: var(--fx-radius-sm);
      cursor: pointer;
      padding: 0 var(--fx-space-sm);
      transition:
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .nav:hover:not([disabled]):not(.active) { border-color: var(--fx-color-primary); color: var(--fx-color-primary); }
    .nav[disabled] { opacity: 0.5; cursor: not-allowed; }
    .nav.active {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
      font-weight: 600;
    }
    .info { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); }
    fx-select { vertical-align: middle; }
    fx-select::part(trigger) {
      min-width: 64px !important;
      min-height: var(--fx-size-sm) !important;
      padding: 0 var(--fx-space-sm) !important;
      border-radius: var(--fx-radius-sm) !important;
      font-size: calc(var(--fx-font-size) - 2px) !important;
    }
  `;
let FxPagination = _FxPagination;
function defineFxPagination() {
  return defineElement("fx-pagination", FxPagination);
}
defineFxPagination();
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
defineFxAutocomplete();
const _FxKnob = class _FxKnob extends FxElement {
  constructor() {
    super(...arguments);
    this._isDragging = false;
    this._startY = 0;
    this._startValue = 0;
    this._onMouseMove = (e) => {
      if (!this._isDragging) return;
      const deltaY = this._startY - e.clientY;
      const sensitivity = (this.max - this.min) / 100;
      this.emitChange(this._startValue + deltaY * sensitivity);
    };
    this._onMouseUp = () => {
      this._isDragging = false;
      document.removeEventListener("mousemove", this._onMouseMove);
      document.removeEventListener("mouseup", this._onMouseUp);
    };
  }
  static get observedAttributes() {
    return [
      "value",
      "min",
      "max",
      "step",
      "size",
      "stroke-width",
      "value-color",
      "range-color",
      "readonly",
      "disabled",
      "value-template"
    ];
  }
  get value() {
    return this.clampValue(Number(this.getAttr("value", "0")) || 0);
  }
  set value(v) {
    if (this.readonly || this.disabled) return;
    const clamped = this.clampValue(v);
    const current = this.clampValue(Number(this.getAttr("value", "0")) || 0);
    if (clamped !== current) {
      this.setAttribute("value", String(clamped));
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          composed: true,
          detail: { value: clamped }
        })
      );
    }
  }
  get min() {
    return Number(this.getAttr("min", "0")) || 0;
  }
  set min(v) {
    this.setAttribute("min", String(v));
  }
  get max() {
    return Number(this.getAttr("max", "100")) || 100;
  }
  set max(v) {
    this.setAttribute("max", String(v));
  }
  get step() {
    return Number(this.getAttr("step", "1")) || 1;
  }
  set step(v) {
    this.setAttribute("step", String(v));
  }
  get size() {
    const s = this.getAttr("size", "md");
    return s === "sm" || s === "lg" ? s : "md";
  }
  set size(v) {
    this.setAttribute("size", v);
  }
  get strokeWidth() {
    return Number(this.getAttr("stroke-width", "8")) || 8;
  }
  set strokeWidth(v) {
    this.setAttribute("stroke-width", String(v));
  }
  get valueColor() {
    return this.getAttr("value-color", "");
  }
  set valueColor(v) {
    this.setAttribute("value-color", v);
  }
  get rangeColor() {
    return this.getAttr("range-color", "");
  }
  set rangeColor(v) {
    this.setAttribute("range-color", v);
  }
  get readonly() {
    return this.hasAttr("readonly");
  }
  set readonly(v) {
    this.toggleAttr("readonly", Boolean(v));
  }
  get disabled() {
    return this.hasAttr("disabled");
  }
  set disabled(v) {
    this.toggleAttr("disabled", Boolean(v));
  }
  get valueTemplate() {
    return this.getAttr("value-template", "{value}");
  }
  set valueTemplate(v) {
    this.setAttribute("value-template", v);
  }
  render() {
    const min = this.min;
    const max = this.max;
    const value = this.clampValue(this.value);
    const range = max - min;
    const pct = range > 0 ? (value - min) / range : 0;
    const sizeNum = this.getSizeNum();
    const strokeW = this.strokeWidth;
    const radius = (sizeNum - strokeW) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct);
    const vc = this.valueColor ? this.safeColor(this.valueColor) : "";
    const rc = this.rangeColor ? this.safeColor(this.rangeColor) : "";
    const valueColorStyle = vc ? `--_value-color: ${vc};` : "";
    const rangeColorStyle = rc ? `--_range-color: ${rc};` : "";
    const displayValue = this.valueTemplate.replace("{value}", String(Math.round(value)));
    this.setTemplate(`
      <div class="knob" part="knob" tabindex="${this.disabled ? "-1" : "0"}"
        role="slider" aria-valuenow="${value}" aria-valuemin="${min}" aria-valuemax="${max}"
        aria-readonly="${this.readonly}" aria-disabled="${this.disabled}"
        style="${valueColorStyle}${rangeColorStyle}">
        <svg viewBox="0 0 ${sizeNum} ${sizeNum}" part="svg">
          <circle class="track" part="track"
            cx="${sizeNum / 2}" cy="${sizeNum / 2}" r="${radius}" />
          <circle class="value" part="value"
            cx="${sizeNum / 2}" cy="${sizeNum / 2}" r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}" />
        </svg>
        <div class="label" part="label">${esc(displayValue)}</div>
      </div>
    `);
    this.attachListeners();
  }
  getSizeNum() {
    const s = this.size;
    if (s === "sm") return 60;
    if (s === "lg") return 140;
    return 100;
  }
  /** Valida um valor de cor CSS, retornando-o seguro ou vazio. */
  safeColor(value) {
    const v = value.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
    if (/^(rgb|rgba|hsl|hsla)\([\d\s.,%()]+\)$/i.test(v)) return v;
    if (/^var\(--[\w-]+(,\s*[^)]*)?\)$/.test(v)) return v;
    if (/^[a-zA-Z]+$/.test(v)) return v;
    return "";
  }
  clampValue(v) {
    const min = this.min;
    const max = this.max;
    const step = this.step;
    let clamped = Math.min(max, Math.max(min, v));
    if (step > 0) {
      clamped = Math.round((clamped - min) / step) * step + min;
      clamped = Math.min(max, Math.max(min, clamped));
    }
    return clamped;
  }
  emitChange(newValue) {
    const clamped = this.clampValue(newValue);
    if (clamped !== this.value) {
      this.value = clamped;
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          composed: true,
          detail: { value: clamped }
        })
      );
    }
  }
  attachListeners() {
    const knob = this.root.querySelector(".knob");
    if (!knob) return;
    knob.addEventListener("mousedown", (e) => {
      if (this.readonly || this.disabled) return;
      e.preventDefault();
      this._isDragging = true;
      this._startY = e.clientY;
      this._startValue = this.value;
      knob.focus();
      document.addEventListener("mousemove", this._onMouseMove);
      document.addEventListener("mouseup", this._onMouseUp);
    });
    knob.addEventListener("touchstart", (e) => {
      if (this.readonly || this.disabled) return;
      e.preventDefault();
      this._isDragging = true;
      this._startY = e.touches[0].clientY;
      this._startValue = this.value;
      knob.focus();
    }, { passive: false });
    knob.addEventListener("touchmove", (e) => {
      if (!this._isDragging || this.readonly || this.disabled) return;
      e.preventDefault();
      const deltaY = this._startY - e.touches[0].clientY;
      const sensitivity = (this.max - this.min) / 100;
      this.emitChange(this._startValue + deltaY * sensitivity);
    }, { passive: false });
    knob.addEventListener("touchend", () => {
      this._isDragging = false;
    });
    knob.addEventListener("keydown", (e) => {
      if (this.readonly || this.disabled) return;
      const step = this.step;
      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
          e.preventDefault();
          this.emitChange(this.value + step);
          break;
        case "ArrowDown":
        case "ArrowLeft":
          e.preventDefault();
          this.emitChange(this.value - step);
          break;
        case "Home":
          e.preventDefault();
          this.emitChange(this.min);
          break;
        case "End":
          e.preventDefault();
          this.emitChange(this.max);
          break;
        case "PageUp":
          e.preventDefault();
          this.emitChange(this.value + step * 10);
          break;
        case "PageDown":
          e.preventDefault();
          this.emitChange(this.value - step * 10);
          break;
      }
    });
  }
  disconnectedCallback() {
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    super.disconnectedCallback();
  }
};
_FxKnob.styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --_size: 100px;
      --_stroke-width: 8px;
      --_value-color: var(--fx-color-primary);
      --_range-color: var(--fx-border-default);
    }
    :host([size='sm']) { --_size: 60px; }
    :host([size='lg']) { --_size: 140px; }
    .knob {
      position: relative;
      width: var(--_size);
      height: var(--_size);
      cursor: pointer;
      user-select: none;
      touch-action: none;
    }
    :host([readonly]) .knob,
    :host([disabled]) .knob {
      cursor: default;
      pointer-events: none;
    }
    :host([disabled]) .knob {
      opacity: 0.55;
    }
    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .track {
      fill: none;
      stroke: var(--_range-color);
      stroke-width: var(--_stroke-width);
    }
    .value {
      fill: none;
      stroke: var(--_value-color);
      stroke-width: var(--_stroke-width);
      stroke-linecap: round;
      transition: stroke-dashoffset var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .label {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: var(--fx-text-default);
      pointer-events: none;
    }
    :host([size='sm']) .label { font-size: 11px; }
    :host([size='md']) .label { font-size: 14px; }
    :host([size='lg']) .label { font-size: 18px; }
    .knob:focus-visible {
      outline: none;
    }
    .knob:focus-visible svg {
      filter: drop-shadow(var(--fx-effect-focus-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)));
    }
  `;
let FxKnob = _FxKnob;
function defineFxKnob() {
  return defineElement("fx-knob", FxKnob);
}
defineFxKnob();
const _FxOrderList = class _FxOrderList extends FxElement {
  constructor() {
    super(...arguments);
    this._data = [];
    this._filteredData = null;
    this._selection = [];
    this._filterValue = "";
    this._draggedIndex = null;
    this._listenersAttached = false;
    this._optionTemplate = null;
  }
  static get observedAttributes() {
    return [
      "data",
      "data-key",
      "filter",
      "filter-by",
      "filter-placeholder",
      "breakpoint",
      "controls-location",
      "dragdrop",
      "striped",
      "selection-mode",
      "show-select-all"
    ];
  }
  set data(value) {
    this._data = value;
    this._filteredData = null;
    this.render();
  }
  get data() {
    return this._data;
  }
  set selection(value) {
    this._selection = value;
    this.render();
  }
  get selection() {
    return this._selection;
  }
  get dataKey() {
    return this.getAttr("data-key", "");
  }
  set dataKey(v) {
    this.setAttribute("data-key", v);
  }
  get filter() {
    return this.hasAttr("filter");
  }
  set filter(v) {
    this.toggleAttr("filter", v);
  }
  get filterBy() {
    return this.getAttr("filter-by", "label");
  }
  set filterBy(v) {
    this.setAttribute("filter-by", v);
  }
  get filterPlaceholder() {
    return this.getAttr("filter-placeholder", "Buscar...");
  }
  set filterPlaceholder(v) {
    this.setAttribute("filter-placeholder", v);
  }
  get breakpoint() {
    return this.getAttr("breakpoint", "960px");
  }
  set breakpoint(v) {
    this.setAttribute("breakpoint", v);
  }
  get dragdrop() {
    return this.hasAttr("dragdrop");
  }
  set dragdrop(v) {
    this.toggleAttr("dragdrop", v);
  }
  get striped() {
    return this.hasAttr("striped");
  }
  set striped(v) {
    this.toggleAttr("striped", v);
  }
  get selectionMode() {
    const s = this.getAttr("selection-mode", "");
    return s === "single" || s === "multiple" ? s : "";
  }
  set selectionMode(v) {
    this.setAttribute("selection-mode", v);
  }
  get showSelectAll() {
    return this.hasAttr("show-select-all");
  }
  set showSelectAll(v) {
    this.toggleAttr("show-select-all", v);
  }
  get filterValue() {
    return this._filterValue;
  }
  set filterValue(v) {
    this._filterValue = v;
    this._applyFilter();
    this._updateListDisplay();
  }
  setOptionTemplate(template) {
    this._optionTemplate = template;
    this.render();
  }
  connectedCallback() {
    this._parseDataAttribute();
    super.connectedCallback();
  }
  attributeChangedCallback() {
    if (this.getAttr("data", "") !== "") {
      this._parseDataAttribute();
    }
    super.attributeChangedCallback();
  }
  _parseDataAttribute() {
    const dataAttr = this.getAttr("data", "");
    if (dataAttr) {
      try {
        this._data = JSON.parse(dataAttr);
        this._filteredData = null;
      } catch {
        this._data = [];
      }
    }
  }
  _applyFilter() {
    if (!this._filterValue) {
      this._filteredData = null;
      return;
    }
    const filterFields = this.filterBy.split(",").map((f) => f.trim());
    this._filteredData = this._data.filter((item) => {
      return filterFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._filterValue.toLowerCase());
      });
    });
  }
  _getDisplayData() {
    return this._filteredData || this._data;
  }
  _getItemKey(item, index) {
    if (this.dataKey && item[this.dataKey] != null) {
      return String(item[this.dataKey]);
    }
    if (item["id"] != null) return String(item["id"]);
    if (item["key"] != null) return String(item["key"]);
    if (item["label"] != null) return String(item["label"]);
    if (item["name"] != null) return String(item["name"]);
    if (item["value"] != null) return String(item["value"]);
    return String(index);
  }
  _getItemLabel(item) {
    const fields = ["label", "name", "title", "text", "value"];
    for (const field of fields) {
      if (item[field] != null) {
        return String(item[field]);
      }
    }
    return JSON.stringify(item);
  }
  _isSelected(item) {
    return this._selection.some((s) => this._getItemKey(s, -1) === this._getItemKey(item, -1));
  }
  _moveItem(fromIndex, toIndex) {
    const actualFrom = this._getActualIndex(fromIndex);
    const actualTo = this._getActualIndex(toIndex);
    if (actualFrom === -1 || actualTo === -1) return;
    const item = this._data.splice(actualFrom, 1)[0];
    this._data.splice(actualTo, 0, item);
    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }
  _getActualIndex(displayIndex) {
    if (this._filteredData) {
      const item = this._filteredData[displayIndex];
      return this._data.findIndex((d) => this._getItemKey(d, -1) === this._getItemKey(item, -1));
    }
    return displayIndex;
  }
  _emitReorder() {
    this.dispatchEvent(new CustomEvent("reorder", {
      bubbles: true,
      composed: true,
      detail: { items: [...this._data] }
    }));
  }
  _emitSelectionChange() {
    this.dispatchEvent(new CustomEvent("selection-change", {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._selection] }
    }));
  }
  _toggleSelection(item) {
    const key2 = this._getItemKey(item, -1);
    const index = this._selection.findIndex((s) => this._getItemKey(s, -1) === key2);
    if (index >= 0) {
      this._selection.splice(index, 1);
    } else if (this.selectionMode === "multiple") {
      this._selection.push(item);
    } else {
      this._selection = [item];
    }
    this._emitSelectionChange();
    this._updateListDisplay();
    this._updateControlsState();
  }
  _selectAll() {
    const displayData = this._getDisplayData();
    this._selection = [...displayData];
    this._emitSelectionChange();
    this._updateListDisplay();
    this._updateControlsState();
  }
  _deselectAll() {
    this._selection = [];
    this._emitSelectionChange();
    this._updateListDisplay();
    this._updateControlsState();
  }
  _toggleSelectAll() {
    const displayData = this._getDisplayData();
    if (this._selection.length === displayData.length) {
      this._deselectAll();
    } else {
      this._selectAll();
    }
  }
  render() {
    const displayData = this._getDisplayData();
    const hasSelection = this.selectionMode;
    const hasMultipleSelection = this.selectionMode === "multiple";
    const allSelected = hasMultipleSelection && displayData.length > 0 && this._selection.length === displayData.length;
    this.setTemplate(`
      <div class="container" part="container">
        ${this.filter ? `
          <div class="filter-wrapper" part="filter-wrapper">
            <input type="text" class="filter-input" part="filter-input"
              placeholder="${this.filterPlaceholder}"
              value="${esc(this._filterValue)}"
              aria-label="Filtrar lista" />
          </div>
        ` : ""}
        <div class="main-row" part="main-row">
          <div class="controls-bar" part="controls-bar">
            <div class="control-group">
              <button class="control-btn" data-action="top" part="control-btn" aria-label="Mover para o inicio">
                <span class="control-btn-icon">«</span>
              </button>
              <button class="control-btn" data-action="up" part="control-btn" aria-label="Mover para cima">
                <span class="control-btn-icon">↑</span>
              </button>
            </div>
            <div class="control-group">
              <button class="control-btn" data-action="down" part="control-btn" aria-label="Mover para baixo">
                <span class="control-btn-icon">↓</span>
              </button>
              <button class="control-btn" data-action="bottom" part="control-btn" aria-label="Mover para o fim">
                <span class="control-btn-icon">»</span>
              </button>
            </div>
          </div>
          <div class="list-wrapper" part="list-wrapper">
            ${hasMultipleSelection && this.showSelectAll ? `
              <div class="select-all-bar" part="select-all-bar">
                <label>
                  <input type="checkbox" class="select-all-checkbox"
                    ${allSelected ? "checked" : ""}
                    aria-label="Selecionar todos" />
                  Selecionar Todos
                </label>
                <span class="selection-count">${this._selection.length} selecionado(s)</span>
              </div>
            ` : ""}
            <ul class="list" part="list" role="listbox"
              aria-multiselectable="${hasMultipleSelection}"
              tabindex="0">
              ${displayData.length === 0 ? `
                <li class="empty-message" part="empty-message">
                  ${this.filter ? "Nenhum resultado encontrado" : "Nenhum item disponivel"}
                </li>
              ` : displayData.map((item, index) => {
      const key2 = this._getItemKey(item, index);
      const label = this._getItemLabel(item);
      const isSelected = this._isSelected(item);
      const content = this._optionTemplate ? this._optionTemplate(item) : esc(label);
      return `
                  <li class="list-item${isSelected ? " selected" : ""}" part="list-item"
                    data-index="${index}" data-key="${esc(key2)}"
                    role="option" aria-selected="${isSelected}"
                    ${this.dragdrop ? 'draggable="true"' : ""}
                    tabindex="0">
                    ${this.dragdrop ? '<span class="drag-handle" part="drag-handle" aria-label="Arrastar">⋮⋮</span>' : ""}
                    ${hasSelection ? `
                      <input type="checkbox" class="checkbox" part="checkbox"
                        ${isSelected ? "checked" : ""}
                        aria-label="Selecionar ${esc(label)}" />
                    ` : ""}
                    <span class="item-content" part="item-content">${content}</span>
                  </li>
                `;
    }).join("")}
            </ul>
          </div>
        </div>
      </div>
    `);
    this._attachListeners();
    this._attachItemListeners(this.root.querySelector(".list"));
    this._updateControlsState();
  }
  _attachListeners() {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    const root = this.root;
    root.addEventListener("input", (e) => {
      const t = e.target;
      if (t.classList.contains("filter-input")) {
        this.filterValue = t.value;
      }
    });
    root.addEventListener("change", (e) => {
      const t = e.target;
      if (t.classList.contains("select-all-checkbox")) {
        this._toggleSelectAll();
      }
    });
    root.addEventListener("click", (e) => {
      const target = e.target;
      const btn = target.closest(".control-btn");
      if (btn) {
        this._handleMoveAction(btn.dataset.action);
      }
    });
    let dragOverElement = null;
    root.addEventListener("dragstart", (e) => {
      const target = e.target.closest(".list-item");
      if (!target) return;
      this._draggedIndex = Number(target.dataset.index);
      target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    root.addEventListener("dragend", (e) => {
      const target = e.target;
      target.classList.remove("dragging");
      this._draggedIndex = null;
      root.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
      dragOverElement = null;
    });
    root.addEventListener("dragover", (e) => {
      e.preventDefault();
      const target = e.target.closest(".list-item");
      if (!target || target.classList.contains("dragging")) return;
      if (dragOverElement) dragOverElement.classList.remove("drag-over");
      target.classList.add("drag-over");
      dragOverElement = target;
    });
    root.addEventListener("drop", (e) => {
      e.preventDefault();
      if (this._draggedIndex === null) return;
      const target = e.target.closest(".list-item");
      if (!target) return;
      const toIndex = Number(target.dataset.index);
      target.classList.remove("drag-over");
      dragOverElement = null;
      this._moveItem(this._draggedIndex, toIndex);
      this._draggedIndex = null;
    });
    this._updateControlsState();
  }
  _attachItemListeners(list) {
    if (!list) return;
    list.addEventListener("click", (e) => {
      const target = e.target;
      const itemEl = target.closest(".list-item");
      if (!itemEl) return;
      if (target.classList.contains("checkbox")) {
        e.stopPropagation();
        const idxC = Number(itemEl.dataset.index);
        this._toggleSelection(this._getDisplayData()[idxC]);
        return;
      }
      const idxI = Number(itemEl.dataset.index);
      this._toggleSelection(this._getDisplayData()[idxI]);
    });
    list.addEventListener("keydown", (e) => {
      const target = e.target;
      if (!target.classList.contains("list-item")) return;
      const items = Array.from(list.querySelectorAll(".list-item"));
      const currentIndex = items.indexOf(target);
      const ke = e;
      switch (ke.key) {
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex > 0) items[currentIndex - 1].focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < items.length - 1) items[currentIndex + 1].focus();
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          if (this.selectionMode) {
            const index = Number(target.dataset.index);
            this._toggleSelection(this._getDisplayData()[index]);
          }
          break;
      }
    });
  }
  _updateListDisplay() {
    const listWrapper = this.root.querySelector(".list-wrapper");
    if (!listWrapper) {
      this.render();
      return;
    }
    const displayData = this._getDisplayData();
    const hasSelection = this.selectionMode;
    const hasMultipleSelection = this.selectionMode === "multiple";
    const allSelected = hasMultipleSelection && displayData.length > 0 && this._selection.length === displayData.length;
    listWrapper.innerHTML = `
      ${hasMultipleSelection && this.showSelectAll ? `
        <div class="select-all-bar" part="select-all-bar">
          <label>
            <input type="checkbox" class="select-all-checkbox"
              ${allSelected ? "checked" : ""}
              aria-label="Selecionar todos" />
            Selecionar Todos
          </label>
          <span class="selection-count">${this._selection.length} selecionado(s)</span>
        </div>
      ` : ""}
      <ul class="list" part="list" role="listbox"
        aria-multiselectable="${hasMultipleSelection}"
        tabindex="0">
        ${displayData.length === 0 ? `
          <li class="empty-message" part="empty-message">
            ${this.filter ? "Nenhum resultado encontrado" : "Nenhum item disponivel"}
          </li>
        ` : displayData.map((item, index) => {
      const key2 = this._getItemKey(item, index);
      const label = this._getItemLabel(item);
      const isSelected = this._isSelected(item);
      const content = this._optionTemplate ? this._optionTemplate(item) : esc(label);
      return `
            <li class="list-item${isSelected ? " selected" : ""}" part="list-item"
              data-index="${index}" data-key="${esc(key2)}"
              role="option" aria-selected="${isSelected}"
              ${this.dragdrop ? 'draggable="true"' : ""}
              tabindex="0">
              ${this.dragdrop ? '<span class="drag-handle" part="drag-handle" aria-label="Arrastar">⋮⋮</span>' : ""}
              ${hasSelection ? `
                <input type="checkbox" class="checkbox" part="checkbox"
                  ${isSelected ? "checked" : ""}
                  aria-label="Selecionar ${esc(label)}" />
              ` : ""}
              <span class="item-content" part="item-content">${content}</span>
            </li>
          `;
    }).join("")}
            </ul>
    `;
    this._attachListeners();
    this._attachItemListeners(this.root.querySelector(".list"));
  }
  _handleMoveAction(action) {
    if (!this._selection.length) return;
    const displayData = this._getDisplayData();
    const selectedIndices = this._selection.map((s) => displayData.findIndex((d) => this._getItemKey(d, -1) === this._getItemKey(s, -1))).filter((i) => i >= 0).sort((a, b) => a - b);
    if (selectedIndices.length === 0) return;
    switch (action) {
      case "top":
        this._moveSelectedToStart(selectedIndices);
        break;
      case "up":
        this._moveSelectedByOne(selectedIndices, -1);
        break;
      case "down":
        this._moveSelectedByOne(selectedIndices, 1);
        break;
      case "bottom":
        this._moveSelectedToEnd(selectedIndices);
        break;
    }
  }
  _moveSelectedToStart(indices) {
    const items = [];
    const actualIndices = [];
    for (const idx of indices) {
      const actualIdx = this._getActualIndex(idx);
      items.push(this._data[actualIdx]);
      actualIndices.push(actualIdx);
    }
    actualIndices.sort((a, b) => b - a).forEach((i) => this._data.splice(i, 1));
    const insertIdx = this._getActualIndex(0);
    this._data.splice(insertIdx, 0, ...items);
    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }
  _moveSelectedToEnd(indices) {
    const items = [];
    const actualIndices = [];
    for (const idx of indices) {
      const actualIdx = this._getActualIndex(idx);
      items.push(this._data[actualIdx]);
      actualIndices.push(actualIdx);
    }
    actualIndices.sort((a, b) => b - a).forEach((i) => this._data.splice(i, 1));
    const displayData = this._getDisplayData();
    const insertIdx = this._getActualIndex(displayData.length - 1);
    this._data.splice(insertIdx + 1, 0, ...items);
    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }
  _moveSelectedByOne(indices, delta) {
    const displayData = this._getDisplayData();
    if (displayData.length === 0) return;
    const actualIndices = indices.map((idx) => this._getActualIndex(idx)).filter((idx) => idx >= 0).sort((a, b) => a - b);
    if (actualIndices.length === 0) return;
    if (delta < 0 && actualIndices[0] <= 0) return;
    if (delta > 0 && actualIndices[actualIndices.length - 1] >= this._data.length - 1) return;
    const selectedItems = actualIndices.map((idx) => this._data[idx]);
    for (let i = actualIndices.length - 1; i >= 0; i--) {
      this._data.splice(actualIndices[i], 1);
    }
    let insertIndex;
    if (delta < 0) {
      insertIndex = actualIndices[0] - 1;
    } else {
      insertIndex = actualIndices[actualIndices.length - 1] - actualIndices.length + 1 + 1;
    }
    insertIndex = Math.max(0, Math.min(insertIndex, this._data.length));
    this._data.splice(insertIndex, 0, ...selectedItems);
    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }
  _updateControlsState() {
    const displayData = this._getDisplayData();
    const selectedIndices = this._selection.map((s) => displayData.findIndex((d) => this._getItemKey(d, -1) === this._getItemKey(s, -1))).filter((i) => i >= 0);
    const buttons = this.root.querySelectorAll(".control-btn");
    buttons.forEach((btn) => {
      const action = btn.dataset.action;
      let disabled = selectedIndices.length === 0;
      if (!disabled) {
        switch (action) {
          case "top":
          case "up":
            disabled = selectedIndices[0] === 0;
            break;
          case "bottom":
          case "down":
            disabled = selectedIndices[selectedIndices.length - 1] === displayData.length - 1;
            break;
        }
      }
      btn.disabled = disabled;
    });
  }
};
_FxOrderList.styles = css`

    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --orderlist-primary: var(--fx-color-primary, #3b82f6);
      --orderlist-border: var(--fx-border-default, #e2e8f0);
      --orderlist-bg: var(--fx-surface-background, #ffffff);
      --orderlist-bg-hover: var(--fx-surface-surface-hover, #f1f5f9);
      --orderlist-text: var(--fx-text-default, #1e293b);
      --orderlist-text-muted: var(--fx-text-muted, #64748b);
      --orderlist-radius: var(--fx-radius-md, 8px);
      --orderlist-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      --orderlist-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    * { box-sizing: border-box; }
    .container { display: flex; flex-direction: column; gap: var(--fx-space-md, 16px); }
    .list-wrapper { display: flex; flex-direction: column; gap: var(--fx-space-sm, 8px); flex: 1; min-width: 0; }
    .select-all-bar { display: flex; align-items: center; justify-content: space-between; padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px); background: linear-gradient(135deg, var(--orderlist-bg), var(--orderlist-bg-hover)); border: 1px solid var(--orderlist-border); border-radius: var(--orderlist-radius); font-size: 0.9em; font-weight: 500; }
    .select-all-bar label { display: flex; align-items: center; gap: var(--fx-space-sm, 10px); cursor: pointer; user-select: none; color: var(--orderlist-text); }
    .select-all-bar input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--orderlist-primary); cursor: pointer; }
    .filter-wrapper { margin-bottom: var(--fx-space-xs, 4px); }
    .filter-input { width: 100%; padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px); padding-left: 42px; border: 1.5px solid var(--orderlist-border); border-radius: var(--orderlist-radius); font-family: inherit; font-size: inherit; color: var(--orderlist-text); background: var(--orderlist-bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 14px center; transition: var(--orderlist-transition); }
    .filter-input:focus { outline: none; border-color: var(--orderlist-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--orderlist-primary) 20%, transparent); }
    .filter-input::placeholder { color: var(--orderlist-text-muted); }
    .main-row { display: flex; align-items: stretch; gap: var(--fx-space-sm, 8px); }
    .list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--orderlist-border); border-radius: var(--orderlist-radius); overflow: hidden; box-shadow: var(--orderlist-shadow); max-height: 450px; overflow-y: auto; flex: 1; }
    .list::-webkit-scrollbar { width: 6px; }
    .list::-webkit-scrollbar-track { background: transparent; }
    .list::-webkit-scrollbar-thumb { background: var(--orderlist-border); border-radius: 3px; }
    .list::-webkit-scrollbar-thumb:hover { background: var(--orderlist-text-muted); }
    .selection-count { font-size: 0.85em; color: var(--orderlist-primary); background: color-mix(in srgb, var(--orderlist-primary) 12%, transparent); padding: 4px 12px; border-radius: 20px; font-weight: 600; }
    :host([striped]) .list-item:nth-child(even) { background: var(--fx-surface-surface, #f8fafc); }
    .list-item { display: flex; align-items: center; gap: var(--fx-space-sm, 10px); padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px); background: var(--orderlist-bg); border-bottom: 1px solid var(--orderlist-border); cursor: pointer; user-select: none; transition: var(--orderlist-transition); }
    .list-item:last-child { border-bottom: none; }
    .list-item:hover { background: var(--orderlist-bg-hover); }
    .list-item.selected { background: color-mix(in srgb, var(--orderlist-primary) 8%, transparent); border-left: 3px solid var(--orderlist-primary); padding-left: 11px; }
    .list-item:focus-visible { outline: none; background: color-mix(in srgb, var(--orderlist-primary) 15%, transparent); }
    .list-item.dragging { opacity: 0.5; background: var(--orderlist-bg-hover); }
    .list-item.drag-over { border-top: 2px solid var(--orderlist-primary); }
    .drag-handle { color: var(--orderlist-text-muted); cursor: grab; flex-shrink: 0; font-size: 1.2em; opacity: 0.6; transition: var(--orderlist-transition); }
    .drag-handle:hover { opacity: 1; }
    .drag-handle:active { cursor: grabbing; }
    .item-content { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .checkbox { flex-shrink: 0; width: 18px; height: 18px; accent-color: var(--orderlist-primary); cursor: pointer; transition: var(--orderlist-transition); }
    .checkbox:hover { transform: scale(1.1); }
    .empty-message { padding: var(--fx-space-xl, 32px); text-align: center; color: var(--orderlist-text-muted); font-style: italic; }
    .controls-bar {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: var(--fx-space-xs, 6px);
      background: var(--orderlist-bg);
      border: 1px solid var(--orderlist-border);
      border-radius: var(--orderlist-radius);
      box-shadow: var(--orderlist-shadow);
      height: fit-content;
      position: sticky;
      top: 0;
      align-self: flex-start;
    }
    .control-group { display: flex; flex-direction: column; gap: 3px; }
    .control-group + .control-group { margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--orderlist-border); }
    button.control-btn { display: flex; align-items: center; justify-content: center; width: 42px; height: 38px; padding: 0; border: none; border-radius: 8px; background: transparent; color: var(--orderlist-text-muted); cursor: pointer; font-size: 16px; line-height: 1; transition: var(--orderlist-transition); position: relative; }
    button.control-btn:hover:not(:disabled) { background: var(--orderlist-bg-hover); color: var(--orderlist-primary); transform: scale(1.1); }
    button.control-btn:active:not(:disabled) { transform: scale(0.92); background: color-mix(in srgb, var(--orderlist-primary) 15%, transparent); }
    button.control-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--orderlist-primary) 30%, transparent); }
    button.control-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
    .control-btn-icon { font-size: 18px; line-height: 1; }
    /* Tooltip nos botoes */
    button.control-btn:hover::after { opacity: 1; transform: translateY(-50%) translateX(0); }
    @media (max-width: 640px) { .main-row { flex-direction: column; } .controls-bar { flex-direction: row; flex-wrap: wrap; justify-content: center; position: relative; } .control-group { flex-direction: row; } .control-group + .control-group { margin-top: 0; margin-left: 4px; padding-top: 0; padding-left: 4px; border-top: none; border-left: 1px solid var(--orderlist-border); } button.control-btn { width: 44px; height: 40px; } button.control-btn::after { display: none; } .list { max-height: 300px; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    .list-item { animation: slideIn 0.2s ease-out; }
    `;
let FxOrderList = _FxOrderList;
function defineFxOrderList() {
  return defineElement("fx-orderlist", FxOrderList);
}
defineFxOrderList();
const _FxPickList = class _FxPickList extends FxElement {
  constructor() {
    super(...arguments);
    this._source = [];
    this._filteredSource = null;
    this._target = [];
    this._filteredTarget = null;
    this._sourceSelection = [];
    this._targetSelection = [];
    this._sourceFilterValue = "";
    this._targetFilterValue = "";
    this._filterListenersAttached = false;
    this._optionTemplate = null;
  }
  static get observedAttributes() {
    return [
      "source",
      "target",
      "source-key",
      "target-key",
      "filter",
      "filter-by",
      "filter-placeholder",
      "dragdrop",
      "striped",
      "selection-mode",
      "show-select-all",
      "source-label",
      "target-label"
    ];
  }
  set source(value) {
    this._source = value;
    this._filteredSource = null;
    this.render();
  }
  get source() {
    return this._source;
  }
  set target(value) {
    this._target = value;
    this._filteredTarget = null;
    this.render();
  }
  get target() {
    return this._target;
  }
  set sourceSelection(value) {
    this._sourceSelection = value;
    this.render();
  }
  get sourceSelection() {
    return this._sourceSelection;
  }
  set targetSelection(value) {
    this._targetSelection = value;
    this.render();
  }
  get targetSelection() {
    return this._targetSelection;
  }
  get sourceKey() {
    return this.getAttr("source-key", "");
  }
  set sourceKey(v) {
    this.setAttribute("source-key", v);
  }
  get targetKey() {
    return this.getAttr("target-key", "");
  }
  set targetKey(v) {
    this.setAttribute("target-key", v);
  }
  get filter() {
    return this.hasAttr("filter");
  }
  set filter(v) {
    this.toggleAttr("filter", v);
  }
  get filterBy() {
    return this.getAttr("filter-by", "label");
  }
  set filterBy(v) {
    this.setAttribute("filter-by", v);
  }
  get filterPlaceholder() {
    return this.getAttr("filter-placeholder", "Buscar...");
  }
  set filterPlaceholder(v) {
    this.setAttribute("filter-placeholder", v);
  }
  get dragdrop() {
    return this.hasAttr("dragdrop");
  }
  set dragdrop(v) {
    this.toggleAttr("dragdrop", v);
  }
  get striped() {
    return this.hasAttr("striped");
  }
  set striped(v) {
    this.toggleAttr("striped", v);
  }
  get selectionMode() {
    const s = this.getAttr("selection-mode", "");
    return s === "single" || s === "multiple" ? s : "";
  }
  set selectionMode(v) {
    this.setAttribute("selection-mode", v);
  }
  get showSelectAll() {
    return this.hasAttr("show-select-all");
  }
  set showSelectAll(v) {
    this.toggleAttr("show-select-all", v);
  }
  get sourceLabel() {
    return this.getAttr("source-label", "Disponíveis");
  }
  set sourceLabel(v) {
    this.setAttribute("source-label", v);
  }
  get targetLabel() {
    return this.getAttr("target-label", "Selecionados");
  }
  set targetLabel(v) {
    this.setAttribute("target-label", v);
  }
  get sourceFilterValue() {
    return this._sourceFilterValue;
  }
  set sourceFilterValue(v) {
    this._sourceFilterValue = v;
    this._applySourceFilter();
    this._updateListDisplay();
  }
  get targetFilterValue() {
    return this._targetFilterValue;
  }
  set targetFilterValue(v) {
    this._targetFilterValue = v;
    this._applyTargetFilter();
    this._updateListDisplay();
  }
  setOptionTemplate(template) {
    this._optionTemplate = template;
    this.render();
  }
  connectedCallback() {
    this._parseSourceAttribute();
    this._parseTargetAttribute();
    super.connectedCallback();
  }
  attributeChangedCallback() {
    if (this.getAttr("source", "") !== "") {
      this._parseSourceAttribute();
    }
    if (this.getAttr("target", "") !== "") {
      this._parseTargetAttribute();
    }
    super.attributeChangedCallback();
  }
  _parseSourceAttribute() {
    const dataAttr = this.getAttr("source", "");
    if (dataAttr) {
      try {
        this._source = JSON.parse(dataAttr);
        this._filteredSource = null;
      } catch {
        this._source = [];
      }
    }
  }
  _parseTargetAttribute() {
    const dataAttr = this.getAttr("target", "");
    if (dataAttr) {
      try {
        this._target = JSON.parse(dataAttr);
        this._filteredTarget = null;
      } catch {
        this._target = [];
      }
    }
  }
  _applySourceFilter() {
    if (!this._sourceFilterValue) {
      this._filteredSource = null;
      return;
    }
    const filterFields = this.filterBy.split(",").map((f) => f.trim());
    this._filteredSource = this._source.filter((item) => {
      return filterFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._sourceFilterValue.toLowerCase());
      });
    });
  }
  _applyTargetFilter() {
    if (!this._targetFilterValue) {
      this._filteredTarget = null;
      return;
    }
    const filterFields = this.filterBy.split(",").map((f) => f.trim());
    this._filteredTarget = this._target.filter((item) => {
      return filterFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._targetFilterValue.toLowerCase());
      });
    });
  }
  _getDisplaySource() {
    return this._filteredSource || this._source;
  }
  _getDisplayTarget() {
    return this._filteredTarget || this._target;
  }
  _getItemKey(item, index, isSource) {
    const keyField = isSource ? this.sourceKey : this.targetKey;
    if (keyField && item[keyField] != null) {
      return String(item[keyField]);
    }
    if (item["id"] != null) return String(item["id"]);
    if (item["key"] != null) return String(item["key"]);
    if (item["label"] != null) return String(item["label"]);
    if (item["name"] != null) return String(item["name"]);
    if (item["value"] != null) return String(item["value"]);
    return String(index);
  }
  _getItemLabel(item) {
    const fields = ["label", "name", "title", "text", "value"];
    for (const field of fields) {
      if (item[field] != null) {
        return String(item[field]);
      }
    }
    return JSON.stringify(item);
  }
  _isSourceSelected(item, index) {
    return this._sourceSelection.some((s) => this._getItemKey(s, -1, true) === this._getItemKey(item, index, true));
  }
  _isTargetSelected(item, index) {
    return this._targetSelection.some((s) => this._getItemKey(s, -1, false) === this._getItemKey(item, index, false));
  }
  _emitMoveToTarget() {
    this.dispatchEvent(new CustomEvent("move-to-target", {
      bubbles: true,
      composed: true,
      detail: { items: [...this._sourceSelection], source: [...this._source], target: [...this._target] }
    }));
  }
  _emitMoveToSource() {
    this.dispatchEvent(new CustomEvent("move-to-source", {
      bubbles: true,
      composed: true,
      detail: { items: [...this._targetSelection], source: [...this._source], target: [...this._target] }
    }));
  }
  _emitSelectionChangeSource() {
    this.dispatchEvent(new CustomEvent("selection-change-source", {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._sourceSelection] }
    }));
  }
  _emitSelectionChangeTarget() {
    this.dispatchEvent(new CustomEvent("selection-change-target", {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._targetSelection] }
    }));
  }
  render() {
    const dSrc = this._getDisplaySource();
    const dTgt = this._getDisplayTarget();
    const hasSel = this.selectionMode;
    const showAll = hasSel === "multiple" && this.showSelectAll;
    const srcItems = dSrc.length === 0 ? `<li class="empty-message">${this.filter ? "Nenhum resultado" : "Nenhum item"}</li>` : dSrc.map((item, i) => `<li class="list-item${this._isSourceSelected(item, i) ? " selected" : ""}" data-index="${i}" data-list="source" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox"' + (this._isSourceSelected(item, i) ? " checked" : "") + " />" : ""}<span class="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join("");
    const tgtItems = dTgt.length === 0 ? `<li class="empty-message">${this.filter ? "Nenhum resultado" : "Nenhum selecionado"}</li>` : dTgt.map((item, i) => `<li class="list-item${this._isTargetSelected(item, i) ? " selected" : ""}" data-index="${i}" data-list="target" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox"' + (this._isTargetSelected(item, i) ? " checked" : "") + " />" : ""}<span class="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join("");
    const srcAllBar = showAll ? `<div class="select-all-bar" part="select-all-bar"><label><input type="checkbox" class="select-all-checkbox" data-list="source" ${this._sourceSelection.length > 0 && this._sourceSelection.length === this._source.length ? "checked" : ""} aria-label="Selecionar todos da origem" /> Selecionar Todos</label><span class="selection-count">${this._sourceSelection.length} selecionado(s)</span></div>` : "";
    const tgtAllBar = showAll ? `<div class="select-all-bar" part="select-all-bar"><label><input type="checkbox" class="select-all-checkbox" data-list="target" ${this._targetSelection.length > 0 && this._targetSelection.length === this._target.length ? "checked" : ""} aria-label="Selecionar todos do destino" /> Selecionar Todos</label><span class="selection-count">${this._targetSelection.length} selecionado(s)</span></div>` : "";
    this.setTemplate(`<div class="container"><div class="list-container"><div class="list-label">${esc(this.sourceLabel)} (${this._source.length})</div>${this.filter ? '<div class="filter-wrapper"><input type="text" class="filter-input source-filter" placeholder="' + this.filterPlaceholder + '" value="' + esc(this._sourceFilterValue) + '" /></div>' : ""}${srcAllBar}<div class="list-wrapper"><ul class="list source-list" role="listbox" tabindex="0">${srcItems}</ul></div></div><div class="controls"><div class="control-group"><button class="control-btn" data-action="move-all-target" part="control-btn" aria-label="Mover todos para destino"><span class="control-btn-icon">»</span></button><button class="control-btn" data-action="move-target" part="control-btn" aria-label="Mover para destino"><span class="control-btn-icon">→</span></button></div><div class="control-group"><button class="control-btn" data-action="move-source" part="control-btn" aria-label="Mover para origem"><span class="control-btn-icon">←</span></button><button class="control-btn" data-action="move-all-source" part="control-btn" aria-label="Mover todos para origem"><span class="control-btn-icon">«</span></button></div></div><div class="list-container"><div class="list-label">${esc(this.targetLabel)} (${this._target.length})</div>${this.filter ? '<div class="filter-wrapper"><input type="text" class="filter-input target-filter" placeholder="' + this.filterPlaceholder + '" value="' + esc(this._targetFilterValue) + '" /></div>' : ""}${tgtAllBar}<div class="list-wrapper"><ul class="list target-list" role="listbox" tabindex="0">${tgtItems}</ul></div></div></div>`);
    this._attachListeners();
  }
  _attachListeners() {
    if (!this._filterListenersAttached) {
      this._filterListenersAttached = true;
      this.root.addEventListener("input", (e) => {
        const t = e.target;
        if (t.classList.contains("select-all-checkbox")) {
          this._handleSelectAll(t);
          return;
        }
        if (t.classList.contains("source-filter")) {
          this.sourceFilterValue = t.value;
        } else if (t.classList.contains("target-filter")) {
          this.targetFilterValue = t.value;
        }
      });
      this.root.addEventListener("click", (e) => {
        const t = e.target;
        const btn = t.closest(".control-btn");
        if (btn) {
          switch (btn.dataset.action) {
            case "move-target":
              this._moveToTarget();
              break;
            case "move-all-target":
              this._moveAllToTarget();
              break;
            case "move-source":
              this._moveToSource();
              break;
            case "move-all-source":
              this._moveAllToSource();
              break;
          }
          return;
        }
        const el = t.closest(".list-item");
        if (!el) return;
        const isSrc = el.dataset.list === "source";
        const idx = Number(el.dataset.index);
        const item = (isSrc ? this._getDisplaySource() : this._getDisplayTarget())[idx];
        if (isSrc) this._toggleSourceSelection(item, idx);
        else this._toggleTargetSelection(item, idx);
      });
    }
    this._updateControlsState();
  }
  _handleSelectAll(checkbox) {
    const isSrc = checkbox.dataset.list === "source";
    if (isSrc) {
      this._sourceSelection = checkbox.checked ? [...this._getDisplaySource()] : [];
      this._emitSelectionChangeSource();
    } else {
      this._targetSelection = checkbox.checked ? [...this._getDisplayTarget()] : [];
      this._emitSelectionChangeTarget();
    }
    this._updateSelectionDisplay();
    this._updateControlsState();
  }
  /**
   * Atualiza a selecao visual in-place (classes e checkboxes dos itens existentes),
   * sem recriar o DOM — mantendo referencias de elementos validas durante cliques.
   */
  _updateSelectionDisplay() {
    const updateList = (listSel, isSelFn, getData) => {
      if (!listSel) return;
      listSel.querySelectorAll(".list-item").forEach((el) => {
        const idx = Number(el.dataset.index);
        const selected = isSelFn(getData()[idx], idx);
        el.classList.toggle("selected", selected);
        el.setAttribute("aria-selected", String(selected));
        const cb = el.querySelector(".checkbox");
        if (cb) cb.checked = selected;
      });
    };
    updateList(this.root.querySelector(".source-list"), (it, i) => this._isSourceSelected(it, i), () => this._getDisplaySource());
    updateList(this.root.querySelector(".target-list"), (it, i) => this._isTargetSelected(it, i), () => this._getDisplayTarget());
    this._updateSelectAllBars();
  }
  /** Sincroniza as barras "Selecionar Todos" (checkbox + contador) sem re-render completo. */
  _updateSelectAllBars() {
    if (!(this.selectionMode === "multiple" && this.showSelectAll)) return;
    const bars = [
      { el: this.root.querySelector('.select-all-checkbox[data-list="source"]'), total: this._source.length, sel: this._sourceSelection.length },
      { el: this.root.querySelector('.select-all-checkbox[data-list="target"]'), total: this._target.length, sel: this._targetSelection.length }
    ];
    bars.forEach(({ el, total, sel }) => {
      if (!el) return;
      el.checked = total > 0 && sel === total;
      const count = el.closest(".select-all-bar")?.querySelector(".selection-count");
      if (count) count.textContent = `${sel} selecionado(s)`;
    });
  }
  _updateControlsState() {
    this.root.querySelectorAll(".control-btn").forEach((btn) => {
      const a = btn.dataset.action;
      btn.disabled = a === "move-target" && this._sourceSelection.length === 0 || a === "move-all-target" && this._source.length === 0 || a === "move-source" && this._targetSelection.length === 0 || a === "move-all-source" && this._target.length === 0;
    });
  }
  _moveToTarget() {
    if (!this._sourceSelection.length) return;
    const items = [...this._sourceSelection];
    this._source = this._source.filter((s) => !items.some((i) => this._getItemKey(i, -1, true) === this._getItemKey(s, -1, true)));
    this._target = [...this._target, ...items];
    this._sourceSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToTarget();
  }
  _moveToSource() {
    if (!this._targetSelection.length) return;
    const items = [...this._targetSelection];
    this._target = this._target.filter((t) => !items.some((i) => this._getItemKey(i, -1, false) === this._getItemKey(t, -1, false)));
    this._source = [...this._source, ...items];
    this._targetSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToSource();
  }
  _moveAllToTarget() {
    const items = [...this._source];
    this._source = [];
    this._target = [...this._target, ...items];
    this._sourceSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToTarget();
  }
  _moveAllToSource() {
    const items = [...this._target];
    this._target = [];
    this._source = [...this._source, ...items];
    this._targetSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToSource();
  }
  _toggleSourceSelection(item, index) {
    const mode = this.selectionMode || "single";
    const key2 = this._getItemKey(item, index, true);
    const idx = this._sourceSelection.findIndex((s) => this._getItemKey(s, -1, true) === key2);
    if (idx >= 0) {
      this._sourceSelection.splice(idx, 1);
    } else if (mode === "multiple") {
      this._sourceSelection.push(item);
    } else {
      this._sourceSelection = [item];
    }
    this._emitSelectionChangeSource();
    this._updateSelectionDisplay();
    this._updateControlsState();
  }
  _toggleTargetSelection(item, index) {
    const mode = this.selectionMode || "single";
    const key2 = this._getItemKey(item, index, false);
    const idx = this._targetSelection.findIndex((s) => this._getItemKey(s, -1, false) === key2);
    if (idx >= 0) {
      this._targetSelection.splice(idx, 1);
    } else if (mode === "multiple") {
      this._targetSelection.push(item);
    } else {
      this._targetSelection = [item];
    }
    this._emitSelectionChangeTarget();
    this._updateSelectionDisplay();
    this._updateControlsState();
  }
  _updateListDisplay() {
    const srcWrapper = this.root.querySelector(".source-list")?.parentElement;
    const tgtWrapper = this.root.querySelector(".target-list")?.parentElement;
    const srcLabel = this.root.querySelector(".list-container:first-of-type .list-label");
    const tgtLabel = this.root.querySelector(".list-container:last-of-type .list-label");
    if (!srcWrapper || !tgtWrapper) {
      this.render();
      return;
    }
    const dSrc = this._getDisplaySource();
    const dTgt = this._getDisplayTarget();
    const hasSel = this.selectionMode;
    const srcItems = dSrc.length === 0 ? `<li class="empty-message" part="empty-message">${this.filter ? "Nenhum resultado" : "Nenhum item"}</li>` : dSrc.map((item, i) => `<li class="list-item${this._isSourceSelected(item, i) ? " selected" : ""}" part="list-item" data-index="${i}" data-list="source" role="option" aria-selected="${this._isSourceSelected(item, i)}" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox" part="checkbox"' + (this._isSourceSelected(item, i) ? " checked" : "") + " />" : ""}<span class="item-content" part="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join("");
    const tgtItems = dTgt.length === 0 ? `<li class="empty-message" part="empty-message">${this.filter ? "Nenhum resultado" : "Nenhum selecionado"}</li>` : dTgt.map((item, i) => `<li class="list-item${this._isTargetSelected(item, i) ? " selected" : ""}" part="list-item" data-index="${i}" data-list="target" role="option" aria-selected="${this._isTargetSelected(item, i)}" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox" part="checkbox"' + (this._isTargetSelected(item, i) ? " checked" : "") + " />" : ""}<span class="item-content" part="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join("");
    srcWrapper.innerHTML = `<ul class="list source-list" role="listbox" tabindex="0">${srcItems}</ul>`;
    tgtWrapper.innerHTML = `<ul class="list target-list" role="listbox" tabindex="0">${tgtItems}</ul>`;
    if (srcLabel) srcLabel.textContent = `${this.sourceLabel} (${this._source.length})`;
    if (tgtLabel) tgtLabel.textContent = `${this.targetLabel} (${this._target.length})`;
    this._updateSelectAllBars();
    this._attachListeners();
  }
};
_FxPickList.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --picklist-primary: var(--fx-color-primary, #3b82f6);
      --picklist-border: var(--fx-border-default, #e2e8f0);
      --picklist-bg: var(--fx-surface-background, #ffffff);
      --picklist-bg-hover: var(--fx-surface-surface-hover, #f1f5f9);
      --picklist-text: var(--fx-text-default, #1e293b);
      --picklist-text-muted: var(--fx-text-muted, #64748b);
      --picklist-radius: var(--fx-radius-md, 8px);
      --picklist-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      --picklist-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    * { box-sizing: border-box; }
    .container {
      display: flex;
      gap: var(--fx-space-sm, 8px);
      align-items: stretch;
    }
    .list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-sm, 8px);
      min-width: 0;
    }
    .list-label {
      font-weight: 600;
      color: var(--picklist-text);
      font-size: calc(var(--fx-font-size) - 1px);
    }
    .select-all-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px);
      background: linear-gradient(135deg, var(--picklist-bg), var(--picklist-bg-hover));
      border: 1px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      font-size: 0.9em;
      font-weight: 500;
    }
    .select-all-bar label {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm, 10px);
      cursor: pointer;
      user-select: none;
      color: var(--picklist-text);
    }
    .select-all-bar input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--picklist-primary);
      cursor: pointer;
    }
    .selection-count {
      font-size: 0.85em;
      color: var(--picklist-primary);
      background: color-mix(in srgb, var(--picklist-primary) 12%, transparent);
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 4px;
      justify-content: center;
      padding: var(--fx-space-xs, 6px);
      background: var(--picklist-bg);
      border: 1px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      box-shadow: var(--picklist-shadow);
      height: fit-content;
      position: sticky;
      top: 0;
      align-self: center;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .control-group + .control-group {
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px solid var(--picklist-border);
    }
    .list-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-sm, 8px);
    }
    .filter-wrapper {
      margin-bottom: var(--fx-space-xs, 4px);
    }
    .filter-input {
      width: 100%;
      box-sizing: border-box;
      padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px);
      padding-left: 42px;
      border: 1.5px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      font-family: inherit;
      font-size: inherit;
      color: var(--picklist-text);
      background: var(--picklist-bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 14px center;
      transition: var(--picklist-transition);
    }
    .filter-input:focus {
      outline: none;
      border-color: var(--picklist-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--picklist-primary) 20%, transparent);
    }
    .filter-input::placeholder {
      color: var(--picklist-text-muted);
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      overflow: hidden;
      box-shadow: var(--picklist-shadow);
      min-height: 200px;
      max-height: 450px;
      overflow-y: auto;
      flex: 1;
    }
    .list::-webkit-scrollbar { width: 6px; }
    .list::-webkit-scrollbar-track { background: transparent; }
    .list::-webkit-scrollbar-thumb { background: var(--picklist-border); border-radius: 3px; }
    .list::-webkit-scrollbar-thumb:hover { background: var(--picklist-text-muted); }
    :host([striped]) .list-item:nth-child(even) {
      background: var(--fx-surface-surface, #f8fafc);
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm, 10px);
      padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px);
      background: var(--picklist-bg);
      border-bottom: 1px solid var(--picklist-border);
      cursor: pointer;
      user-select: none;
      transition: var(--picklist-transition);
    }
    .list-item:last-child { border-bottom: none; }
    .list-item:hover { background: var(--picklist-bg-hover); }
    .list-item.selected {
      background: color-mix(in srgb, var(--picklist-primary) 8%, transparent);
      border-left: 3px solid var(--picklist-primary);
      padding-left: 11px;
    }
    .list-item:focus-visible {
      outline: none;
      background: color-mix(in srgb, var(--picklist-primary) 15%, transparent);
    }
    .checkbox {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      accent-color: var(--picklist-primary);
      cursor: pointer;
      transition: var(--picklist-transition);
    }
    .checkbox:hover { transform: scale(1.1); }
    .item-content {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty-message {
      padding: var(--fx-space-xl, 32px);
      text-align: center;
      color: var(--picklist-text-muted);
      font-style: italic;
    }
    button.control-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 38px;
      padding: 0;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--picklist-text-muted);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      transition: var(--picklist-transition);
      position: relative;
    }
    button.control-btn:hover:not(:disabled) {
      background: var(--picklist-bg-hover);
      color: var(--picklist-primary);
      transform: scale(1.1);
    }
    button.control-btn:active:not(:disabled) {
      transform: scale(0.92);
      background: color-mix(in srgb, var(--picklist-primary) 15%, transparent);
    }
    button.control-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--picklist-primary) 30%, transparent);
    }
    button.control-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
    .control-btn-icon { font-size: 18px; line-height: 1; }

    button.control-btn:hover::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    @media (max-width: 640px) {
      .container { flex-direction: column; }
      .controls {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        position: relative;
      }
      .control-group { flex-direction: row; }
      .control-group + .control-group {
        margin-top: 0;
        margin-left: 4px;
        padding-top: 0;
        padding-left: 4px;
        border-top: none;
        border-left: 1px solid var(--picklist-border);
      }
      button.control-btn { width: 44px; height: 40px; }
      button.control-btn::after { display: none; }
      .list { max-height: 300px; min-height: 150px; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .list-item { animation: slideIn 0.2s ease-out; }
  `;
let FxPickList = _FxPickList;
function defineFxPickList() {
  return defineElement("fx-picklist", FxPickList);
}
defineFxPickList();
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
defineFxAccordion();
defineFxAccordionPanel();
export {
  FX_JSX_TYPES,
  FenixToast,
  FenixUI,
  FxAccordion,
  FxAccordionPanel,
  FxAlert,
  FxAutocomplete,
  FxBadge,
  FxButton,
  FxCalendar,
  FxCheckbox,
  FxDatepicker,
  FxDialog,
  FxDrawer,
  FxDropdown,
  FxDropdownItem,
  FxElement,
  FxFloatlabel,
  FxInput,
  FxKnob,
  FxMultiselect,
  FxOrderList,
  FxPagination,
  FxPickList,
  FxProgress,
  FxRadio,
  FxSelect,
  FxSkeleton,
  FxSpinner,
  FxSwitch,
  FxTabPanel,
  FxTable,
  FxTabs,
  FxTextarea,
  FxToast,
  FxTooltip,
  VERSION,
  applyPreset,
  applyTokens,
  configure,
  css,
  darkTokens,
  deepMerge,
  defaultTokens,
  defineCustomPreset,
  defineElement,
  defineFxTooltipDirective,
  destroyFxTooltipDirective,
  esc,
  kebabToCamel,
  lightTokens,
  listPresets,
  resetTheme,
  sanitizeData,
  setTokens,
  stripTags,
  theme,
  themePresets,
  tokenCssVars
};
//# sourceMappingURL=fenix-ui2.esm.js.map
