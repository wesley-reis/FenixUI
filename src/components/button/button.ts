import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-button> — Componente de ação (piloto).
 *
 * Atributos: variant, size, disabled, loading, type, full.
 * Slots: default (rótulo), `icon` (ícone opcional).
 * Evento: `click` nativo atravessa o Shadow DOM (composed) — ouça no host.
 */
export class FxButton extends FxElement {
  static override styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: var(--fx-space-sm);
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      font-weight: var(--fx-font-weight);
      line-height: var(--fx-font-line-height);
      padding: var(--fx-space-md) var(--fx-space-xl);
      border-radius: var(--fx-radius-md);
      border: 1px solid transparent;
      color: #fff;
      background: var(--fx-color-primary);
      cursor: pointer;
      user-select: none;
      text-decoration: none;
      transition:
        background-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        transform var(--fx-motion-duration-fast) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .btn:focus-visible {
      outline: 2px solid var(--fx-color-primary);
      outline-offset: 2px;
    }
    .btn:hover { filter: brightness(0.88); }
    .btn:active { transform: translateY(1px); }

    /* Tamanhos — alturas vindas dos tokens (personalizáveis por preset) */
    .btn { min-height: var(--fx-size-md); }
    :host([size='sm']) .btn { padding: var(--fx-space-sm) var(--fx-space-lg); font-size: var(--fx-font-size); min-height: var(--fx-size-sm); }
    :host([size='lg']) .btn { padding: var(--fx-space-lg) var(--fx-space-xl); font-size: calc(var(--fx-font-size) + 4px); min-height: var(--fx-size-lg); }

    /* Full width */
    :host([full]) .btn { width: 100%; }

    /* Variantes */
    :host([variant='secondary']) .btn { background: var(--fx-color-secondary); }
    :host([variant='success']) .btn { background: var(--fx-color-success); }
    :host([variant='warning']) .btn { background: var(--fx-color-warning); }
    :host([variant='danger']) .btn { background: var(--fx-color-danger); }
    :host([variant='ghost']) .btn { background: transparent; color: var(--fx-text-default); }
    :host([variant='ghost']) .btn:hover { background: var(--fx-surface-hover); filter: none; }
    :host([variant='outline']) .btn { background: transparent; color: var(--fx-color-primary); border-color: var(--fx-color-primary); }
    :host([variant='outline']) .btn:hover { background: var(--fx-surface-hover); filter: none; }

    /* Ícone e spinner */
    .btn__icon { display: inline-flex; }
    .btn__icon[hidden] { display: none; }
    .btn__label { display: inline-flex; align-items: center; justify-content: center; }
    .btn[hidden] { display: none; }
    .btn__spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: var(--fx-radius-full);
      animation: fx-spin var(--fx-motion-duration-normal) linear infinite;
    }
    @keyframes fx-spin { to { transform: rotate(360deg); } }

    /* Estados */
    :host([disabled]) .btn,
    :host([loading]) .btn {
      opacity: 0.55;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Efeito ripple (estilo PrimeVue). Desative com effect.ripple: '0' no preset. */
    .btn {
      position: relative;
      overflow: hidden;
    }
    .btn__ripple {
      position: absolute;
      border-radius: var(--fx-radius-full);
      background: currentColor;
      opacity: 0.28;
      transform: scale(0);
      animation: fx-ripple 600ms var(--fx-motion-easing) forwards;
      pointer-events: none;
    }
    @keyframes fx-ripple {
      to {
        transform: scale(2.6);
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .btn__ripple { display: none; }
    }
  `;

  static override get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled', 'loading', 'type', 'full'];
  }

  /** Tamanho. Padrão: `'md'`. */
  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) {
    this.setAttribute('size', value);
  }

  get disabled(): boolean {
    return this.hasAttr('disabled');
  }
  set disabled(value: boolean) {
    this.toggleAttr('disabled', Boolean(value));
  }

  get loading(): boolean {
    return this.hasAttr('loading');
  }
  set loading(value: boolean) {
    this.toggleAttr('loading', Boolean(value));
  }

  protected override render(): void {
    const loading = this.hasAttr('loading');
    const disabled = this.hasAttr('disabled') || loading;
    const btnType = this.getAttr('type', 'button');

    this.setTemplate(`
      <button class="btn" part="button" type="${btnType}">
        <span class="btn__icon" part="icon"><slot name="icon"></slot></span>
        <span class="btn__label" part="label"><slot></slot></span>
        ${loading ? '<span class="btn__spinner" aria-hidden="true"></span>' : ''}
      </button>
    `);

    const btn = this.root.querySelector<HTMLButtonElement>('.btn');
    if (!btn) return;

    // Esconde o container do ícone quando o slot está vazio,
    // evitando espaço fantasma do `gap` que descentraliza o rótulo.
    const iconSlot = btn.querySelector<HTMLSlotElement>('.btn__icon slot');
    const iconWrap = this.root.querySelector<HTMLElement>('.btn__icon');
    const hasIcon = Boolean(iconSlot?.assignedNodes({ flatten: true }).some((n) =>
      n.nodeType === Node.ELEMENT_NODE || (n.textContent ?? '').trim() !== '',
    ));
    iconWrap?.toggleAttribute('hidden', !hasIcon);
    if (disabled) {
      btn.setAttribute('disabled', '');
      btn.setAttribute('aria-disabled', 'true');
    } else {
      btn.removeAttribute('disabled');
      btn.removeAttribute('aria-disabled');
    }
    if (loading) btn.setAttribute('aria-busy', 'true');
    else btn.removeAttribute('aria-busy');
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('pointerdown', this.spawnRipple);
  }

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('pointerdown', this.spawnRipple);
  }

  /**
   * Efeito ripple estilo PrimeVue: cria um círculo que expande do ponto
   * de clique e desaparece. Respeita o token `effect.ripple` ('0' desativa)
   * e `prefers-reduced-motion` (via CSS).
   */
  private spawnRipple = (event: PointerEvent): void => {
    if (this.hasAttr('disabled') || this.hasAttr('loading')) return;
    const enabled = getComputedStyle(this)
      .getPropertyValue('--fx-effect-ripple')
      .trim();
    if (enabled === '0' || enabled === 'false') return;

    const btn = this.root.querySelector<HTMLElement>('.btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'btn__ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };
}

export function defineFxButton(): typeof FxButton {
  return defineElement('fx-button', FxButton);
}