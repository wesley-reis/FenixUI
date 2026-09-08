import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-carousel> — Carrossel de slides com navegação e indicadores.
 *
 * Atributos: active (índice do slide), autoplay (ms), loop, show-arrows,
 * show-indicators.
 * Slot `slide`: cada elemento com [slot="slide"] vira um slide.
 * Eventos (composed): `change` (detail: { index }).
 */
export class FxCarousel extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .viewport {
      position: relative;
      overflow: hidden;
      border-radius: var(--fx-radius-lg);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.04));
    }
    .slide {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--fx-space-xl);
      box-sizing: border-box;
      color: var(--fx-text-default);
    }
    .slide[hidden] { display: none; }
    .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 34px;
      height: 34px;
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-full);
      background: color-mix(in srgb, var(--fx-surface-background, #fff) 82%, transparent);
      color: var(--fx-text-default);
      font-size: calc(var(--fx-font-size) + 4px);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing), border-color var(--fx-motion-duration-fast) var(--fx-motion-easing), color var(--fx-motion-duration-fast) var(--fx-motion-easing), transform var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .arrow:hover {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
      transform: translateY(-50%) scale(1.08);
    }
    .arrow[hidden] { display: none; }
    .arrow.prev { left: var(--fx-space-md); }
    .arrow.next { right: var(--fx-space-md); }
    .indicators {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding: var(--fx-space-md) 0 var(--fx-space-xs);
    }
    .indicators[hidden] { display: none; }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: var(--fx-radius-full);
      border: none;
      padding: 0;
      background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.15));
      cursor: pointer;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing), width var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .dot.on { background: var(--fx-color-primary); width: 20px; }
  `;

  static override get observedAttributes(): string[] {
    return ['active', 'autoplay', 'loop', 'show-arrows', 'show-indicators'];
  }

  get active(): number {
    const n = Number(this.getAttr('active', '0'));
    return Math.min(this.slideCount - 1, Math.max(0, Number.isFinite(n) ? n : 0));
  }
  set active(v: number) {
    this.setAttribute('active', String(Math.min(this.slideCount - 1, Math.max(0, v))));
  }

  get slideCount(): number { return this._slides.length; }

  private _slides: Element[] = [];
  private _timer?: ReturnType<typeof setInterval>;

  protected override render(): void {
    this._slides = Array.from(this.children).filter((el) => el.matches('[slot="slide"]'));

    const contentsHtml = this._slides
      .map((s, i) => `<div class="slide" part="slide" data-i="${i}" ${i === this.active ? '' : 'hidden'}>${s.innerHTML}</div>`)
      .join('');

    this.setTemplate(`
      <div class="viewport" part="viewport">
        ${contentsHtml}
        <button type="button" class="arrow prev" part="arrow" aria-label="Anterior" ${this.hasAttr('show-arrows') ? '' : 'hidden'}>‹</button>
        <button type="button" class="arrow next" part="arrow" aria-label="Próximo" ${this.hasAttr('show-arrows') ? '' : 'hidden'}>›</button>
      </div>
      <div class="indicators" part="indicators" ${this.hasAttr('show-indicators') ? '' : 'hidden'}>
        ${this._slides.map((_, i) => `<button type="button" class="dot ${i === this.active ? 'on' : ''}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}
      </div>
    `);

    this._bind();
    this._restartAutoplay();
  }

  protected override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (!this.isConnected || oldValue === newValue) return;
    // só o índice ativo evita re-render total (preserva autoplay)
    if (name === 'active' && this._slides.length) {
      this._go(this.active, false);
      this._restartAutoplay();
      return;
    }
    // show-arrows/show-indicators/loop/autoplay: re-render estrutural
    this.render();
  }

  private _go(index: number, emit = true): void {
    const count = this._slides.length;
    if (!count) return;
    let target: number;
    if (this.hasAttr('loop')) {
      // wrap nas duas direções (permite voltar do primeiro ao último)
      target = ((index % count) + count) % count;
    } else {
      target = Math.min(count - 1, Math.max(0, index));
    }
    // guarda: evita recursão infinita (setAttribute → attributeChangedCallback → _go)
    if (String(target) === this.getAttribute('active')) return;
    this.active = target;

    this.root.querySelectorAll<HTMLElement>('.slide').forEach((s) => {
      s.toggleAttribute('hidden', Number(s.dataset.i) !== target);
    });
    this.root.querySelectorAll<HTMLElement>('.dot').forEach((d) => {
      d.classList.toggle('on', Number(d.dataset.i) === target);
    });
    if (emit) {
      this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: { index: target } }));
    }
  }

  next(): void { this._go(this.active + 1); }
  prev(): void { this._go(this.active - 1); }

  private _bind(): void {
    this.root.querySelector('.arrow.prev')?.addEventListener('click', () => this.prev());
    this.root.querySelector('.arrow.next')?.addEventListener('click', () => this.next());
    this.root.querySelectorAll<HTMLElement>('.dot').forEach((d) => {
      d.addEventListener('click', () => this._go(Number(d.dataset.i)));
    });
  }

  private _restartAutoplay(): void {
    if (this._timer) { clearInterval(this._timer); this._timer = undefined; }
    const ms = Number(this.getAttr('autoplay', '0'));
    if (ms > 0) {
      this._timer = setInterval(() => this._go(this.active + 1), ms);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timer) { clearInterval(this._timer); this._timer = undefined; }
  }
}

export function defineFxCarousel(): typeof FxCarousel {
  return defineElement('fx-carousel', FxCarousel);
}
