import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-multiselect> — Seleção múltipla estilo PrimeVue.
 *
 * Dropdown customizado com painel (overlay), checkbox por item, pesquisa
 * opcional e ação de limpar. Opções via <option> nativos no light DOM.
 *
 * Atributos: values (CSV), searchable, clearable, disabled, placeholder,
 * size (sm|md|lg), no-results.
 * Evento: `change` (composed, detail: { values: string[] }).
 */
export class FxMultiselect extends FxElement {
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
      flex-wrap: nowrap;
      gap: var(--fx-space-xs);
      width: 240px;
      box-sizing: border-box;
      min-height: var(--fx-size-md);
      padding: var(--fx-space-xs) var(--fx-space-md);
      font: inherit;
      color: var(--fx-text-default);
      background-color: var(--fx-surface);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      cursor: pointer;
      text-align: left;
      transition: border-color var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    /* Área dos chips: encolhe e quebra linha internamente,
       mantendo os ícones sempre dentro do componente. */
    .lead {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--fx-space-xs);
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    :host([size='sm']) .trigger { min-height: var(--fx-size-sm); width: 200px; }
    :host([size='lg']) .trigger { min-height: var(--fx-size-lg); width: 280px; font-size: calc(var(--fx-font-size) + 4px); }
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
    .trigger:hover { border-color: var(--fx-border-hover); }
    .trigger:focus-visible {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .trigger[aria-expanded='true'] { border-color: var(--fx-color-primary); }
    .placeholder { color: var(--fx-text-muted); }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: color-mix(in srgb, var(--fx-color-primary) 14%, transparent);
      color: var(--fx-color-primary);
      border-radius: var(--fx-radius-sm);
      padding: 2px 6px;
      font-size: calc(var(--fx-font-size) - 2px);
    }
    .chip__x {
      border: none;
      background: none;
      color: inherit;
      cursor: pointer;
      font-size: calc(var(--fx-font-size) - 1px);
      line-height: 1;
      padding: 0;
    }
    .trigger-right {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--fx-text-muted);
    }
    .icon-btn {
      border: none;
      background: none;
      color: inherit;
      cursor: pointer;
      font-size: calc(var(--fx-font-size) + 2px);
      line-height: 1;
      padding: 0 2px;
      border-radius: var(--fx-radius-full);
    }
    .icon-btn:hover { color: var(--fx-color-danger); }
    .caret {
      font-size: calc(var(--fx-font-size) - 3px);
      transition: transform var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([open]) .caret { transform: rotate(180deg); }

    /* Painel (overlay estilo PrimeVue) */
    .panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: var(--fx-z-dropdown, 1000);
      width: max(100%, 240px);
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      display: none;
      overflow: hidden;
    }
    :host([up]) .panel {
      top: auto;
      bottom: calc(100% + 4px);
    }
    :host([open]) .panel { display: block; }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fx-space-sm);
      padding: var(--fx-space-xs) var(--fx-space-md);
      border-bottom: 1px solid var(--fx-border-default);
      background: var(--fx-surface-hover);
    }
    .count { font-size: calc(var(--fx-font-size) - 2px); color: var(--fx-text-muted); }
    .clear-all {
      border: none;
      background: none;
      font: inherit;
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-color-primary);
      cursor: pointer;
      padding: 0;
    }
    .clear-all:hover { text-decoration: underline; }
    .search {
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
    .list {
      max-height: 240px;
      overflow-y: auto;
      list-style: none;
      margin: 0;
      padding: var(--fx-space-3xs, 4px);
    }
    .opt {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      width: 100%;
      padding: var(--fx-space-xs) var(--fx-space-md);
      border: none;
      background: none;
      font: inherit;
      color: var(--fx-text-default);
      cursor: pointer;
      border-radius: var(--fx-radius-sm);
      text-align: left;
    }
    .opt:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, transparent); }
    .opt[aria-selected='true'] {
      background: color-mix(in srgb, var(--fx-color-primary) 16%, transparent);
      color: var(--fx-color-primary);
      font-weight: var(--fx-font-weight);
    }
    /* Checkbox visual */
    .box {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--fx-border-default);
      border-radius: calc(var(--fx-radius-sm) / 2);
      font-size: 11px;
      line-height: 1;
      color: transparent;
      transition:
        background-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .opt[aria-selected='true'] .box {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
    }
    .opt[aria-selected='true'] .box::after { content: '✓'; }
    .empty { padding: var(--fx-space-md); color: var(--fx-text-muted); text-align: center; }
    :host([disabled]) .trigger { opacity: 0.55; cursor: not-allowed; background: var(--fx-surface-hover); }
  `;

  static override get observedAttributes(): string[] {
    return ['disabled', 'placeholder'];
  }

  private observer?: MutationObserver;
  private docListener?: (e: Event) => void;
  private selected = new Set<string>();

  /** Valores selecionados (CSV no atributo / array na propriedade). */
  get values(): string[] {
    const csv = this.getAttr('values');
    return csv ? csv.split(',').map((v) => v.trim()).filter(Boolean) : [];
  }
  set values(list: string[]) {
    this.setAttribute('values', list.join(','));
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
    // Popula a seleção ANTES do primeiro render (super chama render).
    this.selected = new Set(this.values);
    super.connectedCallback();
    this.observer = new MutationObserver(() => this.render());
    this.observer.observe(this, { childList: true, subtree: true, characterData: true });
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

  /** Aplica a seleção, reflete e emite change. */
  private commit(): void {
    this.values = [...this.selected];
    this.render();
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { values: [...this.selected] },
      }),
    );
  }

  private toggleValue(value: string): void {
    if (this.selected.has(value)) this.selected.delete(value);
    else this.selected.add(value);
    this.commit();
  }

  protected override render(): void {
    const wasOpen = this.hasAttr('open');
    // Preserva o estado do campo de pesquisa entre re-renders.
    const search = this.root.querySelector<HTMLInputElement>('.search')?.value ?? '';

    const opts = this.options;
    for (const v of [...this.selected]) {
      if (!opts.some((o) => o.value === v)) this.selected.delete(v);
    }

    const chips = opts.filter((o) => this.selected.has(o.value));
    const placeholder = this.getAttr('placeholder', 'Selecione…');
    const filtered = search
      ? opts.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : opts;

    this.setTemplate(`
      <span class="trigger" part="trigger" role="button" tabindex="${this.disabled ? -1 : 0}" aria-haspopup="listbox" aria-expanded="${wasOpen}" aria-disabled="${this.disabled}">
        <span class="lead">
        ${
          chips.length
            ? chips.map((c) => `
              <span class="chip" data-value="${c.value}">
                ${c.label}
                <span class="chip__x" role="button" aria-label="Remover ${c.label}">×</span>
              </span>`).join('')
            : `<span class="placeholder">${placeholder}</span>`
        }
        </span>
        <span class="trigger-right">
          ${this.hasAttr('clearable') && chips.length ? '<button type="button" class="icon-btn clear" part="clear" aria-label="Limpar seleção">×</button>' : ''}
          <span class="caret">▼</span>
        </span>
      </span>
      <div class="panel" part="panel" role="listbox" aria-multiselectable="true">
        <div class="panel-header">
          <span class="count">${chips.length} selecionado${chips.length === 1 ? '' : 's'}</span>
          ${this.hasAttr('clearable') && chips.length ? '<button type="button" class="clear-all">Limpar tudo</button>' : ''}
        </div>
        ${this.hasAttr('searchable') ? `<input class="search" part="search" type="text" placeholder="${this.getAttr('search-placeholder', 'Pesquisar…')}">` : ''}
        <ul class="list">
          ${filtered.map((o) => `
            <li><button type="button" class="opt" role="option" data-value="${o.value}"
              aria-selected="${this.selected.has(o.value)}">
              <span class="box" aria-hidden="true"></span>${o.label}
            </button></li>`).join('')}
          ${filtered.length === 0 ? `<li class="empty">${this.getAttr('no-results', 'Nenhum resultado')}</li>` : ''}
        </ul>
      </div>
    `);

    // Reabre o painel se estava aberto antes do re-render.
    if (wasOpen) this.setAttribute('open', '');

    const searchInput = this.root.querySelector<HTMLInputElement>('.search');
    if (searchInput) {
      searchInput.value = search;
      // Preserva foco e posição do cursor entre os re-renders da digitação.
      searchInput.addEventListener('input', () => {
        const pos = searchInput.selectionStart ?? searchInput.value.length;
        this.render();
        const si = this.root.querySelector<HTMLInputElement>('.search');
        if (si) {
          si.focus();
          si.setSelectionRange(pos, pos);
        }
      });
      searchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    const trigger = this.root.querySelector<HTMLElement>('.trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      if (this.disabled) return;
      if ((e.target as HTMLElement).closest('.clear')) return;
      if ((e.target as HTMLElement).closest('.chip__x')) return;
      this.toggleAttribute('open');
      // Flip vertical: se não cabe abaixo, abre para cima.
      if (this.hasAttr('open')) {
        const r = this.getBoundingClientRect();
        this.toggleAttribute('up', r.bottom + 300 > window.innerHeight && r.top > 300);
      } else {
        this.removeAttribute('up');
      }
      this.render();
    });

    // Acessibilidade: Enter/Espaço abrem o painel (span role=button).
    trigger.addEventListener('keydown', (e) => {
      if (this.disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    // × de limpar tudo no trigger.
    this.root.querySelector('.clear')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selected.clear();
      this.commit();
    });

    // "Limpar tudo" no cabeçalho do painel.
    this.root.querySelector('.clear-all')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selected.clear();
      this.commit();
    });

    // Remover chip individual.
    this.root.querySelectorAll<HTMLElement>('.chip').forEach((chip) => {
      chip.querySelector('.chip__x')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleValue(chip.dataset.value!);
      });
    });

    // Alternar opções.
    this.root.querySelectorAll<HTMLElement>('.opt').forEach((opt) => {
      opt.addEventListener('click', () => this.toggleValue(opt.dataset.value!));
    });
  }
}

export function defineFxMultiselect(): typeof FxMultiselect {
  return defineElement('fx-multiselect', FxMultiselect);
}

