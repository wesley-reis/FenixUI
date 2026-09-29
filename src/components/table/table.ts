import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from "../../core/sanitize";
import { FENIX_ICON_BASE_CSS, fenixIconHtml } from '../../icons/base-css';
import { loadFenixIconsFont } from '../../icons/font';
import { renderCell } from "./expr";
import "../select";

/**
 * <fx-table> — Tabela de dados estilo DataTable (dados + colunas configuráveis,
 * ordenação, filtros por coluna, paginação personalizável, busca global na toolbar
 * e modo lazy para busca no servidor).
 *
 * Colunas (light DOM):
 *   <fx-column field="nome" header="Nome" sortable filterable align="left">
 *     opcional: <fx-cell>R$ {{value}}</fx-cell> para render customizado
 *     ou conteúdo direto (HTML + {{ }}) como template alternativo
 *   </fx-column>
 *
 *   IMPORTANTE (frameworks): use <fx-cell>, NÃO <template>. A tag nativa
 *   <template> é reservada — o Vue 3 a transforma em bloco do compilador e o
 *   React gerencia os filhos, então o innerHTML chega vazio. <fx-cell> é uma
 *   tag própria, sem significado especial para nenhum framework. A forma
 *   antiga com <template> continua funcionando (compatibilidade) e há ainda
 *   a opção `template="#id"` apontando para um <template> externo.
 *
 * ⚠️ REGRA DO v-pre (Vue) — o conteúdo do <fx-cell> é TEXTO CRU:
 *   {{ }} é avaliado pelo motor de expressões do <fx-table> (./expr.ts) e
 *   NÃO pelo Vue. Sem `v-pre`, o compilador do Vue consome a interpolação
 *   antes: emite `_toDisplayString(_ctx.value | _ctx.number)`, o conteúdo
 *   chega sem as chaves no innerHTML e o vue-tsc acusa `value`/`number`
 *   inexistentes no escopo. → SEMPRE use <fx-cell v-pre> no Vue.
 *
 *   Cada framework tem a sua neutralização (todas verificadas por compilador):
 *   - Vue 3 / Nuxt .... v-pre        <fx-cell v-pre>{{ value }}</fx-cell>
 *   - React / JSX ..... string JS     <fx-cell>{'{{ value }}'}</fx-cell>
 *                      (o `{{ }}` solto é ERRO de sintaxe no parser JSX)
 *   - Angular ......... ngNonBindable <fx-cell ngNonBindable>…</fx-cell>
 *   - Svelte .......... string JS ou entidades HTML
 *                      {'{{ value }}'}  ou  &lbrace;&lbrace; value &rbrace;&rbrace;
 *   - HTML/CDN/JSF/JSP  nada         <fx-cell>{{ value }}</fx-cell>
 *
 * Toolbar (opcional):
 *   <fx-toolbar>
 *     <input data-search-fields="nome,cargo" placeholder="Buscar…">
 *     <button>Nova ação</button>
 *   </fx-toolbar>
 *   (legado ainda aceito: <template slot="toolbar">…</template>)
 *
 * Dados: propriedade `data` (array de objetos) ou atributo `data` (JSON).
 *
 * Atributos: pagination, rows, rows-options, pagination-position (left|center|right),
 * striped, hover, empty-message, lazy, total, loading, loading-message,
 * sort-field, sort-order.
 * Eventos: page-change, sort-change, row-click, filter-change (todos composed).
 */
