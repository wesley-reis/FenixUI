import { FxElement } from '../../core/base';
/**
 * <fx-accordion-panel> — Painel individual do accordion.
 *
 * Atributos:
 *  - header: titulo exibido no cabecalho (ou use o slot "header").
 *  - value: identificador unico do painel (usado pelo fx-accordion).
 *  - expanded: presenca indica painel aberto (controlado pelo fx-accordion).
 *  - disabled: impede a abertura do painel.
 */
export declare class FxAccordionPanel extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get header(): string;
    set header(v: string);
    get value(): string;
    set value(v: string);
    get expanded(): boolean;
    set expanded(v: boolean);
    get disabled(): boolean;
    set disabled(v: boolean);
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    private _mo;
    protected render(): void;
}
/**
 * <fx-accordion> — Conjunto de paineis expansivos (estilo PrimeVue).
 *
 * Por padrao (modo single) abrir um painel fecha os outros.
 * Adicione o atributo `multiple` para permitir varios paineis abertos.
 *
 * Uso:
 *   <fx-accordion value="p1">
 *     <fx-accordion-panel value="p1" header="Titulo 1">Conteudo…</fx-accordion-panel>
 *     <fx-accordion-panel value="p2" header="Titulo 2">Conteudo…</fx-accordion-panel>
 *   </fx-accordion>
 *
 * Atributos:
 *  - value: valor(es) ativo(s), separados por virgula no modo multiple.
 *  - multiple: permite manter varios paineis abertos ao mesmo tempo.
 *
 * Evento: `change` (composed, detail: { value: string[] }).
 */
export declare class FxAccordion extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get multiple(): boolean;
    set multiple(v: boolean);
    /** Valores ativos como array. */
    get values(): string[];
    set values(v: string[]);
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    private _observer;
    protected render(): void;
    /** Painéis do accordion (filhos diretos ou descendentes). */
    private get panels();
    private _sync;
    private _initialized;
    private _attachListeners;
    private _listenersAttached;
    /** Abre/fecha um painel respeitando o modo (single | multiple). */
    toggle(panel: FxAccordionPanel): void;
    /** Abre um painel pelo valor. */
    open(value: string): void;
    /** Fecha um painel pelo valor. */
    close(value: string): void;
}
export declare function defineFxAccordion(): typeof FxAccordion;
export declare function defineFxAccordionPanel(): typeof FxAccordionPanel;
//# sourceMappingURL=accordion.d.ts.map