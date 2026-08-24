import { FxElement } from '../../core/base';
export declare class FxCalendar extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    private view;
    private cursor;
    /** Período em construção (chaves numéricas). */
    private pickStart;
    private pickEnd;
    /** Modo de seleção: 'single' | 'range' | 'multiple'. */
    get mode(): 'single' | 'range' | 'multiple';
    set mode(m: 'single' | 'range' | 'multiple');
    get range(): boolean;
    set range(value: boolean);
    /** Datas selecionadas no modo multiple (CSV no atributo). */
    get values(): string[];
    set values(list: string[]);
    get value(): string;
    set value(v: string);
    private bounds;
    private locale;
    private fmt;
    private dayDisabled;
    private monthDisabled;
    private yearDisabled;
    private dayKeyOf;
    private keyToDate;
    private iso;
    /** Seleção atual para pintura (chaves). */
    private selection;
    private emit;
    private pickDay;
    private navigate;
    protected render(): void;
    /** Grade de dias com preenchimento do mês anterior. */
    private daysHtml;
}
export declare function defineFxCalendar(): typeof FxCalendar;
//# sourceMappingURL=calendar.d.ts.map