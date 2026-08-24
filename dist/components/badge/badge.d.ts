import { FxElement } from '../../core/base';
/**
 * <fx-badge> — Rótulo/contador de status.
 *
 * Atributos: variant (default|primary|success|warning|danger|info), round.
 * Slots: default (conteúdo).
 */
export declare class FxBadge extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    protected render(): void;
}
export declare function defineFxBadge(): typeof FxBadge;
//# sourceMappingURL=badge.d.ts.map