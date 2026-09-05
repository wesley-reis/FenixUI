import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-dropdown> — Menu de ações em popover.
 *
 * Atributos: label (texto do trigger), position (bottom-left padrão | bottom-right).
 * Itens: <fx-dropdown-item value="x">Texto</fx-dropdown-item>
 * Evento: `select` (composed, detail: { value }).
 */
export class FxDropdown extends FxElement {
  static override styles = css`
    :host {
      position: relative;
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .trigger { min-height: var(--fx-size-md); }
    .panel {
      position: absolute;
      top: calc(100% + 4px);
      min-width: 180px;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      padding: var(--fx-space-xs);
      z-index: var(--fx-z-dropdown, 1000);
      display: none;
    }
    :host([open]) .panel { display: block; }
    /* left = alinhado à esquerda do trigger; right = à direita; center = centrado */
    :host([position='left']) .panel,
    :host([position='bottom-left']) .panel { left: 0; right: auto; }
    :host([position='center']) .panel {
      left: 50%;
      transform: translateX(-50%);
    }
    :host([position='right']) .panel,
    :host([position='bottom-right']) .panel { right: 0; left: auto; }
    :host(:not([position])) .panel { left: 0; right: auto; }
    ::slotted(fx-dropdown-item) { display: block; }
    .empty { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); padding: var(--fx-space-sm); }
  `;

  static override get observedAttributes(): string[] {
    return ['label', 'position', 'open'];
  }

  get open(): boolean { return this.hasAttr('open'); }
  set open(value: boolean) { this.toggleAttr('open', value); }

  protected override render(): void {
    const label = this.getAttr('label', 'Ações');
    const items = Array.from(this.querySelectorAll<HTMLElement>('fx-dropdown-item'));

    this.setTemplate(`
      <span class="trigger" role="button" tabindex="0" part="trigger"
        aria-haspopup="menu" aria-expanded="${this.open}">
        ${esc(label)} ▾
      </span>
      <div class="panel" role="menu" part="panel">
        ${items.length ? '' : '<div class="empty">Nenhuma ação</div>'}
        <slot></slot>
      </div>
    `);

    const trigger = this.root.querySelector<HTMLElement>('.trigger');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      // Fecha outros dropdowns abertos
      document.querySelectorAll('fx-dropdown[open]').forEach((d) => {
        if (d !== this) (d as FxDropdown).open = false;
      });
      this.open = !this.open;
    });
    trigger?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open = !this.open;
      } else if (e.key === 'Escape') {
        this.open = false;
      }
    });

    this._attachDelegatedListeners();
  }

  private docListener?: (e: Event) => void;
  private _listenersAttached = false;

  /** Delegação de cliques nos itens + fechamento ao clicar fora (registrado uma vez). */
  private _attachDelegatedListeners(): void {
    if (this._listenersAttached) return;
    this._listenersAttached = true;

    this.addEventListener('click', (e) => {
      const item = (e.composedPath() as HTMLElement[]).find(
        (n) => n.tagName?.toLowerCase() === 'fx-dropdown-item',
      );
      if (!item) return;
      this.open = false;
      this.dispatchEvent(new CustomEvent('select', {
        bubbles: true, composed: true,
        detail: { value: item.getAttribute('value') ?? '' },
      }));
    });

    this.docListener = (e: Event) => {
      if (!this.contains(e.target as Node)) this.open = false;
    };
    document.addEventListener('click', this.docListener);
  }

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.docListener) document.removeEventListener('click', this.docListener);
    this.docListener = undefined;
  }
}

/**
 * <fx-dropdown-item> — Item de menu.
 */
export class FxDropdownItem extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .item {
      display: block;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      color: var(--fx-text-default);
      padding: var(--fx-space-sm) var(--fx-space-md);
      cursor: pointer;
      border-radius: var(--fx-radius-sm);
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .item:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, var(--fx-surface-background)); color: var(--fx-color-primary); }
  `;

  static override get observedAttributes(): string[] { return ['value']; }

  get value(): string { return this.getAttr('value'); }
  set value(v: string) { this.setAttribute('value', v); }

  protected override render(): void {
    this.setTemplate('<button type="button" class="item" part="item" role="menuitem"><slot></slot></button>');
  }
}

export function defineFxDropdown(): typeof FxDropdown {
  return defineElement('fx-dropdown', FxDropdown);
}
export function defineFxDropdownItem(): typeof FxDropdownItem {
  return defineElement('fx-dropdown-item', FxDropdownItem);
}
