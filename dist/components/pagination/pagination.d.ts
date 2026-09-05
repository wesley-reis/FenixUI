import { FxElement } from '../../core/base';
import '../select';
/**
 * <fx-pagination> — Paginação standalone.
 *
 * Atributos: page (atual), total (itens), rows (por página), rows-options,
 * position (left|center|right).
 * Evento: `page-change` (composed, detail: { page, rows }).
 */
export declare class FxPagination extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get page(): number;
    set page(v: number);
    get total(): number;
    set total(v: number);
    get rows(): number;
    set rows(v: number);
    private get pages();
    protected render(): void;
    private emit;
}
export declare function defineFxPagination(): typeof FxPagination;
//# sourceMappingURL=pagination.d.ts.map