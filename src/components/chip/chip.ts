import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-chip> — Chip/Tag compacto para labels, filtros e seleções.
 *
 * Atributos: variant (primary|secondary|success|warning|danger|info),
 * size (sm|md|lg), removable (mostra o botão ×), selectable (clica alterna
 * o estado selected), selected, disabled, icon (glifo/emoji).
 * Slot padrão: texto do chip.
 * Eventos (composed): `remove` (ao clicar em ×) e `chip-click` (ao clicar).
 */
export class FxChip extends FxElement {
  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-xs);
      padding: var(--fx-space-xs) var(--fx-space-md);
      min-height: var(--fx-size-sm);
      box-sizing: border-box;
      font-size: calc(var(--fx-font-size) - 2px);
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.06));
      border: 1px solid transparent;
      border-radius: var(--fx-radius-full);
      user-select: none;
      transition:
        background var(--fx-motion-duration-fast) var(--fx-motion-easing),
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        filter var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    :host([size='md']) .chip { min-height: var(--fx-size-md); padding: var(--fx-space-xs) var(--fx-space-lg); }
    :host([size='lg']) .chip { min-height: var(--fx-size-lg); font-size: var(--fx-font-size); padding: var(--fx-space-sm) var(--fx-space-xl); }

    :host([variant='primary']) .chip { background: color-mix(in srgb, var(--fx-color-primary) 14%, transparent); color: var(--fx-color-primary); }
    :host([variant='secondary']) .chip { background: color-mix(in srgb, var(--fx-color-secondary) 14%, transparent); color: var(--fx-color-secondary); }
    :host([variant='success']) .chip { background: color-mix(in srgb, var(--fx-color-success) 14%, transparent); color: var(--fx-color-success); }
    :host([variant='warning']) .chip { background: color-mix(in srgb, var(--fx-color-warning) 14%, transparent); color: var(--fx-color-warning); }
    :host([variant='danger']) .chip { background: color-mix(in srgb, var(--fx-color-danger) 14%, transparent); color: var(--fx-color-danger); }
    :host([variant='info']) .chip { background: color-mix(in srgb, var(--fx-color-info) 14%, transparent); color: var(--fx-color-info); }

    .chip.clickable { cursor: pointer; }
    .chip.clickable:hover { filter: brightness(0.95); }
    :host([selected]) .chip {
      background: var(--fx-color-primary);
      color: #fff;
    }
    :host([selected]) .chip:hover { filter: brightness(0.92); }
    :host([disabled]) .chip { opacity: 0.55; cursor: not-allowed; }
    .chip.clickable:active { transform: scale(0.97); }

    .icon { line-height: 1; }
    .remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: none;
      border-radius: var(--fx-radius-full);
      background: transparent;
      color: inherit;
      font-size: calc(var(--fx-font-size) + 2px);
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
    .remove:hover { background: rgba(0, 0, 0, 0.18); }
    .remove[hidden] { display: none; }
  `;

  static override get observedAttributes(): string[] {
    return ['variant', 'size', 'removable', 'selectable', 'selected', 'disabled', 'icon'];
  }

  get selected(): boolean { return this.hasAttr('selected'); }
  set selected(v: boolean) { this.toggleAttr('selected', v); }

  protected override render(): void {
    const icon = this.getAttr('icon');
    const removable = this.hasAttr('removable');
    const disabled = this.hasAttr('disabled');
    const clickable = (this.hasAttr('selectable') || this.hasAttr('href')) && !disabled;

    this.setTemplate(`
      <span class="chip ${clickable ? 'clickable' : ''}" part="chip" role="${clickable ? 'button' : 'status'}"
        ${clickable ? `tabindex="0" aria-pressed="${this.selected}"` : ''} ${disabled ? 'aria-disabled="true"' : ''}>
        ${icon ? `<span class="icon" aria-hidden="true">${esc(icon)}</span>` : ''}
        <slot></slot>
        <button type="button" class="remove" part="remove" aria-label="Remover" ${removable ? '' : 'hidden'}>×</button>
      </span>
    `);

    const chip = this.root.querySelector<HTMLElement>('.chip');
    const remove = this.root.querySelector<HTMLButtonElement>('.remove');
    if (!chip || !remove) return;

    remove.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('remove', { bubbles: true, composed: true }));
    });

    if (clickable) {
      const toggle = (): void => {
        if (this.hasAttr('selectable')) {
          this.selected = !this.selected;
          chip.setAttribute('aria-pressed', String(this.selected));
        }
        this.dispatchEvent(new CustomEvent('chip-click', { bubbles: true, composed: true }));
      };
      chip.addEventListener('click', toggle);
      chip.addEventListener('keydown', (e) => {
        const ev = e as KeyboardEvent;
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggle();
        }
      });
    }
  }
}

export function defineFxChip(): typeof FxChip {
  return defineElement('fx-chip', FxChip);
}
