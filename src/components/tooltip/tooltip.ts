import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-tooltip> — Dica flutuante ao passar o mouse/focar no elemento.
 *
 * Atributos: content (texto da dica), position (top|bottom|left|right, padrão top).
 * Slot padrão: elemento que dispara a dica.
 */
export class FxTooltip extends FxElement {
  static override styles = css`
    :host {
      position: relative;
      display: inline-flex;
      font-family: var(--fx-font-family);
    }
    .bubble {
      position: absolute;
      background: var(--fx-text-default, #1e293b);
      color: var(--fx-surface-background, #fff);
      font-size: calc(var(--fx-font-size, 14px) - 2px);
      line-height: 1.45;
      padding: var(--fx-space-xs) var(--fx-space-md);
      border-radius: var(--fx-radius-sm);
      box-shadow: var(--fx-shadow-md);
      width: max-content;
      min-width: 60px;
      max-width: var(--fx-tooltip-max-width, 320px);
      white-space: normal;
      text-align: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--fx-motion-duration-fast) var(--fx-motion-easing);
      z-index: var(--fx-z-tooltip, 1050);
      pointer-events: none;
    }
    :host(:hover) .bubble,
    :host(:focus-within) .bubble {
      opacity: 1;
      visibility: visible;
    }
    /* position top (padrão) */
    .bubble { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
    .bubble::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: var(--fx-text-default, #1e293b);
    }
    /* bottom */
    :host([position='bottom']) .bubble { bottom: auto; top: calc(100% + 6px); }
    :host([position='bottom']) .bubble::after { top: auto; bottom: 100%; border-top-color: transparent; border-bottom-color: var(--fx-text-default, #1e293b); }
    /* left */
    :host([position='left']) .bubble {
      right: calc(100% + 6px); left: auto; top: 50%; bottom: auto; transform: translateY(-50%);
    }
    :host([position='left']) .bubble::after {
      top: 50%; left: 100%; transform: translateY(-50%);
      border: 5px solid transparent; border-left-color: var(--fx-text-default, #1e293b);
    }
    /* right */
    :host([position='right']) .bubble {
      right: auto; left: calc(100% + 6px); top: 50%; bottom: auto; transform: translateY(-50%);
    }
    :host([position='right']) .bubble::after {
      top: 50%; left: auto; right: 100%; transform: translateY(-50%);
      border: 5px solid transparent; border-right-color: var(--fx-text-default, #1e293b);
    }
  `;

  static override get observedAttributes(): string[] {
    return ['content', 'position'];
  }

  protected override render(): void {
    const content = this.getAttr('content');
    this.setTemplate(`
      <slot></slot>
      <span class="bubble" part="bubble" role="tooltip">${content}</span>
    `);
  }
}

export function defineFxTooltip(): typeof FxTooltip {
  return defineElement('fx-tooltip', FxTooltip);
}
