import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-radio> — Botão de opção. Radios com o mesmo `name` formam um grupo
 * (seleção exclusiva gerenciada pelo próprio componente).
 *
 * Atributos: checked, disabled, value, name, size (sm|md|lg).
 * Evento: `change` (composed, detail: { checked, value }).
 */
export class FxRadio extends FxElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .box {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-sm);
      cursor: pointer;
      user-select: none;
      color: var(--fx-text-default);
      -webkit-tap-highlight-color: transparent;
    }
    .control {
      width: var(--fx-size-radio, 18px);
      height: var(--fx-size-radio, 18px);
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--fx-border-hover);
      border-radius: var(--fx-radius-full);
      background: var(--fx-surface-background);
      transition:
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .box:hover .control { border-color: var(--fx-color-primary); }
    .box:focus-visible .control {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .dot {
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      border-radius: var(--fx-radius-full);
      background: var(--fx-color-primary);
      transform: scale(0);
      transition: transform var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    :host([checked]) .control { border-color: var(--fx-color-primary); }
    :host([checked]) .dot { transform: scale(1); }
    /* Validação */
    :host([error]) .control,
    :host([invalid]) .control { border-color: var(--fx-color-danger, #dc2626); }
    :host([success]) .control,
    :host([valid]) .control { border-color: var(--fx-color-success, #16a34a); }
    .label { display: inline-flex; align-items: center; }
    :host([disabled]) .box {
      opacity: 0.55;
      cursor: not-allowed;
      pointer-events: none;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['checked', 'disabled'];
  }

  get checked(): boolean {
    return this.hasAttr('checked');
  }
  set checked(value: boolean) {
    this.toggleAttr('checked', Boolean(value));
  }

  get disabled(): boolean {
    return this.hasAttr('disabled');
  }
  set disabled(value: boolean) {
    this.toggleAttr('disabled', Boolean(value));
  }

  /** Tamanho do controle. Padrão: `'md'`. */
  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) {
    this.setAttribute('size', value);
  }

  protected override render(): void {
    const px = this.size === 'sm' ? '14px' : this.size === 'lg' ? '22px' : '18px';
    if (!this.style.getPropertyValue('--fx-size-radio')) {
      this.style.setProperty('--fx-size-radio', px);
    }

    this.setTemplate(`
      <span class="box" part="box" role="radio" tabindex="0"
        aria-checked="${this.checked}" aria-disabled="${this.disabled}">
        <span class="control" part="control"><span class="dot" part="dot"></span></span>
        <span class="label" part="label"><slot></slot></span>
      </span>
    `);

    const box = this.root.querySelector<HTMLElement>('.box');
    if (!box) return;
    box.addEventListener('click', () => this.select());
    box.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === ' ' || (e as KeyboardEvent).key === 'Enter') {
        e.preventDefault();
        this.select();
      }
    });
  }

  private select(): void {
    if (this.disabled || this.checked) return;
    // Desmarca os outros radios do mesmo grupo (mesmo name).
    const name = this.getAttr('name');
    if (name) {
      document.querySelectorAll(`fx-radio[name="${CSS.escape(name)}"]`).forEach((r) => {
        (r as FxRadio).checked = false;
      });
    }
    this.checked = true;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { checked: true, value: this.getAttr('value') },
      }),
    );
  }
}

export function defineFxRadio(): typeof FxRadio {
  return defineElement('fx-radio', FxRadio);
}
