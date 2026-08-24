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
    `);

    // Sincroniza painéis
    document.querySelectorAll<FxTabPanel>('fx-tab-panel').forEach((p) => {
      if (tabs.some((t) => t.getAttribute('tab') === p.tab)) {
        p.visible = p.tab === active;
      }
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
    if (!this.hasAttribute('hidden') && !this._initialized) {
      // Painéis não ativos começam ocultos
      const tabs = Array.from(document.querySelectorAll('fx-tabs'));
      const owner = tabs.find((t) => Array.from(t.querySelectorAll<HTMLElement>('fx-tab')).some((tb) => tb.getAttribute('tab') === this.tab));
      if (owner) {
        const active = (owner as FxTabs).value;
        this.visible = active === this.tab;
      }
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
