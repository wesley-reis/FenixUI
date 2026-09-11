import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-popover> — Painel flutuante ancorado em um elemento, com posicionamento
 * automático (flip para cima quando não há espaço abaixo), no estilo Popover do PrimeVue.
 *
 * Atributos:
 *  - target (seletor CSS do elemento âncora — obrigatório);
 *  - trigger (click|hover, padrão click);
 *  - position (top|bottom|auto, padrão auto — faz flip conforme o espaço);
 *  - open (exibe o popover);
 *  - dismissible (fecha ao clicar fora, padrão true).
 *
 * Slots: `header`, padrão (conteúdo), `footer`.
 *
 * Eventos (composed): `show` e `hide`.
 */
export class FxPopover extends FxElement {
  static override styles = css`
    :host { display: contents; }
    .popup {
      position: fixed;
      margin: 0;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      padding: 0;
      min-width: 220px;
      max-width: min(380px, calc(100vw - 24px));
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
      z-index: var(--fx-z-modal, 1100);
      animation: fxpp-pop var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease);
      overflow: hidden;
    }
    .popup[hidden] { display: none; }
    @keyframes fxpp-pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    .popup::before, .popup::after {
      content: '';
      position: absolute;
      border: 7px solid transparent;
    }
    .popup[data-side='bottom']::before {
      top: -14px; left: var(--fxpp-arrow-x, 50%);
      border-bottom-color: var(--fx-border-default);
    }
    .popup[data-side='bottom']::after {
      top: -12px; left: var(--fxpp-arrow-x, 50%);
      border-bottom-color: var(--fx-surface-background);
    }
    .popup[data-side='top']::before {
      bottom: -14px; left: var(--fxpp-arrow-x, 50%);
      border-top-color: var(--fx-border-default);
    }
    .popup[data-side='top']::after {
      bottom: -12px; left: var(--fxpp-arrow-x, 50%);
      border-top-color: var(--fx-surface-background);
    }
    header {
      padding: var(--fx-space-md) var(--fx-space-lg);
      border-bottom: 1px solid var(--fx-border-default);
      font-weight: 600;
      font-size: calc(var(--fx-font-size) + 1px);
      color: var(--fx-text-default);
    }
    header[hidden] { display: none; }
    .body { padding: var(--fx-space-md) var(--fx-space-lg); }
    footer {
      padding: var(--fx-space-md) var(--fx-space-lg);
      border-top: 1px solid var(--fx-border-default);
      display: flex;
      justify-content: flex-end;
      gap: var(--fx-space-sm);
    }
    footer[hidden] { display: none; }
  `;

  static override get observedAttributes(): string[] {
    return ['open', 'target', 'trigger', 'position', 'dismissible'];
  }

  get open(): boolean { return this.hasAttr('open'); }
  set open(value: boolean) { this.toggleAttr('open', value); }

