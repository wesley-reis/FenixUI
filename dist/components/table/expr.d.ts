/**
 * Avaliador de expressões **seguro** (sem `eval`/`Function`) usado pelos
 * templates de célula do `<fx-table>`.
 *
 * Permite personalizar o conteúdo de uma coluna:
 *
 * ```html
 * <fx-column field="preco" header="Preço">
 *   <template>R$ {{ value | currency }}</template>
 * </fx-column>
 *
 * <fx-column field="status" header="Situação">
 *   <template>
 *     <i class="pi pi-{{ row.status === 'ativo' ? 'check' : 'times' }}"></i>
 *   </template>
 * </fx-column>
 * ```
 *
 * Contexto de variáveis dentro de `{{ }}`:
 * - `value` — valor do campo da coluna (row[field])
 * - `row`   — objeto completo da linha
 * - `row.campo` — acesso a qualquer campo da linha
 *
 * Pipes: `value | currency`, `value | date`, `value | date: 'short'`,
 * `value | dateTime`, `value | number`, `value | number: 2`
 */
type Row = Record<string, unknown>;
export type EvalCtx = {
    value: unknown;
    row: Row;
};
export declare const PIPES: Record<string, (v: unknown, arg?: string) => string>;
/** Avalia uma única expressão `{{ }}` retornando uma string. */
export declare function evaluate(expr: string, ctx: EvalCtx): string;
/** Processa um template HTML substituindo todas as ocorrências `{{ expr }}`. */
export declare function renderCell(template: string, row: Row, field: string): string;
export {};
//# sourceMappingURL=expr.d.ts.map