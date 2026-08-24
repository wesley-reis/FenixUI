import { FxElement } from '../../core/base';
/**
 * <fx-progress> — Indicador de progresso determinado/indeterminado.
 *
 * Atributos: value (0-100), indeterminate, variant (primary|success|warning|danger),
 * label (mostra %), size (sm|md|lg).
 * Evento: `complete` quando chega a 100.
 */
export declare class FxProgress extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get value(): number;
    set value(v: number);
    protected render(): void;
    private _done;
}
export declare function defineFxProgress(): typeof FxProgress;
//# sourceMappingURL=progress.d.ts.map