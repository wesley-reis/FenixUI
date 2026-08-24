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
    private get source();
    protected render(): void;
}
export declare function defineFxAutocomplete(): typeof FxAutocomplete;
//# sourceMappingURL=autocomplete.d.ts.map