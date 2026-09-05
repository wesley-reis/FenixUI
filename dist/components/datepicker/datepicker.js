import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
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
export {
  FxDatepicker,
  defineFxDatepicker
};
//# sourceMappingURL=datepicker.js.map
