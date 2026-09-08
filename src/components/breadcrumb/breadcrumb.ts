import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-breadcrumb> — Trilha de navegação hierárquica.
 *
 * Atributos: size (sm|md|lg), separator (glifo entre itens, padrão '/'),
 * label (acessibilidade, padrão 'Breadcrumb').
 * Slots: `item` (repetível — cada <fx-breadcrumb-item> ou elemento com
 * [slot="item"] vira um passo) e `separator` (customiza o separador).
 *
 * Marcação declarativa recomendada:
 *   <fx-breadcrumb>
 *     <fx-breadcrumb-item href="/">Home</fx-breadcrumb-item>
 *     <fx-breadcrumb-item href="/produtos">Produtos</fx-breadcrumb-item>
 *     <fx-breadcrumb-item>Detalhe</fx-breadcrumb-item>
 *   </fx-breadcrumb>
 *
 * Eventos (composed): `select` (detail: { item, index }) ao clicar num item.
 */
export class FxBreadcrumb extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--fx-space-xs);
    }
    :host([size='sm']) nav { font-size: calc(var(--fx-font-size) - 2px); }
    :host([size='lg']) nav { font-size: calc(var(--fx-font-size) + 2px); }

    /* itens (movidos para o nav no shadow DOM) */
    nav [slot='item'] {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-xs);
      color: var(--fx-text-muted);
      text-decoration: none;
      cursor: pointer;
      transition: color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    nav [slot='item']:hover { color: var(--fx-color-primary); }
    nav [slot='item'][aria-current='page'] {
      color: var(--fx-text-default);
      font-weight: 600;
      cursor: default;
    }
    nav [slot='item'][aria-current='page']:hover { color: var(--fx-text-default); }

    .sep {
      color: var(--fx-text-muted);
      user-select: none;
      display: inline-flex;
      align-items: center;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['size', 'separator', 'label'];
  }

  protected override render(): void {
    const label = this.getAttr('label', 'Breadcrumb');

    this.setTemplate(`
      <nav part="nav" aria-label="${esc(label)}"></nav>
    `);

    this._decorateItems();
  }

  /**
   * Move os itens do light DOM para o nav e intercala separadores.
   * Como o playground atribui innerHTML (filhos chegam assincronamente) e
   * re-renders posteriores já terão os itens no nav, a lógica abaixo é
   * idempotente: coleta filhos do light DOM apenas na 1ª chamada.
   */
  private _decorateItems(): void {
    const nav = this.shadowRoot?.querySelector('nav');
    if (!nav) return;
    const sep = this.getAttr('separator', '/');

    // 1ª vez: captura itens do light DOM (idempotente — só coleta uma vez)
    if (this._items.length === 0) {
      this._items = Array.from(this.children).filter((el) =>
        el.matches('[slot="item"]'),
      );
    }

    // limpa nav e reconstrói com os itens armazenados
    nav.innerHTML = '';
    this._items.forEach((item, i) => {
      const isLast = i === this._items.length - 1;
      item.setAttribute('aria-current', isLast ? 'page' : 'false');
      nav.appendChild(item);
      if (isLast) return;
      const s = document.createElement('span');
      s.className = 'sep';
      s.setAttribute('part', 'separator');
      s.setAttribute('aria-hidden', 'true');
      s.textContent = sep;
      nav.appendChild(s);
    });
  }

  private _items: Element[] = [];

  protected override connectedCallback(): void {
    super.connectedCallback();
    // filhos podem não estar disponíveis ainda (innerHTML do playground)
    const obs = new MutationObserver(() => {
      if (this.children.length > 0) {
        obs.disconnect();
        this._decorateItems();
      }
    });
    obs.observe(this, { childList: true });
    // se já tem filhos, decora na hora
    if (this.children.length > 0) this._decorateItems();
  }

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._items = [];
  }
}

export function defineFxBreadcrumb(): typeof FxBreadcrumb {
  return defineElement('fx-breadcrumb', FxBreadcrumb);
}
