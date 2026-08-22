import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

export class FxFloatlabel extends FxElement {
  static override get observedAttributes(): string[] {
    return ['variant', 'error', 'invalid', 'success', 'valid', 'active'];
  }

  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      vertical-align: middle;
    }
    .wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }

    ::slotted(label) {
      position: absolute;
      left: var(--fx-space-md, 12px);
      top: 50%;
      transform: translateY(-50%);
      font-size: var(--fx-font-size, 14px);
      font-weight: var(--fx-font-weight, 400);
      color: var(--fx-text-muted, #94a3b8);
      pointer-events: none;
      transition:
        top var(--fx-motion-duration-normal, 180ms) var(--fx-motion-easing, ease-in-out),
        transform var(--fx-motion-duration-normal, 180ms) var(--fx-motion-easing, ease-in-out),
        font-size var(--fx-motion-duration-normal, 180ms) var(--fx-motion-easing, ease-in-out),
        color var(--fx-motion-duration-normal, 180ms) var(--fx-motion-easing, ease-in-out);
      background-color: var(--fx-surface, #fff);
      padding: 0 4px;
      line-height: 1;
      border-radius: 2px;
      z-index: 2;
    }

    :host([variant='over']) {
      margin-top: 18px;
    }
    :host([variant='over']) ::slotted(label) {
      top: -18px;
      transform: none;
      font-size: calc(var(--fx-font-size, 14px) - 3px);
      font-weight: 600;
      background: transparent;
      padding: 0;
    }

    :host([variant='in']) ::slotted(label) {
      top: 50%;
      transform: translateY(-50%);
      font-size: var(--fx-font-size, 14px);
      font-weight: var(--fx-font-weight, 400);
    }
    :host([variant='in'][active]) ::slotted(label),
    :host([variant='in']:focus-within) ::slotted(label) {
      top: 10px;
      transform: translateY(0);
      font-size: calc(var(--fx-font-size, 14px) - 3px);
      font-weight: 600;
    }

    :host([active]) ::slotted(label),
    :host(:focus-within) ::slotted(label) {
      top: 0;
      transform: translateY(-50%);
      font-size: calc(var(--fx-font-size, 14px) - 3px);
      font-weight: 600;
    }

    :host(:focus-within) ::slotted(label) {
      color: var(--fx-color-primary, #4f46e5);
    }

    :host([error]) ::slotted(label),
    :host([invalid]) ::slotted(label) {
      color: var(--fx-color-danger, #dc2626);
    }

    .error-message {
      display: none;
      margin-top: 4px;
      font-size: calc(var(--fx-font-size, 14px) - 3px);
      color: var(--fx-color-danger, #dc2626);
    }
    :host([error]) .error-message,
    :host([invalid]) .error-message { display: block; }
  `;

  private targetControl: HTMLElement | null = null;
  private observer: MutationObserver | null = null;

  protected override render(): void {
    this.setTemplate(`
      <div class="wrapper" part="wrapper">
        <slot></slot>
      </div>
    `);

    this.attachEvents();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  private attachEvents(): void {
    const slot = this.root.querySelector('slot');
    if (!slot) return;

    const syncTarget = (): void => {
      const nodes = slot.assignedElements();
      const control = nodes.find((n) => n.tagName.toLowerCase() !== 'label') as HTMLElement | undefined;
      if (control !== this.targetControl) {
        this.targetControl = control ?? null;
        this.observeControl();
      }
      this.updateState();
    };

    slot.addEventListener('slotchange', syncTarget);
    syncTarget();

    this.addEventListener('focusin', () => this.updateState());
    this.addEventListener('focusout', () => setTimeout(() => this.updateState(), 50));
    this.addEventListener('input', () => this.updateState());
    this.addEventListener('change', () => this.updateState());
  }

  private observeControl(): void {
    this.observer?.disconnect();
    if (!this.targetControl) return;

    this.observer = new MutationObserver(() => this.updateState());
    this.observer.observe(this.targetControl, {
      attributes: true,
      attributeFilter: ['value', 'values', 'start', 'end', 'open'],
    });
  }

  private updateState(): void {
    if (!this.targetControl) {
      this.removeAttribute('active');
      return;
    }

    const c = this.targetControl as any;
    const hasValue = Boolean(
      (typeof c.value === 'string' && c.value.trim() !== '') ||
      (Array.isArray(c.values) && c.values.length > 0) ||
      (c.getAttribute && (c.getAttribute('value') || c.getAttribute('values') || c.getAttribute('start')))
    );

    const isOpen = c.hasAttribute && c.hasAttribute('open');
    const isFocused = this.matches(':focus-within') || (this.shadowRoot?.activeElement != null);

    if (hasValue || isOpen || isFocused) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }
}

export function defineFxFloatlabel(): typeof FxFloatlabel {
  return defineElement('fx-floatlabel', FxFloatlabel);
}





