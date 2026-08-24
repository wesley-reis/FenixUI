import { FxElement } from '../../core/base';
/**
 * <fx-table> — Tabela de dados estilo DataTable (dados + colunas configuráveis,
 * ordenação, filtros por coluna, paginação personalizável).
 *
 * Colunas (light DOM):
 *   <fx-column field="nome" header="Nome" sortable filterable align="left">
 *     opcional: <template>R$ {{value}}</template> para render customizado
 *   </fx-column>
 *
 * Dados: propriedade `data` (array de objetos) ou atributo `data` (JSON).
 *
 * Atributos: pagination, rows, rows-options, pagination-position (left|center|right),
 * striped, empty-message.
 * Eventos: page-change, sort-change, row-click (todos composed).
 */
export declare class FxTable extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    /** Dados da tabela (array de objetos). */
    data: Record<string, unknown>[];
    private page;
    private sortField;
    private sortDir;
    private filters;
    get rowsPerPage(): number;
    set rowsPerPage(value: number);
    /** Colunas declaradas no light DOM (<fx-column>). */
    private get columns();
    protected connectedCallback(): void;
    /** Pipeline: filtra → ordena → pagina. */
    private computeRows;
    /** Célula: template customizado ({{value}}, {{campo}}, {{row}}) ou valor direto. */
    private cellHtml;
    protected render(): void;
}
export declare function defineFxTable(): typeof FxTable;
//# sourceMappingURL=table.d.ts.map