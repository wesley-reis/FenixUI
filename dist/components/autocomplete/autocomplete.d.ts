import { FxElement } from '../../core/base';
/**
 * <fx-autocomplete> — Campo de texto com sugestões filtradas.
 *
 * Atributos: value, size, placeholder, source (JSON array de strings),
 * disabled, min-chars (padrão 1).
 * Evento: `select` (composed, detail: { value }).
 */
export declare class FxAutocomplete extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get size(): string;
    set size(v: string);
    get value(): string;
    set value(v: string);
    get source(): string[];
    /** Setter necessário para o Vue (patchDOMProp seta `source` como
     *  propriedade, pois o getter existe no prototype). */
    set source(value: string | string[]);
    protected render(): void;
}
export declare function defineFxAutocomplete(): typeof FxAutocomplete;
//# sourceMappingURL=autocomplete.d.ts.map