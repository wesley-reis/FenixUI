import { FxElement } from '../../core/base';
import "../select";
/**
 * <fx-table> — Tabela de dados estilo DataTable (dados + colunas configuráveis,
 * ordenação, filtros por coluna, paginação personalizável, busca global na toolbar
 * e modo lazy para busca no servidor).
 *
 * Colunas (light DOM):
 *   <fx-column field="nome" header="Nome" sortable filterable align="left">
 *     opcional: <template>R$ {{value}}</template> para render customizado
 *     ou conteúdo direto (HTML + {{ }}) como template alternativo
 *   </fx-column>
 *
 * Toolbar (opcional):
 *   <template slot="toolbar">
 *     <input data-search-fields="nome,cargo" placeholder="Buscar…">
 *     <button>Nova ação</button>
 *   </template>
 *
 * Dados: propriedade `data` (array de objetos) ou atributo `data` (JSON).
 *
 * Atributos: pagination, rows, rows-options, pagination-position (left|center|right),
 * striped, empty-message, lazy, total, loading, loading-message.
 * Eventos: page-change, sort-change, row-click, filter-change (todos composed).
 */
export declare class FxTable extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    private _data;
    private _total?;
    private page;
    private sortField;
    private sortDir;
    private filters;
    private globalSearch;
    private _columnObserver?;
    get data(): Record<string, unknown>[];
    set data(value: Record<string, unknown>[]);
    get total(): number;
    set total(value: number);
    get rowsPerPage(): number;
    set rowsPerPage(value: number);
    get lazy(): boolean;
    private get columns();
    private get toolbarTemplate();
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    private _parseDataAttribute;
    private computeRows;
    private _getSearchFields;
    private cellHtml;
    protected render(): void;
    private _restoreToolbarSearch;
}
export declare function defineFxTable(): typeof FxTable;
//# sourceMappingURL=table.d.ts.map