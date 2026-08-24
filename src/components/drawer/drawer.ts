import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-drawer> — Painel deslizante (drawer) com overlay.
 *
 * Atributos:
 *  - position: 'left' | 'right' | 'top' | 'bottom' (padrão: right);
 *  - title: texto do cabeçalho;
 *  - open: exibe o drawer.
 * Conteúdo: livre, via slot.
 * Eventos: `open` e `close` (composed). Fecha por ESC ou clique no overlay.
 */
export class FxDrawer extends FxElement {
  static override styles = css`
    :host {
      display: contents;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    .overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      z-index: var(--fx-z-overlay, 900);
    }
    :host([open]) .overlay { display: block; }

    .panel {
      position: fixed;
      background: var(--fx-surface-background);
      box-shadow: var(--fx-shadow-xl);
      z-index: var(--fx-z-modal, 1000);
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
    :host(:not([open])) .panel { display: none; }
    :host([open]) .panel { display: flex; }
    /* left / right — altura total, largura mínima fixa e expansível */
    :host([position='left']) .panel,
    :host(:not([position])) .panel,
    :host([position='right']) .panel {
      top: 0;
      bottom: 0;
      width: var(--fx-drawer-width, 360px);
      min-width: 300px;
      max-width: 90vw;
    }
    :host([position='left']) .panel { left: 0; }
    :host([position='right']) .panel,
    :host(:not([position])) .panel { right: 0; }

    /* top / bottom — largura total, altura mínima fixa e expansível */
    :host([position='top']) .panel,
    :host([position='bottom']) .panel {
      left: 0;
      right: 0;
      height: var(--fx-drawer-height, 280px);
      min-height: 180px;
      max-height: 85vh;
    }
    :host([position='top']) .panel { top: 0; }
    :host([position='bottom']) .panel { bottom: 0; }

    .header {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      min-height: var(--fx-size-lg);
      padding: var(--fx-space-sm) var(--fx-space-md);
      border-bottom: 1px solid var(--fx-border-default);
      flex: none;
      position: sticky;
      top: 0;
      background: var(--fx-surface-background);
    }
    .title {
      font-weight: 700;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .close {
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--fx-text-muted);
      width: 28px;
      height: 28px;
      line-height: 1;
      border-radius: var(--fx-radius-sm);
      font-size: 16px;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .close:hover {
      background: color-mix(in srgb, var(--fx-color-danger) 14%, var(--fx-surface-background));
      color: var(--fx-color-danger);
    }
    .body {
      padding: var(--fx-space-md);
      flex: 1;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['open', 'title', 'position'];
  }

  get open(): boolean { return this.hasAttr('open'); }
  set open(value: boolean) { this.toggleAttr('open', value); }

  override get title(): string { return this.getAttr('title'); }
  override set title(v: string) { this.setAttribute('title', v); }

  get position(): string {
    const p = this.getAttr('position');
    return ['left', 'right', 'top', 'bottom'].includes(p) ? p : 'right';
  }
  set position(v: string) { this.setAttribute('position', v); }

  protected override render(): void {
    const title = this.getAttr('title');

    this.setTemplate(`
      <div class="overlay" part="overlay"></div>
      <div class="panel" part="panel" role="dialog" aria-modal="true" aria-label="${title || 'Drawer'}">
        ${title !== '' ? `<div class="header" part="header"><span class="title">${title}</span><button type="button" class="close" part="close" aria-label="Fechar">✕</button></div>` : ''}
        <div class="body" part="body"><slot></slot></div>
      </div>
    `);

    const close = () => {
      if (!this.open) return;
      this.open = false;
      this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    };
    this.root.querySelector('.overlay')?.addEventListener('click', close);
    this.root.querySelector('.close')?.addEventListener('click', close);
  }

  protected override connectedCallback(): void {
    super.connectedCallback?.();
    this._onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.open) {
        this.open = false;
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
      }
    };
    document.addEventListener('keydown', this._onKeydown);
  }

  protected override disconnectedCallback(): void {
    document.removeEventListener('keydown', this._onKeydown);
    super.disconnectedCallback?.();
  }

  private _onKeydown: (e: KeyboardEvent) => void = () => {};
}

export function defineFxDrawer(): typeof FxDrawer {
  return defineElement('fx-drawer', FxDrawer);
}