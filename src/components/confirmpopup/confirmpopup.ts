import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';
import { FENIX_ICON_BASE_CSS, isFenixIconName } from '../../icons/base-css';

/**
 * <fx-confirmpopup> — Popup de confirmação não-modal ancorado em um elemento,
 * exibido acima ou abaixo dinamicamente (com flip automático quando não há
 * espaço na viewport), no estilo ConfirmPopup do PrimeVue.
 *
 * Atributos:
 *  - target (seletor CSS do elemento âncora — obrigatório para abrir);
 *  - message (texto da mensagem, quando o slot padrão não é usado);
 *  - icon (emoji/glifo exibido antes da mensagem; se for um nome da Fenix Icons,
 *    ex.: icon="help", é renderizado com a fonte de ícones);
 *  - accept-label / reject-label (textos dos botões padrão);
 *  - position (top|bottom|auto — padrão `auto`, que faz flip conforme o espaço);
 *  - open (exibe o popup).
 *
 * Slots:
 *  - padrão: corpo da mensagem (template "message");
 *  - `accept`: conteúdo do botão de confirmação (template "accept");
 *  - `reject`: conteúdo do botão de rejeição (template "reject").
 *
 * Eventos (composed): `accept` e `reject` — ambos fecham o popup.
 */
export class FxConfirmPopup extends FxElement {
  static override styles = css`
    :host { display: contents; }
    .popup {
      position: fixed;
      margin: 0;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      padding: var(--fx-space-md) var(--fx-space-lg);
      min-width: 220px;
      max-width: min(380px, calc(100vw - 24px));
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
      z-index: var(--fx-z-modal, 1100);
      animation: fxcp-pop var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease);
    }
    .popup[hidden] { display: none; }
    @keyframes fxcp-pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    /* seta indicadora */
    .popup::before {
      content: '';
      position: absolute;
      left: var(--fxcp-arrow-x, 50%);
      border: 7px solid transparent;
    }
    .popup[data-side='bottom']::before {
      top: -14px;
      border-bottom-color: var(--fx-border-default);
    }
    .popup[data-side='top']::before {
      bottom: -14px;
      border-top-color: var(--fx-border-default);
    }
    .popup::after {
      content: '';
      position: absolute;
      left: var(--fxcp-arrow-x, 50%);
      border: 6px solid transparent;
    }
    .popup[data-side='bottom']::after {
      top: -12px;
      border-bottom-color: var(--fx-surface-background);
    }
    .popup[data-side='top']::after {
      bottom: -12px;
      border-top-color: var(--fx-surface-background);
    }
    .message {
      display: flex;
      align-items: flex-start;
      gap: var(--fx-space-sm);
    }
    .icon { font-size: calc(var(--fx-font-size) + 4px); line-height: 1.2; }
    ${FENIX_ICON_BASE_CSS}
    .icon.fx-icon { font-size: calc(var(--fx-font-size) + 6px); color: var(--fx-color-primary); }
    .text { margin: 0; }
    footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--fx-space-sm);
      margin-top: var(--fx-space-md);
    }
    footer button {
      font-family: var(--fx-font-family);
      font-size: calc(var(--fx-font-size) - 2px);
      padding: var(--fx-space-xs) var(--fx-space-md);
      border-radius: var(--fx-radius-sm);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface-background);
      color: var(--fx-text-default);
      cursor: pointer;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    footer button:hover { background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.04)); }
    footer button.accept {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
    }
    footer button.accept:hover { filter: brightness(0.92); background: var(--fx-color-primary); }
  `;

  static override get observedAttributes(): string[] {
    return ['open', 'target', 'message', 'icon', 'accept-label', 'reject-label', 'position'];
  }

  get open(): boolean { return this.hasAttr('open'); }
  set open(value: boolean) { this.toggleAttr('open', value); }

