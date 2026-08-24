import { FxElement } from '../../core/base';
/**
 * <fx-textarea> — Área de texto multilinha estilizada com os tokens do tema.
 *
 * Atributos: value, size (sm|md|lg), placeholder, disabled, readonly,
 * rows, maxlength.
 * Eventos: `input` e `change` (composed, detail: { value }).
 */
export declare class FxTextarea extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get size(): string;
    set size(value: string);
    get value(): string;
    set value(value: string);
    protected render(): void;
}
export declare function defineFxTextarea(): typeof FxTextarea;
//# sourceMappingURL=textarea.d.ts.map