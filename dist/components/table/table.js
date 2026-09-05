import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
import { esc } from "../../core/sanitize.js";
import { renderCell } from "./expr.js";
import "../select/index.js";
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
export {
  FxTable,
  defineFxTable
};
//# sourceMappingURL=table.js.map
