import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';
import { FENIX_ICON_BASE_CSS, fenixIconHtml } from '../../icons/base-css';

/**
 * <fx-input> — Campo de texto estilizado com os tokens do tema.
 *
 * Atributos: type (text|number|email|password|search|tel|url), value, size,
 * placeholder, disabled, readonly, min, max, step, clearable,
 * full (largura 100% acompanhando o elemento pai), icon (nome do glifo Fenix Icons
 * ou emoji/texto livre) e icon-pos (left|right, padrão left).
 * Largura: o default (260px; sm 220px / lg 300px) fica no HOST via tokens
 * --fx-input-width(-sm|-lg) — CSS externo, classes e style inline no elemento
 * vencem o default sem precisar de atributo.
 * Slots: `icon` (ícone customizado no lugar do atributo).
 * Eventos: `input` e `change` (composed, detail: { value }).
 */
export class FxInput extends FxElement {
  static override styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
      /* Largura padrão no HOST (e não no .field interno): assim CSS externo,
         classes do framework (ex.: w-full) e style inline no elemento vencem
         este default naturalmente — regras do documento têm precedência sobre
         :host. Default global trocável via token: --fx-input-width (-sm/-lg). */
      width: var(--fx-input-width, 260px);
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .field {
      font-family: inherit;
      font-size: inherit;
      min-height: var(--fx-size-md);
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      /* Acompanha a largura definida no :host. */
      width: 100%;
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
    /* Validação: sobrescrevem a borda/foco via token do preset. */
    :host([error]) .field,
    :host([invalid]) .field,
    :host([error]) .field:focus-visible,
    :host([invalid]) .field:focus-visible {
      border-color: var(--fx-color-danger, #dc2626);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent);
    }
    :host([success]) .field,
    :host([valid]) .field,
    :host([success]) .field:focus-visible,
    :host([valid]) .field:focus-visible {
      border-color: var(--fx-color-success, #16a34a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent);
    }
    :host([size='sm']) { width: var(--fx-input-width-sm, 220px); }
    :host([size='sm']) .field { padding: var(--fx-space-sm) var(--fx-space-md); font-size: var(--fx-font-size); min-height: var(--fx-size-sm); }
    :host([size='lg']) { width: var(--fx-input-width-lg, 300px); }
    :host([size='lg']) .field { padding: var(--fx-space-lg) var(--fx-space-xl); font-size: calc(var(--fx-font-size) + 4px); min-height: var(--fx-size-lg); }
    /* Full width: o host estica até o pai e o campo interno acompanha
       (usar com um container de largura controlada, ex. w-full no Vue). */
    :host([full]) { display: block; width: 100%; }
    :host([full]) .field { width: 100%; }
    /* Clearable */
    :host([clearable]) { position: relative; display: inline-flex; }
    :host([clearable][full]) { display: block; }
    .wrap { position: relative; display: inline-flex; align-items: center; width: 100%; }
    :host([full]) .wrap { display: flex; width: 100%; }
    :host([clearable]) .field { padding-right: var(--fx-space-xl); }
    :host([clearable][full]) .field { flex: 1 1 auto; }
    /* Ícones (attr icon + slot icon) — DENTRO do campo, sobre o padding
       (padrão Material/PrimeVue). Tamanho ajustável via --fx-input-icon-size. */
    .field-icon {
      position: relative;
      display: inline-flex;
      box-sizing: border-box;
      width: 100%;
    }
    .field-icon .field { flex: 1 1 auto; min-width: 0; }
    :host([full]) .field-icon { display: flex; width: 100%; }
    .field-icon .fx-icon,
    .field-icon ::slotted([slot='icon']) {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--fx-input-icon-size, calc(var(--fx-font-size) + 6px));
      line-height: 1;
      color: var(--fx-text-muted);
      pointer-events: none;
      z-index: 1;
    }
    .field-icon.icon-left .fx-icon,
    .field-icon.icon-left ::slotted([slot='icon']) { left: var(--fx-space-md); }
    .field-icon.icon-right .fx-icon,
    .field-icon.icon-right ::slotted([slot='icon']) { right: var(--fx-space-md); }
    /* padding = posição do ícone + largura + folga extra para o texto
       não colar no glifo. */
    .field-icon.icon-left .field {
      padding-left: calc(var(--fx-input-icon-size, calc(var(--fx-font-size) + 6px)) + var(--fx-space-md) + var(--fx-space-sm));
    }
    .field-icon.icon-right .field {
      padding-right: calc(var(--fx-input-icon-size, calc(var(--fx-font-size) + 6px)) + var(--fx-space-md) + var(--fx-space-sm));
    }
    /* icon-pos right + clearable: desloca o × para não sobrepor o ícone. */
    .field-icon.icon-right + .clear {
      right: calc(var(--fx-input-icon-size, calc(var(--fx-font-size) + 6px)) + var(--fx-space-lg));
    }
    .clear {
      position: absolute;
      right: var(--fx-space-xs);
      border: none;
      background: transparent;
      color: var(--fx-text-muted);
      font-size: calc(var(--fx-font-size) + 4px);
      line-height: 1;
      cursor: pointer;
      padding: 0 var(--fx-space-xs);
      border-radius: var(--fx-radius-full);
    }
    .clear:hover { color: var(--fx-color-danger); }
    .clear[hidden] { display: none; }
    /* Base dos glifos Fenix Icons (o @font-face vem de @wrrdev/fenix-ui/icons). */
    ${FENIX_ICON_BASE_CSS}
  `;

  // `value` fica FORA da observação: refleti-lo a cada tecla não pode
  // re-renderizar o template, senão o campo perde o foco ao digitar.
  // `error`/`success` (+ aliases `invalid`/`valid`) PRECISAM ser observados:
  // é assim que o toggle no playground / setAttribute no submit re-renderiza.
  static override get observedAttributes(): string[] {
    return [
      'type', 'size', 'placeholder',
      'disabled', 'readonly', 'min', 'max', 'step',
      'icon', 'icon-pos', 'error', 'invalid', 'success', 'valid',
    ];
  }

  /** Tamanho do campo. Padrão: `'md'`. */
  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) {
    this.setAttribute('size', value);
  }

  get value(): string {
    return this.getAttr('value');
  }
  set value(value: string) {
    this.setAttribute('value', value);
  }

  get disabled(): boolean {
    return this.hasAttr('disabled');
  }
  set disabled(value: boolean) {
    this.toggleAttr('disabled', Boolean(value));
  }

  protected override render(): void {
    const type = this.getAttr('type', 'text');
    const placeholder = this.getAttr('placeholder');
    const readonly = this.hasAttr('readonly');
    const disabled = this.hasAttr('disabled');
    const min = this.getAttr('min');
    const max = this.getAttr('max');
    const step = this.getAttr('step');
    const icon = this.getAttr('icon');
    const iconPos = this.getAttr('icon-pos', 'left') === 'right' ? 'right' : 'left';
    // Slot `icon` vence o atributo `icon`; sem nenhum dos dois, sem ícone.
    const slottedIcon = this.querySelector<HTMLElement>('[slot="icon"]');
    const iconContent = slottedIcon
      ? '<slot name="icon" part="icon"></slot>'
      : (icon ? fenixIconHtml(icon) : '');
    const useIconBox = Boolean(iconContent);

    this.setTemplate(`
      ${this.hasAttr('clearable') ? '<div class="wrap" part="wrap">' : ''}
      ${useIconBox ? `<div class="field-icon icon-${iconPos}">` : ''}
      ${useIconBox && iconPos === 'left' ? iconContent : ''}
      <input class="field" part="input" type="${esc(type)}"
        ${placeholder ? `placeholder="${esc(placeholder)}"` : ''}
        ${min ? `min="${esc(min)}"` : ''} ${max ? `max="${esc(max)}"` : ''} ${step ? `step="${esc(step)}"` : ''}
      />
      ${useIconBox && iconPos === 'right' ? iconContent : ''}
      ${useIconBox ? '</div>' : ''}
      ${this.hasAttr('clearable') ? '<button type="button" class="clear" part="clear" aria-label="Limpar" tabindex="-1">×</button></div>' : ''}
    `);

    const field = this.root.querySelector<HTMLInputElement>('.field');
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

    // Clearable: botão × que limpa o campo e emite input/change vazios.
    const clearBtn = this.root.querySelector<HTMLButtonElement>('.clear');
    const syncClear = (): void => {
      clearBtn?.toggleAttribute('hidden', field.value === '');
    };
    syncClear();
    clearBtn?.addEventListener('click', () => {
      field.value = '';
      syncClear();
      emit('input');
      emit('change');
      field.focus();
    });
    field.addEventListener('input', syncClear);
  }
}

export function defineFxInput(): typeof FxInput {
  return defineElement('fx-input', FxInput);
}
