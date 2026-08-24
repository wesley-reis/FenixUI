import { FxElement } from "../../core/base";
/**
 * Rótulo flutuante .
 *
 * Envolve um campo de formulário (fx-input, fx-select, fx-multiselect,
 * fx-datepicker, ...) + um <label>. A label se comporta como placeholder
 * quando o campo está vazio e "sobe" quando o campo é focado, contém valor
 * ou abre dropdown.
 *
 *  - variant="on"   (padrão): label sobre a borda superior
 *  - variant="in"   : label como placeholder interno, sobe ao focar/valor
 *  - variant="over" : label estática acima do campo
 *
 *  - error / invalid: label + borda em vermelho, mensagem menor abaixo.
 *  - success / valid: label + borda em verde.
 *
 * A label do light DOM é MOVIDA para dentro do Shadow DOM (como `.flabel`),
 * usando classes de shadow (não `::slotted`), o que é confiável mesmo com
 * componentes aninhados que possuem shadow root próprio.
 */
export declare class FxFloatlabel extends FxElement {
    static get observedAttributes(): string[];
    static styles: string;
    private targetControl;
    private observer;
    private listenersReady;
    protected render(): void;
    protected disconnectedCallback(): void;
    /** Campo de controle = qualquer filho direto que não seja label. */
    private findControl;
    /** Label = filho direto <label>. */
    private findLabel;
    private attachEvents;
    /** Observa mudanças de atributos do controle (value, open, values...). */
    private syncControlReference;
    private syncState;
    private applyError;
    private isWithin;
    private isFocusedInside;
}
export declare function defineFxFloatlabel(): typeof FxFloatlabel;
//# sourceMappingURL=floatlabel.d.ts.map