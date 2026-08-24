import { FxElement } from '../../core/base';
/**
 * <fx-switch> — Interruptor ligado/desligado (role="switch").
 *
 * O texto do slot (light DOM) é o rótulo clicável.
 * Atributos: checked, disabled, size (sm|md|lg).
 * Evento: `change` (composed, detail: { checked }).
 */
export declare class FxSwitch extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    /** Tamanho da trilha. Padrão: `'md'`. */
    get size(): string;
    set size(value: string);
    get checked(): boolean;
    set checked(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    protected render(): void;
}
export declare function defineFxSwitch(): typeof FxSwitch;
//# sourceMappingURL=switch.d.ts.map