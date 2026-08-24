import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
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
    return ["value", "start", "end", "min", "max", "range", "mode", "values", "locale", "disabled"];
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
    return new Date(Math.floor(k / 1e4), Math.floor(k / 100) % 100 - 1, k % 100);
  }
  iso(k) {
    const d = this.keyToDate(k);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  /** Seleção atual para pintura (chaves). */
  selection() {
    const multi = new Set(this.values.map((iso) => parseBound(iso)?.lo ?? 0).filter(Boolean));
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
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail }));
    } else if (this.mode === "multiple") {
      const values = this.values;
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { values } }));
    } else {
      const value = this.getAttr("value");
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { value } }));
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
      if (k < this.pickStart) [this.pickStart, this.pickEnd] = [k, this.pickStart];
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
      days: this.fmt({ month: "long", year: "numeric" }, new Date(this.cursor.y, this.cursor.m, 1)),
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
      (b) => b.addEventListener("click", () => this.navigate(Number(b.dataset.nav)))
    );
    const gotoBtn = this.root.querySelector("[data-goto]");
    gotoBtn?.addEventListener("click", () => {
      this.view = gotoBtn.dataset.goto;
      this.render();
    });
    this.root.querySelectorAll("[data-day]").forEach(
      (b) => b.addEventListener("click", () => this.pickDay(Number(b.dataset.day)))
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
      const cls = ["cell", isSel ? "sel" : "", inRange ? "in-range" : "", k === todayK ? "today" : ""].filter(Boolean).join(" ");
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
    :host([disabled]) { opacity: 0.55; pointer-events: none; }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fx-space-xs);
      margin-bottom: var(--fx-space-xs);
    }
    .nav,
    .title {
      border: none;
      background: none;
      color: var(--fx-text-default);
      cursor: pointer;
      font: inherit;
      border-radius: var(--fx-radius-sm);
      padding: var(--fx-space-3xs, 4px) var(--fx-space-xs);
    }
    .nav:hover, .title:hover { background: var(--fx-surface-surface-hover); }
    .title { font-weight: var(--fx-font-weight); text-transform: capitalize; flex: 1; }
    .grid {
      display: grid;
      grid-template-columns: repeat(7, 34px);
      gap: 2px;
    }
    .grid.months, .grid.years { grid-template-columns: repeat(4, minmax(52px, 1fr)); }
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
    .cell:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, transparent); }
    .cell.muted { color: var(--fx-text-disabled); }
    .cell.today::after {
      content: '';
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
    .cell.sel::after { background: #fff; }
    .cell.in-range {
      background: color-mix(in srgb, var(--fx-color-primary) 16%, transparent);
      border-radius: 0;
    }
    .grid.months .cell, .grid.years .cell { height: 40px; }
    .cell[disabled] { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
  `;
let FxCalendar = _FxCalendar;
function defineFxCalendar() {
  return defineElement("fx-calendar", FxCalendar);
}
export {
  FxCalendar,
  defineFxCalendar
};
//# sourceMappingURL=calendar.js.map
