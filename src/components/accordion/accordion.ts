import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-accordion-panel> — Painel individual do accordion.
 *
 * Atributos:
 *  - header: titulo exibido no cabecalho (ou use o slot "header").
 *  - value: identificador unico do painel (usado pelo fx-accordion).
 *  - expanded: presenca indica painel aberto (controlado pelo fx-accordion).
 *  - disabled: impede a abertura do painel.
 */
export class FxAccordionPanel extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      color: var(--fx-text-default);
    }
    /* A borda fica no wrapper interno (nao no :host): regras do documento
       externo (ex.: preflight do Tailwind com border-width: 0) vencem as
       regras :host do shadow tree, o que apagaria a linha divisoria. */
    .panel {
      border-bottom: 1px solid var(--fx-border-default);
    }
    :host(:last-child) .panel { border-bottom: none; }
    :host([disabled]) { opacity: 0.6; pointer-events: none; }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fx-space-md);
      width: 100%;
      box-sizing: border-box;
      padding: var(--fx-space-lg, 20px) var(--fx-space-md, 14px);
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      font-weight: 500;
      color: var(--fx-text-muted);
      text-align: left;
      cursor: pointer;
      transition: color var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease),
        background var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease);
    }
    .header:hover { color: var(--fx-text-default); }
    .header:focus-visible {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
      border-radius: var(--fx-radius-sm, 4px);
    }
    :host([expanded]) .header {
      color: var(--fx-text-default);
      font-weight: 700;
    }
    .header-text { flex: 1; min-width: 0; }
    .chevron {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--fx-text-muted);
      transition: transform var(--fx-motion-duration-normal, 250ms) var(--fx-motion-easing, ease);
    }
    :host([expanded]) .chevron { transform: rotate(180deg); color: var(--fx-color-primary); }
    .content {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows var(--fx-motion-duration-normal, 250ms) var(--fx-motion-easing, ease);
    }
    :host([expanded]) .content { grid-template-rows: 1fr; }
    .content-inner { overflow: hidden; }
    .content-pad {
      padding: 0 var(--fx-space-md, 14px) var(--fx-space-lg, 20px);
      color: var(--fx-text-muted);
      line-height: 1.6;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['header', 'expanded', 'disabled'];
  }

  get header(): string {
    return this.getAttr('header', '');
  }
  set header(v: string) {
    this.setAttribute('header', v);
  }

  get value(): string {
    return this.getAttr('value', '');
  }
  set value(v: string) {
    this.setAttribute('value', v);
  }

  get expanded(): boolean {
    return this.hasAttr('expanded');
  }
  set expanded(v: boolean) {
    this.toggleAttr('expanded', v);
  }

  get disabled(): boolean {
    return this.hasAttr('disabled');
  }
  set disabled(v: boolean) {
    this.toggleAttr('disabled', v);
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    // O clique vem do shadow root; composedPath() revela o alvo real.
    this.addEventListener('click', (e) => {
      const path = e.composedPath() as HTMLElement[];
      if (!path.some((el) => el.classList?.contains('header'))) return;
      if (this.disabled) return;
      this.dispatchEvent(
        new CustomEvent('fx-accordion-toggle', {
          bubbles: true,
          composed: true,
          detail: { panel: this },
        }),
      );
    });
    // Re-render quando o atributo expanded muda (para aria-expanded).
    this._mo = new MutationObserver(() => this.render());
    this._mo.observe(this, { attributes: true, attributeFilter: ['expanded', 'header', 'disabled'] });
  }

  protected override disconnectedCallback(): void {
    this._mo?.disconnect();
    this._mo = null;
  }

  private _mo: MutationObserver | null = null;

  protected override render(): void {
    this.setTemplate(`
      <div class="panel" part="panel">
        <button type="button" class="header" part="header" role="button"
          aria-expanded="${this.expanded}"
          ${this.disabled ? 'aria-disabled="true"' : ''}>
          <span class="header-text" part="header-text">
            <slot name="header">${this.header}</slot>
          </span>
          <span class="chevron" part="chevron" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </button>
        <div class="content" part="content" role="region">
          <div class="content-inner">
            <div class="content-pad" part="content-pad"><slot></slot></div>
          </div>
        </div>
      </div>
    `);
  }
}

