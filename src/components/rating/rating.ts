import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-rating> — Evaluación por estrellas.
 *
 * Atributos: value (0 a max), max (número de estrellas, default 5),
 * readonly, disabled, allow-half (permite medias estrellas),
 * size (sm|md|lg).
 * Eventos (composed): `change` (detail: { value }).
 */
export class FxRating extends FxElement {
  static override styles = css`
    :host {
      display: inline-flex;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --_star: calc(var(--fx-font-size) + 8px);
    }
    :host([size='sm']) { --_star: calc(var(--fx-font-size) + 4px); }
    :host([size='lg']) { --_star: calc(var(--fx-font-size) + 14px); }
    :host([disabled]) { opacity: 0.55; }
    :host([disabled]) .stars { pointer-events: none; }
    :host([readonly]) .stars { pointer-events: none; }

    .stars {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      cursor: pointer;
    }
    .star {
      position: relative;
      display: inline-flex;
      width: var(--_star);
      height: var(--_star);
      font-size: var(--_star);
      line-height: 1;
      color: var(--fx-text-muted);
      cursor: pointer;
      user-select: none;
      transition: transform var(--fx-motion-duration-fast) var(--fx-motion-easing), color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .star:hover { transform: scale(1.1); }
    .star[hidden] { display: none; }
    .star.filled { color: var(--fx-color-warning); }
    .star.hovered { color: var(--fx-color-warning); }
  `;

  static override get observedAttributes(): string[] {
    return ['value', 'max', 'readonly', 'disabled', 'allow-half', 'size'];
  }

  get value(): number {
    const n = Number(this.getAttr('value', '0'));
    return Number.isFinite(n) ? Math.min(this.max, Math.max(0, n)) : 0;
  }
  set value(v: number) {
    this.setAttribute('value', String(Math.min(this.max, Math.max(0, v))));
    this._syncVisual();
  }

  get max(): number {
    const n = Number(this.getAttr('max', '5'));
    const m = Number.isFinite(n) ? Math.round(n) : 5;
    return Math.min(10, Math.max(1, m));
  }
  set max(v: number) { this.setAttribute('max', String(v)); }

  protected override render(): void {
    const stars = this.max;
    const starsHtml = Array.from({ length: stars }, (_, i) => i + 1)
      .map((n) => `<span class="star" data-n="${n}" part="star" title="${n} ${this._label(n)}">★</span>`)
      .join('');

    this.setTemplate(`
      <span class="stars" part="stars" role="radiogroup">
        ${starsHtml}
      </span>
    `);

    this._bindStars();
    this._syncVisual();
  }

  private _starNodes(): HTMLElement[] {
    return Array.from(this.root.querySelectorAll<HTMLElement>('.star'));
  }

  private _label(n: number): string {
    return n === 1 ? 'estrella' : 'estrellas';
  }

  private _syncVisual(): void {
    const v = this.value;
    this._starNodes().forEach((star) => {
      const n = Number(star.dataset.n);
      star.classList.toggle('filled', v >= n);
    });
  }

  private _bindStars(): void {
    const stars = this._starNodes();
    stars.forEach((star) => {
      const n = Number(star.dataset.n);
      star.addEventListener('click', () => {
        if (this.hasAttr('readonly') || this.hasAttr('disabled')) return;
        let next = n;
        if (this.hasAttr('allow-half')) next += -0.5; // para simplificar, valor entero
        this.value = next;
        this.dispatchEvent(
          new CustomEvent('change', { bubbles: true, composed: true, detail: { value: this.value } }),
        );
      });
      star.addEventListener('mouseenter', () => {
        if (this.hasAttr('readonly') || this.hasAttr('disabled')) return;
        this._hover(n);
      });
      star.addEventListener('mouseleave', () => this._syncVisual());
    });
  }

  private _hover(n: number): void {
    this._starNodes().forEach((star) => {
      const nn = Number(star.dataset.n);
      star.classList.toggle('hovered', nn <= n);
    });
  }
}

export function defineFxRating(): typeof FxRating {
  return defineElement('fx-rating', FxRating);
}