import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-timeline> — Linha do tempo vertical com eventos.
 *
 * Atributos: marker (glifo do marcador, padrão '●'), size (sm|md|lg).
 * Slot `item`: cada elemento com [slot="item"] vira um evento. Use os
 * atributos `time` (texto do horário/data) e `title` no item.
 *
 * Exemplo:
 *   <fx-timeline>
 *     <div slot="item" time="09:00" title="Reunião">Detalhes…</div>
 *     <div slot="item" time="14:00" title="Deploy">Detalhes…</div>
 *   </fx-timeline>
 */
export class FxTimeline extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --_marker: calc(var(--fx-font-size) - 1px);
    }
    :host([size='sm']) { --_marker: calc(var(--fx-font-size) - 3px); }
    :host([size='lg']) { --_marker: calc(var(--fx-font-size) + 2px); }

    .tl {
      list-style: none;
      margin: 0;
      padding: 0;
      position: relative;
    }
    /* linha vertical centralizada no eixo dos marcadores */
    .tl::before {
      content: '';
      position: absolute;
      left: calc(var(--_marker) / 2 - 1px);
      top: calc(var(--_marker) / 2);
      bottom: 6px;
      width: 2px;
      background: var(--fx-border-default);
    }
    .event {
      position: relative;
      padding: 0 0 var(--fx-space-lg) calc(var(--_marker) + var(--fx-space-lg));
    }
    .event:last-child { padding-bottom: 0; }
    /* marcador circular centralizado no eixo da linha */
    .dot {
      position: absolute;
      left: 0;
      top: 0;
      width: var(--_marker);
      height: var(--_marker);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: calc(var(--_marker) * 0.55);
      color: var(--fx-color-primary);
      line-height: 1;
    }
    .head {
      display: flex;
      align-items: baseline;
      gap: var(--fx-space-sm);
      flex-wrap: wrap;
      min-height: var(--_marker);
    }
    .time {
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-muted);
      white-space: nowrap;
    }
    .title {
      font-weight: 600;
      color: var(--fx-text-default);
    }
    .content {
      margin-top: 2px;
      color: var(--fx-text-default);
      line-height: 1.5;
    }
    .event[hidden] { display: none; }

    /* ---- modo horizontal ---- */
    :host([orientation='horizontal']) .tl {
      display: flex;
    }
    :host([orientation='horizontal']) .tl::before {
      left: calc(var(--_marker) / 2 - 1px);
      right: calc(var(--_marker) / 2);
      top: calc(var(--_marker) / 2 - 1px);
      bottom: auto;
      width: auto;
      height: 2px;
    }
    :host([orientation='horizontal']) .event {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 var(--fx-space-lg) 0 0;
    }
    :host([orientation='horizontal']) .event:last-child { padding-right: 0; }
    :host([orientation='horizontal']) .event .dot {
      position: static;
      margin-bottom: var(--fx-space-sm);
    }
  `;

  static override get observedAttributes(): string[] {
    return ['marker', 'size', 'orientation'];
  }

  protected override render(): void {
    this.setTemplate(`<ol class="tl" part="timeline"></ol>`);
    this._decorate();
  }

  /**
   * Monta os eventos a partir dos itens do light DOM.
   * Os itens permanecem no light DOM (sem slot correspondente, não são
   * renderizados) — assim a decoração é idempotente e sobrevive a re-renders.
   */
  private _decorate(): void {
    const list = this.shadowRoot?.querySelector('ol');
    if (!list) return;
    const marker = this.getAttr('marker', '●');
    const items = Array.from(this.querySelectorAll('[slot="item"]'));
    if (!items.length) return;

    list.innerHTML = items
      .map((item) => {
        const time = item.getAttribute('time') ?? '';
        const title = item.getAttribute('title') ?? '';
        const head = [
          time ? `<span class="time">${esc(time)}</span>` : '',
          title ? `<span class="title">${esc(title)}</span>` : '',
        ].join('');
        return `<li class="event" part="event"><span class="dot" part="marker" aria-hidden="true">${esc(marker)}</span><div class="head">${head}</div><div class="content">${item.innerHTML}</div></li>`;
      })
      .join('');
  }

  private _observer?: MutationObserver;

  protected override connectedCallback(): void {
    super.connectedCallback();
    // filhos podem chegar depois (innerHTML do playground)
    this._observer = new MutationObserver(() => this._decorate());
    this._observer.observe(this, { childList: true, subtree: false });
    this._decorate();
  }

  protected override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = undefined;
  }
}

export function defineFxTimeline(): typeof FxTimeline {
  return defineElement('fx-timeline', FxTimeline);
}