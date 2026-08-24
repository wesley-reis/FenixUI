/**
 * <fx-toast> — notificações imperativas com posição e duração configuráveis.
 *
 * Atributos: kind (success|error|info|warning), title, message,
 * position (top-left|top-center|top-right|bottom-left|bottom-center|bottom-right),
 * duration (ms; 0 = fixo até fechar).
 */
const POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
] as const;
export type ToastPosition = (typeof POSITIONS)[number];
type ToastKind = 'success' | 'error' | 'info' | 'warning';

const KIND_COLOR: Record<ToastKind, string> = {
  success: 'var(--fx-color-success, #10b981)',
  error: 'var(--fx-color-danger, #f43f5e)',
  info: 'var(--fx-color-info, #0ea5e9)',
  warning: 'var(--fx-color-warning, #f59e0b)',
};

const CARD_CSS = `
:host { display: contents; }
.card {
  display: flex; align-items: flex-start; gap: 10px;
  min-width: 260px; max-width: 360px;
  background: var(--fx-surface-background, #fff);
  color: var(--fx-text-default, #1e293b);
  border: 1px solid var(--fx-border-default, #e2e8f0);
  border-left: 4px solid var(--kind);
  border-radius: var(--fx-radius-md, 8px);
  box-shadow: var(--fx-shadow-lg, 0 10px 30px rgba(0,0,0,.14));
  padding: var(--fx-space-sm, 8px) var(--fx-space-md, 12px);
  font-family: inherit;
  animation: fx-toast-in .25s ease;
}
@keyframes fx-toast-in { from { opacity: 0; transform: translateY(-6px); } }
.card.leaving { opacity: 0; transition: opacity .2s ease; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--kind); margin-top: 6px; flex: none; }
.body { flex: 1; min-width: 0; }
.title { font-weight: 600; font-size: 14px; }
.msg { font-size: calc(var(--fx-font-size, 14px) - 2px); color: var(--fx-text-muted, #64748b); margin-top: 2px; word-break: break-word; white-space: pre-line; }
.close {
  all: unset; cursor: pointer; flex: none; line-height: 1;
  color: var(--fx-text-muted, #64748b); font-size: 15px; padding: 2px 4px; border-radius: 4px;
}
.close:hover { color: var(--fx-color-danger, #f43f5e); background: var(--fx-surface-surface-hover, rgba(0,0,0,.05)); }
`;

export class FxToast extends HTMLElement {
  static get observedAttributes() {
    return ['kind', 'title', 'message', 'duration'];
  }

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot!.firstChild) this.#render();
    const dur = Number(this.getAttribute('duration') ?? '4000');
    // Durações mínimas: valores muito baixos (ex.: digitação parcial no
    // playground) são elevados para 1s; 0 permanece fixo até fechar.
    const safe = dur === 0 ? 0 : Math.max(Number.isNaN(dur) ? 4000 : dur, 1000);
    if (!Number.isNaN(safe) && safe > 0 && !this.timer) {
      this.timer = setTimeout(() => this.dismiss(), safe);
    }
  }

  disconnectedCallback() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  dismiss() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const card = this.shadowRoot!.querySelector('.card');
    if (card) {
      card.classList.add('leaving');
      setTimeout(() => this.remove(), 200);
    } else {
      this.remove();
    }
  }

  #render() {
    const kind = (this.getAttribute('kind') || 'info') as ToastKind;
    const title = this.getAttribute('title') ?? '';
    const msg = this.getAttribute('message') ?? '';
    const color = KIND_COLOR[kind] ?? KIND_COLOR.info;
    this.shadowRoot!.innerHTML = `
      <style>${CARD_CSS}</style>
      <div class="card" style="--kind:${color}" role="status" part="card">
        <span class="dot"></span>
        <div class="body">
          ${title ? '<div class="title"></div>' : ''}
          ${msg ? '<div class="msg"></div>' : ''}
        </div>
        <button class="close" aria-label="Fechar">✕</button>
      </div>`;
    const t = this.shadowRoot!.querySelector<HTMLElement>('.title');
    const m = this.shadowRoot!.querySelector<HTMLElement>('.msg');
    if (t) t.textContent = title;
    if (m) m.textContent = msg;
    this.shadowRoot!.querySelector('.close')!.addEventListener('click', () => this.dismiss());
  }
}

/* ---------- Regiões por posição na tela ---------- */
function regionFor(position: ToastPosition): HTMLElement {
  let region = document.querySelector<HTMLElement>(`[data-fx-toast-region="${position}"]`);
  if (!region) {
    region = document.createElement('div');
    region.setAttribute('data-fx-toast-region', position);
    const [vertical, horizontal] = position.split('-') as [string, string];
    const style = region.style as CSSStyleDeclaration & Record<string, string>;
    style.position = 'fixed';
    style[vertical] = '16px';
    if (horizontal === 'center') {
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    } else {
      style[horizontal] = '16px';
    }
    style.display = 'flex';
    style.flexDirection = 'column';
    style.gap = '8px';
    style.zIndex = '1100';
    style.pointerEvents = 'none';
    new MutationObserver(() => {
      region!.querySelectorAll('*').forEach((c) => ((c as HTMLElement).style.pointerEvents = 'auto'));
    }).observe(region, { childList: true });
    document.body.appendChild(region);
  }
  return region;
}

export interface ToastOptions {
  /** Texto secundário (também aceito como 2º argumento dos métodos). */
  message?: string;
  position?: ToastPosition;
  /** Tempo em ms até sumir. 0 = fixo até fechar. Padrão: 4000 */
  duration?: number;
}

class ToastApi {
  private seq = 0;
  private map = new Map<number, FxToast>();

  push(kind: ToastKind, title: string, messageOrOpts?: string | ToastOptions, opts?: ToastOptions): number {
    const id = ++this.seq;
    // Assinaturas suportadas:
    //   push(kind, title, options)
    //   push(kind, title, message, options)   <- usada pela doc e mais intuitiva
    const message = typeof messageOrOpts === 'string' ? messageOrOpts : messageOrOpts?.message;
    const o: ToastOptions = { ...(typeof messageOrOpts === 'object' && messageOrOpts ? messageOrOpts : undefined), ...opts };
    const el = document.createElement('fx-toast') as FxToast;
    el.setAttribute('kind', kind);
    el.setAttribute('title', title);
    if (message) el.setAttribute('message', message);
    el.setAttribute('position', o.position ?? 'top-right');
    el.setAttribute('duration', String(o.duration ?? 4000));
    regionFor(o.position ?? 'top-right').appendChild(el);
    this.map.set(id, el);
    return id;
  }

  close(id: number) {
    this.map.get(id)?.dismiss();
    this.map.delete(id);
  }

  success = (t: string, m?: string, o?: ToastOptions) => this.push('success', t, m, o);
  error = (t: string, m?: string, o?: ToastOptions) => this.push('error', t, m, o);
  info = (t: string, m?: string, o?: ToastOptions) => this.push('info', t, m, o);
  warning = (t: string, m?: string, o?: ToastOptions) => this.push('warning', t, m, o);
}

export const FenixToast = new ToastApi();
// Exposto globalmente para uso em HTML puro (onclick="FenixToast.success(...)")
(globalThis as unknown as Record<string, unknown>).FenixToast = FenixToast;

export function defineFxToast() {
  if (!customElements.get('fx-toast')) customElements.define('fx-toast', FxToast);
}

