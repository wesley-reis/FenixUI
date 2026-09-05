import { FxElement } from '../../core/base';
/**
 * <fx-skeleton> — Placeholder animado para carregamento de conteúdo.
 *
 * Atributos: variant (text|circle|rect, padrão text), width, height, lines (para text).
 */
export declare class FxSkeleton extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    /** Valida um valor de dimensão CSS, retornando-o seguro ou vazio. */
    private safeSize;
    protected render(): void;
}
export declare function defineFxSkeleton(): typeof FxSkeleton;
//# sourceMappingURL=skeleton.d.ts.map