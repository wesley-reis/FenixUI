import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-textarea> — Área de texto multilinha estilizada com os tokens do tema.
 *
 * Atributos: value, size (sm|md|lg), placeholder, disabled, readonly,
 * rows, maxlength.
 * Eventos: `input` e `change` (composed, detail: { value }).
 */
export class FxTextarea extends FxElement {
  static override styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .field {
      font-family: inherit;
      font-size: inherit;
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      width: 260px;
      min-height: calc(var(--fx-size-md) + 40px);
      resize: vertical;
      box-sizing: border-box;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .field::placeholder { color: var(--fx-text-muted); opacity: 1; }
    .field:hover { border-color: var(--fx-border-hover); }
    .field:focus-visible {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .field:disabled,
    .field[readonly] {
      opacity: 0.55;
      cursor: not-allowed;
      background-color: var(--fx-surface-surface-hover);
    }
    :host([error]) .field, :host([invalid]) .field {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent);
    }
    :host([success]) .field, :host([valid]) .field {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent);
    }
    :host([size='sm']) .field { width: 220px; min-height: var(--fx-size-sm); padding: var(--fx-space-sm) var(--fx-space-md); }
    :host([size='lg']) .field { width: 300px; min-height: calc(var(--fx-size-lg) + 80px); }
  `;

  static override get observedAttributes(): string[] {
    return ['size', 'placeholder', 'disabled', 'readonly', 'rows', 'maxlength'];
  }

  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) { this.setAttribute('size', value); }

  get value(): string { return this.getAttr('value'); }
  set value(value: string) { this.setAttribute('value', value); }

  protected override render(): void {
    const placeholder = this.getAttr('placeholder');
    const readonly = this.hasAttr('readonly');
    const disabled = this.hasAttr('disabled');
    const rows = this.getAttr('rows');
    const maxlength = this.getAttr('maxlength');

    this.setTemplate(`<textarea class="field" part="textarea"
      ${placeholder ? `placeholder="${esc(placeholder)}"` : ''}
      ${rows ? `rows="${esc(rows)}"` : ''}
      ${maxlength ? `maxlength="${esc(maxlength)}"` : ''}
    ></textarea>`);

    const field = this.root.querySelector<HTMLTextAreaElement>('.field');
    if (!field) return;
    field.value = this.getAttr('value');
    if (disabled) field.setAttribute('disabled', '');
    if (readonly) field.setAttribute('readonly', '');

    const emit = (event: string): void => {
      this.value = field.value;
      this.dispatchEvent(
        new CustomEvent(event, { bubbles: true, composed: true, detail: { value: field.value } }),
      );
    };
    // Bloqueia o evento nativo (composed, sem detail) para que só o
    // CustomEvent com detail chegue aos consumidores.
    field.addEventListener('input', (e) => { e.stopPropagation(); emit('input'); });
    field.addEventListener('change', (e) => { e.stopPropagation(); emit('change'); });
  }
}

export function defineFxTextarea(): typeof FxTextarea {
  return defineElement('fx-textarea', FxTextarea);
}