/**
 * <fx-accordion> — Conjunto de paineis expansivos (estilo PrimeVue).
 *
 * Por padrao (modo single) abrir um painel fecha os outros.
 * Adicione o atributo `multiple` para permitir varios paineis abertos.
 *
 * Uso:
 *   <fx-accordion value="p1">
 *     <fx-accordion-panel value="p1" header="Titulo 1">Conteudo…</fx-accordion-panel>
 *     <fx-accordion-panel value="p2" header="Titulo 2">Conteudo…</fx-accordion-panel>
 *   </fx-accordion>
 *
 * Atributos:
 *  - value: valor(es) ativo(s), separados por virgula no modo multiple.
 *  - multiple: permite manter varios paineis abertos ao mesmo tempo.
 *
 * Evento: `change` (composed, detail: { value: string[] }).
 */
export class FxAccordion extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .accordion {
      background: var(--fx-surface-background, #ffffff);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md, 8px);
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }
  `;

  static override get observedAttributes(): string[] {
    return ['value', 'multiple'];
  }

  get multiple(): boolean {
    return this.hasAttr('multiple');
  }
  set multiple(v: boolean) {
    this.toggleAttr('multiple', v);
  }

  /** Valores ativos como array. */
  get values(): string[] {
    return this.getAttr('value', '').split(',').map(s => s.trim()).filter(Boolean);
  }
  set values(v: string[]) {
    this.setAttribute('value', v.join(','));
  }

  protected override connectedCallback(): void {
    this._observer = new MutationObserver(() => this._sync());
    this._observer.observe(this, { childList: true, subtree: true });
    super.connectedCallback();
    // Os paineis filhos podem ainda nao estar upgradados no primeiro sync;
    // reagenda para depois da fila de upgrade de custom elements.
    queueMicrotask(() => this._sync());
  }

  protected override disconnectedCallback(): void {
    this._observer?.disconnect();
    this._observer = null;
  }

  private _observer: MutationObserver | null = null;

  protected override render(): void {
    this.setTemplate(`
      <div class="accordion" part="accordion">
        <slot></slot>
      </div>
    `);
    this._sync();
    this._attachListeners();
  }

  /** Painéis do accordion (filhos diretos ou descendentes). */
  private get panels(): FxAccordionPanel[] {
    return Array.from(this.querySelectorAll<FxAccordionPanel>('fx-accordion-panel'));
  }

  private _sync(): void {
    const actives = this.values;
    // Leitura via getAttribute (nao via getters) porque os paineis filhos
    // podem ainda nao estar upgradados quando o accordion conecta.
    const panels = Array.from(this.querySelectorAll('fx-accordion-panel'));
    // Apenas na conexao inicial (sem valor definido): abre o primeiro painel.
    if (!this._initialized && actives.length === 0 && panels.length > 0) {
      this._initialized = true;
      const first = panels.find((p) => !p.hasAttribute('disabled'));
      if (first) {
        this.values = [first.getAttribute('value') || '0'];
        return;
      }
    }
    this._initialized = true;
    panels.forEach((p, i) => {
      const v = p.getAttribute('value') || String(i);
      if (!p.hasAttribute('value')) p.setAttribute('value', v);
      p.toggleAttribute('expanded', actives.includes(v));
    });
  }

  private _initialized = false;

  private _attachListeners(): void {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    // O painel emite 'fx-accordion-toggle' a partir do proprio host
    // (event retargeting do Shadow DOM impede usar closest('.header') aqui).
    this.addEventListener('fx-accordion-toggle', (e) => {
      const panel = (e as CustomEvent).detail?.panel as FxAccordionPanel | undefined;
      if (!panel || panel.disabled) return;
      this.toggle(panel);
    });
  }

  private _listenersAttached = false;

  /** Abre/fecha um painel respeitando o modo (single | multiple). */
  toggle(panel: FxAccordionPanel): void {
    const v = panel.value;
    let actives = this.values;
    if (panel.expanded) {
      actives = actives.filter(a => a !== v);
    } else if (this.multiple) {
      actives = [...actives, v];
    } else {
      actives = [v];
    }
    this.values = actives;
    this._sync();
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value: actives },
      }),
    );
  }

  /** Abre um painel pelo valor. */
  open(value: string): void {
    const panel = this.panels.find((p, i) => (p.value || String(i)) === value);
    if (panel && !panel.expanded) this.toggle(panel);
  }

  /** Fecha um painel pelo valor. */
  close(value: string): void {
    const panel = this.panels.find((p, i) => (p.value || String(i)) === value);
    if (panel && panel.expanded) this.toggle(panel);
  }
}

export function defineFxAccordion(): typeof FxAccordion {
  return defineElement('fx-accordion', FxAccordion);
}

export function defineFxAccordionPanel(): typeof FxAccordionPanel {
  return defineElement('fx-accordion-panel', FxAccordionPanel);
}
