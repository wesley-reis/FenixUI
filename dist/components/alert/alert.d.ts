import { FxElement } from '../../core/base';
/**
 * <fx-alert> — Aviso inline com variantes semânticas.
 *
 * Atributos: variant (info|success|warning|danger, padrão info), title, dismissible.
 * Slot padrão: conteúdo da mensagem. Evento `dismiss`.
 */
export declare class FxAlert extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    protected render(): void;
}
export declare function defineFxAlert(): typeof FxAlert;
//# sourceMappingURL=alert.d.ts.map