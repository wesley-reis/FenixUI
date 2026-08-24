import { FxElement } from '../../core/base';
/**
 * <fx-spinner> — Indicador de progresso indeterminado.
 *
 * Atributos: size (sm|md|lg).
 */
export declare class FxSpinner extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    /** Tamanho do spinner. Padrão: `'md'`. */
    get size(): string;
    set size(value: string);
    protected render(): void;
}
export declare function defineFxSpinner(): typeof FxSpinner;
//# sourceMappingURL=spinner.d.ts.map