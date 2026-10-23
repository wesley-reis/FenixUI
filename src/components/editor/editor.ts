import { FxFormElement } from '../../core/form-element';
import { defineElement } from '../../core/define';
import { isDomAvailable } from '../../core/dom';
import { esc } from '../../core/sanitize';
import { FENIX_ICON_BASE_CSS, fenixIconHtml } from '../../icons/base-css';
import { loadFenixIconsFont } from '../../icons/font';
import { sanitizeBody, sanitizeEmbedUrl, sanitizeLinkUrl, sanitizeMediaUrl } from './sanitize-html';
import { normalizeElement } from './normalize-html';
import { EDITOR_STYLES } from './styles';
import {
  closestInEditor,
  getBlock,
  getRange,
  placeCaretAtEnd,
  restoreRange,
  saveRange,
} from './selection';
import {
  align,
  applyLink,
  escapeAttr,
  escapeText,
  formatBlock,
  indent,
  insertHtml,
  nativeExec,
  removeFormat,
  toggleInline,
  toggleList,
  unlink,
} from './commands';
import { mergeSelectedCells, splitCell as splitTableCell } from './table-utils';

export type FxEditorToolbar = 'minimal' | 'basic' | 'standard' | 'full' | 'none';
export type FxEditorPasteMode = 'clean' | 'plain';

export interface FxEditorChangeDetail {
  value: string;
  html: string;
  text: string;
}

export type FxEditorUploadResult = string | { url: string; alt?: string; width?: string };

interface DialogField {
  name: string;
  label: string;
  type?: 'text' | 'url' | 'number' | 'select';
  value?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

interface DialogResult {
  [key: string]: string;
}

const MAX_PASTE_BYTES = 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const LARGE_DOC_CHARS = 20_000;
const EMIT_DEBOUNCE_MS = 140;
const HISTORY_LIMIT = 50;

const QUICK_SVG = {
  left: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg>',
  center: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg>',
  right: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg>',
  delete: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg>',
} as const;

/**
 * <fx-editor> — editor de texto rico nativo.
 *
 * Form-associated: com `name` entra no FormData com o HTML sanitizado.
 * O atributo `value` é o conteúdo inicial (como o texto de um <textarea>);
 * a propriedade `value` é o conteúdo atual.
 */
export class FxEditor extends FxFormElement {
  static override styles = `${FENIX_ICON_BASE_CSS}\n${EDITOR_STYLES}`;

  static override get observedAttributes(): string[] {
    return [
      'toolbar', 'features', 'placeholder', 'readonly', 'disabled', 'required',
      'full', 'error', 'invalid', 'success', 'valid', 'show-count',
      'paste-mode', 'min-height', 'max-height', 'fullscreen', 'maxlength',
    ];
  }

  /** Callback opcional de upload de imagem. */
  uploadImage?: (file: File) => Promise<FxEditorUploadResult>;
  /** Hook opcional de sanitização extra (roda depois do sanitizador interno). */
  sanitizeHtml?: (html: string) => string;

  #built = false;
  #eventsBound = false;
  #initialized = false;
  #defaultValue = '';
  #value = '';
  #dirty = false;
  #sourceMode = false;
  #lastRange: Range | null = null;
  #rafId = 0;
  #emitTimer: ReturnType<typeof setTimeout> | null = null;
  #lastLimitError = 0;
  #snapshotTimer: ReturnType<typeof setTimeout> | null = null;
  #history: string[] = [];
  #historyIndex = -1;
  #imagePicker: HTMLInputElement | null = null;
  #mediaFigure: HTMLElement | null = null;
  #linkAnchor: HTMLAnchorElement | null = null;
  #resizeDispose: (() => void) | null = null;
  #dialogReturnFocus: HTMLElement | null = null;
  #dialogResolve: ((result: DialogResult | null) => void) | null = null;
  #disposers: Array<() => void> = [];
  #selectionRaf = 0;
  #bodyOverflow = '';

  get editor(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>('.content');
  }

  get source(): HTMLTextAreaElement | null {
    return this.root.querySelector<HTMLTextAreaElement>('.source');
  }

  get toolbarEl(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>('.toolbar');
  }

  get value(): string {
    if (this.#sourceMode && this.source) return this.#serialize();
    if (this.#dirty) this.#value = this.#serialize();
    return this.#value;
  }

  set value(next: string) {
    const clean = this.#cleanHtml(next ?? '');
    this.#value = clean;
    this.#dirty = false;
    if (!this.#defaultValue) this.#defaultValue = clean;
    this.#applyValue(clean);
    this.updateFormValue();
  }

  get html(): string { return this.value; }
  set html(next: string) { this.value = next; }

  get text(): string {
    return (this.editor?.textContent ?? '').replace(/\u200b/g, '').trim();
  }

  get defaultValue(): string { return this.#defaultValue; }
  set defaultValue(next: string) {
    this.#defaultValue = this.#cleanHtml(next ?? '');
    if (!this.#dirty) this.value = this.#defaultValue;
  }

  get disabled(): boolean { return this.hasAttr('disabled'); }
  set disabled(value: boolean) { this.toggleAttr('disabled', Boolean(value)); }

  get readonly(): boolean { return this.hasAttr('readonly'); }
  set readonly(value: boolean) { this.toggleAttr('readonly', Boolean(value)); }

  get required(): boolean { return this.hasAttr('required'); }
  set required(value: boolean) { this.toggleAttr('required', Boolean(value)); }

  get placeholder(): string { return this.getAttr('placeholder'); }
  set placeholder(value: string) { this.setAttribute('placeholder', value); }

  get toolbar(): FxEditorToolbar {
    const value = this.getAttr('toolbar', 'standard') as FxEditorToolbar;
    return ['minimal', 'basic', 'standard', 'full', 'none'].includes(value) ? value : 'standard';
  }
  set toolbar(value: FxEditorToolbar) { this.setAttribute('toolbar', value); }

  get pasteMode(): FxEditorPasteMode {
    return this.getAttr('paste-mode', 'clean') === 'plain' ? 'plain' : 'clean';
  }
  set pasteMode(value: FxEditorPasteMode) { this.setAttribute('paste-mode', value); }

  get fullscreen(): boolean { return this.hasAttr('fullscreen'); }
  set fullscreen(value: boolean) { this.toggleAttr('fullscreen', Boolean(value)); }

  /** Limite de caracteres de texto (0 desativa). Padrão: 30.000. */
  get maxlength(): number {
    const value = Number.parseInt(this.getAttr('maxlength', '30000'), 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  set maxlength(value: number) {
    if (Number.isFinite(value) && value >= 0) this.setAttribute('maxlength', String(Math.floor(value)));
    else this.removeAttribute('maxlength');
  }

  protected override connectedCallback(): void {
    loadFenixIconsFont();
    super.connectedCallback();
    if (this.fullscreen) this.#syncBodyOverflow();

    if (!this.#initialized) {
      this.#initialized = true;
      const initial = this.#value || this.getAttr('value') || this.innerHTML;
      this.replaceChildren();
      this.#defaultValue = this.#cleanHtml(initial);
      this.#value = this.#defaultValue;
      this.#applyValue(this.#defaultValue);
      this.updateFormValue();
      this.#pushHistory(this.#value);
      this.dispatchEvent(new CustomEvent('ready', { bubbles: true, composed: true }));
    } else if (this.#built && !this.#eventsBound) {
      this.#bindEvents();
      this.#eventsBound = true;
    }

    this.#bindGlobalSelection();
  }

  protected override disconnectedCallback(): void {
    for (const dispose of this.#disposers) dispose();
    this.#disposers = [];
    this.#eventsBound = false;
    cancelAnimationFrame(this.#rafId);
    cancelAnimationFrame(this.#selectionRaf);
    if (this.#emitTimer) clearTimeout(this.#emitTimer);
    if (this.#snapshotTimer) clearTimeout(this.#snapshotTimer);
    this.#endResize();
    this.#hideMediaOverlay();
    this.#hideLinkOverlay();
    if (this.hasAttr('fullscreen')) document.body.style.overflow = this.#bodyOverflow;
    this.#releaseDialog(null);
    super.disconnectedCallback();
  }

  protected override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.#built) return;
    if (name === 'toolbar' || name === 'features') this.#renderToolbar();
    if (name === 'fullscreen') this.#syncBodyOverflow();
    this.#syncChrome();
  }

  override formResetCallback(): void {
    this.#dirty = false;
    this.value = this.#defaultValue;
  }

  protected override getFormValue(): string | FormData | null {
    return this.hasAttr('disabled') ? null : this.value;
  }

  protected override render(): void {
    if (this.#built) return;

    this.setTemplate(`
      <div class="editor" part="editor">
        <div class="toolbar" part="toolbar" role="toolbar" aria-label="Formatação" aria-orientation="horizontal"></div>
        <div class="body">
          <div class="content" part="content" contenteditable="true" role="textbox"
               aria-multiline="true" spellcheck="true"></div>
          <textarea class="source" part="source" spellcheck="false" hidden aria-label="HTML do conteúdo"></textarea>
          <div class="media-overlay" part="media-overlay" hidden>
            <span class="media-handle nw" data-handle="nw"></span>
            <span class="media-handle ne" data-handle="ne"></span>
            <span class="media-handle sw" data-handle="sw"></span>
            <span class="media-handle se" data-handle="se"></span>
            <span class="media-size"></span>
            <button type="button" class="media-delete" data-media-action="delete" aria-label="Excluir mídia" title="Excluir mídia">${fenixIconHtml('delete')}</button>
          </div>
          <div class="link-overlay" part="link-overlay" hidden>
            <button type="button" data-link-action="open">Abrir</button>
            <button type="button" data-link-action="edit">Editar</button>
            <button type="button" data-link-action="remove">Remover</button>
          </div>
        </div>
        <div class="statusbar" part="statusbar">
          <span class="count"></span>
          <span class="source-actions" hidden>
            <button type="button" class="btn source-apply">Aplicar</button>
            <button type="button" class="btn source-cancel">Cancelar</button>
          </span>
          <slot name="footer"></slot>
        </div>
        <input type="file" class="image-picker" accept="image/*" hidden>
        <div class="backdrop" part="dialog" hidden>
          <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="fx-editor-dialog-title">
            <header>
              <h3 id="fx-editor-dialog-title"></h3>
              <button type="button" class="dialog-close" aria-label="Fechar">×</button>
            </header>
            <div class="dialog-body"></div>
            <footer>
              <button type="button" class="btn dialog-cancel">Cancelar</button>
              <button type="button" class="btn dialog-ok">Aplicar</button>
            </footer>
          </div>
        </div>
      </div>
    `);

    this.#built = true;
    this.#imagePicker = this.root.querySelector<HTMLInputElement>('.image-picker');
    this.#bindEvents();
    this.#eventsBound = true;
    this.#renderToolbar();
    this.#syncChrome();
  }

  #on(
    target: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options?: AddEventListenerOptions,
  ): void {
    target.addEventListener(type, handler, options);
    this.#disposers.push(() => target.removeEventListener(type, handler, options));
  }

  #bindEvents(): void {
    const editor = this.editor;
    const toolbar = this.toolbarEl;
    if (!editor || !toolbar) return;

    this.#on(toolbar, 'mousedown', (event) => {
      const target = event.target as HTMLElement;
      this.#lastRange = saveRange(editor) ?? this.#lastRange;
      this.#hideLinkOverlay();
      if (target.closest('button')) event.preventDefault();
    });

    this.#on(toolbar, 'click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-cmd],[data-action]');
      if (!target || (target as HTMLButtonElement).disabled) return;
      const cmd = target.dataset.cmd;
      const action = target.dataset.action;
      if (cmd) this.#execCommand(cmd);
      else if (action) this.#action(action);
    });

    this.#on(toolbar, 'change', (event) => {
      const select = (event.target as HTMLElement).closest<HTMLSelectElement>('[data-block]');
      if (!select) return;
      this.#restoreSelection();
      formatBlock(editor, select.value || 'p');
      this.#afterCommand();
    });

    this.#on(toolbar, 'input', (event) => {
      const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-color]');
      if (!input) return;
      this.#restoreSelection();
      nativeExec('styleWithCSS', 'true');
      nativeExec(input.dataset.color ?? 'foreColor', input.value);
      this.#afterCommand();
    });

    this.#on(toolbar, 'keydown', (event) => this.#handleToolbarKeydown(event as KeyboardEvent));
    this.#on(toolbar, 'focusin', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('.tb-btn');
      if (button) this.#moveToolbarTabStop(button);
    });

