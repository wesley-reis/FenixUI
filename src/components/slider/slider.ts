import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-slider> — Controle deslizante para seleção de valor numérico em um intervalo.
 *
 * Atributos: min, max, step, value, size (sm|md|lg), disabled, show-value,
 * label (rótulo acima do trilho).
 * Eventos (composed): `input` (durante o arraste) e `change` (ao soltar) —
 * ambos com `detail: { value: number }`.
 */
export class FxSlider extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --_track-h: 6px;
      --_thumb: 18px;
    }
    :host([size='sm']) { --_track-h: 4px; --_thumb: 14px; }
    :host([size='lg']) { --_track-h: 8px; --_thumb: 22px; }
    :host([disabled]) { opacity: 0.55; pointer-events: none; }

    .label {
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-muted);
      margin-bottom: var(--fx-space-xs);
      display: flex;
      justify-content: space-between;
      gap: var(--fx-space-md);
      align-items: center;
    }
    .track-wrap {
      position: relative;
      display: flex;
      align-items: center;
      height: var(--_thumb);
      cursor: pointer;
      touch-action: none;
    }
    .track {
      width: 100%;
      height: var(--_track-h);
      border-radius: var(--fx-radius-full);
      background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.08));
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--fx-color-primary);
      border-radius: var(--fx-radius-full);
    }
    .thumb {
      position: absolute;
      top: 50%;
      width: var(--_thumb);
      height: var(--_thumb);
      border-radius: var(--fx-radius-full);
      background: var(--fx-surface-background);
      border: 2px solid var(--fx-color-primary);
      box-shadow: var(--fx-shadow-sm);
      transform: translate(-50%, -50%);
      transition: box-shadow var(--fx-motion-duration-fast) var(--fx-motion-easing);
      box-sizing: border-box;
    }
    .track-wrap:hover .thumb,
    .track-wrap.dragging .thumb { box-shadow: var(--fx-effect-focus-ring, none); }
    .track-wrap:focus-visible { outline: none; }
    .track-wrap:focus-visible .thumb {
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .value {
      position: absolute;
      bottom: calc(100% + 6px);
      transform: translateX(-50%);
      background: var(--fx-text-default, #1e293b);
      color: var(--fx-surface-background, #fff);
      font-size: calc(var(--fx-font-size) - 3px);
      font-weight: 600;
      padding: 2px var(--fx-space-xs);
      border-radius: var(--fx-radius-sm);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .track-wrap:hover .value,
    .track-wrap.dragging .value,
    .track-wrap:focus-visible .value { opacity: 1; }
  `;

  static override get observedAttributes(): string[] {
    return ['min', 'max', 'step', 'size', 'disabled', 'show-value', 'label'];
  }

  get min(): number { return this._num('min', 0); }
  get max(): number { return this._num('max', 100); }
  get step(): number { return this._num('step', 1); }

  get value(): number {
    return this._clamp(this._num('value', this.min));
  }
  set value(v: number) {
    const snapped = this._snap(v);
    this.setAttribute('value', String(snapped));
    // atualiza visual sem re-render (preserva estado de drag/foco)
    if (this.isConnected) this._syncVisual();
  }

  private _num(attr: string, fallback: number): number {
    const raw = this.getAttribute(attr);
    if (raw === null || raw === '') return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  private _clamp(v: number): number {
    return Math.min(this.max, Math.max(this.min, v));
  }

  /** Arredonda para o múltiplo de `step` mais próximo dentro do intervalo. */
  private _snap(v: number): number {
    const step = this.step || 1;
    const snapped = Math.round((this._clamp(v) - this.min) / step) * step + this.min;
    return Number(this._clamp(snapped).toFixed(10));
  }

  /** Percentual (0-100) do valor atual dentro do intervalo. */
  private _pct(): number {
    const span = this.max - this.min;
    return span <= 0 ? 0 : ((this.value - this.min) / span) * 100;
  }

  protected override render(): void {
    const pct = this._pct();
    const label = this.getAttr('label');
    const showValue = this.hasAttr('show-value');

    this.setTemplate(`
      ${label ? `<div class="label" part="label"><span>${label}</span>${showValue ? `<span>${this.value}</span>` : ''}</div>` : ''}
      <div class="track-wrap" part="track" tabindex="0" role="slider"
        aria-valuemin="${this.min}" aria-valuemax="${this.max}" aria-valuenow="${this.value}"
        aria-label="${label || 'Slider'}" ${this.hasAttr('disabled') ? 'aria-disabled="true"' : ''}>
        <div class="track"><div class="fill" part="fill" style="width: ${pct}%"></div></div>
        <div class="thumb" part="thumb" style="left: ${pct}%"></div>
        ${showValue ? `<span class="value" style="left: ${pct}%">${this.value}</span>` : ''}
      </div>
    `);

    this._bindPointer();
    this._bindKeyboard();
  }

  private _dragging = false;
  private _onMove?: (e: PointerEvent) => void;
  private _onUp?: (e: PointerEvent) => void;

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Limpa listeners de janela se o elemento for removido durante um drag.
    if (this._dragging) {
      this._dragging = false;
      if (this._onMove) window.removeEventListener('pointermove', this._onMove);
      if (this._onUp) window.removeEventListener('pointerup', this._onUp);
    }
  }

  private _wrap(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>('.track-wrap');
  }

  private _bindPointer(): void {
    const wrap = this._wrap();
    if (!wrap) return;

    const valueFromEvent = (e: PointerEvent): number => {
      const rect = wrap.getBoundingClientRect();
      const ratio = rect.width <= 0 ? 0 : (e.clientX - rect.left) / rect.width;
      return this.min + ratio * (this.max - this.min);
    };

    const move = (e: PointerEvent): void => {
      if (!this._dragging) return;
      this.value = valueFromEvent(e);
      this._syncVisual();
      this.dispatchEvent(
        new CustomEvent('input', { bubbles: true, composed: true, detail: { value: this.value } }),
      );
    };
    this._onMove = move;
    const up = (e: PointerEvent): void => {
      if (!this._dragging) return;
      this._dragging = false;
      wrap.classList.remove('dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.value = valueFromEvent(e);
      this._syncVisual();
      this.dispatchEvent(
        new CustomEvent('change', { bubbles: true, composed: true, detail: { value: this.value } }),
      );
    };
    this._onUp = up;

    wrap.addEventListener('pointerdown', (e) => {
      if (this.hasAttr('disabled')) return;
      this._dragging = true;
      wrap.classList.add('dragging');
      wrap.focus();
      this.value = valueFromEvent(e);
      this._syncVisual();
      this.dispatchEvent(
        new CustomEvent('input', { bubbles: true, composed: true, detail: { value: this.value } }),
      );
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
  }

  private _bindKeyboard(): void {
    const wrap = this._wrap();
    if (!wrap) return;
    wrap.addEventListener('keydown', (e) => {
      if (this.hasAttr('disabled')) return;
      const ev = e as KeyboardEvent;
      const big = (this.max - this.min) / 10;
      let next: number | null = null;
      switch (ev.key) {
        case 'ArrowRight': case 'ArrowUp': next = this.value + this.step; break;
        case 'ArrowLeft': case 'ArrowDown': next = this.value - this.step; break;
        case 'PageUp': next = this.value + big; break;
        case 'PageDown': next = this.value - big; break;
        case 'Home': next = this.min; break;
        case 'End': next = this.max; break;
        default: return;
      }
      ev.preventDefault();
      this.value = next;
      this._syncVisual();
      this.dispatchEvent(
        new CustomEvent('input', { bubbles: true, composed: true, detail: { value: this.value } }),
      );
      this.dispatchEvent(
        new CustomEvent('change', { bubbles: true, composed: true, detail: { value: this.value } }),
      );
    });
  }

  /** Atualiza fill/thumb/tooltip/aria sem re-renderizar o template (evita perder o drag). */
  private _syncVisual(): void {
    const pct = this._pct();
    const wrap = this._wrap();
    if (!wrap) return;
    const fill = wrap.querySelector<HTMLElement>('.fill');
    const thumb = wrap.querySelector<HTMLElement>('.thumb');
    const tip = wrap.querySelector<HTMLElement>('.value');
    if (fill) fill.style.width = `${pct}%`;
    if (thumb) thumb.style.left = `${pct}%`;
    if (tip) {
      tip.style.left = `${pct}%`;
      tip.textContent = String(this.value);
    }
    wrap.setAttribute('aria-valuenow', String(this.value));
    const labelPct = this.root.querySelector<HTMLElement>('.label span:last-child');
    if (labelPct) labelPct.textContent = String(this.value);
  }
}

export function defineFxSlider(): typeof FxSlider {
  return defineElement('fx-slider', FxSlider);
}

