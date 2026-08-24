/**
 * Infraestrutura base de Web Component do FenixUI.
 *
 * Todo componente estende `FxElement`, que:
 *  - cria o Shadow Root (isolamento de estrutura e CSS);
 *  - injeta o CSS (tokens via `var(--fx-*)`) + template em cada render;
 *  - re-renderiza quando atributos observados mudam.
 */
export declare abstract class FxElement extends HTMLElement {
    /** CSS isolado no Shadow DOM. Deve usar apenas `var(--fx-*)`. */
    static styles: string;
    static get observedAttributes(): string[];
    protected readonly root: ShadowRoot;
    constructor();
    /** Chamado quando um atributo observado muda. */
    protected attributeChangedCallback(): void;
    /** Chamado quando o elemento é anexado ao DOM. */
    protected connectedCallback(): void;
    /** Chamado quando o elemento é removido do DOM (limpeza de recursos). */
    protected disconnectedCallback(): void;
    protected hasAttr(name: string): boolean;
    protected getAttr(name: string, fallback?: string): string;
    protected toggleAttr(name: string, on: boolean): void;
    /** Injeta `<style>` + template no Shadow DOM. */
    protected setTemplate(html: string): void;
    /** Implementado por cada componente. */
    protected abstract render(): void;
}
//# sourceMappingURL=base.d.ts.map