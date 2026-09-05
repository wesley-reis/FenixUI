import { FxElement } from '../../core/base';
/**
 * <fx-dropdown> — Menu de ações em popover.
 *
 * Atributos: label (texto do trigger), position (bottom-left padrão | bottom-right).
 * Itens: <fx-dropdown-item value="x">Texto</fx-dropdown-item>
 * Evento: `select` (composed, detail: { value }).
 */
export declare class FxDropdown extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get open(): boolean;
    set open(value: boolean);
    protected render(): void;
    private docListener?;
    private _listenersAttached;
    /** Delegação de cliques nos itens + fechamento ao clicar fora (registrado uma vez). */
    private _attachDelegatedListeners;
    protected disconnectedCallback(): void;
}
/**
 * <fx-dropdown-item> — Item de menu.
 */
export declare class FxDropdownItem extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get value(): string;
    set value(v: string);
    protected render(): void;
}
export declare function defineFxDropdown(): typeof FxDropdown;
export declare function defineFxDropdownItem(): typeof FxDropdownItem;
//# sourceMappingURL=dropdown.d.ts.map