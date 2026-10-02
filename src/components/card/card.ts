import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-card> — Container de conteúdo com cabeçalho, corpo e rodapé.
 *
 * Atributos: variant (elevated|flat|outline|ghost, padrão elevated),
 * radius (sm|md|lg — arredondamento; `size` segue aceito como alias legado),
 * padded (exibe padding interno), heading (rótulo opcional no cabeçalho).
 * Slots: `header`, padrão (conteúdo), `footer`.
 *
 * `header` e `footer` só são renderizados visualmente quando têm conteúdo:
 * sem `heading`/nó no slot header e sem nó no slot footer, as seções ficam
 * `hidden` (sem padding e sem a linha divisória).
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

    /* Raio do container: radius (nome atual) — size continua aceito
       como alias legado para não quebrar quem já usava o atributo. */
    :host([radius='sm']) .card,
    :host([size='sm']) .card { border-radius: var(--fx-radius-sm); }
    :host([radius='lg']) .card,
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
    return ['variant', 'radius', 'size', 'padded', 'heading'];
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
    // Header e footer só existem visualmente se houver conteúdo: sem isso o
    // rodapé vazio ainda pintava padding + linha divisória no card.
    this._syncSlots();
    for (const name of ['header', 'footer']) {
      this.root
        .querySelector(`slot[name="${name}"]`)
        ?.addEventListener('slotchange', () => this._syncSlots());
    }
  }

  /**
   * Esconde `header`/`footer` quando o respectivo slot não recebeu nenhum nó.
   * O `<slot>` fica no shadow e os nós no light DOM, então a checagem é feita
   * via `assignedNodes()` — cobre conteúdo adicionado dinamicamente.
   */
  private _syncSlots(): void {
    for (const name of ['header', 'footer'] as const) {
      const slot = this.root.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
      const section = this.root.querySelector<HTMLElement>(name);
      if (!slot || !section) continue;
      // `flatten: true` atravessa slots aninhados; nós em branco (whitespace)
      // não contam como conteúdo. O atributo `heading` alimenta SÓ o header —
      // contá-lo também no footer faria todo card com `heading` exibir a linha
      // divisória do rodapé mesmo sem nada no slot `footer`.
      const temConteudo =
        slot
          .assignedNodes({ flatten: true })
          .some((n) => n.nodeType === 1 || (n.textContent ?? '').trim() !== '') ||
        (name === 'header' && Boolean(this.getAttr('heading')));
      section.toggleAttribute('hidden', !temConteudo);
    }
  }
}

export function defineFxCard(): typeof FxCard {
  return defineElement('fx-card', FxCard);
}