  protected override render(): void {
    this.setTemplate(`
      <div class="popup" part="popover" role="dialog" aria-modal="false" ${this.open ? '' : 'hidden'}>
        <header part="header" hidden><slot name="header"></slot></header>
        <div class="body" part="content"><slot></slot></div>
        <footer part="footer" hidden><slot name="footer"></slot></footer>
      </div>
    `);

    if (!this.open) return;
    const popup = this.root.querySelector<HTMLElement>('.popup');
    if (!popup) return;

    // Evita listeners duplicados em re-renders enquanto aberto
    // (ex.: mudança de target/position/trigger com o popover aberto).
    this._cleanup?.();
    this._cleanup = undefined;

    const close = (): void => {
      this.open = false;
      this._cleanup?.();
      this._cleanup = undefined;
      this._restoreFocus();
      this.dispatchEvent(new CustomEvent('hide', { bubbles: true, composed: true }));
    };

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
    };
    const onPointerDown = (e: MouseEvent): void => {
      if (!this.hasAttr('dismissible')) return;
      const path = e.composedPath();
      const anchor = this._anchor();
      const hitAnchor = anchor ? path.includes(anchor) : false;
      if (!path.includes(popup) && !hitAnchor) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown, true);
    this._cleanup = () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };

    // sincroniza slots ANTES de posicionar (header/footer alteram a altura)
    this._syncSlots();
    this._position(popup);
    this._previouslyFocused = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => popup.focus({ preventScroll: true }));
    this.dispatchEvent(new CustomEvent('show', { bubbles: true, composed: true }));
  }

  private _cleanup?: () => void;
  private _previouslyFocused: HTMLElement | null = null;

  private _anchor(): HTMLElement | null {
    const selector = this.getAttr('target');
    if (!selector) return null;
    try { return document.querySelector<HTMLElement>(selector); }
    catch { return null; }
  }

  private _syncSlots(): void {
    const header = this.root.querySelector<HTMLSlotElement>('slot[name="header"]');
    const footer = this.root.querySelector<HTMLSlotElement>('slot[name="footer"]');
    const headerWrap = this.root.querySelector<HTMLElement>('header');
    const footerWrap = this.root.querySelector<HTMLElement>('footer');
    const hasHeader = !!header && header.assignedNodes().length > 0;
    const hasFooter = !!footer && footer.assignedNodes().length > 0;
    headerWrap?.toggleAttribute('hidden', !hasHeader);
        footerWrap?.toggleAttribute('hidden', !hasFooter);
  }

  private _position(popup: HTMLElement): void {
    const anchor = this._anchor();
    if (!anchor) return;
    popup.hidden = false;

    const a = anchor.getBoundingClientRect();
    const p = popup.getBoundingClientRect();
    const gap = 8;
    const margin = 8;

    let side: 'top' | 'bottom';
    const pos = this.getAttr('position', 'auto');
    if (pos === 'top') side = 'top';
    else if (pos === 'bottom') side = 'bottom';
    else side = a.bottom + gap + p.height <= window.innerHeight - margin ? 'bottom' : 'top';

    // flip quando o lado forçado não cabe (evita sobrepor o anchor)
    if (side === 'top' && a.top - gap - p.height < margin && a.bottom + gap + p.height <= window.innerHeight - margin) {
      side = 'bottom';
    } else if (side === 'bottom' && a.bottom + gap + p.height > window.innerHeight - margin && a.top - gap - p.height >= margin) {
      side = 'top';
    }

    const left = Math.min(
      Math.max(margin, a.left + a.width / 2 - p.width / 2),
      window.innerWidth - p.width - margin,
    );
    const top = side === 'bottom' ? a.bottom + gap : a.top - gap - p.height;

    popup.dataset.side = side;
    popup.style.left = `${Math.round(left)}px`;
    popup.style.top = `${Math.round(Math.max(margin, top))}px`;
    const arrowX = Math.min(Math.max(a.left + a.width / 2 - left, 16), p.width - 16);
    popup.style.setProperty('--fxpp-arrow-x', `${Math.round(arrowX)}px`);
  }

  private _restoreFocus(): void {
    if (this._previouslyFocused?.isConnected) this._previouslyFocused.focus();
    this._previouslyFocused = null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('scroll', this._onReposition, true);
    window.addEventListener('resize', this._onReposition);
    this._bindTrigger();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this._onReposition, true);
    window.removeEventListener('resize', this._onReposition);
    this._triggerCleanup?.();
    this._triggerCleanup = undefined;
    this._cleanup?.();
    this._cleanup = undefined;
    this._restoreFocus();
  }

  private _onReposition = (): void => {
    if (!this.open) return;
    const popup = this.root.querySelector<HTMLElement>('.popup');
    if (popup && !popup.hidden) this._position(popup);
  };

  private _bindTrigger(): void {
    const anchor = this._anchor();
    if (!anchor) return;
    const trigger = this.getAttr('trigger', 'click');

    if (trigger === 'hover') {
      anchor.addEventListener('mouseenter', this._onEnter);
      anchor.addEventListener('mouseleave', this._onLeave);
      this._triggerCleanup = () => {
        anchor.removeEventListener('mouseenter', this._onEnter);
        anchor.removeEventListener('mouseleave', this._onLeave);
      };
    } else {
      anchor.addEventListener('pointerdown', this._onClick);
      this._triggerCleanup = () => anchor.removeEventListener('pointerdown', this._onClick);
    }
  }

  private _triggerCleanup?: () => void;
  private _onEnter = (): void => { this.open = true; };
  private _onLeave = (): void => { this.open = false; };
  private _onClick = (): void => { this.open = !this.open; };
}

export function defineFxPopover(): typeof FxPopover {
  return defineElement('fx-popover', FxPopover);
}
