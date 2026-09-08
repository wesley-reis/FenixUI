import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-empty-state> — Estado vazio/ilustrativo para listas e telas sem dados.
 *
 * Atributos: icon (glifo/emoji), heading (título), description (texto de apoio).
 * Slots: `icon` (customiza o ícone), `action` (botão/chamada para ação).
 */
export class FxEmptyState extends FxElement {
  static override styles = css`
    :host {
      display: flex;
      justify-content: center;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--fx-space-sm);
      padding: var(--fx-space-2xl, 48px) var(--fx-space-xl);
      text-align: center;
      max-width: 420px;
    }
    .icon {
      font-size: calc(var(--fx-font-size) + 28px);
      line-height: 1;
      color: var(--fx-text-muted);
    }
    .icon[hidden] { display: none; }
    h4 {
      margin: 0;
      font-size: calc(var(--fx-font-size) + 3px);
      font-weight: 600;
      color: var(--fx-text-default);
    }
    h4[hidden] { display: none; }
    p {
      margin: 0;
      font-size: calc(var(--fx-font-size) - 1px);
      color: var(--fx-text-muted);
      line-height: 1.5;
    }
    p[hidden] { display: none; }
    .action { margin-top: var(--fx-space-sm); }
    .action:empty { display: none; }
  `;

  static override get observedAttributes(): string[] {
    return ['icon', 'heading', 'description'];
  }

  protected override render(): void {
    const icon = this.getAttr('icon', '📭');
    const heading = this.getAttr('heading');
    const description = this.getAttr('description');

    this.setTemplate(`
      <div class="wrap" part="wrap">
        <span class="icon" part="icon" aria-hidden="true">${esc(icon)}</span>
        <h4 part="heading" ${heading ? '' : 'hidden'}>${esc(heading)}</h4>
        <p part="description" ${description ? '' : 'hidden'}>${esc(description)}</p>
        <slot name="icon"></slot>
        <span class="action"><slot name="action"></slot></span>
      </div>
    `);
  }
}

export function defineFxEmptyState(): typeof FxEmptyState {
  return defineElement('fx-empty-state', FxEmptyState);
}