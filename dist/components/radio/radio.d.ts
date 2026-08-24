import { FxElement } from '../../core/base';
/**
 * <fx-radio> — Botão de opção. Radios com o mesmo `name` formam um grupo
 * (seleção exclusiva gerenciada pelo próprio componente).
 *
 * Atributos: checked, disabled, value, name, size (sm|md|lg).
 * Evento: `change` (composed, detail: { checked, value }).
 */
export declare class FxRadio extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get checked(): boolean;
    set checked(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    /** Tamanho do controle. Padrão: `'md'`. */
    get size(): string;
    set size(value: string);
    protected render(): void;
    private select;
}
export declare function defineFxRadio(): typeof FxRadio;
//# sourceMappingURL=radio.d.ts.map