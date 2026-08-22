import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-badge> — Rótulo/contador de status.
 *
 * Atributos: variant (default|primary|success|warning|danger|info), round.
 * Slots: default (conteúdo).
 */
export class FxBadge extends FxElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      font-family: var(--fx-font-family);
      font-size: calc(var(--fx-font-size) - 2px);
      font-weight: var(--fx-font-weight);
      line-height: 1;
      padding: var(--fx-space-xs) var(--fx-space-sm);
      border-radius: var(--fx-radius-full);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface);
      color: var(--fx-text-muted);
      white-space: nowrap;
    }
    :host([variant='primary']) .badge { background: var(--fx-color-primary); color: #fff; border-color: transparent; }
    :host([variant='success']) .badge { background: var(--fx-color-success); color: #fff; border-color: transparent; }
    :host([variant='warning']) .badge { background: var(--fx-color-warning); color: #fff; border-color: transparent; }
    :host([variant='danger']) .badge { background: var(--fx-color-danger); color: #fff; border-color: transparent; }
    :host([variant='info']) .badge { background: var(--fx-color-info); color: #fff; border-color: transparent; }
    :host(:not([round])) .badge { border-radius: var(--fx-radius-sm); }
  `;

  static override get observedAttributes(): string[] {
    return ['variant', 'round'];
  }

  protected override render(): void {
    this.setTemplate(`<span class="badge" part="badge"><slot></slot></span>`);
  }
}

export function defineFxBadge(): typeof FxBadge {
  return defineElement('fx-badge', FxBadge);
}