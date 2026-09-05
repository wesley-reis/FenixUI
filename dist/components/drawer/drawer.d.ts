import { FxElement } from '../../core/base';
/**
 * <fx-drawer> — Painel deslizante (drawer) com overlay.
 *
 * Atributos:
 *  - position: 'left' | 'right' | 'top' | 'bottom' (padrão: right);
 *  - title: texto do cabeçalho;
 *  - open: exibe o drawer.
 * Conteúdo: livre, via slot.
 * Eventos: `open` e `close` (composed). Fecha por ESC ou clique no overlay.
 */
export declare class FxDrawer extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get open(): boolean;
    set open(value: boolean);
    get title(): string;
    set title(v: string);
    get position(): string;
    set position(v: string);
    protected render(): void;
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    private _onKeydown;
    private _previouslyFocused;
    private _close;
    /** Mantém o foco dentro do drawer (WCAG 2.4.3 / 2.1.2). */
    private _trapFocus;
    private _restoreFocus;
}
export declare function defineFxDrawer(): typeof FxDrawer;
//# sourceMappingURL=drawer.d.ts.map