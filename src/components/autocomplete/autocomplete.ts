import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-autocomplete> — Campo de texto com sugestões filtradas.
 *
 * Atributos: value, size, placeholder, source (JSON array de strings),
 * disabled, min-chars (padrão 1).
 * Evento: `select` (composed, detail: { value }).
 */
export class FxAutocomplete extends FxElement {
  static override styles = css`
    :host {
      position: relative;
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    input {
      font-family: inherit;
      font-size: inherit;
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      width: 260px;
      min-height: var(--fx-size-md);
      box-sizing: border-box;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    input::placeholder { color: var(--fx-text-muted); opacity: 1; }
    input:hover { border-color: var(--fx-border-hover); }
    input:focus-visible {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    :host([size='sm']) input { width: 220px; min-height: var(--fx-size-sm); padding: var(--fx-space-sm) var(--fx-space-md); }
    :host([size='lg']) input { width: 300px; min-height: var(--fx-size-lg); }
    .list {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      z-index: var(--fx-z-dropdown, 1000);
      max-height: 220px;
      overflow-y: auto;
      display: none;
    }
    :host([open]) .list { display: block; }
    .opt {
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
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .opt:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, var(--fx-surface-background)); color: var(--fx-color-primary); }
    .empty { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); padding: var(--fx-space-sm) var(--fx-space-md); }
  `;

  static override get observedAttributes(): string[] {
    return ['size', 'placeholder', 'source', 'disabled', 'min-chars'];
  }

  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(v: string) { this.setAttribute('size', v); }
  get value(): string { return this.getAttr('value'); }
  set value(v: string) { this.setAttribute('value', v); }

  private get source(): string[] {
    try {
      const raw = JSON.parse(this.getAttr('source', '[]'));
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  }

  protected override render(): void {
    const placeholder = this.getAttr('placeholder');

    this.setTemplate(`
      <input class="field" part="input" type="text"
        ${placeholder ? `placeholder="${placeholder}"` : ''} autocomplete="off"/>
      <div class="list" part="list" role="listbox"></div>
    `);

    const field = this.root.querySelector<HTMLInputElement>('.field');
    if (!field) return;
    field.value = this.value;
    if (this.hasAttr('disabled')) field.setAttribute('disabled', '');

    const list = this.root.querySelector<HTMLElement>('.list');
    const minChars = Number(this.getAttr('min-chars', '1')) || 1;

    const openList = (): void => {
      if (!list) return;
      const q = field.value.toLowerCase();
      const matches = this.source.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
      list.innerHTML = matches.length
        ? matches.map((m) => `<button type="button" class="opt" role="option" data-v="${m}">${m}</button>`).join('')
        : '<div class="empty">Nenhum resultado</div>';
      list.querySelectorAll<HTMLButtonElement>('.opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          field.value = btn.dataset.v ?? '';
          this.value = field.value;
          this.toggleAttr('open', false);
          this.dispatchEvent(new CustomEvent('select', {
            bubbles: true, composed: true, detail: { value: this.value },
          }));
        });
      });
      this.toggleAttr('open', true);
    };

    // Reabrir com foco sem re-render (evita perder digitação)
    field.addEventListener('input', () => {
      this.value = field.value;
      openList();
    });
    field.addEventListener('focus', () => { if (field.value.length >= minChars) openList(); });

    document.addEventListener('click', (e) => {
      if (!this.contains(e.target as Node)) this.toggleAttr('open', false);
    });
  }
}

export function defineFxAutocomplete(): typeof FxAutocomplete {
  return defineElement('fx-autocomplete', FxAutocomplete);
}
