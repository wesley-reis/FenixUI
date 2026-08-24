import { FxElement } from '../../core/base';
/**
 * <fx-checkbox> — Caixa de seleção com suporte a estado indeterminado.
 *
 * Atributos: checked, indeterminate, disabled, value, size (sm|md|lg).
 * Evento: `change` (composed, detail: { checked, value }).
 */
export declare class FxCheckbox extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get checked(): boolean;
    set checked(value: boolean);
    get indeterminate(): boolean;
    set indeterminate(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    /** Tamanho do controle. Padrão: `'md'`. */
    get size(): string;
    set size(value: string);
    protected render(): void;
    private toggle;
}
export declare function defineFxCheckbox(): typeof FxCheckbox;
//# sourceMappingURL=checkbox.d.ts.map