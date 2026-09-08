import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-avatar> — Representação visual de usuário/item.
 *
 * Atributos: size (number px / sm|md|lg), shape (circle|rounded|square),
 * variant (image|text|icon), src (imagem), alt (acessibilidade).
 * Slots: `icon` (glifo/emoji quando variant=icon) e padrão (iniciais).
 *
 * Uso em grupo: posicione vários `<fx-avatar>` em um container com a classe
 * `avatar-group` (empilha com overlap automático).
 */
export class FxAvatar extends FxElement {
  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --_size: var(--fx-size-md, 36px);
      --_bg: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.08));
      --_color: var(--fx-text-default, #1e293b);
    }
    :host([size='sm']) { --_size: var(--fx-size-sm, 24px); }
    :host([size='lg']) { --_size: var(--fx-size-lg, 48px); }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--_size);
      height: var(--_size);
      min-width: var(--_size);
      box-sizing: border-box;
      background: var(--_bg);
      color: var(--_color);
      font-weight: 700;
      font-size: calc(var(--_size) / 2.2);
      line-height: 1;
      overflow: hidden;
      text-decoration: none;
      /* border-radius definido por shape abaixo */
    }
    :host([shape='square']) .avatar { border-radius: var(--fx-radius-sm); }
    :host([shape='rounded']) .avatar { border-radius: var(--fx-radius-md); }
    :host([shape='circle']) .avatar, :host([shape='']) .avatar { border-radius: var(--fx-radius-full); }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .avatar.text { font-size: calc(var(--_size) / 2.6); }
    .avatar .slot-icon { font-size: calc(var(--_size) / 2.4); }

    /* grupo empilhado */
    :host(.avatar-group) { display: inline-flex; }
    :host(.avatar-group) > .avatar {
      border: 2px solid var(--fx-surface-background);
      margin-left: calc(var(--_size) / -3);
      z-index: 1;
    }
    :host(.avatar-group) > .avatar:last-child { margin-left: 0; }
    :host(.avatar-group) > .avatar:hover { z-index: 2; }
  `;

  static override get observedAttributes(): string[] {
    return ['size', 'shape', 'variant', 'src', 'alt'];
  }

  get variant(): string { return this.getAttr('variant', 'text'); }
  get src(): string { return this.getAttr('src'); }
  set src(v: string) { this.setAttribute('src', v); }

  protected override render(): void {
    const variant = this.variant;
    const src = this.getAttr('src');
    const alt = this.getAttr('alt', '');
    const isIcon = variant === 'icon';
    const isImage = variant === 'image' && src;

    this.setTemplate(`
      <span class="avatar${isImage ? ' image' : isIcon ? ' icon-slot' : ' text'}" part="avatar" aria-label="${esc(alt)}" role="img">
        ${isImage
                          ? `<img src="${esc(src)}" alt="${esc(alt)}">`
          : isIcon
            ? `<slot name="icon" class="slot-icon"></slot>`
            : `<slot></slot>`}
      </span>
    `);
  }
}

export function defineFxAvatar(): typeof FxAvatar {
  return defineElement('fx-avatar', FxAvatar);
}
