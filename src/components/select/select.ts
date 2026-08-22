import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-select> — Campo de seleção com dropdown customizado.
 *
 * Escreva os filhos como `<option>` nativos no light DOM; eles são
 * espelhados automaticamente (MutationObserver):
 *
 *   <fx-select value="b" searchable clearable>
 *     <option value="a">Opção A</option>
 *     <option value="b">Opção B</option>
 *   </fx-select>
 *
 * Atributos: value, size (sm|md|lg), disabled, placeholder,
 * searchable, clearable, search-placeholder, no-results.
 * Evento: `change` (composed, detail: { value }).
 */
export class FxSelect extends FxElement {
  static override styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      position: relative;
    }
    .trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fx-space-sm);
      box-sizing: border-box;
      min-height: var(--fx-size-md);
      min-width: 200px;
      font: inherit;
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      text-align: left;
      background-color: var(--fx-surface);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-xs) var(--fx-space-md);
      cursor: pointer;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .trigger:hover { border-color: var(--fx-border-hover); }
    .trigger:focus-visible,
    :host([open]) .trigger {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
        :host([size='sm']) .trigger { min-width: 180px; min-height: var(--fx-size-sm); }
    :host([size='lg']) .trigger { min-height: var(--fx-size-lg); font-size: calc(var(--fx-font-size) + 4px); }
        /* Validação */
    :host([error]) .trigger,
    :host([invalid]) .trigger {
      border-color: var(--fx-color-danger, #dc2626);
    }
    :host([error]) .trigger:focus-visible,
    :host([invalid]) .trigger:focus-visible,
    :host([error][open]) .trigger,
    :host([invalid][open]) .trigger {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent);
    }
    :host([success]) .trigger,
    :host([valid]) .trigger {
      border-color: var(--fx-color-success, #16a34a);
    }
    :host([success]) .trigger:focus-visible,
    :host([valid]) .trigger:focus-visible,
    :host([success][open]) .trigger,
    :host([valid][open]) .trigger {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent);
    }
    :host([disabled]) .trigger,
    .trigger[aria-disabled='true'] { opacity: 0.55; cursor: not-allowed; background-color: var(--fx-surface-hover); }
    /* O rótulo encolhe (ellipsis) e os ícones NUNCA saem do campo. */
    .label,
    .placeholder {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .placeholder { color: var(--fx-text-muted); }
    .actions {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-xs, 8px);
      flex-shrink: 0;
    }
    .caret { font-size: calc(var(--fx-font-size) - 3px); color: var(--fx-text-muted); pointer-events: none; }

    /* Painel do dropdown */
    .panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: var(--fx-z-dropdown, 1000);
      width: max(100%, 220px);
      max-height: 260px;
      overflow-y: auto;
      display: none;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
    }
    :host([open]) .panel { display: block; }
    .search {
      position: sticky;
      top: 0;
      width: 100%;
      box-sizing: border-box;
      font: inherit;
      color: var(--fx-text-default);
      background: var(--fx-surface-background);
      border: none;
      border-bottom: 1px solid var(--fx-border-default);
      padding: var(--fx-space-sm) var(--fx-space-md);
      outline: none;
    }
    .opt {
      display: block;
      width: 100%;
      text-align: left;
      font: inherit;
      color: var(--fx-text-default);
      background: none;
      border: none;
      padding: var(--fx-space-sm) var(--fx-space-md);
      cursor: pointer;
    }
    /* Hover e selecionado com a cor primária do tema (igual ao multiselect). */
    .opt:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, transparent); }
    .opt[aria-selected='true'] {
      background: color-mix(in srgb, var(--fx-color-primary) 18%, transparent);
      color: var(--fx-color-primary);
      font-weight: var(--fx-font-weight);
    }
    .empty { padding: var(--fx-space-sm) var(--fx-space-md); color: var(--fx-text-muted); }

    /* Clearable */
    .clear {
      border: none;
      background: transparent;
      color: var(--fx-text-muted);
      font-size: calc(var(--fx-font-size) + 2px);
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
    .clear:hover { color: var(--fx-color-danger); }
    .clear[hidden] { display: none; }
  `;

  // `value` fica FORA da observação: refleti-lo no change não pode
  // re-renderizar o template e fechar o dropdown.
  static override get observedAttributes(): string[] {
        return ['size', 'disabled', 'placeholder', 'searchable', 'clearable', 'error', 'success'];
  }

  private observer?: MutationObserver;
  private docListener?: (e: Event) => void;

  /** Tamanho do campo. Padrão: `'md'`. */
  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) {
    this.setAttribute('size', value);
  }

  get value(): string {
    return this.getAttr('value');
  }
  set value(value: string) {
    this.setAttribute('value', value);
  }

  get disabled(): boolean {
    return this.hasAttr('disabled');
  }
  set disabled(value: boolean) {
    this.toggleAttr('disabled', Boolean(value));
  }

  private get options(): { value: string; label: string }[] {
    return [...this.querySelectorAll('option')].map((o) => ({
      value: o.getAttribute('value') ?? o.textContent?.trim() ?? '',
      label: o.textContent?.trim() ?? '',
    }));
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    // Espelha mudanças nas <option> do light DOM.
    this.observer = new MutationObserver(() => this.render());
    this.observer.observe(this, { childList: true, subtree: true, characterData: true });
    // Fecha o dropdown ao clicar fora.
    this.docListener = (e: Event) => {
      if (!this.hasAttr('open')) return;
      if (e.composedPath().includes(this)) return;
      this.removeAttribute('open');
      this.render();
    };
    document.addEventListener('click', this.docListener);
  }

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    if (this.docListener) document.removeEventListener('click', this.docListener);
  }

  private select(value: string): void {
    this.value = value;
    this.removeAttribute('open');
    this.render();
    this.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true, detail: { value } }),
    );
  }

  protected override render(): void {
    const prevOpen = this.hasAttr('open');
    const prevSearch = this.root.querySelector<HTMLInputElement>('.search');
    // Estado do campo de busca antes de re-renderizar (valor, foco e cursor).
    const search = prevSearch?.value ?? '';
    const searchFocused =
      prevSearch != null && this.root.activeElement === prevSearch;
    const caretPos = searchFocused ? prevSearch!.selectionStart : null;

    const opts = this.options;
    let current = this.getAttr('value');
    if (!current) {
      const explicit = this.querySelector('option[selected]');
      current = explicit?.getAttribute('value') ?? explicit?.textContent?.trim() ?? '';
    }
    const selectedLabel = opts.find((o) => o.value === current)?.label ?? '';
    const placeholder = this.getAttr('placeholder', 'Selecione…');

    const filtered = search
      ? opts.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : opts;

    this.setTemplate(`
      <span class="trigger" part="trigger" role="button" tabindex="${this.disabled ? -1 : 0}" aria-haspopup="listbox" aria-expanded="${prevOpen}">
        <span class="${selectedLabel ? 'label' : 'placeholder'}">${selectedLabel || placeholder}</span>
        <span class="actions">
          ${this.hasAttr('clearable') && current ? '<button type="button" class="clear" part="clear" aria-label="Limpar">×</button>' : ''}
          <span class="caret">▼</span>
        </span>
      </span>
      <div class="panel" part="panel" role="listbox">
        ${this.hasAttr('searchable') ? `<input class="search" part="search" type="text" placeholder="${this.getAttr('search-placeholder', 'Pesquisar…')}">` : ''}
        ${filtered.map((o) => `
          <button type="button" class="opt" role="option" data-value="${o.value}"
            aria-selected="${o.value === current}">${o.label}</button>`).join('')}
        ${filtered.length === 0 ? `<div class="empty">${this.getAttr('no-results', 'Nenhum resultado')}</div>` : ''}
      </div>
    `);

    if (prevOpen) this.setAttribute('open', '');
    const searchInput = this.root.querySelector<HTMLInputElement>('.search');
    if (searchInput) {
      searchInput.value = search;
      searchInput.addEventListener('input', () => this.render());
      searchInput.addEventListener('click', (e) => e.stopPropagation());
      // Re-render não pode roubar o foco nem perder a posição do cursor.
      if (searchFocused) {
        searchInput.focus();
        try { searchInput.setSelectionRange(caretPos!, caretPos!); } catch { /* type=text sempre suporta */ }
      }
    }

    const trigger = this.root.querySelector<HTMLElement>('.trigger');
    if (!trigger) return;
    if (this.disabled) trigger.setAttribute('aria-disabled', 'true');

    trigger.addEventListener('click', (e) => {
      if (this.disabled) return;
      if ((e.target as HTMLElement).closest('.clear')) return;
      this.toggleAttribute('open');
      this.render();
      this.root.querySelector<HTMLInputElement>('.search')?.focus();
    });

    // Teclado: Enter/Espaço abrem o dropdown.
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });

    // Limpar.
    this.root.querySelector('.clear')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.value = '';
      this.removeAttribute('open');
      this.render();
      this.dispatchEvent(
        new CustomEvent('change', { bubbles: true, composed: true, detail: { value: '' } }),
      );
    });

    // Escolher opção.
    this.root.querySelectorAll<HTMLElement>('.opt').forEach((opt) => {
      opt.addEventListener('click', () => this.select(opt.dataset.value!));
    });
  }
}

export function defineFxSelect(): typeof FxSelect {
  return defineElement('fx-select', FxSelect);
}

