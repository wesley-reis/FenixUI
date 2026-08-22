import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-switch> — Interruptor ligado/desligado (role="switch").
 *
 * O texto do slot (light DOM) é o rótulo clicável.
 * Atributos: checked, disabled, size (sm|md|lg).
 * Evento: `change` (composed, detail: { checked }).
 */
export class FxSwitch extends FxElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .switch {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-sm);
      cursor: pointer;
      user-select: none;
      background: none;
      border: none;
      padding: 0;
      color: var(--fx-text-default);
      font: inherit;
    }
    .track {
      position: relative;
      width: 40px;
      height: 22px;
      border-radius: var(--fx-radius-full);
      background: var(--fx-border-default);
      flex-shrink: 0;
      transition: background-color var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: var(--fx-radius-full);
      background: #fff;
      box-shadow: var(--fx-shadow-sm);
      transition: transform var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([checked]) .track { background: var(--fx-color-primary); }
    :host([checked]) .thumb { transform: translateX(18px); }
    .switch:focus-visible .track {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .label { display: inline-flex; align-items: center; }
    :host([disabled]) .switch { opacity: 0.55; cursor: not-allowed; pointer-events: none; }
    /* Escala: sm 32×18 · md 40×22 (padrão) · lg 48×26 */
    :host([size='sm']) .track { width: 32px; height: 18px; }
    :host([size='sm']) .thumb { top: 2px; left: 2px; width: 14px; height: 14px; }
    :host([size='sm'][checked]) .thumb { transform: translateX(14px); }
    :host([size='lg']) .track { width: 48px; height: 26px; }
    :host([size='lg']) .thumb { top: 4px; left: 4px; width: 18px; height: 18px; }
    :host([size='lg'][checked]) .thumb { transform: translateX(22px); }
  `;

  static override get observedAttributes(): string[] {
    return ['checked', 'disabled', 'size'];
  }

  /** Tamanho da trilha. Padrão: `'md'`. */
  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) {
    this.setAttribute('size', value);
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

  protected override render(): void {
    this.setTemplate(`
      <button class="switch" part="switch" type="button" role="switch"
        aria-checked="${this.checked}" ${this.hasAttr('disabled') ? 'disabled' : ''}>
        <span class="track" part="track"><span class="thumb" part="thumb"></span></span>
        <span class="label" part="label"><slot></slot></span>
      </button>
    `);

    const btn = this.root.querySelector<HTMLButtonElement>('.switch');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (this.hasAttr('disabled')) return;
      this.checked = !this.checked;
      btn.setAttribute('aria-checked', String(this.checked));
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: { checked: this.checked },
        }),
      );
    });
  }
}

export function defineFxSwitch(): typeof FxSwitch {
  return defineElement('fx-switch', FxSwitch);
}
