import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-tabs> — Navegação por abas.
 *
 * Atributos: value (aba ativa, corresponde ao attr `tab` de cada fx-tab-panel).
 * Uso:
 *   <fx-tabs value="a">
 *     <fx-tab tab="a">Aba A</fx-tab>
 *     <fx-tab tab="b">Aba B</fx-tab>
 *   </fx-tabs>
 *   <fx-tab-panel tab="a">…</fx-tab-panel>
 *   <fx-tab-panel tab="b">…</fx-tab-panel>
 * Evento: `change` (composed, detail: { value }).
 */
export class FxTabs extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
    }
    .list {
      display: flex;
      gap: var(--fx-space-xs);
      border-bottom: 2px solid var(--fx-border-default);
    }
    .tab {
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: var(--fx-font-size);
      color: var(--fx-text-muted);
      padding: var(--fx-space-md) var(--fx-space-lg);
      cursor: pointer;
      position: relative;
      transition: color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .tab::after {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: -2px;
      height: 2px;
      background: transparent;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .tab:hover { color: var(--fx-text-default); }
    .tab[data-disabled] {
      color: var(--fx-border-default);
      cursor: not-allowed;
      opacity: 0.6;
    }
    .tab[data-disabled]:hover { color: var(--fx-border-default); }
    .tab[aria-selected='true'] {
      color: var(--fx-color-primary);
      font-weight: 600;
    }
    .tab[aria-selected='true']::after { background: var(--fx-color-primary); }
    .tab:focus-visible {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
      border-radius: var(--fx-radius-sm);
    }
    /* Os <fx-tab> originais são renderizados como botões no shadow DOM.
       Sem isto, o <slot> os projetaria de novo como texto cru abaixo das abas. */
    ::slotted(fx-tab) {
      display: none !important;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['value'];
  }

  get value(): string { return this.getAttr('value'); }
  set value(value: string) { this.setAttribute('value', value); }

  protected override render(): void {
    const tabs = Array.from(this.querySelectorAll<HTMLElement>('fx-tab'));
    const active = this.value || tabs[0]?.getAttribute('tab') || '';

    this.setTemplate(`
      <div class="list" role="tablist">
        ${tabs.map((t) => {
          const tabId = t.getAttribute('tab') ?? '';
          const disabled = t.hasAttribute('disabled');
          return `<button type="button" class="tab" role="tab" part="tab"
            data-tab="${tabId}" aria-selected="${tabId === active}"
            ${disabled ? 'aria-disabled="true" data-disabled="true"' : ''}>${t.textContent?.trim()}</button>`;
        }).join('')}
      </div>
      <slot></slot>
    `);

    // Sincroniza apenas os painéis DESTE conjunto de abas
    // (dentro do host ou irmãos seguintes — nunca global).
    // IMPORTANTE: manipula o atributo `hidden` DIRETAMENTE (nunca a
    // propriedade `.visible`), porque escrever a propriedade em um
    // elemento ainda não upgradeado cria uma own property que faz
    // shadowing dos accessors do prototype para sempre.
    this.panels.forEach((p) => {
      const show = p.getAttribute('tab') === active;
      if (show) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });

    this.root.querySelectorAll<HTMLButtonElement>('.tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.hasAttribute('data-disabled')) return;
        this.value = btn.dataset.tab ?? '';
        this.dispatchEvent(
          new CustomEvent('change', { bubbles: true, composed: true, detail: { value: this.value } }),
        );
      });
    });
  }

  /** Painéis associados: descendentes do host ou irmãos seguintes no DOM. */
  private get panels(): FxTabPanel[] {
    const inside = Array.from(this.querySelectorAll<FxTabPanel>('fx-tab-panel'));
    if (inside.length) return inside;
    const out: FxTabPanel[] = [];
    let el = this.nextElementSibling;
    while (el && !el.matches('fx-tabs')) {
      if (el.matches('fx-tab-panel')) out.push(el as FxTabPanel);
      else out.push(...Array.from(el.querySelectorAll<FxTabPanel>(':scope > fx-tab-panel')));
      el = el.nextElementSibling;
    }
    return out;
  }
}

/**
 * <fx-tab-panel> — Painel de conteúdo associado a uma aba.
 */
export class FxTabPanel extends FxElement {
  static override styles = css`
    :host { display: block; padding: var(--fx-space-lg) 0; font-family: var(--fx-font-family); color: var(--fx-text-default); }
    :host([hidden]) { display: none; }
  `;

  static override get observedAttributes(): string[] {
    return ['tab'];
  }

  get tab(): string { return this.getAttr('tab'); }

  get visible(): boolean { return !this.hasAttr('hidden'); }
  set visible(value: boolean) { this.toggleAttr('hidden', !value); }

  protected override render(): void {
    this.setTemplate('<slot></slot>');
    if (!this._initialized) {
      // Estado inicial: visível apenas se for a aba ativa do owner.
      // (usa atributo direto — ver comentário em FxTabs.render)
      const owner =
        (this.closest<FxTabs>('fx-tabs')) ??
        (() => {
          let el = this.previousElementSibling;
          while (el) {
            if (el.matches('fx-tabs')) return el as FxTabs;
            el = el.previousElementSibling;
          }
          return null;
        })();
      const active = owner ? (owner.getAttribute('value') || '') : '';
      if (this.getAttribute('tab') !== active) this.setAttribute('hidden', '');
      this._initialized = true;
    }
  }

  private _initialized = false;
}

export function defineFxTabs(): typeof FxTabs {
  return defineElement('fx-tabs', FxTabs);
}
export function defineFxTabPanel(): typeof FxTabPanel {
  return defineElement('fx-tab-panel', FxTabPanel);
}
