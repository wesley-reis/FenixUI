import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

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
export class FxKnob extends FxElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --_size: 100px;
      --_stroke-width: 8px;
      --_value-color: var(--fx-color-primary);
      --_range-color: var(--fx-border-default);
    }
    :host([size='sm']) { --_size: 60px; }
    :host([size='lg']) { --_size: 140px; }
    .knob {
      position: relative;
      width: var(--_size);
      height: var(--_size);
      cursor: pointer;
      user-select: none;
      touch-action: none;
    }
    :host([readonly]) .knob,
    :host([disabled]) .knob {
      cursor: default;
      pointer-events: none;
    }
    :host([disabled]) .knob {
      opacity: 0.55;
    }
    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .track {
      fill: none;
      stroke: var(--_range-color);
      stroke-width: var(--_stroke-width);
    }
    .value {
      fill: none;
      stroke: var(--_value-color);
      stroke-width: var(--_stroke-width);
      stroke-linecap: round;
      transition: stroke-dashoffset var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .label {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: var(--fx-text-default);
      pointer-events: none;
    }
    :host([size='sm']) .label { font-size: 11px; }
    :host([size='md']) .label { font-size: 14px; }
    :host([size='lg']) .label { font-size: 18px; }
    .knob:focus-visible {
      outline: none;
    }
    .knob:focus-visible svg {
      filter: drop-shadow(var(--fx-effect-focus-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)));
    }
  `;

  static override get observedAttributes(): string[] {
    return [
      'value',
      'min',
      'max',
      'step',
      'size',
      'stroke-width',
      'value-color',
      'range-color',
      'readonly',
      'disabled',
      'value-template',
    ];
  }

  get value(): number {
    return this.clampValue(Number(this.getAttr('value', '0')) || 0);
  }
  set value(v: number) {
    if (this.readonly || this.disabled) return;
    const clamped = this.clampValue(v);
    const current = this.clampValue(Number(this.getAttr('value', '0')) || 0);
    if (clamped !== current) {
      this.setAttribute('value', String(clamped));
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: { value: clamped },
        }),
      );
    }
  }

  get min(): number {
    return Number(this.getAttr('min', '0')) || 0;
  }
  set min(v: number) {
    this.setAttribute('min', String(v));
  }

  get max(): number {
    return Number(this.getAttr('max', '100')) || 100;
  }
  set max(v: number) {
    this.setAttribute('max', String(v));
  }

  get step(): number {
    return Number(this.getAttr('step', '1')) || 1;
  }
  set step(v: number) {
    this.setAttribute('step', String(v));
  }

  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(v: string) {
    this.setAttribute('size', v);
  }

  get strokeWidth(): number {
    return Number(this.getAttr('stroke-width', '8')) || 8;
  }
  set strokeWidth(v: number) {
    this.setAttribute('stroke-width', String(v));
  }

  get valueColor(): string {
    return this.getAttr('value-color', '');
  }
  set valueColor(v: string) {
    this.setAttribute('value-color', v);
  }

  get rangeColor(): string {
    return this.getAttr('range-color', '');
  }
  set rangeColor(v: string) {
    this.setAttribute('range-color', v);
  }

  get readonly(): boolean {
    return this.hasAttr('readonly');
  }
  set readonly(v: boolean) {
    this.toggleAttr('readonly', Boolean(v));
  }

  get disabled(): boolean {
    return this.hasAttr('disabled');
  }
  set disabled(v: boolean) {
    this.toggleAttr('disabled', Boolean(v));
  }

  get valueTemplate(): string {
    return this.getAttr('value-template', '{value}');
  }
  set valueTemplate(v: string) {
    this.setAttribute('value-template', v);
  }

  private _isDragging = false;
  private _startY = 0;
  private _startValue = 0;

  protected override render(): void {
    const min = this.min;
    const max = this.max;
    const value = this.clampValue(this.value);
    const range = max - min;
    const pct = range > 0 ? (value - min) / range : 0;

    const sizeNum = this.getSizeNum();
    const strokeW = this.strokeWidth;
    const radius = (sizeNum - strokeW) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct);

    const valueColorStyle = this.valueColor ? `--_value-color: ${this.valueColor};` : '';
    const rangeColorStyle = this.rangeColor ? `--_range-color: ${this.rangeColor};` : '';

    const displayValue = this.valueTemplate.replace('{value}', String(Math.round(value)));

    this.setTemplate(`
      <div class="knob" part="knob" tabindex="${this.disabled ? '-1' : '0'}"
        role="slider" aria-valuenow="${value}" aria-valuemin="${min}" aria-valuemax="${max}"
        aria-readonly="${this.readonly}" aria-disabled="${this.disabled}"
        style="${valueColorStyle}${rangeColorStyle}">
        <svg viewBox="0 0 ${sizeNum} ${sizeNum}" part="svg">
          <circle class="track" part="track"
            cx="${sizeNum / 2}" cy="${sizeNum / 2}" r="${radius}" />
          <circle class="value" part="value"
            cx="${sizeNum / 2}" cy="${sizeNum / 2}" r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}" />
        </svg>
        <div class="label" part="label">${displayValue}</div>
      </div>
    `);

    this.attachListeners();
  }

  private getSizeNum(): number {
    const s = this.size;
    if (s === 'sm') return 60;
    if (s === 'lg') return 140;
    return 100;
  }

  private clampValue(v: number): number {
    const min = this.min;
    const max = this.max;
    const step = this.step;
    let clamped = Math.min(max, Math.max(min, v));
    if (step > 0) {
      clamped = Math.round((clamped - min) / step) * step + min;
      clamped = Math.min(max, Math.max(min, clamped));
    }
    return clamped;
  }

  private emitChange(newValue: number): void {
    const clamped = this.clampValue(newValue);
    if (clamped !== this.value) {
      this.value = clamped;
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: { value: clamped },
        }),
      );
    }
  }

  private attachListeners(): void {
    const knob = this.root.querySelector<HTMLElement>('.knob');
    if (!knob) return;

    knob.addEventListener('mousedown', (e: MouseEvent) => {
      if (this.readonly || this.disabled) return;
      e.preventDefault();
      this._isDragging = true;
      this._startY = e.clientY;
      this._startValue = this.value;
      knob.focus();
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);
    });

    knob.addEventListener('touchstart', (e: TouchEvent) => {
      if (this.readonly || this.disabled) return;
      e.preventDefault();
      this._isDragging = true;
      this._startY = e.touches[0].clientY;
      this._startValue = this.value;
      knob.focus();
    }, { passive: false });

    knob.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this._isDragging || this.readonly || this.disabled) return;
      e.preventDefault();
      const deltaY = this._startY - e.touches[0].clientY;
      const sensitivity = (this.max - this.min) / 100;
      this.emitChange(this._startValue + deltaY * sensitivity);
    }, { passive: false });

    knob.addEventListener('touchend', () => {
      this._isDragging = false;
    });

    knob.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.readonly || this.disabled) return;
      const step = this.step;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault();
          this.emitChange(this.value + step);
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault();
          this.emitChange(this.value - step);
          break;
        case 'Home':
          e.preventDefault();
          this.emitChange(this.min);
          break;
        case 'End':
          e.preventDefault();
          this.emitChange(this.max);
          break;
        case 'PageUp':
          e.preventDefault();
          this.emitChange(this.value + step * 10);
          break;
        case 'PageDown':
          e.preventDefault();
          this.emitChange(this.value - step * 10);
          break;
      }
    });
  }

  private _onMouseMove = (e: MouseEvent): void => {
    if (!this._isDragging) return;
    const deltaY = this._startY - e.clientY;
    const sensitivity = (this.max - this.min) / 100;
    this.emitChange(this._startValue + deltaY * sensitivity);
  };

  private _onMouseUp = (): void => {
    this._isDragging = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  };

  protected override disconnectedCallback(): void {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    super.disconnectedCallback();
  }
}

export function defineFxKnob(): typeof FxKnob {
  return defineElement('fx-knob', FxKnob);
}