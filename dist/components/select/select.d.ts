import { FxElement } from '../../core/base';
/**
 * <fx-select> — Campo de seleção com dropdown customizado.
 *
 * Escreva os filhos como `<option>` nativos no light DOM; eles são
 * espelhados automaticamente (MutationObserver):
 *
 *   <fx-select value="b" searchable clearable>
 *     <option value="a">Opção A</option>
 *     <option value="b">Opção B</option>
 *   </fx-select>
 *
 * Atributos: value, size (sm|md|lg), disabled, placeholder,
 * searchable, clearable, search-placeholder, no-results.
 * Evento: `change` (composed, detail: { value }).
 */
export declare class FxSelect extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    private observer?;
    private docListener?;
    /** Tamanho do campo. Padrão: `'md'`. */
    get size(): string;
    set size(value: string);
    get value(): string;
    set value(value: string);
    get disabled(): boolean;
    set disabled(value: boolean);
    private get options();
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    private select;
    protected render(): void;
}
export declare function defineFxSelect(): typeof FxSelect;
//# sourceMappingURL=select.d.ts.map