    this.#on(editor, 'input', (event) => {
      event.stopPropagation();
      this.#hideLinkOverlay();
      this.#dirty = true;
      this.#updateEmpty();
      this.#scheduleEmit();
      this.#scheduleSnapshot();
    });

    this.#on(editor, 'focus', () => {
      this.dispatchEvent(new CustomEvent('focus', { bubbles: true, composed: true }));
    });

    this.#on(editor, 'blur', () => {
      this.#lastRange = saveRange(editor) ?? this.#lastRange;
      this.#emitNow();
      this.#emitChange();
      this.dispatchEvent(new CustomEvent('blur', { bubbles: true, composed: true }));
    });

    this.#on(editor, 'keydown', (event) => this.#handleKeydown(event as KeyboardEvent));
    this.#on(editor, 'beforeinput', (event) => this.#handleBeforeInput(event as InputEvent));
    this.#on(editor, 'paste', (event) => this.#handlePaste(event as ClipboardEvent));
    this.#on(editor, 'dragover', (event) => event.preventDefault());
    this.#on(editor, 'drop', (event) => this.#handleDrop(event as DragEvent));
    this.#on(editor, 'dblclick', (event) => this.#handleDoubleClick(event as MouseEvent));
    this.#on(editor, 'click', (event) => this.#handleEditorClick(event as MouseEvent));
    this.#on(editor, 'scroll', () => { this.#positionMediaOverlay(); this.#positionLinkOverlay(); }, { passive: true });
    this.#on(window, 'resize', () => { this.#positionMediaOverlay(); this.#positionLinkOverlay(); });

    const overlay = this.root.querySelector<HTMLElement>('.media-overlay');
    if (overlay) {
      this.#on(overlay, 'pointerdown', (event) => this.#startResize(event as PointerEvent));
      this.#on(overlay, 'click', (event) => {
        const action = (event.target as HTMLElement).closest<HTMLElement>('[data-media-action]');
        if (action?.dataset.mediaAction === 'delete') this.#deleteMediaFigure();
      });
    }

    const linkOverlay = this.root.querySelector<HTMLElement>('.link-overlay');
    if (linkOverlay) {
      this.#on(linkOverlay, 'click', (event) => this.#handleLinkOverlayClick(event as MouseEvent));
    }

    if (this.source) {
      this.#on(this.source, 'input', () => {
        this.#dirty = true;
        this.#scheduleEmit();
      });
    }

    if (this.#imagePicker) {
      this.#on(this.#imagePicker, 'change', () => {
        const file = this.#imagePicker?.files?.[0];
        if (file) void this.#handleImageFile(file);
        if (this.#imagePicker) this.#imagePicker.value = '';
      });
    }

    const backdrop = this.root.querySelector<HTMLElement>('.backdrop');
    if (backdrop) {
      this.#on(backdrop, 'click', (event) => {
        if (event.target === backdrop) this.#releaseDialog(null);
      });
      this.#on(backdrop, 'keydown', (event) => this.#trapDialogFocus(event as KeyboardEvent));
    }

    const dialogBody = this.root.querySelector<HTMLElement>('.dialog-body');
    if (dialogBody) {
      this.#on(dialogBody, 'keydown', (event) => {
        const target = event.target as HTMLElement;
        if ((event as KeyboardEvent).key === 'Enter' && target.tagName !== 'BUTTON') {
          event.preventDefault();
          this.#submitDialog();
        }
      });
    }

    for (const selector of ['.dialog-close', '.dialog-cancel']) {
      const btn = this.root.querySelector<HTMLButtonElement>(selector);
      if (btn) this.#on(btn, 'click', () => this.#releaseDialog(null));
    }

    const ok = this.root.querySelector<HTMLButtonElement>('.dialog-ok');
    if (ok) this.#on(ok, 'click', () => this.#submitDialog());

    const applySource = this.root.querySelector<HTMLButtonElement>('.source-apply');
    if (applySource) this.#on(applySource, 'click', () => this.#applySource());

    const cancelSource = this.root.querySelector<HTMLButtonElement>('.source-cancel');
    if (cancelSource) this.#on(cancelSource, 'click', () => this.#cancelSource());
  }

  #syncChrome(): void {
    const editor = this.editor;
    if (!editor) return;

    const locked = this.disabled || this.readonly;
    editor.setAttribute('contenteditable', locked ? 'false' : 'true');
    editor.setAttribute('aria-readonly', String(this.readonly));
    editor.setAttribute('aria-disabled', String(this.disabled));

    if (this.placeholder) editor.setAttribute('data-placeholder', this.placeholder);
    else editor.removeAttribute('data-placeholder');

    const toolbar = this.toolbarEl;
    toolbar?.toggleAttribute('hidden', this.toolbar === 'none' || this.readonly);

    for (const control of Array.from(this.root.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>(
      '.tb-btn, .tb-select, .tb-color input',
    ))) {
      const isSourceToggle = control.closest('[data-action="source"]') !== null;
      const isFullscreenToggle = control.closest('[data-action="fullscreen"]') !== null;
      control.disabled = this.readonly || this.disabled || (this.#sourceMode && !isSourceToggle && !isFullscreenToggle);
    }

    this.#applyCssVars();
    this.#updateEmpty();
    this.#updateCount();
    this.#validate();
    this.#updateSourceUi();
    const fullscreenButton = this.root.querySelector<HTMLElement>('[data-action="fullscreen"]');
    fullscreenButton?.classList.toggle('active', this.fullscreen);
    fullscreenButton?.setAttribute('aria-pressed', String(this.fullscreen));
    if (locked || this.#sourceMode) this.#hideMediaOverlay();
  }

  #applyCssVars(): void {
    const min = this.getAttr('min-height');
    const max = this.getAttr('max-height');
    if (min) this.style.setProperty('--fx-editor-min-height', min);
    else this.style.removeProperty('--fx-editor-min-height');
    if (max) this.style.setProperty('--fx-editor-max-height', max);
    else this.style.removeProperty('--fx-editor-max-height');
  }

  #updateEmpty(): void {
    const editor = this.editor;
    if (!editor) return;
    const empty = !editor.textContent?.trim() && !editor.querySelector('img,video,iframe,table,hr');
    editor.classList.toggle('is-empty', empty);
  }

  #updateCount(): void {
    const count = this.root.querySelector<HTMLElement>('.count');
    if (!count) return;
    const statusbar = this.root.querySelector<HTMLElement>('.statusbar');
    const hasFooter = this.querySelector('[slot="footer"]') !== null;
    if (statusbar) statusbar.hidden = !this.#sourceMode && !this.hasAttr('show-count') && !hasFooter;
    if (!this.hasAttr('show-count')) {
      count.textContent = '';
      return;
    }
    const text = this.text;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    count.textContent = `${words} palavra${words === 1 ? '' : 's'} · ${text.length} caractere${text.length === 1 ? '' : 's'}`;
  }

  #fits(extra: number): boolean {
    const max = this.maxlength;
    if (!max) return true;
    const editor = this.editor;
    const range = editor ? getRange(editor, this.#lastRange) : null;
    const selected = range && !range.collapsed ? range.toString().length : 0;
    return this.text.length - selected + extra <= max;
  }

  #limitError(): void {
    const now = Date.now();
    if (now - this.#lastLimitError < 1200) return;
    this.#lastLimitError = now;
    this.#error(`Limite de ${this.maxlength.toLocaleString('pt-BR')} caracteres atingido.`);
  }

  #validate(): void {
    if (!this.internals || typeof this.internals.setValidity !== 'function') return;
    try {
      if (this.required && !this.text) {
        this.internals.setValidity(
          { valueMissing: true },
          'Preencha este campo.',
          this.editor ?? undefined,
        );
      } else {
        this.internals.setValidity({});
      }
    } catch {
      /* ambientes sem validação nativa (jsdom) */
    }
  }

  /** Sanitiza + normaliza em uma única parseada do HTML. */
  #cleanHtml(html: string, forEditor = false): string {
    const body = sanitizeBody(html);
    if (!body) return forEditor ? '<p><br></p>' : '';
    return normalizeElement(body, { forEditor });
  }

  #serialize(): string {
    if (this.#sourceMode && this.source) {
      return this.#cleanHtml(this.source.value);
    }
    const editor = this.editor;
    if (!editor) return '';
    if (!editor.textContent?.trim() && !editor.querySelector('img,video,iframe,table,hr')) return '';
    let clean = this.#cleanHtml(editor.innerHTML);
    if (this.sanitizeHtml) {
      clean = this.#cleanHtml(this.sanitizeHtml(clean));
    }
    return clean;
  }

  #applyValue(html: string): void {
    const editor = this.editor;
    if (!editor) return;
    this.#hideMediaOverlay();
    const normalized = this.#cleanHtml(html, true);
    if (editor.innerHTML !== normalized) editor.innerHTML = normalized;
    this.#hideLinkOverlay();
    this.#hideMediaOverlay();
    this.#decorateMediaFigures();
    this.#updateEmpty();
    this.#updateCount();
  }

  #scheduleEmit(): void {
    cancelAnimationFrame(this.#rafId);
    if (this.#emitTimer) {
      clearTimeout(this.#emitTimer);
      this.#emitTimer = null;
    }
    const size = this.editor?.textContent?.length ?? 0;
    if (size < LARGE_DOC_CHARS) {
      this.#rafId = requestAnimationFrame(() => this.#emitNow());
      return;
    }
    // Documentos grandes: evita serializar a cada frame enquanto o usuário digita.
    this.#emitTimer = setTimeout(() => {
      this.#emitTimer = null;
      this.#emitNow();
    }, EMIT_DEBOUNCE_MS);
  }

  #emitNow(): void {
    // Diferido por rAF/debounce: pode disparar depois do teardown do ambiente
    // (testes), quando `CustomEvent` já não existe.
    if (!isDomAvailable()) return;
    cancelAnimationFrame(this.#rafId);
    if (this.#emitTimer) {
      clearTimeout(this.#emitTimer);
      this.#emitTimer = null;
    }
    const value = this.#serialize();
    this.#value = value;
    this.#dirty = false;
    const detail: FxEditorChangeDetail = { value, html: value, text: this.text };
    for (const type of ['input', 'valueChange']) {
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
    }
    this.#updateCount();
    this.#validate();
  }

  #emitChange(): void {
    const value = this.value;
    const detail: FxEditorChangeDetail = { value, html: value, text: this.text };
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail }));
  }

  #pushHistory(html: string): void {
    if (this.#history[this.#historyIndex] === html) return;
    this.#history = this.#history.slice(0, this.#historyIndex + 1);
    this.#history.push(html);
    if (this.#history.length > HISTORY_LIMIT) this.#history.shift();
    this.#historyIndex = this.#history.length - 1;
  }

  #scheduleSnapshot(): void {
    if (this.#snapshotTimer) clearTimeout(this.#snapshotTimer);
    this.#snapshotTimer = setTimeout(() => {
      this.#pushHistory(this.#dirty ? this.#serialize() : this.#value);
    }, 600);
  }

  #historyUndo(): void {
    if (this.#historyIndex <= 0) return;
    this.#historyIndex--;
    this.#applyValue(this.#history[this.#historyIndex]);
    if (this.editor) placeCaretAtEnd(this.editor);
    this.#afterCommand();
  }

  #historyRedo(): void {
    if (this.#historyIndex >= this.#history.length - 1) return;
    this.#historyIndex++;
    this.#applyValue(this.#history[this.#historyIndex]);
    if (this.editor) placeCaretAtEnd(this.editor);
    this.#afterCommand();
  }

  #bindGlobalSelection(): void {
    const handler = (): void => {
      const editor = this.editor;
      if (!editor) return;
      const range = getRange(editor, this.#lastRange);
      if (!range) return;
      this.#lastRange = range.cloneRange();
      cancelAnimationFrame(this.#selectionRaf);
      this.#selectionRaf = requestAnimationFrame(() => this.#updateToolbar());
    };
    document.addEventListener('selectionchange', handler);
    this.#disposers.push(() => document.removeEventListener('selectionchange', handler));
  }

  #restoreSelection(): void {
    const editor = this.editor;
    if (!editor) return;
    if (this.#lastRange) restoreRange(editor, this.#lastRange);
    else editor.focus({ preventScroll: true });
  }

  #syncBodyOverflow(): void {
    if (this.fullscreen) {
      this.#bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = this.#bodyOverflow;
    }
  }

  #updateSourceUi(): void {
    const source = this.source;
    const content = this.editor;
    const actions = this.root.querySelector<HTMLElement>('.source-actions');
    if (actions) actions.toggleAttribute('hidden', !this.#sourceMode);
    if (source) source.hidden = !this.#sourceMode;
    if (content) content.hidden = this.#sourceMode;
    const toggle = this.root.querySelector<HTMLElement>('[data-action="source"]');
    toggle?.classList.toggle('active', this.#sourceMode);
    toggle?.setAttribute('aria-pressed', String(this.#sourceMode));
  }

  #releaseDialog(result: DialogResult | null): void {
    const backdrop = this.root.querySelector<HTMLElement>('.backdrop');
    backdrop?.setAttribute('hidden', '');
    const resolve = this.#dialogResolve;
    this.#dialogResolve = null;
    const returnFocus = this.#dialogReturnFocus;
    this.#dialogReturnFocus = null;
    resolve?.(result);
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    else this.#restoreSelection();
  }

  #renderToolbar(): void {
    const toolbar = this.toolbarEl;
    if (!toolbar) return;

    const preset = this.toolbar;
    if (preset === 'none') {
      toolbar.innerHTML = '';
      toolbar.hidden = true;
      return;
    }
    toolbar.hidden = false;

    const features = new Set(
      this.getAttr('features').split(',').map((item) => item.trim()).filter(Boolean),
    );
    const has = (feature: string): boolean => features.size === 0 || features.has(feature);

    const button = (cmd: string, icon: string, label: string, action = ''): string =>
      `<button type="button" class="tb-btn" tabindex="-1" ${action ? `data-action="${action}"` : `data-cmd="${cmd}"`} title="${label}" aria-label="${label}" aria-pressed="false">${fenixIconHtml(icon)}</button>`;

    const select = `<select class="tb-select" data-block aria-label="Formato do bloco">
      <option value="p">Parágrafo</option>
      <option value="h1">Título 1</option>
      <option value="h2">Título 2</option>
      <option value="h3">Título 3</option>
      <option value="h4">Título 4</option>
      <option value="blockquote">Citação</option>
      <option value="pre">Código</option>
    </select>`;

    const history = button('undo', 'undo', 'Desfazer') + button('redo', 'redo', 'Refazer');
    const inline = [
      button('bold', 'format_bold', 'Negrito'),
      button('italic', 'format_italic', 'Itálico'),
      button('underline', 'format_underlined', 'Sublinhado'),
      button('strikeThrough', 'format_strikethrough', 'Riscado'),
      button('code', 'code', 'Código inline'),
      button('removeFormat', 'format_clear', 'Limpar formatação'),
    ].join('');
    const color = [
      `<label class="tb-color" title="Cor do texto"><input type="color" autocomplete="off" data-color="foreColor" value="#111827" aria-label="Cor do texto"></label>`,
      `<label class="tb-color" title="Realçar texto"><input type="color" autocomplete="off" data-color="hiliteColor" value="#fef08a" aria-label="Realçar texto"></label>`,
    ].join('');
    const alignGroup = [
      button('justifyLeft', 'format_align_left', 'Alinhar à esquerda'),
      button('justifyCenter', 'format_align_center', 'Centralizar'),
      button('justifyRight', 'format_align_right', 'Alinhar à direita'),
      button('justifyFull', 'format_align_justify', 'Justificar'),
    ].join('');
    const indentation = [
      button('outdent', 'format_indent_decrease', 'Diminuir recuo', 'outdent'),
      button('indent', 'format_indent_increase', 'Aumentar recuo', 'indent'),
    ].join('');
    const lists = [
      button('insertUnorderedList', 'format_list_bulleted', 'Lista com marcadores'),
      button('insertOrderedList', 'format_list_numbered', 'Lista numerada'),
    ].join('');
    const blocks = button('', 'format_quote', 'Citação', 'blockquote') + button('', 'code_blocks', 'Bloco de código', 'codeblock');

    const insert: string[] = [];
    if (has('link')) {
      insert.push(button('', 'link', 'Link (Ctrl+K)', 'link'));
      insert.push(button('', 'link_off', 'Remover link', 'unlink'));
    }
    if (preset !== 'minimal') {
      if (has('image')) insert.push(button('', 'image', 'Imagem', 'image'));
      if (has('video')) insert.push(button('', 'videocam', 'Vídeo', 'video'));
      if (has('table')) insert.push(button('', 'table', 'Tabela', 'table'));
      if (has('columns')) insert.push(button('', 'view_column', 'Colunas', 'columns'));
      insert.push(button('insertHorizontalRule', 'horizontal_rule', 'Linha horizontal'));
    }

    const tools: string[] = [];
    if (preset === 'standard' || preset === 'full') {
      if (has('source')) tools.push(button('', 'code', 'Ver HTML', 'source'));
      if (has('fullscreen')) tools.push(button('', 'fullscreen', 'Tela cheia', 'fullscreen'));
    }

    const groups: string[] = [history, select + inline];
    if (preset !== 'minimal') groups.push(lists);
    if (preset !== 'minimal' && preset !== 'basic') {
      groups.push(color, alignGroup, indentation, blocks);
    }
    if (insert.length) groups.push(insert.join(''));
    if (tools.length) groups.push(tools.join(''));

    toolbar.innerHTML =
      groups.map((group) => `<div class="tb-group">${group}</div>`).join('') +
      `<div class="panel" data-panel hidden></div>`;
    toolbar.querySelector<HTMLElement>('.tb-btn')?.setAttribute('tabindex', '0');
  }

  #updateToolbar(): void {
    const editor = this.editor;
    if (!editor) return;
    const range = getRange(editor, this.#lastRange);
    if (!range) return;

    const setActive = (cmd: string, active: boolean): void => {
      const button = this.root.querySelector<HTMLButtonElement>(`[data-cmd="${cmd}"]`);
      if (!button) return;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    };

    const ancestor = (selector: string): boolean => {
      const node = range.startContainer;
      const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
      const match = el?.closest(selector);
      return Boolean(match && editor.contains(match));
    };

    setActive('bold', ancestor('strong,b'));
    setActive('italic', ancestor('em,i'));
    setActive('underline', ancestor('u'));
    setActive('strikeThrough', ancestor('s,del,strike'));
    setActive('code', ancestor('code'));
    setActive('insertUnorderedList', ancestor('ul'));
    setActive('insertOrderedList', ancestor('ol'));

    const block = getBlock(editor, range);
    const blockTag = block?.tagName.toLowerCase() ?? 'p';
    const blockSelect = this.root.querySelector<HTMLSelectElement>('[data-block]');
    if (blockSelect) {
      const value = Array.from(blockSelect.options).some((option) => option.value === blockTag)
        ? blockTag
        : 'p';
      blockSelect.value = value;
    }

    const alignment = block ? (block.style.textAlign || 'left') : 'left';
    setActive('justifyLeft', alignment === 'left' || alignment === 'start' || alignment === '');
    setActive('justifyCenter', alignment === 'center');
    setActive('justifyRight', alignment === 'right' || alignment === 'end');
    setActive('justifyFull', alignment === 'justify');
  }

  #handleToolbarKeydown(event: KeyboardEvent): void {
    const active = this.root.activeElement as HTMLElement | null;
    if (!active || !active.classList.contains('tb-btn')) return;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

    const controls = Array.from(
      this.toolbarEl?.querySelectorAll<HTMLElement>(
        '.tb-btn:not(:disabled), .tb-select:not(:disabled), .tb-color input:not(:disabled)',
      ) ?? [],
    );
    if (!controls.length) return;

    event.preventDefault();
    let index = controls.indexOf(active);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = controls.length - 1;
    else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + controls.length) % controls.length;

    const next = controls[index];
    if (!next) return;
    this.#moveToolbarTabStop(next);
    next.focus();
  }

  #moveToolbarTabStop(active: HTMLElement): void {
    this.toolbarEl?.querySelectorAll<HTMLElement>('.tb-btn').forEach((button) => {
      button.setAttribute('tabindex', button === active ? '0' : '-1');
    });
  }

  #trapDialogFocus(event: KeyboardEvent): void {
    if (!this.#dialogResolve || event.key !== 'Tab') return;
    const dialog = this.root.querySelector<HTMLElement>('.dialog');
    if (!dialog) return;

    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.root.activeElement;

    if (event.shiftKey && (active === first || !active || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !active || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  #execCommand(cmd: string): void {
    const editor = this.editor;
    if (!editor) return;
    this.#restoreSelection();

    switch (cmd) {
      case 'undo':
        if (!nativeExec('undo')) this.#historyUndo();
        break;
      case 'redo':
        if (!nativeExec('redo')) this.#historyRedo();
        break;
      case 'bold':
        toggleInline(editor, 'strong');
        break;
      case 'italic':
        toggleInline(editor, 'em');
        break;
      case 'underline':
        toggleInline(editor, 'u');
        break;
      case 'strikeThrough':
        toggleInline(editor, 's');
        break;
      case 'code':
        toggleInline(editor, 'code');
        break;
      case 'justifyLeft':
        align(editor, 'left');
        break;
      case 'justifyCenter':
        align(editor, 'center');
        break;
      case 'justifyRight':
        align(editor, 'right');
        break;
      case 'justifyFull':
        align(editor, 'justify');
        break;
      case 'insertUnorderedList':
        toggleList(editor, false);
        break;
      case 'insertOrderedList':
        toggleList(editor, true);
        break;
      case 'removeFormat':
        removeFormat(editor);
        break;
      case 'insertHorizontalRule':
        insertHtml(editor, '<hr><p><br></p>');
        break;
      case 'foreColor':
      case 'hiliteColor':
        nativeExec('styleWithCSS', 'true');
        nativeExec(cmd, this.root.querySelector<HTMLInputElement>(`[data-color="${cmd}"]`)?.value);
        break;
      default:
        nativeExec(cmd);
    }

    this.#afterCommand();
  }

  #afterCommand(): void {
    this.#dirty = true;
    this.#hideLinkOverlay();
    this.#decorateMediaFigures();
    this.#updateEmpty();
    this.#scheduleEmit();
    this.#scheduleSnapshot();
    this.#updateToolbar();
  }

  #action(action: string): void {
    const editor = this.editor;
    if (!editor) return;

    switch (action) {
      case 'link':
        void this.#openLinkDialog();
        break;
      case 'image':
        void this.#openImageDialog();
        break;
      case 'video':
        void this.#openVideoDialog();
        break;
      case 'table':
        this.#showTablePanel();
        break;
      case 'columns':
        this.#showColumnsPanel();
        break;
      case 'source':
        this.#toggleSource();
        break;
      case 'fullscreen':
        this.fullscreen = !this.fullscreen;
        break;
      case 'blockquote':
        this.#restoreSelection();
        formatBlock(editor, 'blockquote');
        this.#afterCommand();
        break;
      case 'codeblock':
        this.#restoreSelection();
        formatBlock(editor, 'pre');
        this.#afterCommand();
        break;
      case 'indent':
        this.#restoreSelection();
        indent(editor, 24);
        this.#afterCommand();
        break;
      case 'outdent':
        this.#restoreSelection();
        indent(editor, -24);
        this.#afterCommand();
        break;
      case 'clear':
        this.#restoreSelection();
        removeFormat(editor);
        this.#afterCommand();
        break;
      case 'unlink':
        this.#restoreSelection();
        unlink(editor);
        this.#afterCommand();
        break;
    }
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;

    const active = this.root.activeElement;
    const overlay = this.root.querySelector<HTMLElement>('.media-overlay');
    if (
      this.#mediaFigure &&
      (event.key === 'Delete' || event.key === 'Backspace') &&
      (active === this.#mediaFigure ||
        this.#mediaFigure.contains(active) ||
        Boolean(overlay && active && overlay.contains(active)))
    ) {
      event.preventDefault();
      this.#deleteMediaFigure();
      return;
    }

    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (mod && !event.altKey) {
      if (key === 'b') { event.preventDefault(); this.#execCommand('bold'); return; }
      if (key === 'i') { event.preventDefault(); this.#execCommand('italic'); return; }
      if (key === 'u') { event.preventDefault(); this.#execCommand('underline'); return; }
      if (key === 'k') { event.preventDefault(); void this.#openLinkDialog(); return; }
      if (key === 'z' && !event.shiftKey) { event.preventDefault(); this.#execCommand('undo'); return; }
      if (key === 'y' || (key === 'z' && event.shiftKey)) { event.preventDefault(); this.#execCommand('redo'); return; }
    }

    if (event.key === 'Escape') {
      if (this.#dialogResolve) this.#releaseDialog(null);
      else if (this.#sourceMode) this.#cancelSource();
      else if (this.fullscreen) this.fullscreen = false;
      else if (this.#linkAnchor) this.#hideLinkOverlay();
      else if (this.#mediaFigure) this.#hideMediaOverlay();
      else this.#hidePanel();
      return;
    }

    if (event.key === 'Tab' && this.#tabInTable(event.shiftKey)) {
      event.preventDefault();
    }
  }

  #tabInTable(backwards: boolean): boolean {
    const editor = this.editor;
    if (!editor) return false;
    const range = getRange(editor, this.#lastRange);
    if (!range) return false;
    const cell = closestInEditor<HTMLTableCellElement>(editor, range.startContainer, 'td,th');
    const table = cell?.closest('table');
    if (!cell || !table) return false;

    const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>('td,th'));
    let index = cells.indexOf(cell);
    if (index < 0) return false;

    if (backwards) {
      index = Math.max(0, index - 1);
    } else {
      index++;
      if (index >= cells.length) {
        const row = cell.parentElement as HTMLTableRowElement | null;
        if (!row) return false;
        const clone = row.cloneNode(true) as HTMLTableRowElement;
        for (const cloned of Array.from(clone.querySelectorAll<HTMLTableCellElement>('td,th'))) {
          cloned.innerHTML = '<p><br></p>';
        }
        row.after(clone);
        cells.push(...Array.from(clone.querySelectorAll<HTMLTableCellElement>('td,th')));
        index = cells.indexOf(clone.querySelector<HTMLTableCellElement>('td,th')!);
      }
    }

    const target = cells[index];
    if (!target) return false;
    const next = document.createRange();
    next.selectNodeContents(target);
    next.collapse(true);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(next);
    return true;
  }

  #handleBeforeInput(event: InputEvent): void {
    if (this.disabled || this.readonly || !this.maxlength) return;
    const type = event.inputType;
    if (
      type === 'insertFromPaste' ||
      type === 'insertFromDrop' ||
      type.startsWith('history') ||
      type.startsWith('format')
    ) {
      return;
    }
    const extra = event.data?.length ?? (type === 'insertParagraph' || type === 'insertLineBreak' ? 1 : 0);
    if (!extra) return;
    if (!this.#fits(extra)) {
      event.preventDefault();
      this.#limitError();
    }
  }

  #handlePaste(event: ClipboardEvent): void {
    const clipboard = event.clipboardData;
    if (!clipboard) return;

    const file = Array.from(clipboard.files ?? []).find((item) => item.type.startsWith('image/'));
    if (file) {
      event.preventDefault();
      void this.#handleImageFile(file);
      return;
    }

    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');
    if (html.length > MAX_PASTE_BYTES || text.length > MAX_PASTE_BYTES) return;

    event.preventDefault();
    if (!this.#fits(text.length)) {
      this.#limitError();
      return;
    }
    if (this.pasteMode === 'plain' || !html) {
      this.#insertPlainText(text);
      return;
    }

    const clean = this.#cleanHtml(html);
    if (!clean) {
      this.#insertPlainText(text);
      return;
    }

    this.#restoreSelection();
    insertHtml(this.editor!, clean);
    this.#afterCommand();
  }

  #handleDrop(event: DragEvent): void {
    const transfer = event.dataTransfer;
    if (!transfer) return;
    event.preventDefault();

    const file = Array.from(transfer.files ?? []).find((item) => item.type.startsWith('image/'));
    if (file) {
      void this.#handleImageFile(file);
      return;
    }

    const html = transfer.getData('text/html');
    const text = transfer.getData('text/plain');
    if (!this.#fits(text.length)) {
      this.#limitError();
      return;
    }
    if (html) {
      insertHtml(this.editor!, this.#cleanHtml(html));
      this.#afterCommand();
    } else if (text) {
      this.#insertPlainText(text);
    }
  }

  #insertPlainText(text: string): void {
    const paragraphs = text
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((block) => `<p>${escapeText(block).replace(/\n/g, '<br>')}</p>`)
      .join('');
    insertHtml(this.editor!, paragraphs || '<p><br></p>');
    this.#afterCommand();
  }

  #toggleSource(): void {
    if (this.#sourceMode) {
      this.#applySource();
      return;
    }
    const source = this.source;
    if (!source) return;
    source.value = this.#serialize();
    this.#sourceMode = true;
    this.#syncChrome();
    source.focus();
  }

  #applySource(): void {
    const source = this.source;
    if (!source) return;
    const clean = this.#cleanHtml(source.value);
    this.#sourceMode = false;
    this.#value = clean;
    this.#dirty = false;
    this.#applyValue(clean);
    this.#syncChrome();
    this.updateFormValue();
    this.#emitChange();
    this.#afterCommand();
  }

  #cancelSource(): void {
    this.#sourceMode = false;
    this.#applyValue(this.#value);
    this.#syncChrome();
  }

  #openDialog(title: string, fields: DialogField[]): Promise<DialogResult | null> {
    const backdrop = this.root.querySelector<HTMLElement>('.backdrop');
    const titleEl = this.root.querySelector<HTMLElement>('.dialog h3');
    const body = this.root.querySelector<HTMLElement>('.dialog-body');
    if (!backdrop || !titleEl || !body) return Promise.resolve(null);

    titleEl.textContent = title;
    body.innerHTML = fields.map((field) => this.#fieldHtml(field)).join('');
    this.#dialogReturnFocus = (this.root.activeElement as HTMLElement | null) ?? this.editor;
    backdrop.removeAttribute('hidden');

    const first = body.querySelector<HTMLInputElement | HTMLSelectElement>('input,select');
    first?.focus();

    return new Promise((resolve) => {
      this.#dialogResolve = resolve;
    });
  }

  #fieldHtml(field: DialogField): string {
    const label = esc(field.label);
    if (field.type === 'select') {
      const options = (field.options ?? [])
        .map((option) => `<option value="${esc(option.value)}" ${option.value === field.value ? 'selected' : ''}>${esc(option.label)}</option>`)
        .join('');
      return `<label class="field"><span>${label}</span><select data-field="${esc(field.name)}">${options}</select></label>`;
    }
    const type = field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : 'text';
    return `<label class="field"><span>${label}</span><input data-field="${esc(field.name)}" type="${type}" autocomplete="off" value="${esc(field.value ?? '')}" placeholder="${esc(field.placeholder ?? '')}"></label>`;
  }

  #submitDialog(): void {
    const body = this.root.querySelector<HTMLElement>('.dialog-body');
    if (!body) return;
    const result: DialogResult = {};
    for (const field of Array.from(body.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-field]'))) {
      result[field.dataset.field ?? ''] = field.value.trim();
    }
    this.#releaseDialog(result);
  }

  async #openLinkDialog(existing?: HTMLAnchorElement): Promise<void> {
    this.#hideLinkOverlay();
    const editor = this.editor;
    if (!editor) return;
    if (existing) this.#selectAnchor(existing);
    let range = getRange(editor, this.#lastRange);
    if (!range) {
      placeCaretAtEnd(editor);
      range = getRange(editor);
      this.#lastRange = range?.cloneRange() ?? null;
    }
    const anchor = existing ?? closestInEditor<HTMLAnchorElement>(editor, range?.startContainer ?? null, 'a');
    const selected = range && !range.collapsed ? range.toString() : (anchor?.textContent ?? '');

    const result = await this.#openDialog('Link', [
      { name: 'url', label: 'URL', type: 'url', value: anchor?.getAttribute('href') ?? '', placeholder: 'https://...' },
      { name: 'text', label: 'Texto (quando não há seleção)', value: selected, placeholder: 'Texto do link' },
      {
        name: 'target',
        label: 'Abrir em',
        type: 'select',
        value: anchor?.getAttribute('target') ?? '_blank',
        options: [
          { value: '_blank', label: 'Nova aba' },
          { value: '_self', label: 'Mesma aba' },
        ],
      },
    ]);
    if (!result) return;

    const href = sanitizeLinkUrl(result.url ?? '');
    if (!href) {
      this.#error('URL de link inválida.');
      return;
    }

    const target = result.target === '_self' ? '_self' : '_blank';
    const label = (result.text ?? '').trim() || (anchor ? undefined : selected || href);
    if (anchor) {
      anchor.setAttribute('href', href);
      anchor.setAttribute('target', target);
      anchor.setAttribute('rel', 'noopener noreferrer');
      if (label) anchor.textContent = label;
      this.#afterCommand();
      this.#restoreSelection();
      return;
    }

    this.#restoreSelection();
    applyLink(editor, href, label ?? (selected || href), target);
    this.#afterCommand();
  }

  async #openImageDialog(existing?: HTMLImageElement): Promise<void> {
    this.#hideMediaOverlay();
    const figure = existing?.closest('figure');
    const caption = figure?.querySelector('figcaption')?.textContent ?? '';
    const alignValue = figure?.getAttribute('data-align') ?? 'center';
    const widthValue = figure?.style.width?.replace('%', '') || '100';

    const dialog = this.#openDialog(existing ? 'Editar imagem' : 'Inserir imagem', [
      { name: 'src', label: 'URL da imagem', type: 'url', value: existing?.getAttribute('src') ?? '', placeholder: 'https://...' },
      { name: 'alt', label: 'Texto alternativo', value: existing?.getAttribute('alt') ?? '' },
      { name: 'caption', label: 'Legenda', value: caption },
      {
        name: 'width',
        label: 'Largura',
        type: 'select',
        value: widthValue,
        options: [
          { value: '25', label: '25%' },
          { value: '50', label: '50%' },
          { value: '75', label: '75%' },
          { value: '100', label: '100%' },
        ],
      },
      {
        name: 'align',
        label: 'Alinhamento',
        type: 'select',
        value: alignValue,
        options: [
          { value: 'left', label: 'Esquerda' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Direita' },
        ],
      },
    ]);

    const body = this.root.querySelector<HTMLElement>('.dialog-body');
    if (body) {
      const upload = document.createElement('button');
      upload.type = 'button';
      upload.className = 'btn';
      upload.textContent = 'Escolher arquivo…';
      upload.addEventListener('click', () => {
        this.#releaseDialog(null);
        this.#imagePicker?.click();
      });
      body.appendChild(upload);
    }

    const result = await dialog;
    if (!result) return;
    const src = sanitizeMediaUrl(result.src ?? '', 'img');
    if (!src) {
      this.#error('URL de imagem inválida.');
      return;
    }

    if (existing && figure) {
      existing.setAttribute('src', src);
      existing.setAttribute('alt', result.alt ?? '');
      figure.setAttribute('data-align', result.align || 'center');
      figure.style.width = `${result.width || 100}%`;
      const cap = figure.querySelector('figcaption');
      if (result.caption) {
        if (cap) cap.textContent = result.caption;
        else figure.insertAdjacentHTML('beforeend', `<figcaption>${escapeText(result.caption)}</figcaption>`);
      } else {
        cap?.remove();
      }
      this.#afterCommand();
      return;
    }

    this.#restoreSelection();
    this.#insertImage(src, result.alt ?? '', result.caption ?? '', result.width || '100', result.align || 'center');
  }

  #toEmbedUrl(value: string): string {
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') {
        return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const id = url.searchParams.get('v');
        if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
        if (url.pathname.startsWith('/shorts/')) {
          return `https://www.youtube-nocookie.com/embed/${url.pathname.split('/')[2] ?? ''}`;
        }
      }
      if (host === 'vimeo.com') {
        const id = url.pathname.split('/').filter(Boolean)[0];
        if (id) return `https://player.vimeo.com/video/${id}`;
      }
      return value;
    } catch {
      return value;
    }
  }

  async #openVideoDialog(): Promise<void> {
    const result = await this.#openDialog('Inserir vídeo', [
      { name: 'src', label: 'URL do vídeo ou embed', type: 'url', placeholder: 'https://.../video.mp4 ou YouTube/Vimeo' },
      { name: 'caption', label: 'Legenda', value: '' },
      {
        name: 'width',
        label: 'Largura',
        type: 'select',
        value: '100',
        options: [
          { value: '50', label: '50%' },
          { value: '75', label: '75%' },
          { value: '100', label: '100%' },
        ],
      },
      {
        name: 'align',
        label: 'Alinhamento',
        type: 'select',
        value: 'center',
        options: [
          { value: 'left', label: 'Esquerda' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Direita' },
        ],
      },
    ]);
    if (!result) return;

    const src = result.src ?? '';
    const embed = sanitizeEmbedUrl(this.#toEmbedUrl(src));
    if (embed) {
      this.#restoreSelection();
      this.#insertEmbed(embed, result.caption ?? '', result.width || '100', result.align || 'center');
      return;
    }

    const media = sanitizeMediaUrl(src, 'video');
    if (!media) {
      this.#error('URL de vídeo inválida.');
      return;
    }

    this.#restoreSelection();
    this.#insertVideo(media, result.caption ?? '', result.width || '100', result.align || 'center');
  }

  #decorateMediaFigures(): void {
    const editor = this.editor;
    if (!editor || this.#sourceMode) return;

    for (const figure of Array.from(
      editor.querySelectorAll<HTMLElement>('figure.fx-image, figure.fx-video, figure.fx-embed'),
    )) {
      if (figure.querySelector(':scope > .fx-media-quick')) {
        this.#syncQuickActions(figure);
        continue;
      }

      for (const kind of ['left', 'center', 'right', 'delete'] as const) {
        const label =
          kind === 'delete'
            ? 'Excluir mídia'
            : kind === 'left'
              ? 'Alinhar à esquerda'
              : kind === 'center'
                ? 'Centralizar'
                : 'Alinhar à direita';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `fx-media-quick quick-${kind}`;
        button.title = label;
        button.setAttribute('aria-label', label);
        if (kind === 'delete') button.dataset.mediaDelete = '';
        else button.dataset.mediaAlign = kind;
        button.innerHTML = QUICK_SVG[kind];
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (kind === 'delete') {
            figure.remove();
            this.#hideMediaOverlay();
            this.#afterCommand();
          } else {
            figure.setAttribute('data-align', kind);
            this.#syncQuickActions(figure);
            this.#afterCommand();
          }
        });
        figure.appendChild(button);
      }

      this.#syncQuickActions(figure);
    }
  }

  #syncQuickActions(figure: HTMLElement): void {
    const align = figure.getAttribute('data-align') || 'center';
    for (const button of Array.from(
      figure.querySelectorAll<HTMLElement>(':scope > .fx-media-quick[data-media-align]'),
    )) {
      button.classList.toggle('active', button.dataset.mediaAlign === align);
    }
  }

  #selectAnchor(anchor: HTMLAnchorElement): void {
    const editor = this.editor;
    if (!editor) return;
    editor.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(anchor);
    const selection = document.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
    this.#lastRange = range.cloneRange();
  }

  #handleLinkOverlayClick(event: MouseEvent): void {
    const action = (event.target as HTMLElement).closest<HTMLElement>('[data-link-action]');
    const anchor = this.#linkAnchor;
    if (!action || !anchor) return;
    event.preventDefault();
    event.stopPropagation();
    const kind = action.dataset.linkAction;
    if (kind === 'open') this.#openLink(anchor);
    else if (kind === 'edit') void this.#openLinkDialog(anchor);
    else if (kind === 'remove') this.#removeLink(anchor);
  }

  #openLink(anchor: HTMLAnchorElement): void {
    const href = anchor.getAttribute('href') ?? '';
    if (!href) return;
    this.#hideLinkOverlay();
    const target = anchor.getAttribute('target') === '_self' ? '_self' : '_blank';
    window.open(href, target, target === '_blank' ? 'noopener,noreferrer' : undefined);
  }

  #removeLink(anchor: HTMLAnchorElement): void {
    const parent = anchor.parentNode;
    if (!parent) return;
    while (anchor.firstChild) parent.insertBefore(anchor.firstChild, anchor);
    anchor.remove();
    this.#hideLinkOverlay();
    this.#afterCommand();
    this.editor?.focus({ preventScroll: true });
  }

  #showLinkOverlay(anchor: HTMLAnchorElement): void {
    this.#linkAnchor = anchor;
    const overlay = this.root.querySelector<HTMLElement>('.link-overlay');
    if (!overlay) return;
    const target = anchor.getAttribute('target') === '_self' ? 'mesma janela' : 'nova aba';
    const open = overlay.querySelector<HTMLElement>('[data-link-action="open"]');
    if (open) open.title = `Abrir na ${target}`;
    overlay.hidden = false;
    this.#positionLinkOverlay();
  }

  #hideLinkOverlay(): void {
    this.#linkAnchor = null;
    const overlay = this.root.querySelector<HTMLElement>('.link-overlay');
    if (overlay) overlay.hidden = true;
  }

  #positionLinkOverlay(): void {
    const overlay = this.root.querySelector<HTMLElement>('.link-overlay');
    const anchor = this.#linkAnchor;
    const editor = this.editor;
    if (!overlay) return;
    if (!anchor || !editor || this.#sourceMode || !anchor.isConnected || !editor.contains(anchor)) {
      overlay.hidden = true;
      return;
    }

    const body = overlay.parentElement;
    if (!body) return;
    const bodyRect = body.getBoundingClientRect();
    const rect = anchor.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom < bodyRect.top || rect.top > bodyRect.bottom) {
      overlay.hidden = true;
      return;
    }

    overlay.hidden = false;
    const width = overlay.offsetWidth || 180;
    const height = overlay.offsetHeight || 30;
    const left = Math.max(4, Math.min(rect.left - bodyRect.left, bodyRect.width - width - 4));
    let top = rect.bottom - bodyRect.top + 6;
    if (top + height > bodyRect.height) top = rect.top - bodyRect.top - height - 6;
    overlay.style.left = `${left}px`;
    overlay.style.top = `${Math.max(4, top)}px`;
  }

  #handleEditorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (anchor && this.editor?.contains(anchor)) {
      this.#hideMediaOverlay();
      this.#showLinkOverlay(anchor);
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        this.#openLink(anchor);
      }
      return;
    }

    this.#hideLinkOverlay();
    const figure = target.closest<HTMLElement>('figure.fx-image, figure.fx-video, figure.fx-embed');
    if (figure) this.#showMediaOverlay(figure);
    else this.#hideMediaOverlay();
  }

  #showMediaOverlay(figure: HTMLElement): void {
    this.#mediaFigure = figure;
    figure.setAttribute('tabindex', '0');
    if (figure.classList.contains('fx-image')) figure.focus({ preventScroll: true });
    const overlay = this.root.querySelector<HTMLElement>('.media-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    this.#positionMediaOverlay();
  }

  #hideMediaOverlay(): void {
    this.#mediaFigure?.removeAttribute('tabindex');
    this.#mediaFigure = null;
    const overlay = this.root.querySelector<HTMLElement>('.media-overlay');
    if (!overlay) return;
    overlay.hidden = true;
    const size = overlay.querySelector<HTMLElement>('.media-size');
    if (size) size.textContent = '';
  }

  #deleteMediaFigure(): void {
    const figure = this.#mediaFigure;
    if (!figure) return;
    figure.remove();
    this.#hideMediaOverlay();
    this.#afterCommand();
    this.editor?.focus({ preventScroll: true });
  }

  #positionMediaOverlay(): void {
    const overlay = this.root.querySelector<HTMLElement>('.media-overlay');
    const figure = this.#mediaFigure;
    const editor = this.editor;
    if (!overlay) return;
    if (!figure || !editor || this.#sourceMode || !figure.isConnected || !editor.contains(figure)) {
      overlay.hidden = true;
      return;
    }

    const body = overlay.parentElement;
    if (!body) return;
    const bodyRect = body.getBoundingClientRect();
    const rect = figure.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom < bodyRect.top || rect.top > bodyRect.bottom) {
      overlay.hidden = true;
      return;
    }

    overlay.hidden = false;
    overlay.style.left = `${rect.left - bodyRect.left}px`;
    overlay.style.top = `${rect.top - bodyRect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const size = overlay.querySelector<HTMLElement>('.media-size');
    if (size) size.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  }

  #startResize(event: PointerEvent): void {
    const handle = (event.target as HTMLElement).closest<HTMLElement>('[data-handle]');
    const figure = this.#mediaFigure;
    const editor = this.editor;
    if (!handle || !figure || !editor) return;

    event.preventDefault();
    event.stopPropagation();
    this.#endResize();

    const parent = figure.parentElement;
    if (!parent) return;
    const parentWidth = parent.getBoundingClientRect().width || editor.clientWidth;
    if (!parentWidth) return;

    const rect = figure.getBoundingClientRect();
    const startWidth = rect.width
      ? (rect.width / parentWidth) * 100
      : Number.parseFloat(figure.style.width) || 100;
    const startX = event.clientX;
    const direction = handle.dataset.handle?.includes('w') ? -1 : 1;

    const move = (moveEvent: PointerEvent): void => {
      const deltaPct = ((moveEvent.clientX - startX) * direction * 100) / parentWidth;
      const width = Math.min(100, Math.max(15, startWidth + deltaPct));
      figure.style.width = `${width.toFixed(1).replace(/\.0$/, '')}%`;
      this.#positionMediaOverlay();
    };

    const up = (): void => {
      this.#endResize();
      this.#afterCommand();
      this.#positionMediaOverlay();
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    window.addEventListener('pointercancel', up, { once: true });
    this.#resizeDispose = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }

  #endResize(): void {
    this.#resizeDispose?.();
    this.#resizeDispose = null;
  }

  #handleDoubleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const image = target.closest<HTMLImageElement>('img');
    if (image) {
      event.preventDefault();
      void this.#openImageDialog(image);
    }
  }

  #insertImage(src: string, alt: string, caption: string, width: string, align: string): void {
    const html =
      `<figure class="fx-image" contenteditable="false" data-align="${escapeAttr(align)}" style="width:${escapeAttr(width)}%">` +
      `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async">` +
      `${caption ? `<figcaption>${escapeText(caption)}</figcaption>` : ''}` +
      `</figure><p><br></p>`;
    insertHtml(this.editor!, html);
    this.#afterCommand();
  }

  #insertVideo(src: string, caption: string, width: string, align = 'center'): void {
    const html =
      `<figure class="fx-video" contenteditable="false" data-align="${escapeAttr(align)}" style="width:${escapeAttr(width)}%">` +
      `<video controls preload="metadata" src="${escapeAttr(src)}" style="width:100%"></video>` +
      `${caption ? `<figcaption>${escapeText(caption)}</figcaption>` : ''}` +
      `</figure><p><br></p>`;
    insertHtml(this.editor!, html);
    this.#afterCommand();
  }

  #insertEmbed(src: string, caption: string, width: string, align = 'center'): void {
    const html =
      `<figure class="fx-embed" contenteditable="false" data-align="${escapeAttr(align)}" style="width:${escapeAttr(width)}%">` +
      `<iframe src="${escapeAttr(src)}" title="${escapeAttr(caption || 'Vídeo')}" loading="lazy" allowfullscreen ` +
      `sandbox="allow-scripts allow-same-origin allow-presentation" referrerpolicy="strict-origin-when-cross-origin" ` +
      `style="width:100%;aspect-ratio:16/9;border:0"></iframe>` +
      `${caption ? `<figcaption>${escapeText(caption)}</figcaption>` : ''}` +
      `</figure><p><br></p>`;
    insertHtml(this.editor!, html);
    this.#afterCommand();
  }

  #insertTable(rows: number, cols: number): void {
    const rowCount = Math.min(20, Math.max(1, rows));
    const colCount = Math.min(12, Math.max(1, cols));
    const width = (100 / colCount).toFixed(4).replace(/\.?0+$/, '');
    const colsHtml = `<colgroup>${Array.from({ length: colCount }, () => `<col style="width:${width}%">`).join('')}</colgroup>`;
    const head = `<thead><tr>${Array.from({ length: colCount }, () => '<th scope="col"><p><br></p></th>').join('')}</tr></thead>`;
    const bodyRows = Math.max(0, rowCount - 1);
    const body = bodyRows
      ? `<tbody>${Array.from({ length: bodyRows }, () =>
          `<tr>${Array.from({ length: colCount }, () => '<td><p><br></p></td>').join('')}</tr>`,
        ).join('')}</tbody>`
      : '';

    const html =
      `<figure class="fx-table"><table>${colsHtml}${head}${body}</table></figure><p><br></p>`;
    insertHtml(this.editor!, html);
    this.#afterCommand();
  }

  #insertColumns(cols: number): void {
    const count = Math.min(4, Math.max(1, cols));
    const width = (100 / count).toFixed(4).replace(/\.?0+$/, '');
    const cells = Array.from(
      { length: count },
      () => `<td style="width:${width}%;vertical-align:top;padding:8px"><p><br></p></td>`,
    ).join('');
    const html =
      `<table class="fx-grid" role="presentation" data-cols="${count}" data-stack="sm" ` +
      `style="width:100%;border-collapse:collapse"><tbody><tr>${cells}</tr></tbody></table><p><br></p>`;
    insertHtml(this.editor!, html);
    this.#afterCommand();
  }

  #showTablePanel(): void {
    const panel = this.root.querySelector<HTMLElement>('[data-panel]');
    if (!panel) return;
    const table = this.#currentTable();

    const grid = Array.from({ length: 64 }, (_, index) => {
      const rows = Math.floor(index / 8) + 1;
      const cols = (index % 8) + 1;
      return `<button type="button" data-grid="${rows},${cols}" aria-label="${rows} por ${cols}"></button>`;
    }).join('');

    panel.innerHTML =
      `<p class="panel-title">Inserir tabela</p><div class="grid-picker">${grid}</div>` +
      (table
        ? `<p class="panel-title" style="margin-top:8px">Tabela atual</p><div class="panel-actions">` +
          `<button type="button" class="btn" data-table-action="add-row">+ Linha</button>` +
          `<button type="button" class="btn" data-table-action="add-col">+ Coluna</button>` +
          `<button type="button" class="btn" data-table-action="del-row">− Linha</button>` +
          `<button type="button" class="btn" data-table-action="del-col">− Coluna</button>` +
          `<button type="button" class="btn" data-table-action="toggle-header">Cabeçalho</button>` +
          `<button type="button" class="btn" data-table-action="merge-cells">Mesclar</button>` +
          `<button type="button" class="btn" data-table-action="split-cell">Dividir</button>` +
          `<button type="button" class="btn" data-table-action="del-table">Excluir tabela</button>` +
          `</div>`
        : '');
    panel.removeAttribute('hidden');

    panel.querySelectorAll<HTMLButtonElement>('[data-grid]').forEach((button) => {
      button.addEventListener('click', () => {
        const [rows, cols] = (button.dataset.grid ?? '').split(',').map(Number);
        this.#hidePanel();
        this.#insertTable(rows, cols);
      });
    });
    panel.querySelectorAll<HTMLButtonElement>('[data-table-action]').forEach((button) => {
      button.addEventListener('click', () => {
        this.#tableAction(button.dataset.tableAction ?? '');
        this.#hidePanel();
      });
    });
  }

  #showColumnsPanel(): void {
    const panel = this.root.querySelector<HTMLElement>('[data-panel]');
    if (!panel) return;
    panel.innerHTML =
      `<p class="panel-title">Inserir colunas</p><div class="panel-actions">` +
      [1, 2, 3, 4]
        .map((count) => `<button type="button" class="btn" data-columns="${count}">${count}</button>`)
        .join('') +
      `</div>`;
    panel.removeAttribute('hidden');
    panel.querySelectorAll<HTMLButtonElement>('[data-columns]').forEach((button) => {
      button.addEventListener('click', () => {
        this.#hidePanel();
        this.#insertColumns(Number(button.dataset.columns ?? 1));
      });
    });
  }

  #hidePanel(): void {
    this.root.querySelector<HTMLElement>('[data-panel]')?.setAttribute('hidden', '');
  }

  #currentTable(): HTMLTableElement | null {
    const editor = this.editor;
    if (!editor) return null;
    const range = getRange(editor, this.#lastRange);
    return closestInEditor<HTMLTableElement>(editor, range?.startContainer ?? null, 'table');
  }

  #tableAction(action: string): void {
    const table = this.#currentTable();
    if (!table) return;
    const editor = this.editor;
    const range = editor ? getRange(editor, this.#lastRange) : null;
    const cell = editor
      ? closestInEditor<HTMLTableCellElement>(editor, range?.startContainer ?? null, 'td,th')
      : null;
    const row = cell?.parentElement as HTMLTableRowElement | null;

    if (action === 'merge-cells') {
      if (!range) return;
      const merged = mergeSelectedCells(table, range);
      if (!merged) return;
      placeCaretAtEnd(merged);
      this.#afterCommand();
      return;
    }

    if (action === 'split-cell') {
      if (!cell) return;
      const created = splitTableCell(table, cell);
      if (!created.length) return;
      placeCaretAtEnd(cell);
      this.#afterCommand();
      return;
    }

    if (action === 'add-row' && row) {
      const clone = row.cloneNode(true) as HTMLTableRowElement;
      for (const cloneCell of Array.from(clone.querySelectorAll<HTMLTableCellElement>('td,th'))) {
        cloneCell.innerHTML = '<p><br></p>';
      }
      row.after(clone);
    } else if (action === 'add-col' && cell) {
      const index = Array.from(row?.children ?? []).indexOf(cell);
      for (const currentRow of Array.from(table.rows)) {
        const target = currentRow.cells[Math.max(0, index)];
        const clone = (target ?? currentRow.cells[currentRow.cells.length - 1])?.cloneNode(false) as HTMLTableCellElement | undefined;
        if (!clone) continue;
        clone.innerHTML = '<p><br></p>';
        currentRow.insertBefore(clone, target?.nextSibling ?? null);
      }
    } else if (action === 'del-row' && row && table.rows.length > 1) {
      row.remove();
    } else if (action === 'del-col' && cell && table.rows[0]?.cells.length > 1) {
      const index = Array.from(row?.children ?? []).indexOf(cell);
      for (const currentRow of Array.from(table.rows)) {
        currentRow.cells[index]?.remove();
      }
    } else if (action === 'toggle-header') {
      const thead = table.tHead;
      if (thead && thead.rows.length) {
        const headerRow = thead.rows[0];
        for (const headerCell of Array.from(headerRow.cells)) {
          const td = document.createElement('td');
          td.innerHTML = headerCell.innerHTML;
          headerCell.replaceWith(td);
        }
        const tbody = table.tBodies[0] ?? table.createTBody();
        tbody.insertBefore(headerRow, tbody.firstChild);
        thead.remove();
      } else {
        const firstRow = table.rows[0];
        if (firstRow) {
          for (const firstCell of Array.from(firstRow.cells)) {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.innerHTML = firstCell.innerHTML;
            firstCell.replaceWith(th);
          }
          table.createTHead().appendChild(firstRow);
        }
      }
    } else if (action === 'del-table') {
      const figure = table.closest('figure.fx-table');
      (figure ?? table).remove();
    }

    this.#afterCommand();
  }

  async #handleImageFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.#error('O arquivo selecionado não é uma imagem.');
      return;
    }
    if (file.type === 'image/svg+xml') {
      this.#error('SVG não é permitido por segurança. Use PNG, JPEG, WebP ou GIF.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.#error('Imagem muito grande (máximo 8 MB).');
      return;
    }

    let src = '';
    let alt = file.name.replace(/\.[a-z0-9]+$/i, '');

    try {
      if (this.uploadImage) {
        const uploaded = await this.uploadImage(file);
        if (typeof uploaded === 'string') src = uploaded;
        else {
          src = uploaded.url;
          if (uploaded.alt) alt = uploaded.alt;
        }
      } else {
        src = await this.#fileToDataUrl(file);
      }
    } catch {
      this.#error('Não foi possível processar a imagem.');
      return;
    }

    if (!src || !sanitizeMediaUrl(src, 'img')) {
      this.#error('A imagem resultante não tem uma URL segura.');
      return;
    }

    this.#restoreSelection();
    this.#insertImage(src, alt, '', '100', 'center');
  }

  async #fileToDataUrl(file: File): Promise<string> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('read-error'));
      reader.readAsDataURL(file);
    });

    if (file.type === 'image/gif') return dataUrl;

    return new Promise<string>((resolve) => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1600;
        const scale = Math.min(1, maxWidth / (image.naturalWidth || maxWidth));
        if (scale >= 1) {
          resolve(dataUrl);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round((image.naturalWidth || maxWidth) * scale);
        canvas.height = Math.round((image.naturalHeight || maxWidth) * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(dataUrl);
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85));
      };
      image.onerror = () => resolve(dataUrl);
      image.src = dataUrl;
    });
  }

  #error(message: string): void {
    this.dispatchEvent(
      new CustomEvent('editor-error', {
        bubbles: true,
        composed: true,
        detail: { message },
      }),
    );
  }

  /* ---------------------------------------------------------------------
   * API pública
   * ------------------------------------------------------------------ */

  override focus(options?: FocusOptions): void {
    this.editor?.focus(options ?? { preventScroll: true });
  }

  override blur(): void {
    this.editor?.blur();
  }

  execute(command: string, value?: string): void {
    if (value !== undefined) {
      this.#restoreSelection();
      nativeExec('styleWithCSS', 'true');
      nativeExec(command, value);
      this.#afterCommand();
      return;
    }
    this.#execCommand(command);
  }

  insertHTML(html: string): void {
    const clean = this.#cleanHtml(html);
    const probe = document.createElement('div');
    probe.innerHTML = clean;
    const extra = probe.textContent?.length ?? 0;
    if (!this.#fits(extra)) {
      this.#limitError();
      return;
    }
    this.#restoreSelection();
    insertHtml(this.editor!, clean);
    this.#afterCommand();
  }

  /** Mescla as células tocadas pela seleção. */
  mergeCells(): boolean {
    const table = this.#currentTable();
    const editor = this.editor;
    const range = editor ? getRange(editor, this.#lastRange) : null;
    if (!table || !range) return false;
    const merged = mergeSelectedCells(table, range);
    if (!merged) return false;
    placeCaretAtEnd(merged);
    this.#afterCommand();
    return true;
  }

  /** Divide a célula mesclada atual. */
  splitCell(): boolean {
    const table = this.#currentTable();
    const editor = this.editor;
    const range = editor ? getRange(editor, this.#lastRange) : null;
    const cell = editor
      ? closestInEditor<HTMLTableCellElement>(editor, range?.startContainer ?? null, 'td,th')
      : null;
    if (!table || !cell) return false;
    const created = splitTableCell(table, cell);
    if (!created.length) return false;
    placeCaretAtEnd(cell);
    this.#afterCommand();
    return true;
  }

  getHtml(): string {
    return this.value;
  }

  setHtml(html: string): void {
    this.value = html;
  }

  getText(): string {
    return this.text;
  }

  clear(): void {
    this.value = '';
    this.#dirty = false;
    this.#applyValue('');
    this.updateFormValue();
    this.#emitChange();
    this.focus();
  }

  undo(): void {
    this.execute('undo');
  }

  redo(): void {
    this.execute('redo');
  }

  saveSelection(): void {
    if (this.editor) this.#lastRange = saveRange(this.editor) ?? this.#lastRange;
  }

  restoreSelection(): void {
    this.#restoreSelection();
  }

  openDialog(kind: 'link' | 'image' | 'video'): void {
    if (kind === 'link') void this.#openLinkDialog();
    else if (kind === 'image') void this.#openImageDialog();
    else void this.#openVideoDialog();
  }

  toggleSource(): void {
    this.#toggleSource();
  }

  toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;
  }












}

export function defineFxEditor(): typeof FxEditor {
  return defineElement('fx-editor', FxEditor);
}
