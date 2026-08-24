import { FxElement } from '../../core/base';
/**
 * <fx-tooltip> — Dica flutuante ao passar o mouse/focar no elemento.
 *
 * Atributos: content (texto da dica), position (top|bottom|left|right, padrão top).
 * Slot padrão: elemento que dispara a dica.
 */
export declare class FxTooltip extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    protected render(): void;
}
export declare function defineFxTooltip(): typeof FxTooltip;
//# sourceMappingURL=tooltip.d.ts.map