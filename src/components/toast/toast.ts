/**
 * <fx-toast> — notificações imperativas com posição e duração configuráveis.
 *
 * Atributos: kind (success|error|info|warning), title, message,
 * position (top-left|top-center|top-right|bottom-left|bottom-center|bottom-right),
 * duration (ms; 0 = fixo até fechar), mode ('light'|'dark' — força o esquema de
 * cores do card independentemente do tema global), progress (booleano ou
 * 'always'|'hover'|'paused' — barra de contagem regressiva na cor do kind),
 * progress-origin (left|right — lado pelo qual a barra esvazia; padrão left).
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

/** Ícone exibido no lugar da bolinha, conforme a variante. */
const KIND_ICON: Record<ToastKind, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

const CARD_CSS = `
:host { display: contents; pointer-events: auto; }
/* Modo explícito: sobrepõe os tokens herdados do tema global SOMENTE neste card. */
:host([mode='dark']) {
  --fx-surface-background: #1e293b;
  --fx-text-default: #f1f5f9;
  --fx-text-muted: #94a3b8;
  --fx-border-default: #334155;
  --fx-shadow-lg: 0 10px 30px rgba(0, 0, 0, .5);
  --fx-surface-surface-hover: rgba(255, 255, 255, .08);
}
:host([mode='light']) {
  --fx-surface-background: #ffffff;
  --fx-text-default: #1e293b;
  --fx-text-muted: #64748b;
  --fx-border-default: #e2e8f0;
  --fx-shadow-lg: 0 10px 30px rgba(0, 0, 0, .14);
  --fx-surface-surface-hover: rgba(0, 0, 0, .05);
}
.fx-icon {
  font-family: var(--fx-icon-font, 'Fenix Icons');
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  display: inline-block;
  white-space: nowrap;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
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
.icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--kind);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex: none; margin-top: 2px;
  user-select: none;
}
.body { flex: 1; min-width: 0; }
.title { font-weight: 600; font-size: 14px; }
.msg { font-size: calc(var(--fx-font-size, 14px) - 2px); color: var(--fx-text-muted, #64748b); margin-top: 2px; word-break: break-word; white-space: pre-line; }
.close {
  all: unset; cursor: pointer; flex: none; line-height: 1;
  color: var(--fx-text-muted, #64748b); font-size: 15px; padding: 2px 4px; border-radius: 4px;
}
.close:hover { color: var(--fx-color-danger, #f43f5e); background: var(--fx-surface-surface-hover, rgba(0,0,0,.05)); }

/* --- Barra de contagem regressiva (atributo progress) ---
   Fica na base do card e esvazia durante a duração, na cor do kind (--kind) —
   ou seja, acompanha success/error/warning/info sem configuração extra.

   O lado é configurável pelo atributo progress-origin (padrão: left):
     left  → a barra drena da direita para a esquerda (ancorada à esquerda)
     right → a barra drena da esquerda para a direita (ancorada à direita)
   A origem entra como custom property, então os keyframes são compartilhados.

   Usa escalaX em vez de width: a animação escreve só na compositor, sem
   reflow por frame. */
.card { position: relative; overflow: hidden; }
.progress {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: var(--kind);
  transform-origin: var(--toast-progress-origin, left center);
  transform: scaleX(1);
  border-radius: 0 0 var(--fx-radius-md, 8px) var(--fx-radius-md, 8px);
  pointer-events: none;
  will-change: transform;
}
.progress.run { animation: fx-toast-drain var(--toast-duration, 4000ms) linear forwards; }
/* No modo hover a animação fica parada até o cursor/foco entrar no card. */
.card:hover .progress.run,
.card:focus-within .progress.run { animation-play-state: running; }
@keyframes fx-toast-drain {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
/* A barra só começa a correr no 2º frame: no 1º ela já apareceria zerada
   (o elemento acabou de ser inserido e a animação aplica o estado final). */
.card.entering .progress { animation: none; }
/* Ao dispensar, congela a barra: ela some junto com o card em .2s. */
.card.leaving .progress { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .progress.run { animation-duration: 0.01ms; }
}
`;

export class FxToast extends HTMLElement {
  static get observedAttributes() {
    return ['kind', 'title', 'message', 'duration', 'icon', 'mode', 'progress', 'progress-origin'];
  }

  /**
   * Exibe a barra de contagem regressiva na base do card.
   *
   * A barra esvazia da esquerda para a direita durante exatamente `duration`
   * e usa a cor do `kind`. Com `duration="0"` (toast fixo) a barra é
   * omitida — não há tempo restante a representar.
   *
   * - `'always'` (ou atributo vazio): barra sempre correndo.
   * - `'hover'`: a barra só corre enquanto o cursor estiver sobre o toast;
   *   ao sair, a animação pausa, então dá tempo de ler a mensagem.
   * - `'paused'`: barra visível, porém parada.
   */
  get progress(): 'always' | 'hover' | 'paused' | undefined {
    if (!this.hasAttribute('progress')) return undefined;
    const v = this.getAttribute('progress');
    return v === 'hover' || v === 'paused' ? v : 'always';
  }
  set progress(value: 'always' | 'hover' | 'paused' | undefined) {
    if (value) this.setAttribute('progress', value);
    else this.removeAttribute('progress');
  }

