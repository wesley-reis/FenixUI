import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

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
 * searchable, clearable, search-placeholder, no-results,
 * placement (auto|top|bottom — direção do painel; `auto` inverte quando
 * não cabe na viewport).
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
      /* Largura no HOST (padrão: conteúdo com mín. 200px). CSS externo, classes
         e style inline no elemento definem a largura sem precisar do full. */
      width: var(--fx-select-width, max-content);
      min-width: var(--fx-select-min-width, 200px);
      /* Espaço entre o campo e o painel + altura máxima do painel. Expostos
         como custom property porque ::part() do lado do consumidor tem
         prioridade MENOR que a folha do shadow root e não vence o top. */
      --fx-select-panel-offset: 4px;
      --fx-select-panel-max-height: 260px;
    }
    .trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fx-space-sm);
      box-sizing: border-box;
      min-height: var(--fx-size-md);
      /* Acompanha a largura definida no :host. */
      width: 100%;
      font: inherit;
      /* Altura/linha determinísticas: a caixa fica no token --fx-size-*
         (o line-height fixo impede que a herança da página estoure o min-height). */
      line-height: var(--fx-font-line-height);
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      text-align: left;
      background-color: var(--fx-surface-background);
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
        :host([size='sm']) { min-width: var(--fx-select-min-width-sm, 180px); }
    :host([size='sm']) .trigger { min-height: var(--fx-size-sm); }
    :host([size='lg']) .trigger { min-height: var(--fx-size-lg); font-size: calc(var(--fx-font-size) + 4px); }
    /* Full width: o host estica até o pai e o trigger acompanha. */
    :host([full]) { display: block; width: 100%; }
    :host([full]) { min-width: 0; }
    :host([full]) .trigger { width: 100%; min-width: 0; }
    :host([full]) .panel { width: 100%; }
        /* Validação — borda e brilho JÁ EM REPOUSO (igual ao fx-input); o
           brilho segue --fx-effect-error-ring, que acompanha effect.focus-ring. */
    :host([error]) .trigger,
    :host([invalid]) .trigger {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: var(--fx-effect-error-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent));
    }
    :host([error]) .trigger:focus-visible,
    :host([invalid]) .trigger:focus-visible,
    :host([error][open]) .trigger,
    :host([invalid][open]) .trigger {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: var(--fx-effect-error-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent));
    }
    :host([success]) .trigger,
    :host([valid]) .trigger {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: var(--fx-effect-success-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent));
    }
    :host([success]) .trigger:focus-visible,
    :host([valid]) .trigger:focus-visible,
    :host([success][open]) .trigger,
    :host([valid][open]) .trigger {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: var(--fx-effect-success-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent));
    }
    :host([disabled]) .trigger,
    .trigger[aria-disabled='true'] { opacity: 0.55; cursor: not-allowed; background-color: var(--fx-surface-surface-hover); }
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

    /* Painel do dropdown — a POSIÇÃO vertical é definida pelas regras
       [data-placement] abaixo (o JS de ajustarPosicao decide), por isso
       top/bottom não ficam aqui. */
    .panel {
      position: absolute;
      left: 0;
      z-index: var(--fx-z-dropdown, 1000);
      width: max(100%, 220px);
      max-height: var(--fx-select-panel-max-height, 260px);
      overflow-y: auto;
      display: none;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
    }
    /* Padrão: abre para baixo. */
    :host([open]:not([data-placement='top'])) .panel {
      top: calc(100% + var(--fx-select-panel-offset, 4px));
    }
    /* placement="top" explícito ou auto-flip: abre para cima. */
    :host([open][placement='top']) .panel,
    :host([open][data-placement='top']) .panel {
      top: auto;
      bottom: calc(100% + var(--fx-select-panel-offset, 4px));
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
        // `invalid`/`valid` são aliases aceitos no CSS; sem observá-los o
        // setAttribute no submit não re-renderiza.
        return ['size', 'disabled', 'placeholder', 'searchable', 'clearable', 'error', 'invalid', 'success', 'valid', 'placement'];
  }

  /** Espaço (px) entre o campo e o painel — espelha `--fx-select-panel-offset`. */
  private static readonly GAP = 4;
  /** Margem (px) mantida entre o painel e as bordas da viewport. */
  private static readonly MARGEM = 8;
  /** Altura mínima do painel ao ser limitado pelo espaço disponível. */
  private static readonly MIN_ALTURA = 80;

  private observer?: MutationObserver;
  private docListener?: (e: Event) => void;
  /** Reposiciona o painel enquanto ele estiver aberto (bound em `_abrir`). */
  private onReflow?: () => void;

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
      this._fechar();
      this.render();
    };
    document.addEventListener('click', this.docListener);
  }

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    if (this.docListener) document.removeEventListener('click', this.docListener);
    this._unbindReflow();
  }

  /** Abre o dropdown, posiciona o painel e passa a reposicioná-lo no reflow. */
  private _abrir(): void {
    this.setAttribute('open', '');
    this._bindReflow();
  }

  /** Fecha o dropdown e libera os listeners de resize/scroll. */
  private _fechar(): void {
    this.removeAttribute('open');
    // Sem isto o `data-placement` fica preso no host e a próxima abertura
    // mostraria o painel na posição invertida antes do ajuste rodar.
    this.removeAttribute('data-placement');
    this._unbindReflow();
  }

  /** Liga o reposicionamento (resize + scroll interno, em capture). */
  private _bindReflow(): void {
    if (this.onReflow) return;
    this.onReflow = () => {
      if (this.hasAttr('open')) this.ajustarPosicao();
    };
    window.addEventListener('resize', this.onReflow);
    window.addEventListener('scroll', this.onReflow, true);
  }

  private _unbindReflow(): void {
    if (!this.onReflow) return;
    window.removeEventListener('resize', this.onReflow);
    window.removeEventListener('scroll', this.onReflow, true);
    this.onReflow = undefined;
  }

  /**
   * Decide a posição vertical do painel medindo o espaço real da viewport.
   *
   * `placement="top"`/`"bottom"` são respeitados literalmente; o padrão
   * (`auto`) só inverte quando o painel não cabe embaixo E couber melhor
   * acima. Também limita a altura ao espaço disponível e evita overflow
   * horizontal próximo à borda direita.
   */
  protected ajustarPosicao(): void {
    const painel = this.root.querySelector<HTMLElement>('.panel');
    const trigger = this.root.querySelector<HTMLElement>('.trigger');
    if (!painel || !trigger) return;

    const r = trigger.getBoundingClientRect();
    const abaixo = window.innerHeight - r.bottom; // espaço livre embaixo
    const acima = r.top;                            // espaço livre acima
    const desejado = painel.scrollHeight;           // altura já com a busca
    const maxAltura = FxSelect._maxAltura(this);

    const pedido = this.getAttr('placement', 'auto');
    const paraCima =
      pedido === 'top' ||
      (pedido !== 'bottom' && abaixo < Math.min(desejado, maxAltura) && acima > abaixo);

    // O atributo placement do host tem precedência no CSS; data-placement
    // é o canal interno do auto-flip e usa a mesma regra de estilo.
    if (paraCima) this.setAttribute('data-placement', 'top');
    else this.removeAttribute('data-placement');

    // Limita a altura ao espaço real disponível (evita o painel vazar da tela).
    const disponivel = Math.max(
      FxSelect.MIN_ALTURA,
      (paraCima ? acima : abaixo) - FxSelect.GAP,
    );
    painel.style.maxHeight = `${Math.min(desejado || disponivel, disponivel, maxAltura)}px`;

    // Reset do deslocamento horizontal antes de remedir (o painel é recriado
    // a cada render, mas o ajuste pode rodar várias vezes com o mesmo nó).
    painel.style.left = '';
    const largura = painel.offsetWidth;
    const excesso = r.left + largura - (window.innerWidth - FxSelect.MARGEM);
    if (excesso > 0) {
      painel.style.left = `${-excesso}px`;
      painel.style.right = 'auto';
    }
  }

  /** Altura máxima do painel a partir de `--fx-select-panel-max-height`. */
  private static _maxAltura(host: HTMLElement): number {
    const raw = getComputedStyle(host).getPropertyValue('--fx-select-panel-max-height');
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 260;
  }

  private select(value: string): void {
    this.value = value;
    this._fechar();
    this.render();
    this.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true, detail: { value } }),
    );
  }

  /** Navegação por teclado entre as opções do listbox (WCAG 2.1.1). */
  private _navigateOptions(e: KeyboardEvent): void {
    e.preventDefault();
    if (!this.hasAttr('open')) {
      this._abrir();
      this.render();
    }
    const opts = Array.from(this.root.querySelectorAll<HTMLButtonElement>('.opt'));
    if (!opts.length) return;
    const current = opts.indexOf(this.root.activeElement as HTMLButtonElement);
    let next = 0;
    if (e.key === 'ArrowDown') next = current === -1 ? 0 : Math.min(current + 1, opts.length - 1);
    else if (e.key === 'ArrowUp') next = current === -1 ? opts.length - 1 : Math.max(current - 1, 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = opts.length - 1;
    opts[next]?.focus();
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
        <span class="${selectedLabel ? 'label' : 'placeholder'}">${esc(selectedLabel) || esc(placeholder)}</span>
        <span class="actions">
          ${this.hasAttr('clearable') && current ? '<button type="button" class="clear" part="clear" aria-label="Limpar">×</button>' : ''}
          <span class="caret">▼</span>
        </span>
      </span>
      <div class="panel" part="panel" role="listbox">
        ${this.hasAttr('searchable') ? `<input class="search" part="search" type="text" placeholder="${esc(this.getAttr('search-placeholder', 'Pesquisar…'))}">` : ''}
        ${filtered.map((o) => `
          <button type="button" class="opt" role="option" data-value="${esc(o.value)}"
            aria-selected="${o.value === current}">${esc(o.label)}</button>`).join('')}
        ${filtered.length === 0 ? `<div class="empty">${esc(this.getAttr('no-results', 'Nenhum resultado'))}</div>` : ''}
      </div>
    `);

    if (prevOpen) this.setAttribute('open', '');
    // A medição só é válida com o painel já `display: block` (open aplicado).
    if (this.hasAttr('open')) this.ajustarPosicao();
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
      if (this.hasAttr('open')) this._fechar();
      else this._abrir();
      this.render();
      this.root.querySelector<HTMLInputElement>('.search')?.focus();
    });

    // Teclado: Enter/Espaço abrem o dropdown; setas/Home/End/Escape navegam.
    trigger.addEventListener('keydown', (e) => {
      if (this.disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
        return;
      }
      if (e.key === 'Escape') {
        if (this.hasAttr('open')) {
          this._fechar();
          this.render();
          this.root.querySelector<HTMLElement>('.trigger')?.focus();
        }
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
        this._navigateOptions(e);
      }
    });

    // Limpar.
    this.root.querySelector('.clear')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.value = '';
      this._fechar();
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

