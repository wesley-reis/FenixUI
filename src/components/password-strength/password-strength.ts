import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-password-strength> — Medidor de força de senha.
 *
 * Atributos: value (a senha a avaliar), label (rótulo acima), size (sm|md|lg).
 * A força (0-4) é calculada por comprimento e variedade de caracteres.
 * Evento (composed): `change` (detail: { score: 0-4, value }).
 */
export class FxPasswordStrength extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .label {
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-muted);
      margin-bottom: var(--fx-space-xs);
      display: flex;
      justify-content: space-between;
      gap: var(--fx-space-md);
    }
    .label strong { color: var(--_color); }
    .bars {
      display: flex;
      gap: 4px;
      --_color: var(--fx-text-muted);
    }
    .bar {
      flex: 1;
      height: 6px;
      border-radius: var(--fx-radius-full);
      background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.08));
      transition: background var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .bar.on { background: var(--_color); }
    :host([size='sm']) .bar { height: 4px; }
    :host([size='lg']) .bar { height: 8px; }
    /* cores por nível via data-score no host */
    :host([data-score='1']) { --_color: var(--fx-color-danger); }
    :host([data-score='2']) { --_color: var(--fx-color-warning); }
    :host([data-score='3']) { --_color: var(--fx-color-info); }
    :host([data-score='4']) { --_color: var(--fx-color-success); }
  `;

  static override get observedAttributes(): string[] {
    return ['value', 'label', 'size'];
  }

  get value(): string { return this.getAttr('value'); }
  set value(v: string) { this.setAttribute('value', v); }

  /** Calcula a força da senha (0-4). */
  private _score(): number {
    const v = this.value;
    if (!v) return 0;
    let score = 0;
    if (v.length >= 6) score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
    return Math.min(4, score);
  }

  private _labelFor(score: number): string {
    return ['Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'][score];
  }

  protected override render(): void {
    this._paint();
  }

  private _paint(): void {
    const score = this._score();
    const label = this.getAttr('label', 'Força da senha');

    this.setTemplate(`
      <div class="label" part="label">
        <span>${label}</span>
        <strong>${score > 0 ? this._labelFor(score) : ''}</strong>
      </div>
      <div class="bars" part="bars" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${score}">
        ${Array.from({ length: 4 }, (_, i) => `<span class="bar ${i < score ? 'on' : ''}" part="bar"></span>`).join('')}
      </div>
    `);
    this.dataset.score = String(score);
  }

  protected override attributeChangedCallback(): void {
    if (this.isConnected) {
      const prev = this._prevScore;
      this._paint();
      const score = this._score();
      if (score !== prev) {
        this.dispatchEvent(new CustomEvent('change', {
          bubbles: true, composed: true,
          detail: { score, value: this.value },
        }));
        this._prevScore = score;
      }
    }
  }

  private _prevScore = -1;
}

export function defineFxPasswordStrength(): typeof FxPasswordStrength {
  return defineElement('fx-password-strength', FxPasswordStrength);
}