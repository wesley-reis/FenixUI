import { FxElement } from '../../core/base';
/**
 * <fx-multiselect> — Seleção múltipla .
 *
 * Dropdown customizado com painel (overlay), checkbox por item, pesquisa
 * opcional e ação de limpar. Opções via <option> nativos no light DOM.
 *
 * Atributos: values (CSV), searchable, clearable, disabled, placeholder,
 * size (sm|md|lg), no-results.
 * Evento: `change` (composed, detail: { values: string[] }).
 */
export declare class FxMultiselect extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    private observer?;
    private docListener?;
    private selected;
    /** Valores selecionados (CSV no atributo / array na propriedade). */
    get values(): string[];
    set values(list: string[]);
    get disabled(): boolean;
    set disabled(value: boolean);
    private get options();
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    /** Aplica a seleção, reflete e emite change. */
    private commit;
    private toggleValue;
    /** Navegação por teclado entre as opções do listbox (WCAG 2.1.1). */
    private _navigateOptions;
    protected render(): void;
}
export declare function defineFxMultiselect(): typeof FxMultiselect;
//# sourceMappingURL=multiselect.d.ts.map