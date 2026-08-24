import { FxElement } from '../../core/base';
/**
 * <fx-datepicker> — Campo de data com calendário suspenso.
 *
 * Um input com ícone de calendário no final; ao clicar, abre o
 * <fx-calendar> em um popover. As datas selecionadas aparecem no input.
 *
 * Atributos:
 * - mode="single" | "range" | "multiple"  (padrão: single)
 * - value="YYYY-MM-DD"                    → single
 * - start/end                             → range
 * - values="a,b,c"                        → múltiplas datas (CSV)
 * - min/max, placeholder, disabled, clearable, size (sm|md|lg)
 * - format="dd/mm/yyyy"  → máscara de exibição (tokens: dd mm yyyy, HH MM SS)
 * - show-time            → inclui seleção de hora:minuto:segundo no popover;
 *                          o valor passa a ser "YYYY-MM-DDTHH:mm:ss"
 *
 * Evento: `change` (composed):
 * - single:   { value }
 * - range:    { value, start, end }
 * - multiple: { values: string[] }
 */
export declare class FxDatepicker extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    private docListener?;
    /** Hora/minuto/segundo do modo show-time. */
    private time;
    get mode(): string;
    set mode(value: string);
    get value(): string;
    set value(v: string);
    /** Datas do modo múltiplo (CSV no atributo). */
    get values(): string[];
    set values(list: string[]);
    get disabled(): boolean;
    set disabled(value: boolean);
    protected connectedCallback(): void;
    protected disconnectedCallback(): void;
    /** Formata uma data ISO ("YYYY-MM-DD" ou com "THH:mm:ss") segundo o atributo format. */
    private formatDate;
    /** Texto exibido no input conforme o modo. */
    private displayText;
    /** "HH:MM:SS" do estado interno de show-time. */
    private timeText;
    /** Extrai hora de um valor ISO inicial, se houver. */
    private loadTimeFromValue;
    /** Anexa o horário interno ao ISO puro vindo do calendário. */
    private withTime;
    protected render(): void;
    private emitChange;
    /**
     * Interpreta o texto digitado livremente e devolve ISO "YYYY-MM-DD"
     * (ou null se inválido). Aceita a máscara do atributo `format`
     * (tokens dd/mm/yyyy) ou ISO direto.
     */
    private parseTyped;
    /** Aplica o texto digitado no modo free-text (blur/Enter). */
    private commitTyped;
}
export declare function defineFxDatepicker(): typeof FxDatepicker;
//# sourceMappingURL=datepicker.d.ts.map