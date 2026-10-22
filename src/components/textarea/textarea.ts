import { FxFormElement } from '../../core/form-element';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-textarea> — Área de texto multilinha estilizada com os tokens do tema.
 *
 * Form-Associated Custom Element: dentro de um <form> entra no FormData
 * (via atributo `name`), recebe reset/disable do form e é alvo de
 * `<label for>`/`autofocus`. Enter continua sendo quebra de linha.
 *
 * Atributos: value, name, size (sm|md|lg), placeholder, disabled, readonly,
 * rows, maxlength, autofocus.
 *
 * Autofill: o <textarea> real vive no Shadow DOM, então `autocomplete` é
 * repassado ao campo interno (default `off`, como no <fx-input>) e o atributo
 * declarado no host vence. `name`/`id` também descem ao campo interno. O Chrome
 * IGNORA `off` em type="password" — irrelevante aqui, mas a regra vale para o
 * <fx-input>.
 *
 * Eventos: `input`, `change` e `valueChange` (composed, detail: { value }) —
 * `input` aciona o v-model do Vue e `valueChange` o [(value)] do Angular.
 */
export class FxTextarea extends FxFormElement {
  static override styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      /* Largura padrão no HOST: CSS externo, classes e style inline no elemento
         vencem este default naturalmente (regras do documento > :host). */
      width: var(--fx-textarea-width, 260px);
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .field {
      font-family: inherit;
      font-size: inherit;
      /* Altura determinística: a caixa fica EXATAMENTE no token --fx-size-*. */
      line-height: var(--fx-font-line-height);
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      /* Acompanha a largura definida no :host. */
      width: 100%;
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
    /* Validação: borda sempre; brilho (anel) via token que acompanha
       effect.focus-ring — desligado ⇒ erro só com a borda vermelha. */
    :host([error]) .field, :host([invalid]) .field {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: var(--fx-effect-error-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent));
    }
    :host([success]) .field, :host([valid]) .field {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: var(--fx-effect-success-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent));
    }
    :host([size='sm']) { width: var(--fx-textarea-width-sm, 220px); }
    :host([size='sm']) .field { min-height: var(--fx-size-sm); padding: var(--fx-space-xs) var(--fx-space-md); }
    :host([size='lg']) { width: var(--fx-textarea-width-lg, 300px); }
    :host([size='lg']) .field { min-height: calc(var(--fx-size-lg) + 80px); }
    /* Full width: o host estica até o pai e o campo interno acompanha. */
    :host([full]) { display: block; width: 100%; }
    :host([full]) .field { width: 100%; }
  `;

  static override get observedAttributes(): string[] {
    return ['size', 'placeholder', 'disabled', 'readonly', 'full', 'rows', 'maxlength', 'error', 'invalid', 'success', 'valid',
      // Autofill: vivem no campo interno (ver o JSDoc da classe).
      'autocomplete', 'name', 'id'];
  }

  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) { this.setAttribute('size', value); }

  get value(): string { return this.getAttr('value'); }
  set value(value: string | null | undefined) {
    this.setAttribute('value', value == null ? '' : String(value));
    // `value` NÃO é observado (re-render perderia o foco): o campo interno é
    // sincronizado aqui, sem re-render, preservando foco/cursor.
    this.syncInternalControl();
    this.updateFormValue();
  }

  get readonly(): boolean {
    return this.hasAttr('readonly');
  }
  set readonly(value: boolean) {
    this.toggleAttr('readonly', Boolean(value));
  }

  get full(): boolean {
    return this.hasAttr('full');
  }
  set full(value: boolean) {
    this.toggleAttr('full', Boolean(value));
  }

  protected override render(): void {
    const placeholder = this.getAttr('placeholder');
    const readonly = this.hasAttr('readonly');
    const disabled = this.hasAttr('disabled');
    const rows = this.getAttr('rows');
    const maxlength = this.getAttr('maxlength');
    // Autofill: o <textarea> interno é o alvo do navegador — o atributo do HOST
    // é repassado; sem ele, `off` (ver o JSDoc da classe).
    const autocomplete = this.getAttr('autocomplete', 'off');
    const name = this.getAttr('name');
    const id = this.getAttr('id');

    this.setTemplate(`<textarea class="field" part="textarea"
      ${name ? `name="${esc(name)}"` : ''} ${id ? `id="${esc(id)}"` : ''}
      autocomplete="${esc(autocomplete)}"
      ${placeholder ? `placeholder="${esc(placeholder)}"` : ''}
      ${rows ? `rows="${esc(rows)}"` : ''}
      ${maxlength ? `maxlength="${esc(maxlength)}"` : ''}
    ></textarea>`);

    const field = this.root.querySelector<HTMLTextAreaElement>('.field');
    if (!field) return;
    field.value = this.getAttr('value');
    if (disabled) field.setAttribute('disabled', '');
    if (readonly) field.setAttribute('readonly', '');

    // Cada interação emite UM `input` (v-model) + `valueChange` (Angular);
    // `change` apenas no evento nativo de mudança.
    const notifyInput = (): void => {
      this.value = field.value;
      this.emitValueEvents();
    };
    const notifyChange = (): void => {
      this.value = field.value;
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: { value: field.value },
        }),
      );
    };
    // Bloqueia o evento nativo (composed, sem detail) para que só o
    // CustomEvent com detail chegue aos consumidores.
    field.addEventListener('input', (e) => { e.stopPropagation(); notifyInput(); });
    field.addEventListener('change', (e) => { e.stopPropagation(); notifyChange(); });

    // Publica name/value no form (ElementInternals) a cada render.
    this.updateFormValue();
  }

  /** Empurra o atributo `value` para o campo interno sem re-renderizar. */
  protected override syncInternalControl(): void {
    const field = this.root.querySelector<HTMLTextAreaElement>('.field');
    const value = this.getAttr('value');
    if (field && field.value !== value) field.value = value;
  }
}

export function defineFxTextarea(): typeof FxTextarea {
  return defineElement('fx-textarea', FxTextarea);
}
