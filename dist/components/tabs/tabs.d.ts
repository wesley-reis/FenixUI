import { FxElement } from '../../core/base';
/**
 * <fx-tabs> — Navegação por abas.
 *
 * Atributos: value (aba ativa, corresponde ao attr `tab` de cada fx-tab-panel).
 * Uso:
 *   <fx-tabs value="a">
 *     <fx-tab tab="a">Aba A</fx-tab>
 *     <fx-tab tab="b">Aba B</fx-tab>
 *   </fx-tabs>
 *   <fx-tab-panel tab="a">…</fx-tab-panel>
 *   <fx-tab-panel tab="b">…</fx-tab-panel>
 * Evento: `change` (composed, detail: { value }).
 */
export declare class FxTabs extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get value(): string;
    set value(value: string);
    protected render(): void;
    /** Painéis associados: descendentes do host ou irmãos seguintes no DOM. */
    private get panels();
}
/**
 * <fx-tab-panel> — Painel de conteúdo associado a uma aba.
 */
export declare class FxTabPanel extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get tab(): string;
    /** Setter necessário: o Vue (patchDOMProp) seta `tab` como PROPRIEDADE
     *  (pois o getter existe no prototype) — sem ele o atributo nunca é
     *  aplicado e o painel nunca é exibido. */
    set tab(value: string);
    get visible(): boolean;
    set visible(value: boolean);
    protected render(): void;
    private _initialized;
}
export declare function defineFxTabs(): typeof FxTabs;
export declare function defineFxTabPanel(): typeof FxTabPanel;
//# sourceMappingURL=tabs.d.ts.map