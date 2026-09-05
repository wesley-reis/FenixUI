import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';
import '../select';

/**
 * <fx-pagination> — Paginação standalone.
 *
 * Atributos: page (atual), total (itens), rows (por página), rows-options,
 * position (left|center|right).
 * Evento: `page-change` (composed, detail: { page, rows }).
 */
export class FxPagination extends FxElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    :host([position='center']) { justify-content: center; }
    :host([position='right']) { justify-content: flex-end; }
    .nav {
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
    .nav:hover:not([disabled]):not(.active) { border-color: var(--fx-color-primary); color: var(--fx-color-primary); }
    .nav[disabled] { opacity: 0.5; cursor: not-allowed; }
    .nav.active {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
      font-weight: 600;
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

  protected override render(): void {
    const pages = this.pages;
    const current = Math.min(Math.max(1, this.page), pages);
    const opts = (this.getAttr('rows-options', '5,10,20,50') || '').split(',').map((s) => s.trim()).filter(Boolean);

    // Janela de páginas: mostra até 5 com elipses simplificada
    const window_: number[] = [];
    for (let p = Math.max(1, current - 2); p <= Math.min(pages, current + 2); p++) window_.push(p);

    const from = total0(current, this.rows);
    const to = Math.min(current * this.rows, this.total);

    this.setTemplate(`
      <span class="info">${this.total ? `${from}-${to} de ${this.total}` : '0 itens'}</span>
      <button type="button" class="nav" part="prev" data-go="${current - 1}" ${current <= 1 ? 'disabled' : ''}>‹</button>
      ${window_[0] !== 1 && pages > 5 ? `<button type="button" class="nav" data-go="1">1</button>` : ''}
      ${window_.map((p) => `<button type="button" class="nav ${p === current ? 'active' : ''}" data-go="${p}">${p}</button>`).join('')}
      ${window_[window_.length - 1] !== pages && pages > 5 ? `<button type="button" class="nav" data-go="${pages}">${pages}</button>` : ''}
      <button type="button" class="nav" part="next" data-go="${current + 1}" ${current >= pages ? 'disabled' : ''}>›</button>
      ${opts.length ? `
        <fx-select class="rows-sel" part="rows" size="sm" value="${this.rows}" aria-label="Itens por página">
          ${opts.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
        </fx-select>` : ''}
    `);

    function total0(page: number, rows: number): number {
      return (page - 1) * rows + 1;
    }

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
