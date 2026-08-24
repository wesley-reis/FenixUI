import { FxElement } from '../../core/base';
/**
 * <fx-button> — Componente de ação (piloto).
 *
 * Atributos: variant, size, disabled, loading, type, full.
 * Slots: default (rótulo), `icon` (ícone opcional).
 * Evento: `click` nativo atravessa o Shadow DOM (composed) — ouça no host.
 */
export declare class FxButton extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    /** Tamanho. Padrão: `'md'`. */
    get size(): string;
    set size(value: string);
    get disabled(): boolean;
    set disabled(value: boolean);
    get loading(): boolean;
    set loading(value: boolean);
    protected render(): void;
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    /**
     * Efeito ripple : cria um círculo que expande do ponto
     * de clique e desaparece. Respeita o token `effect.ripple` ('0' desativa)
     * e `prefers-reduced-motion` (via CSS).
     */
    private spawnRipple;
}
export declare function defineFxButton(): typeof FxButton;
//# sourceMappingURL=button.d.ts.map