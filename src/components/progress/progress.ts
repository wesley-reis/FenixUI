import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-progress> — Indicador de progresso determinado/indeterminado.
 *
 * Atributos: value (0-100), indeterminate, variant (primary|success|warning|danger),
 * label (mostra %), size (sm|md|lg).
 * Evento: `complete` quando chega a 100.
 */
export class FxProgress extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      --_color: var(--fx-color-primary);
    }
    :host([variant='success']) { --_color: var(--fx-color-success); }
    :host([variant='warning']) { --_color: var(--fx-color-warning); }
    :host([variant='danger']) { --_color: var(--fx-color-danger); }
    .row {
      display: flex;
      align-items: center;
      gap: var(--fx-space-md);
    }
    .track {
      flex: 1;
      height: 8px;
      background: var(--fx-surface-surface-hover);
      border-radius: var(--fx-radius-full);
      overflow: hidden;
    }
    :host([size='sm']) .track { height: 4px; }
    :host([size='lg']) .track { height: 12px; }
    .bar {
      height: 100%;
      width: 0%;
      background: var(--_color);
      border-radius: var(--fx-radius-full);
      transition: width var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([indeterminate]) .bar {
      width: 40%;
      animation: slide 1.2s ease-in-out infinite;
    }
    @keyframes slide {
      from { transform: translateX(-100%); }
      to { transform: translateX(350%); }
    }
    .pct {
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-default);
      font-weight: 600;
      min-width: 34px;
      text-align: right;
    }
    .caption {
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-muted);
      margin-bottom: var(--fx-space-xs);
    }
  `;

  static override get observedAttributes(): string[] {
    return ['value', 'indeterminate', 'variant', 'label', 'hide-label', 'size'];
  }

  get value(): number { return Number(this.getAttr('value', '0')) || 0; }
  set value(v: number) { this.setAttribute('value', String(Math.min(100, Math.max(0, v)))); }

  protected override render(): void {
    const pct = Math.min(100, Math.max(0, this.value));
    const indeterminate = this.hasAttr('indeterminate');
    const labelText = this.getAttr('label');
    const showPct = !indeterminate && !this.hasAttr('hide-label');

    this.setTemplate(`
      ${labelText ? `<div class="caption" part="caption">${esc(labelText)}</div>` : ''}
      <div class="row">
        <div class="track" part="track" role="progressbar"
          aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="bar" part="bar" style="width: ${indeterminate ? '40%' : `${pct}%`}"></div>
        </div>
        ${showPct ? `<span class="pct">${pct}%</span>` : ''}
      </div>
    `);

    if (!this._done && !this.hasAttr('indeterminate') && pct >= 100) {
      this._done = true;
      this.dispatchEvent(new CustomEvent('complete', { bubbles: true, composed: true }));
    }
    if (pct < 100) this._done = false;
  }

  private _done = false;
}

export function defineFxProgress(): typeof FxProgress {
  return defineElement('fx-progress', FxProgress);
}