export class FxTable extends FxElement {
	static override styles = css`
		${FENIX_ICON_BASE_CSS}
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
		/* Listrado: alterna a superfície (cinza). Antes usava
		   --fx-surface-background, que é a MESMA cor do fundo do :host e
		   portanto pintava branco sobre branco (listrado invisível). */
		:host([striped]) tbody tr:nth-child(even) {
			background: var(--fx-surface-surface, #f8fafc);
		}
		/* O hover é opt-in via atributo (o clique na linha continua sempre ativo). */
		:host([hover]) tbody tr:hover {
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
			display: inline-flex;
			align-items: center;
			justify-content: center;
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
		/* O glifo precisa de 1px a mais que o dígito: a altura de traço do ícone é
		   maior que a do número, então igualar os dois font-size deixa a seta
		   visivelmente maior que o texto. */
		.pg-btn .fx-icon {
			font-size: calc(var(--fx-font-size) - 1px);
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

	static override get observedAttributes(): string[] {
		return [
			"pagination",
			"rows",
			"rows-options",
			"striped",
			"hover",
			"toolbar",
			"empty-message",
			"pagination-position",
			"lazy",
			"total",
			"loading",
			"loading-message",
			"sort-field",
			"sort-order",
		];
	}

	private _data: Record<string, unknown>[] = [];
	private _total?: number;
	private page = 0;
	private sortField = "";
	private sortDir: 1 | -1 = 1;
	private filters: Record<string, string> = {};
	private globalSearch = "";
	private _columnObserver?: MutationObserver;

	get data(): Record<string, unknown>[] {
		return this._data;
	}
	set data(value: Record<string, unknown>[]) {
		this._data = Array.isArray(value) ? value : [];
		this.render();
	}

	get total(): number {
		return this._total ?? this._data.length;
	}
	set total(value: number) {
		this._total = value;
		this.setAttribute("total", String(value));
	}

	get rowsPerPage(): number {
		const r = Number(this.getAttr("rows", "10"));
		return r > 0 ? r : 10;
	}
	set rowsPerPage(value: number) {
		this.setAttribute("rows", String(value));
	}

	get lazy(): boolean {
		return this.hasAttr("lazy");
	}

	private get columns(): {
		field: string;
		header: string;
		sortable: boolean;
		filterable: boolean;
		align: string;
		template?: HTMLElement;
		directTemplate?: string;
	}[] {
		return [...this.querySelectorAll("fx-column")].map((c) => {
			const tpl = this._resolveCellTemplate(c);
			const direct = tpl ? undefined : c.innerHTML.trim();
			const align = c.getAttribute("align") ?? "left";
			return {
				field: c.getAttribute("field") ?? "",
				header: c.getAttribute("header") ?? c.getAttribute("field") ?? "",
				sortable: c.hasAttribute("sortable"),
				filterable: c.hasAttribute("filterable"),
				align: ["left", "center", "right", "justify", "start", "end"].includes(align) ? align : "left",
				template: tpl ?? undefined,
				directTemplate: direct || undefined,
			};
		});
	}

	/**
	 * Resolve o template de célula de uma `<fx-column>`, em ordem de prioridade:
	 *
	 * 1. `<fx-cell>` — **recomendado**. Tag própria, sem significado especial
	 *    para Vue/React/Angular/Svelte: nenhum framework a intercepta, então o
	 *    `innerHTML` sempre chega intacto ao componente. O light DOM do
	 *    `<fx-table>` não é exibido (a tabela não usa `<slot>`), então o
	 *    conteúdo-fonte nunca aparece na tela.
	 *
	 *    ⚠️ O conteúdo é TEXTO CRU para o motor de expressões: o `{{ }}` NÃO é
	 *    interpretado pelo framework hospedeiro. Cada um precisa neutralizar a
	 *    própria sintaxe antes (ver o cabeçalho do arquivo): `v-pre` no Vue,
	 *    `{'{{ }}'}` no JSX, `ngNonBindable` no Angular, string/entidades no
	 *    Svelte. Sem isso o template não chega ao `renderCell`.
	 * 2. `template="#id"` (ou `template="id"`) — aponta para um `<template>`
	 *    declarado **fora** da tabela, útil em React/Angular, onde é mais
	 *    simples manter o markup num único lugar.
	 * 3. `<template>` dentro da coluna — forma **legada**, mantida por
	 *    compatibilidade. Em Vue 3 ela vira um bloco do compilador e em React os
	 *    filhos são gerenciados pelo framework; nos dois casos o `innerHTML`
	 *    chega vazio e a célula não renderiza. Prefira `<fx-cell>`.
	 */
	private _resolveCellTemplate(c: Element): HTMLElement | null {
		const cell = c.querySelector<HTMLElement>(":scope > fx-cell");
		if (cell) return cell;
		const ref = c.getAttribute("template");
		if (ref) {
			const alvo = this._resolveRef(ref);
			if (alvo) return alvo;
		}
		return c.querySelector<HTMLElement>("template");
	}

	private get toolbarTemplate(): HTMLElement | null {
		// Mesma lógica da célula: `<fx-toolbar>` > `toolbar="#id"` > legado.
		const bar = this.querySelector<HTMLElement>(":scope > fx-toolbar");
		if (bar) return bar;
		const ref = this.getAttr("toolbar");
		if (ref) {
			const alvo = this._resolveRef(ref);
			if (alvo) return alvo;
		}
		return this.querySelector<HTMLElement>('template[slot="toolbar"]');
	}

	/**
	 * Resolve `ref` para um elemento: `#id`/`id` ⇒ `getElementById` no
	 * documento; qualquer outro valor é tratado como seletor CSS relativo à
	 * própria tabela. Valores inválidos devolvem `null` (sem exceção).
	 */
	private _resolveRef(ref: string): HTMLElement | null {
		const valor = ref.trim();
		if (!valor) return null;
		const doc = this.ownerDocument;
		if (valor.startsWith('#')) return doc?.getElementById(valor.slice(1)) ?? null;
		if (/^[.#[>]/.test(valor)) {
			try {
				return this.querySelector<HTMLElement>(valor);
			} catch {
				return null; // seletor inválido — degrada para o próximo fallback
			}
		}
		return doc?.getElementById(valor) ?? null;
	}

	protected override connectedCallback(): void {
		this._parseDataAttribute();
		this._parseSortAttributes();
		// O pager usa glifos da Fenix Icons: garante o @font-face mesmo quando o
		// app não importou `@wrrdev/fenix-ui/icons` (idempotente).
		loadFenixIconsFont();
		super.connectedCallback();
		this._columnObserver = new MutationObserver(() => this.render());
		this._columnObserver.observe(this, { childList: true, subtree: true });
	}

	protected override disconnectedCallback(): void {
		this._columnObserver?.disconnect();
		super.disconnectedCallback();
	}

	/** Ordenação inicial via `sort-field` / `sort-order` (documentados na API). */
	private _parseSortAttributes(): void {
		const field = this.getAttr("sort-field");
		if (field) this.sortField = field;
		const order = this.getAttr("sort-order");
		if (order === "asc" || order === "desc") this.sortDir = order === "asc" ? 1 : -1;
	}

	private _parseDataAttribute(): void {
		if (!this._data.length) {
			try {
				const json = this.getAttr("data");
				if (json) this._data = JSON.parse(json);
			} catch {
				/* atributo invalido - ignora */
			}
		}
		const totalAttr = this.getAttr("total");
		if (totalAttr) {
			const n = Number(totalAttr);
			if (!isNaN(n)) this._total = n;
		}
	}

	private computeRows(): { rows: Record<string, unknown>[]; total: number } {
		let out = [...this._data];

		for (const [field, term] of Object.entries(this.filters)) {
			if (!term) continue;
			const t = term.toLowerCase();
			out = out.filter((r) =>
				String(r[field] ?? "")
					.toLowerCase()
					.includes(t),
			);
		}

		if (this.globalSearch) {
			const t = this.globalSearch.toLowerCase();
			const searchFields = this._getSearchFields();
			out = out.filter((r) => {
				const fields = searchFields.length ? searchFields : Object.keys(r);
				return fields.some((f) =>
					String(r[f] ?? "")
						.toLowerCase()
						.includes(t),
				);
			});
		}

		const total = this.lazy ? this.total : out.length;

		if (this.sortField) {
			out.sort((a, b) => {
				const av = a[this.sortField],
					bv = b[this.sortField];
				if (typeof av === "number" && typeof bv === "number")
					return (av - bv) * this.sortDir;
				return (
					String(av ?? "").localeCompare(String(bv ?? ""), "pt-BR") *
					this.sortDir
				);
			});
		}

		if (this.hasAttr("pagination") && !this.lazy) {
			const start = this.page * this.rowsPerPage;
			out = out.slice(start, start + this.rowsPerPage);
		}

		return { rows: out, total };
	}

	private _getSearchFields(): string[] {
		const input = this.root.querySelector<HTMLInputElement>(
			"[data-search-fields]",
		);
		if (!input) return [];
		const attr = input.getAttribute("data-search-fields");
		if (attr === null) return [];
		return attr
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
	}

	private cellHtml(
		col: {
			field: string;
			template?: HTMLElement;
			directTemplate?: string;
		},
		row: Record<string, unknown>,
	): string {
		const template = col.template?.innerHTML ?? col.directTemplate;
		if (template) return renderCell(template, row, col.field);
		return esc(String(row[col.field] ?? ""));
	}

	protected override render(): void {
		const cols = this.columns.filter((c) => c.field);
		const { rows, total } = this.computeRows();
		const paginated = this.hasAttr("pagination");
		const pages = Math.max(1, Math.ceil(total / this.rowsPerPage));
		if (this.page >= pages) this.page = pages - 1;

		const toolbar = this.toolbarTemplate;
		const toolbarHtml = toolbar
			? `<div class="toolbar" part="toolbar">${toolbar.innerHTML}</div>`
			: "";

		const headHtml = cols
			.map((c) => {
				const isSorted = this.sortField === c.field;
				const ind = isSorted
					? this.sortDir === 1
						? "▲"
						: "▼"
					: c.sortable
						? "⇅"
						: "";
				const activeClass = isSorted ? "active" : "";
				return `<th part="header" class="${c.sortable ? "sortable" : ""}" style="text-align:${c.align}" data-field="${esc(c.field)}">${esc(c.header)}${ind ? `<span class="sort-ind ${activeClass}">${ind}</span>` : ""}</th>`;
			})
			.join("");

		const filterRow = cols.some((c) => c.filterable)
			? `<tr class="filter-row">${cols.map((c) => `<th style="text-align:${c.align}">${c.filterable ? `<input class="filter" data-field="${esc(c.field)}" placeholder="${esc("Filtrar…")}" value="${esc(this.filters[c.field] ?? "")}">` : ""}</th>`).join("")}</tr>`
			: "";

		const bodyHtml = rows.length
			? rows
					.map(
						(row, i) =>
							`<tr part="row" data-index="${i}">${cols.map((c) => `<td part="cell" style="text-align:${c.align}">${this.cellHtml(c, row)}</td>`).join("")}</tr>`,
					)
					.join("")
			: `<tr><td class="empty" colspan="${cols.length || 1}">${esc(this.getAttr("empty-message", "Nenhum registro encontrado"))}</td></tr>`;

		const pagerHtml = !paginated
			? ""
			: `
      <div class="pager" part="pager">
        <span class="info">Página ${this.page + 1} de ${pages} · ${total} registros</span>
        <button type="button" class="pg-btn" part="first" aria-label="Primeira página" data-pg="first" ${this.page === 0 ? "disabled" : ""}>${fenixIconHtml("first_page")}</button>
        <button type="button" class="pg-btn" part="prev" aria-label="Página anterior" data-pg="prev" ${this.page === 0 ? "disabled" : ""}>${fenixIconHtml("navigate_before")}</button>
        ${Array.from({ length: pages }, (_, p) => `<button type="button" class="pg-btn" data-pg="${p}" aria-current="${p === this.page}">${p + 1}</button>`).join("")}
        <button type="button" class="pg-btn" part="next" aria-label="Próxima página" data-pg="next" ${this.page >= pages - 1 ? "disabled" : ""}>${fenixIconHtml("navigate_next")}</button>
        <button type="button" class="pg-btn" part="last" aria-label="Última página" data-pg="last" ${this.page >= pages - 1 ? "disabled" : ""}>${fenixIconHtml("last_page")}</button>
        <label class="info">${esc("Por página:")}
          <fx-select class="rows-sel" size="sm" value="${this.rowsPerPage}" aria-label="Itens por página">${this.getAttr(
					"rows-options",
					"5,10,20,50",
				)
					.split(",")
					.map((n) => n.trim())
					.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`)
					.join("")}</fx-select>
        </label>
      </div>`;

		const loading = this.hasAttr("loading");
		const loadingHtml = loading
			? `<div class="loading-overlay" part="loading-overlay"><div class="tbl-spinner" part="spinner"></div><span class="loading-text">${esc(this.getAttr("loading-message", "Carregando…"))}</span></div>`
			: "";

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

		// Ordenação.
		this.root
			.querySelectorAll<HTMLTableCellElement>("th.sortable")
			.forEach((th) => {
				th.addEventListener("click", () => {
					const f = th.dataset.field!;
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
								lazy: this.lazy,
							},
						}),
					);
				});
			});

		// Filtros (preserva foco/caret ao digitar).
		this.root.querySelectorAll<HTMLInputElement>(".filter").forEach((inp) => {
			inp.addEventListener("input", () => {
				const field = inp.dataset.field!;
				const value = inp.value;
				const pos = inp.selectionStart;
				this.filters[field] = value;
				this.page = 0;
				this.render();
				this.dispatchEvent(
					new CustomEvent("filter-change", {
						bubbles: true,
						composed: true,
						detail: { field, value, lazy: this.lazy },
					}),
				);
				const again = this.root.querySelector<HTMLInputElement>(
					`.filter[data-field="${esc(field)}"]`,
				);
				if (again) {
					again.focus();
					again.setSelectionRange(pos, pos);
				}
			});
			inp.addEventListener("click", (e) => e.stopPropagation());
		});

		// Busca global da toolbar.
		this.root
			.querySelectorAll<HTMLInputElement>("[data-search-fields]")
			.forEach((inp) => {
				inp.addEventListener("input", () => {
					this.globalSearch = inp.value;
					this.page = 0;
					const pos = inp.selectionStart;
					this.render();
					const again = this.root.querySelector<HTMLInputElement>(
						"[data-search-fields]",
					);
					if (again) {
						again.focus();
						again.setSelectionRange(pos, pos);
					}
				});
			});

		// Paginação.
		this.root
			.querySelectorAll<HTMLButtonElement>(".pg-btn")
			.forEach((btn) => {
				btn.addEventListener("click", () => {
					const pg = btn.dataset.pg!;
					this.page =
						pg === "first"
							? 0
							: pg === "prev"
								? Math.max(0, this.page - 1)
								: pg === "next"
									? Math.min(pages - 1, this.page + 1)
									: pg === "last"
										? pages - 1
										: Number(pg);
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
								lazy: this.lazy,
							},
						}),
					);
				});
			});
		this.root
			.querySelector<HTMLElement>("fx-select.rows-sel")
			?.addEventListener("change", (e) => {
				const value = Number((e as CustomEvent).detail?.value);
				if (!value || value === this.rowsPerPage) return;
				this.rowsPerPage = value;
				this.page = 0;
				this.render();
			});

		// Clique na linha.
		this.root
			.querySelectorAll<HTMLTableRowElement>("tbody tr[data-index]")
			.forEach((tr) => {
				tr.addEventListener("click", () => {
					this.dispatchEvent(
						new CustomEvent("row-click", {
							bubbles: true,
							composed: true,
							detail: {
								row: rows[Number(tr.dataset.index)],
								index: Number(tr.dataset.index),
							},
						}),
					);
				});
			});

		this._restoreToolbarSearch();
	}

	private _restoreToolbarSearch(): void {
		const input = this.root.querySelector<HTMLInputElement>(
			"[data-search-fields]",
		);
		if (input && this.globalSearch) input.value = this.globalSearch;
	}
}

export function defineFxTable(): typeof FxTable {
  return defineElement('fx-table', FxTable);
}
