import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxTable = class _FxTable extends FxElement {
  constructor() {
    super(...arguments);
    this.data = [];
    this.page = 0;
    this.sortField = "";
    this.sortDir = 1;
    this.filters = {};
  }
  static get observedAttributes() {
    return ["pagination", "rows", "rows-options", "striped", "empty-message", "pagination-position"];
  }
  get rowsPerPage() {
    const r = Number(this.getAttr("rows", "10"));
    return r > 0 ? r : 10;
  }
  set rowsPerPage(value) {
    this.setAttribute("rows", String(value));
  }
  /** Colunas declaradas no light DOM (<fx-column>). */
  get columns() {
    return [...this.querySelectorAll("fx-column")].map((c) => ({
      field: c.getAttribute("field") ?? "",
      header: c.getAttribute("header") ?? c.getAttribute("field") ?? "",
      sortable: c.hasAttribute("sortable"),
      filterable: c.hasAttribute("filterable"),
      align: c.getAttribute("align") ?? "left",
      template: c.querySelector("template") ?? void 0
    }));
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.data.length) {
      try {
        const json = this.getAttr("data");
        if (json) this.data = JSON.parse(json);
      } catch {
      }
    }
    new MutationObserver(() => this.render()).observe(this, { childList: true, subtree: true });
  }
  /** Pipeline: filtra → ordena → pagina. */
  computeRows() {
    let out = [...this.data];
    for (const [field, term] of Object.entries(this.filters)) {
      if (!term) continue;
      const t = term.toLowerCase();
      out = out.filter((r) => String(r[field] ?? "").toLowerCase().includes(t));
    }
    const total = out.length;
    if (this.sortField) {
      out.sort((a, b) => {
        const av = a[this.sortField], bv = b[this.sortField];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * this.sortDir;
        return String(av ?? "").localeCompare(String(bv ?? ""), "pt-BR") * this.sortDir;
      });
    }
    if (this.hasAttr("pagination")) {
      const start = this.page * this.rowsPerPage;
      out = out.slice(start, start + this.rowsPerPage);
    }
    return { rows: out, total };
  }
  /** Célula: template customizado ({{value}}, {{campo}}, {{row}}) ou valor direto. */
  cellHtml(col, row) {
    const value = row[col.field];
    if (col.template) {
      return col.template.innerHTML.replace(/\{\{(\w+)\}\}/g, (_, k) => k === "value" ? String(value ?? "") : k === "row" ? "" : String(row[k] ?? ""));
    }
    return String(value ?? "");
  }
  render() {
    const cols = this.columns.filter((c) => c.field);
    const { rows, total } = this.computeRows();
    const paginated = this.hasAttr("pagination");
    const pages = Math.max(1, Math.ceil(total / this.rowsPerPage));
    if (this.page >= pages) this.page = pages - 1;
    const headHtml = cols.map((c) => {
      const ind = this.sortField === c.field ? this.sortDir === 1 ? "▲" : "▼" : "";
      return `<th part="header" class="${c.sortable ? "sortable" : ""}" style="text-align:${c.align}" data-field="${c.field}">${c.header}${ind ? `<span class="sort-ind">${ind}</span>` : ""}</th>`;
    }).join("");
    const filterRow = cols.some((c) => c.filterable) ? `<tr class="filter-row">${cols.map((c) => `<th style="text-align:${c.align}">${c.filterable ? `<input class="filter" data-field="${c.field}" placeholder="Filtrar…" value="${this.filters[c.field] ?? ""}">` : ""}</th>`).join("")}</tr>` : "";
    const bodyHtml = rows.length ? rows.map((row, i) => `<tr part="row" data-index="${i}">${cols.map((c) => `<td part="cell" style="text-align:${c.align}">${this.cellHtml(c, row)}</td>`).join("")}</tr>`).join("") : `<tr><td class="empty" colspan="${cols.length || 1}">${this.getAttr("empty-message", "Nenhum registro encontrado")}</td></tr>`;
    const pagerHtml = !paginated ? "" : `
      <div class="pager" part="pager">
        <span class="info">Página ${this.page + 1} de ${pages} · ${total} registros</span>
        <button type="button" class="pg-btn" data-pg="first" ${this.page === 0 ? "disabled" : ""}>«</button>
        <button type="button" class="pg-btn" data-pg="prev" ${this.page === 0 ? "disabled" : ""}>‹</button>
        ${Array.from({ length: pages }, (_, p) => `<button type="button" class="pg-btn" data-pg="${p}" aria-current="${p === this.page}">${p + 1}</button>`).join("")}
        <button type="button" class="pg-btn" data-pg="next" ${this.page >= pages - 1 ? "disabled" : ""}>›</button>
        <button type="button" class="pg-btn" data-pg="last" ${this.page >= pages - 1 ? "disabled" : ""}>»</button>
        <label class="info">Por página:
          <select class="rows-sel">${this.getAttr("rows-options", "5,10,20,50").split(",").map((n) => n.trim()).map((n) => `<option value="${n}" ${Number(n) === this.rowsPerPage ? "selected" : ""}>${n}</option>`).join("")}</select>
        </label>
      </div>`;
    this.setTemplate(`
      <div class="scroll">
        <table part="table">
          <thead><tr>${headHtml}</tr>${filterRow}</thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
      ${pagerHtml}
    `);
    this.root.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const f = th.dataset.field;
        if (this.sortField === f) this.sortDir = this.sortDir === 1 ? -1 : 1;
        else {
          this.sortField = f;
          this.sortDir = 1;
        }
        this.render();
        this.dispatchEvent(new CustomEvent("sort-change", {
          bubbles: true,
          composed: true,
          detail: { field: this.sortField, direction: this.sortDir === 1 ? "asc" : "desc" }
        }));
      });
    });
    this.root.querySelectorAll(".filter").forEach((inp) => {
      inp.addEventListener("input", () => {
        this.filters[inp.dataset.field] = inp.value;
        this.page = 0;
        const field = inp.dataset.field;
        const pos = inp.selectionStart;
        this.render();
        const again = this.root.querySelector(`.filter[data-field="${field}"]`);
        if (again) {
          again.focus();
          again.setSelectionRange(pos, pos);
        }
      });
      inp.addEventListener("click", (e) => e.stopPropagation());
    });
    this.root.querySelectorAll(".pg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pg = btn.dataset.pg;
        this.page = pg === "first" ? 0 : pg === "prev" ? Math.max(0, this.page - 1) : pg === "next" ? Math.min(pages - 1, this.page + 1) : pg === "last" ? pages - 1 : Number(pg);
        this.render();
        this.dispatchEvent(new CustomEvent("page-change", {
          bubbles: true,
          composed: true,
          detail: { page: this.page + 1, pages, rowsPerPage: this.rowsPerPage, total }
        }));
      });
    });
    this.root.querySelector(".rows-sel")?.addEventListener("change", (e) => {
      this.rowsPerPage = Number(e.target.value);
      this.page = 0;
      this.render();
    });
    this.root.querySelectorAll("tbody tr[data-index]").forEach((tr) => {
      tr.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("row-click", {
          bubbles: true,
          composed: true,
          detail: { row: rows[Number(tr.dataset.index)], index: Number(tr.dataset.index) }
        }));
      });
    });
  }
};
_FxTable.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    .scroll { overflow-x: auto; border: 1px solid var(--fx-border-default); border-radius: var(--fx-radius-md); }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: var(--fx-space-sm) var(--fx-space-md);
      background: var(--fx-surface-background);
      border-bottom: 2px solid var(--fx-border-default);
      white-space: nowrap;
      user-select: none;
    }
    th.sortable { cursor: pointer; }
    th.sortable:hover { color: var(--fx-color-primary); }
    .sort-ind { font-size: calc(var(--fx-font-size) - 4px); margin-left: var(--fx-space-3xs, 2px); }
    .filter-row th { padding: var(--fx-space-3xs, 4px) var(--fx-space-md) var(--fx-space-sm); border-bottom-width: 1px; }
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
    .filter:focus { border-color: var(--fx-color-primary); box-shadow: var(--fx-effect-focus-ring, none); }
    td {
      padding: var(--fx-space-sm) var(--fx-space-md);
      border-bottom: 1px solid var(--fx-border-default);
    }
    tbody tr { cursor: pointer; transition: background-color var(--fx-motion-duration-fast) var(--fx-motion-easing); }
    tbody tr:hover { background: color-mix(in srgb, var(--fx-color-primary) 8%, transparent); }
    :host([striped]) tbody tr:nth-child(even) { background: var(--fx-surface-background); }
    :host([striped]) tbody tr:hover { background: color-mix(in srgb, var(--fx-color-primary) 8%, transparent); }
    .empty { text-align: center; padding: var(--fx-space-xl); color: var(--fx-text-muted); }
    .pager {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      flex-wrap: wrap;
      padding: var(--fx-space-sm) 0;
    }
    :host([pagination-position='center']) .pager { justify-content: center; }
    :host([pagination-position='right']) .pager { justify-content: flex-end; }
    .pager .info { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); }
    .pg-btn {
      font: inherit;
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-default);
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-sm);
      padding: var(--fx-space-3xs, 4px) var(--fx-space-sm);
      cursor: pointer;
      transition: border-color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .pg-btn:hover:not(:disabled) { border-color: var(--fx-color-primary); color: var(--fx-color-primary); }
    .pg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pg-btn[aria-current='true'] {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
      font-weight: var(--fx-font-weight);
    }
    .rows-sel {
      font: inherit;
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-default);
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-sm);
      padding: 2px var(--fx-space-xs);
      outline: none;
    }
  `;
let FxTable = _FxTable;
function defineFxTable() {
  return defineElement("fx-table", FxTable);
}
export {
  FxTable,
  defineFxTable
};
//# sourceMappingURL=table.js.map
