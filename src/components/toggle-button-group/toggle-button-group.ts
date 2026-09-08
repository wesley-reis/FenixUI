import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-toggle-button-group> — Grupo de botones de selección múltiple o única.
 *
 * Atributos: multiple (permite varios seleccionados), value (lista), size.
 * Slots `option`: cada botón con [slot="option" value="..."].
 * Evento (composed): `change` (detail: { value: string[] }).
 */
export class FxToggleButtonGroup extends FxElement {
  static override styles = css`
    :host { display: inline-flex; font-family: var(--fx-font-family); font-size: var(--fx-font-size); gap: var(--fx-space-xs); }
    .option {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--fx-space-xs);
      min-height: var(--fx-size-md);
      padding: var(--fx-space-sm) var(--fx-space-lg);
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      cursor: pointer;
      user-select: none;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing), border-color var(--fx-motion-duration-fast) var(--fx-motion-easing), color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    :host([size='sm']) .option { min-height: var(--fx-size-sm); padding: var(--fx-space-xs) var(--fx-space-md); font-size: calc(var(--fx-font-size) - 2px); }
    :host([size='lg']) .option { min-height: var(--fx-size-lg); padding: var(--fx-space-md) var(--fx-space-xl); font-size: calc(var(--fx-font-size) + 2px); }
    .option:hover { border-color: var(--fx-color-primary); }
    .option.active {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
    }
    .option.active:hover { filter: brightness(0.92); }
  `;

  static override get observedAttributes(): string[] {
    return ['multiple', 'size'];
  }

  get value(): string[] {
    const raw = this.getAttr('value');
    return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  }
  set value(v: string[]) { this.setAttribute('value', v.join(',')); }

  get multiple(): boolean { return this.hasAttr('multiple'); }

  get options(): HTMLElement[] {
    return Array.from(this.children).filter((el) => el.matches('[slot="option"]')).map((el) => el as HTMLElement);
  }

  protected override render(): void {
    const opts = this.options;
    const selected = this.value;

    const html = opts
      .map((o, i) => {
        const val = o.getAttribute('value') ?? '';
        const active = selected.includes(val);
        return `<button type="button" class="option ${active ? 'active' : ''}" part="option" data-v="${esc(val)}" aria-pressed="${active}">${esc(o.textContent?.trim() || `Opción ${i + 1}`)}</button>`;
      })
      .join('');

    this.setTemplate(`
      <div class="options" part="options" role="group" aria-label="Toggle buttons">
        ${html}
      </div>
    `);

    this._bindOptions();
  }

  private _bindOptions(): void {
    Array.from(this.root.querySelectorAll<HTMLElement>('.option') || []).forEach((opt) => {
      opt.addEventListener('click', () => this._toggle(opt));
      opt.addEventListener('keydown', (e) => {
        const ev = e as KeyboardEvent;
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          this._toggle(opt);
        }
      });
    });
  }

  private _toggle(opt: HTMLElement): void {
    const val = opt.dataset.v ?? '';
    let current = this.value;

    if (this.multiple) {
      if (current.includes(val)) current = current.filter((v) => v !== val);
      else current.push(val);
    } else {
      current = current.includes(val) ? [] : [val];
    }

    this.value = current;
    this.root.querySelectorAll<HTMLElement>('.option').forEach((o) => {
      const on = current.includes(o.dataset.v ?? '');
      o.classList.toggle('active', on);
      o.setAttribute('aria-pressed', String(on));
    });
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: { value: current } }));
  }
}

export function defineFxToggleButtonGroup(): typeof FxToggleButtonGroup {
  return defineElement('fx-toggle-button-group', FxToggleButtonGroup);
}