  /**
   * Lado a partir do qual a barra esvazia.
   *
   * - `'left'` (padrão): a barra fica ancorada à esquerda e drena da direita
   *   para a esquerda.
   * - `'right'`: a barra fica ancorada à direita e drena da esquerda para a
   *   direita (espelhado).
   *
   * Só tem efeito junto com `progress`; qualquer valor fora da lista cai em
   * `'left'`.
   */
  get progressOrigin(): 'left' | 'right' {
    return this.getAttribute('progress-origin') === 'right' ? 'right' : 'left';
  }
  set progressOrigin(value: 'left' | 'right') {
    this.setAttribute('progress-origin', value);
  }

  /** Duração efetiva em ms (0 = fixo). Mesma regra usada no timer. */
  private get safeDuration(): number {
    const dur = Number(this.getAttribute('duration') ?? '4000');
    if (dur === 0) return 0;
    return Math.max(Number.isNaN(dur) ? 4000 : dur, 1000);
  }

  /** Esquema de cores forçado do card: 'light' | 'dark' | undefined (segue o tema). */
  get mode(): 'light' | 'dark' | undefined {
    const m = this.getAttribute('mode');
    return m === 'light' || m === 'dark' ? m : undefined;
  }
  set mode(value: 'light' | 'dark' | undefined) {
    if (value) this.setAttribute('mode', value);
    else this.removeAttribute('mode');
  }

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot!.firstChild) this.#render();
    // Durações mínimas: valores muito baixos (ex.: digitação parcial no
    // playground) são elevados para 1s; 0 permanece fixo até fechar.
    const safe = this.safeDuration;
    if (safe > 0 && !this.timer) {
      this.timer = setTimeout(() => this.dismiss(), safe);
    }
    this.#syncProgress();
  }

  disconnectedCallback() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  attributeChangedCallback(name: string) {
    // A duração é lida em dois lugares (timer + barra): se mudar com o toast
    // na tela, ambos precisam se realinhar.
    if (name === 'duration' || name === 'progress' || name === 'progress-origin' || name === 'kind') {
      this.#syncProgress();
    }
  }

  /**
   * Aplica (ou remove) a barra de contagem regressiva.
   *
   * A barra só existe com `progress` e `duration > 0`. O tempo da animação
   * vem de `--toast-duration`, sempre igual ao do `setTimeout` que fecha o
   * toast — assim a barra e o desaparecimento nunca desalinham.
   */
  #syncProgress(): void {
    const card = this.shadowRoot?.querySelector<HTMLElement>('.card');
    if (!card) return;
    const bar = this.shadowRoot!.querySelector<HTMLElement>('.progress');
    const mode = this.progress;
    const dur = this.safeDuration;
    const shouldShow = !!mode && dur > 0;

    if (!shouldShow) {
      bar?.remove();
      card.classList.remove('entering');
      return;
    }
    if (!bar) {
      this.shadowRoot!.querySelector('.card')!.insertAdjacentHTML('beforeend', '<span class="progress" part="progress" aria-hidden="true"></span>');
    }
    const el = this.shadowRoot!.querySelector<HTMLElement>('.progress')!;
    el.style.setProperty('--toast-duration', `${dur}ms`);
    // `left` (padrão) => origem à esquerda; `right` espelha a drenagem.
    el.style.setProperty('--toast-progress-origin', `${this.progressOrigin} center`);
    el.classList.remove('run');
    // `paused` mantém a barra cheia e imóvel; `always` e `hover` deixam a
    // animação correr (no `hover`, o CSS só a dispara sob :hover do host).
    if (mode !== 'paused') el.classList.add('run');
    // 1 frame sem animação para o browser registrar o estado inicial cheio
    // antes de a barra começar a esvaziar.
    card.classList.add('entering');
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('entering')));
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
    const iconName = this.getAttribute('icon');
    const isFxIcon = !!iconName && /^[a-z][a-z0-9_]*$/.test(iconName);
    if (isFxIcon) void import('../../icons');
    const iconContent = isFxIcon ? iconName : KIND_ICON[kind] ?? KIND_ICON.info;
    this.shadowRoot!.innerHTML = `
      <style>${CARD_CSS}</style>
      <div class="card" style="--kind:${color}" role="status" part="card">
        <span class="icon${isFxIcon ? ' fx-icon' : ''}">${iconContent}</span>
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
    // Os cards reabilitam pointer-events via `:host { pointer-events: auto }` (herança),
    // sem necessidade de MutationObserver.
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
  /**
   * Barra de contagem regressiva na base do card, na cor do `kind`.
   * `'always'` (padrão) corre sempre; `'hover'` só enquanto o cursor estiver
   * sobre o toast; `'paused'` exibe a barra cheia, porém imóvel.
   * Sem efeito com `duration: 0` (não há tempo restante a representar).
   */
  progress?: 'always' | 'hover' | 'paused';
  /**
   * Lado a partir do qual a barra esvazia. `'left'` (padrão) deixa a barra
   * ancorada à esquerda; `'right'` a ancora à direita (espelhado).
   * Só tem efeito junto com `progress`.
   */
  progressOrigin?: 'left' | 'right';
  /** Força o esquema de cores do card, independentemente do tema global. */
  mode?: 'light' | 'dark';
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
    if (o.mode) el.setAttribute('mode', o.mode);
    if (o.progress) el.setAttribute('progress', o.progress);
    if (o.progressOrigin) el.setAttribute('progress-origin', o.progressOrigin);
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

