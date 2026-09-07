import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-card> — Container de conteúdo com cabeçalho, corpo e rodapé.
 *
 * Atributos: variant (elevated|flat|outline, padrão elevated), size (sm|md|lg),
 * padded (exibe padding interno), heading (rótulo opcional no cabeçalho).
 * Slots: `header`, padrão (conteúdo), `footer`.
 */
export class FxCard extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      box-sizing: border-box;
    }
    .card {
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-lg);
      box-shadow: var(--fx-shadow-sm);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    /* Elevado: sombra principal; Flat: sem sombra mas cor plana; Outline: sem sombra e borda sólida */
    :host([variant='elevated']) .card { box-shadow: var(--fx-shadow-md); }
    :host([variant='elevated']) .card:hover { box-shadow: var(--fx-shadow-xl); }
    :host([variant='flat']) .card { box-shadow: none; border-color: transparent; }
    :host([variant='outline']) .card { box-shadow: none; border-style: solid; border-width: 1px; }
    :host([variant='ghost']) .card { box-shadow: none; border-color: transparent; background: transparent; }

    /* Tamanhos */
    :host([size='sm']) .card { border-radius: var(--fx-radius-sm); }
    :host([size='lg']) .card { border-radius: var(--fx-radius-xl); }

    header {
      padding: var(--fx-space-md) var(--fx-space-xl);
      border-bottom: 1px solid var(--fx-border-default);
      font-weight: 600;
      color: var(--fx-text-default);
      font-size: calc(var(--fx-font-size) + 2px);
    }
    header[hidden] { display: none; }

    .body {
      flex: 1 1 auto;
    }
    :host([padded]) .body { padding: var(--fx-space-lg) var(--fx-space-xl); }
    :host([padded]) .body:empty { padding: 0; }

    footer {
      padding: var(--fx-space-md) var(--fx-space-xl);
      border-top: 1px solid var(--fx-border-default);
      display: flex;
      justify-content: flex-end;
      gap: var(--fx-space-sm);
    }
    footer[hidden] { display: none; }
  `;

  static override get observedAttributes(): string[] {
    return ['variant', 'size', 'padded', 'heading'];
  }

  protected override render(): void {
    const heading = this.getAttr('heading');
    this.setTemplate(`
      <div class="card" part="card">
        <header part="header" ${heading ? '' : 'hidden'}>${esc(heading)}<slot name="header"></slot></header>
        <div class="body" part="content"><slot></slot></div>
        <footer part="footer"><slot name="footer"></slot></footer>
      </div>
    `);
  }
}

export function defineFxCard(): typeof FxCard {
  return defineElement('fx-card', FxCard);
}