  protected override render(): void {
    const message = this.getAttr('message');
    const icon = this.getAttr('icon');
    const iconIsFx = isFenixIconName(icon);
    if (iconIsFx) void import('../../icons');
    const acceptLabel = this.getAttr('accept-label', 'Sim');
    const rejectLabel = this.getAttr('reject-label', 'Não');

    this.setTemplate(`
      <div class="popup" part="popup" role="alertdialog" aria-modal="false" ${this.open ? '' : 'hidden'}>
        <div class="message" part="message">
          ${icon ? `<span class="icon${iconIsFx ? ' fx-icon' : ''}" aria-hidden="true">${esc(icon)}</span>` : ''}
          <p class="text"><slot>${esc(message)}</slot></p>
        </div>
        <footer part="footer">
          <slot name="reject">
            <button type="button" class="reject" part="reject-button">${esc(rejectLabel)}</button>
          </slot>
          <slot name="accept">
            <button type="button" class="accept" part="accept-button">${esc(acceptLabel)}</button>
          </slot>
        </footer>
      </div>
    `);

    if (!this.open) return;

    const popup = this.root.querySelector<HTMLElement>('.popup');
    if (!popup) return;

    // Evita listeners duplicados em re-renders enquanto aberto
    // (ex.: mudança de message/icon/accept-label com o popup aberto).
    this._cleanup?.();
    this._cleanup = undefined;

    const close = (event: 'accept' | 'reject'): void => {
      this.open = false;
      this._cleanup?.();
      this._cleanup = undefined;
      this._restoreFocus();
      this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }));
    };

    this.root.querySelector('.reject')?.addEventListener('click', () => close('reject'));
    this.root.querySelector('.accept')?.addEventListener('click', () => close('accept'));

    // ESC fecha (reject) — clique fora fecha (reject)
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { e.stopPropagation(); close('reject'); }
    };
    const onPointerDown = (e: MouseEvent): void => {
      const path = e.composedPath();
      const anchor = this._anchor();
      const hitAnchor = anchor ? path.includes(anchor) : false;
      if (!path.includes(popup) && !hitAnchor) close('reject');
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown, true);
    this._cleanup = () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };

    this._position(popup);
    this._previouslyFocused = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => {
      this.root.querySelector<HTMLElement>('button.accept')?.focus();
    });
  }

  private _cleanup?: () => void;
  private _previouslyFocused: HTMLElement | null = null;

  private _anchor(): HTMLElement | null {
    const selector = this.getAttr('target');
    if (!selector) return null;
    try {
      return document.querySelector<HTMLElement>(selector);
    } catch {
      return null;
    }
  }

  /**
   * Posiciona o popup fixo junto ao âncora, acima ou abaixo dinamicamente:
   * `position="auto"` (padrão) prefere abaixo e faz flip para cima quando
   * não há espaço; `top`/`bottom` forçam o lado.
   */
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

    // clamp horizontal para nunca sair da viewport
    const left = Math.min(
      Math.max(margin, a.left + a.width / 2 - p.width / 2),
      window.innerWidth - p.width - margin,
    );
    const top = side === 'bottom' ? a.bottom + gap : a.top - gap - p.height;

    popup.dataset.side = side;
    popup.style.left = `${Math.round(left)}px`;
    popup.style.top = `${Math.round(Math.max(margin, top))}px`;
    // posição da seta relativa ao popup
    const arrowX = Math.min(Math.max(a.left + a.width / 2 - left, 16), p.width - 16);
    popup.style.setProperty('--fxcp-arrow-x', `${Math.round(arrowX)}px`);
  }

  private _restoreFocus(): void {
    if (this._previouslyFocused?.isConnected) this._previouslyFocused.focus();
    this._previouslyFocused = null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // reposiciona em scroll/resize enquanto aberto
    window.addEventListener('scroll', this._onReposition, true);
    window.addEventListener('resize', this._onReposition);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this._onReposition, true);
    window.removeEventListener('resize', this._onReposition);
    this._cleanup?.();
    this._cleanup = undefined;
    this._restoreFocus();
  }

  private _onReposition = (): void => {
    if (!this.open) return;
    const popup = this.root.querySelector<HTMLElement>('.popup');
    if (popup && !popup.hidden) this._position(popup);
  };
}

export function defineFxConfirmPopup(): typeof FxConfirmPopup {
  return defineElement('fx-confirmpopup', FxConfirmPopup);
}

