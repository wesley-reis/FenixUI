import { FxElement } from '../../core/base';
/**
 * <fx-knob> - Controle giratorio circular para ajuste de valor.
 *
 * Similar ao Knob do PrimeVue, permite ajustar um valor arrastando o mouse
 * ou usando as setas do teclado. Exibe um arco de progresso circular com
 * o valor central configuravel via valueTemplate.
 *
 * Atributos: value, min, max, step, size, strokeWidth, valueColor, rangeColor,
 * readonly, disabled, valueTemplate.
 * Evento: `change` (composed, detail: { value }).
 */
export declare class FxKnob extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    get value(): number;
    set value(v: number);
    get min(): number;
    set min(v: number);
    get max(): number;
    set max(v: number);
    get step(): number;
    set step(v: number);
    get size(): string;
    set size(v: string);
    get strokeWidth(): number;
    set strokeWidth(v: number);
    get valueColor(): string;
    set valueColor(v: string);
    get rangeColor(): string;
    set rangeColor(v: string);
    get readonly(): boolean;
    set readonly(v: boolean);
    get disabled(): boolean;
    set disabled(v: boolean);
    get valueTemplate(): string;
    set valueTemplate(v: string);
    private _isDragging;
    private _startY;
    private _startValue;
    protected render(): void;
    private getSizeNum;
    private clampValue;
    private emitChange;
    private attachListeners;
    private _onMouseMove;
    private _onMouseUp;
    protected disconnectedCallback(): void;
}
export declare function defineFxKnob(): typeof FxKnob;
//# sourceMappingURL=knob.d.ts.map