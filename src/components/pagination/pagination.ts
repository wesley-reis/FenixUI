import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { pageRange } from '../../core/page-range';
import { esc } from '../../core/sanitize';
import { FENIX_ICON_BASE_CSS, fenixIconHtml } from '../../icons/base-css';
import { loadFenixIconsFont } from '../../icons/font';
import '../select';

/**
 * <fx-pagination> — Paginação standalone.
 *
 * Atributos: page (atual), total (itens), rows (por página), rows-options,
 * position (left|center|right).
 * Evento: `page-change` (composed, detail: { page, rows }).
 *
 * Com muitas páginas o pager usa janela deslizante com elipses
 * (1 … 499 [500] 501 … 1000) em vez de um botão por página.
 */
export class FxPagination extends FxElement {
  static override styles = css`
    ${FENIX_ICON_BASE_CSS}
    :host {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--fx-space-sm);
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    :host([position='center']) { justify-content: center; }
    :host([position='right']) { justify-content: flex-end; }
    .nav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--fx-size-sm);
      height: var(--fx-size-sm);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface-background);
      color: var(--fx-text-default);
      font-family: inherit;
      font-size: calc(var(--fx-font-size) - 2px);
      border-radius: var(--fx-radius-sm);
      cursor: pointer;
      padding: 0 var(--fx-space-sm);
      transition:
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    /* O glifo precisa de 1px a mais que o dígito: a altura de traço do ícone é
       maior que a do número, então igualar os dois font-size deixa a seta
       visivelmente maior que o texto. */
    .nav .fx-icon { font-size: calc(var(--fx-font-size) - 1px); }
    .nav:hover:not([disabled]):not(.active) { border-color: var(--fx-color-primary); color: var(--fx-color-primary); }
    .nav[disabled] { opacity: 0.5; cursor: not-allowed; }
    .nav.active {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
      font-weight: 600;
    }
    /* Elipse entre a janela de páginas e as bordas: ocupa o mesmo espaço de
       um botão (para o rodapé não "pular" ao navegar) mas não é clicável. */
    .ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--fx-size-sm);
      height: var(--fx-size-sm);
      color: var(--fx-text-muted);
      font-size: calc(var(--fx-font-size) - 2px);
      user-select: none;
    }
    .info { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); }
    fx-select { vertical-align: middle; }
    fx-select::part(trigger) {
      min-width: 64px !important;
      min-height: var(--fx-size-sm) !important;
      padding: 0 var(--fx-space-sm) !important;
      border-radius: var(--fx-radius-sm) !important;
      font-size: calc(var(--fx-font-size) - 2px) !important;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['page', 'total', 'rows', 'rows-options', 'position'];
  }

  get page(): number { return Number(this.getAttr('page', '1')) || 1; }
  set page(v: number) { this.setAttribute('page', String(v)); }
  get total(): number { return Number(this.getAttr('total', '0')) || 0; }
  set total(v: number) { this.setAttribute('total', String(v)); }
  get rows(): number { return Number(this.getAttr('rows', '10')) || 10; }
  set rows(v: number) { this.setAttribute('rows', String(v)); }

  private get pages(): number {
    return Math.max(1, Math.ceil(this.total / this.rows));
  }

  protected override connectedCallback(): void {
    // O pager usa glifos da Fenix Icons: garante o @font-face mesmo quando o
    // app não importou `@wrrdev/fenix-ui/icons` (idempotente).
    loadFenixIconsFont();
    super.connectedCallback();
  }

  protected override render(): void {
    const pages = this.pages;
    const current = Math.min(Math.max(1, this.page), pages);
    const opts = (this.getAttr('rows-options', '5,10,20,50') || '').split(',').map((s) => s.trim()).filter(Boolean);

    // Janela de páginas: primeira + última + vizinhas da atual, com elipse no
    // miolo. Mantém o pager compacto mesmo com milhares de páginas.
    const pageButtons = pageRange(current, pages)
      .map((item) =>
        item === 'ellipsis'
          ? `<span class="ellipsis" part="ellipsis" aria-hidden="true">…</span>`
          : `<button type="button" class="nav ${item === current ? 'active' : ''}" part="page" data-go="${item}"${item === current ? ' aria-current="page"' : ''}>${item}</button>`,
      )
      .join('');

    const from = (current - 1) * this.rows + 1;
    const to = Math.min(current * this.rows, this.total);

    this.setTemplate(`
      <span class="info">${this.total ? `${from}-${to} de ${this.total}` : '0 itens'}</span>
      <button type="button" class="nav" part="first" aria-label="Primeira página" data-go="1" ${current <= 1 ? 'disabled' : ''}>${fenixIconHtml('first_page')}</button>
      <button type="button" class="nav" part="prev" aria-label="Página anterior" data-go="${current - 1}" ${current <= 1 ? 'disabled' : ''}>${fenixIconHtml('navigate_before')}</button>
      ${pageButtons}
      <button type="button" class="nav" part="next" aria-label="Próxima página" data-go="${current + 1}" ${current >= pages ? 'disabled' : ''}>${fenixIconHtml('navigate_next')}</button>
      <button type="button" class="nav" part="last" aria-label="Última página" data-go="${pages}" ${current >= pages ? 'disabled' : ''}>${fenixIconHtml('last_page')}</button>
      ${opts.length ? `
        <fx-select class="rows-sel" part="rows" size="sm" value="${this.rows}" aria-label="Itens por página">
          ${opts.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
        </fx-select>` : ''}
    `);

    this.root.querySelectorAll<HTMLButtonElement>('.nav[data-go]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = Number(btn.dataset.go);
        if (target >= 1 && target <= pages && target !== current) {
          this.page = target;
          this.emit();
        }
      });
    });
    const sel = this.root.querySelector<HTMLElement>('fx-select.rows-sel');
    sel?.addEventListener('change', (e) => {
      const value = Number((e as CustomEvent).detail?.value);
      if (!value || value === this.rows) return;
      this.rows = value;
      this.page = 1;
      this.emit();
    });
  }

  private emit(): void {
    this.dispatchEvent(new CustomEvent('page-change', {
      bubbles: true, composed: true,
      detail: { page: this.page, rows: this.rows },
    }));
  }
}

export function defineFxPagination(): typeof FxPagination {
  return defineElement('fx-pagination', FxPagination);
}
