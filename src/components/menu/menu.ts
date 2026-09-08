import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-menu> — Menú de navegación (horizontal o vertical) con ítems y submenús.
 *
 * Atributos: orientation (horizontal|vertical), size (sm|md|lg),
 * dense (reduce el alto), titles (separado por `,` para navegación).
 * Slots `item`: cada ítem de menú con [slot="item"].
 * Evento (composed): `select` (detail: { index, label }).
 */
export class FxMenu extends FxElement {
  static override styles = css`
    :host { display: block; font-family: var(--fx-font-family); font-size: var(--fx-font-size); }
    :host([orientation='vertical']) { border: 1px solid var(--fx-border-default); border-radius: var(--fx-radius-md); }
    nav {
      display: flex;
      align-items: center;
      gap: var(--fx-space-xs);
      flex-wrap: wrap;
      background: var(--fx-surface-background);
    }
    :host([orientation='vertical']) nav { flex-direction: column; align-items: stretch; }
    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-xs);
      padding: var(--fx-space-sm) var(--fx-space-md);
      min-height: var(--fx-size-sm);
      border-radius: var(--fx-radius-sm);
      color: var(--fx-text-default);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing), color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    :host([size='sm']) .item { min-height: var(--fx-size-sm); padding: var(--fx-space-xs) var(--fx-space-sm); font-size: calc(var(--fx-font-size) - 2px); }
    :host([size='lg']) .item { min-height: var(--fx-size-lg); padding: var(--fx-space-md) var(--fx-space-lg); font-size: calc(var(--fx-font-size) + 1px); }
    .item:hover { background: var(--fx-surface-surface-hover, rgba(0,0,0,0.06)); }
    .item.active { background: var(--fx-color-primary); color: #fff; font-weight: 600; }
    .item[aria-disabled='true'] { opacity: 0.5; cursor: not-allowed; }
    .item[aria-disabled='true']:hover { background: none; }
    .item .caret { font-size: calc(var(--fx-font-size) - 2px); color: var(--fx-text-muted); }

    /* submenú ancorado ao item */
    .submenu-wrap { position: relative; display: inline-flex; }
    :host([orientation='vertical']) .submenu-wrap { width: 100%; }
    .dropdown {
      position: absolute;
      left: 0;
      top: calc(100% + 4px);
      min-width: 180px;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-sm);
      box-shadow: var(--fx-shadow-lg);
      padding: var(--fx-space-xs);
      z-index: var(--fx-z-dropdown, 1060);
      display: none;
      flex-direction: column;
    }
    .dropdown.open { display: flex; }
    :host([orientation='vertical']) .dropdown { left: 100%; top: 0; }
  `;

  static override get observedAttributes(): string[] {
    return ['orientation', 'size', 'dense', 'titles'];
  }

  get orientation(): string { return this.getAttr('orientation', 'horizontal'); }

  get items(): HTMLElement[] {
    return Array.from(this.children).filter((el) => el.matches('[slot="item"]')).map((el) => el as HTMLElement);
  }

  protected override render(): void {
    const titleAttr = this.getAttr('titles');
    const titles = titleAttr ? titleAttr.split(',').map((s) => s.trim()) : [];

    const items = this.items;
    const itemsHtml = items
      .map((it, i) => {
        const label = titles[i] || it.textContent?.trim() || `Item ${i + 1}`;
        const hasSub = it.matches('[submenu]');
        const disabled = it.hasAttribute('disabled');
        const item = `
          <span class="item" part="item" data-i="${i}" ${disabled ? 'aria-disabled="true"' : ''}>
            ${esc(label)}${hasSub ? `<span class="caret">▾</span>` : ''}
          </span>`;
        if (!hasSub) return item;
        return `
          <span class="submenu-wrap" part="submenu-wrap">
            ${item}
            <div class="dropdown" part="submenu"><slot name="submenu-${i}"></slot></div>
          </span>`;
      })
      .join('');

    this.setTemplate(`
      <nav part="menu" aria-label="Menu">
        ${itemsHtml}
      </nav>
    `);

    this._bindItems();
  }

  private _bindItems(): void {
    const items = Array.from(this.root.querySelectorAll<HTMLElement>('.item'));
    items.forEach((item) => {
      const i = Number(item.dataset.i);
      item.addEventListener('click', () => {
        if (item.getAttribute('aria-disabled') === 'true') return;
        const source = this.items[i];
        const hasSub = source?.hasAttribute('submenu');
        if (hasSub) {
          // fecha outros dropdowns e alterna o deste item
          this.root.querySelectorAll<HTMLElement>('.dropdown.open').forEach((d) => {
            if (d !== item.parentElement?.querySelector('.dropdown')) d.classList.remove('open');
          });
          item.parentElement?.querySelector('.dropdown')?.classList.toggle('open');
          return;
        }
        this._setActive(item);
        this.dispatchEvent(new CustomEvent('select', {
          bubbles: true, composed: true,
          detail: { index: i, label: item.textContent?.trim() ?? '' },
        }));
      });
      item.addEventListener('keydown', (e) => {
        const ev = e as KeyboardEvent;
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          item.click();
        }
      });
    });
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('pointerdown', this._onOutside);
  }

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this._onOutside);
  }

  private _onOutside = (e: MouseEvent): void => {
    const path = e.composedPath();
    this.root.querySelectorAll<HTMLElement>('.dropdown.open').forEach((d) => {
      if (!path.includes(d)) d.classList.remove('open');
    });
  };

  private _setActive(active: HTMLElement): void {
    Array.from(this.root.querySelectorAll<HTMLElement>('.item')).forEach((it) => {
      it.classList.toggle('active', it === active);
    });
  }
}

export function defineFxMenu(): typeof FxMenu {
  return defineElement('fx-menu', FxMenu);
}