import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-badge> — Rótulo/contador de status.
 *
 * Atributos: variant (default|primary|success|warning|danger|info), round.
 * Slots: default (conteúdo).
 */
export class FxBadge extends FxElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      font-family: var(--fx-font-family);
      font-size: calc(var(--fx-font-size) - 2px);
      font-weight: var(--fx-font-weight);
      line-height: 1;
      padding: var(--fx-space-xs) var(--fx-space-sm);
      border-radius: var(--fx-radius-full);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface-background);
      color: var(--fx-text-muted);
      white-space: nowrap;
    }
    /* Cor: severity é o atributo canônico; variant=<cor> segue aceito como
       alias legado. Sem nenhum dos dois, o badge fica neutro (estilo base). */
    :host([severity='primary']) .badge,
    :host([variant='primary']) .badge { background: var(--fx-color-primary); color: #fff; border-color: transparent; }
    :host([severity='success']) .badge,
    :host([variant='success']) .badge { background: var(--fx-color-success); color: #fff; border-color: transparent; }
    :host([severity='warning']) .badge,
    :host([variant='warning']) .badge { background: var(--fx-color-warning); color: #fff; border-color: transparent; }
    :host([severity='danger']) .badge,
    :host([variant='danger']) .badge { background: var(--fx-color-danger); color: #fff; border-color: transparent; }
    :host([severity='info']) .badge,
    :host([variant='info']) .badge { background: var(--fx-color-info); color: #fff; border-color: transparent; }
    :host(:not([round])) .badge { border-radius: var(--fx-radius-sm); }
  `;

  static override get observedAttributes(): string[] {
    return ['variant', 'severity', 'round'];
  }

  get variant(): string { return this.getAttr('variant', 'default'); }
  set variant(v: string) { this.setAttribute('variant', v); }

  /** Cor semântica do badge (canônica). Padrão: `''` (neutro). */
  get severity(): string { return this.getAttr('severity'); }
  set severity(v: string) { if (v) this.setAttribute('severity', v); else this.removeAttribute('severity'); }

  get round(): boolean { return this.hasAttr('round'); }
  set round(v: boolean) { this.toggleAttr('round', Boolean(v)); }

  protected override render(): void {
    this.setTemplate(`<span class="badge" part="badge"><slot></slot></span>`);
  }
}

export function defineFxBadge(): typeof FxBadge {
  return defineElement('fx-badge', FxBadge);
}