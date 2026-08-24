import { FxElement } from '../../core/base';
/**
 * <fx-input> — Campo de texto estilizado com os tokens do tema.
 *
 * Atributos: type (text|number|email|password|search|tel|url), value, size,
 * placeholder, disabled, readonly, min, max, step, clearable.
 * Eventos: `input` e `change` (composed, detail: { value }).
 */
export declare class FxInput extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    /** Tamanho do campo. Padrão: `'md'`. */
    get size(): string;
    set size(value: string);
    get value(): string;
    set value(value: string);
    get disabled(): boolean;
    set disabled(value: boolean);
    protected render(): void;
}
export declare function defineFxInput(): typeof FxInput;
//# sourceMappingURL=input.d.ts.map