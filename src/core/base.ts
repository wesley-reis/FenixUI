/**
 * Infraestrutura base de Web Component do FenixUI.
 *
 * Todo componente estende `FxElement`, que:
 *  - cria o Shadow Root (isolamento de estrutura e CSS);
 *  - injeta o CSS (tokens via `var(--fx-*)`) + template em cada render;
 *  - re-renderiza quando atributos observados mudam.
 */

export abstract class FxElement extends HTMLElement {
  /** CSS isolado no Shadow DOM. Deve usar apenas `var(--fx-*)`. */
  static styles: string = '';

  static get observedAttributes(): string[] {
    return [];
  }

  protected readonly root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  /** Chamado quando um atributo observado muda. */
  protected attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  /** Chamado quando o elemento é anexado ao DOM. */
  protected connectedCallback(): void {
    this.render();
  }

  /** Chamado quando o elemento é removido do DOM (limpeza de recursos). */
  protected disconnectedCallback(): void {
    /* noop — sobrescreva para limpar observers/listeners. */
  }

  protected hasAttr(name: string): boolean {
    return this.hasAttribute(name);
  }

  protected getAttr(name: string, fallback = ''): string {
    return this.getAttribute(name) ?? fallback;
  }

  protected toggleAttr(name: string, on: boolean): void {
    if (on) this.setAttribute(name, '');
    else this.removeAttribute(name);
  }

  /** Injeta `<style>` + template no Shadow DOM. */
  protected setTemplate(html: string): void {
    const styles = (this.constructor as typeof FxElement).styles;
    this.root.innerHTML = `<style>${styles}</style>${html}`;
  }

  /** Implementado por cada componente. */
  protected abstract render(): void;
}