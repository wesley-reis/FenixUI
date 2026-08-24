import { FxElement } from '../../core/base';
/**
 * <fx-dialog> — Janela modal com overlay, ESC para fechar e foco preso.
 *
 * Atributos: open, size (sm|md|lg), heading (título).
 * Slots: padrão (conteúdo), footer (botões de ação).
 * Eventos: `open`, `close` (composed).
 */
export declare class FxDialog extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get open(): boolean;
    set open(value: boolean);
    protected render(): void;
    private _cleanup?;
    disconnectedCallback(): void;
}
export declare function defineFxDialog(): typeof FxDialog;
//# sourceMappingURL=dialog.d.ts.map