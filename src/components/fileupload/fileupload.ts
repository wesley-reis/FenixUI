import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-fileupload> — Seletor de arquivos com upload e progresso (estilo FileUpload do PrimeVue).
 *
 * Atributos:
 *  - mode (basic|advanced — `basic`: botão; `advanced`: dropzone com drag & drop);
 *  - size (sm|md|lg, padrão md);
 *  - severity (primary|secondary|success|warning|danger|info — cor do botão no modo basic);
 *  - label (texto do botão/área, padrão 'Escolher arquivo');
 *  - icon (glifo/emoji exibido antes do texto — sem o atributo, sem ícone);
 *  - accept, multiple, disabled (como no <input type="file">);
 *  - show-progress (exibe barra + % de upload);
 *  - progress (0-100 — o consumidor atualiza durante o upload real);
 *  - value (nome(s) do(s) arquivo(s) carregado(s), somente leitura/espelho).
 *
 * Eventos (composed): `select` (detail: { files: File[] }), `remove`, `complete`.
 */
export class FxFileUpload extends FxElement {
  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    :host([disabled]) { opacity: 0.55; pointer-events: none; }
    input[type='file'] { display: none; }

    /* ---- botão (basic) ---- */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--fx-space-sm);
      min-height: var(--fx-size-md);
      padding: var(--fx-space-md) var(--fx-space-lg);
      font-family: inherit;
      font-size: inherit;
      font-weight: var(--fx-font-weight);
      color: var(--fx-text-default);
      background-color: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      cursor: pointer;
      box-sizing: border-box;
      transition:
        border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing),
        background var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .btn:hover { border-color: var(--fx-border-hover); background: var(--fx-surface-surface-hover, rgba(0,0,0,0.03)); }
    .btn:focus-visible {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    /* Severities (como no <fx-button>) — aplicam-se ao botão do modo basic */
    :host([severity='primary']) .btn { background: var(--fx-color-primary); border-color: transparent; color: #fff; }
    :host([severity='secondary']) .btn { background: var(--fx-color-secondary); border-color: transparent; color: #fff; }
    :host([severity='success']) .btn { background: var(--fx-color-success); border-color: transparent; color: #fff; }
    :host([severity='warning']) .btn { background: var(--fx-color-warning); border-color: transparent; color: #fff; }
    :host([severity='danger']) .btn { background: var(--fx-color-danger); border-color: transparent; color: #fff; }
    :host([severity='info']) .btn { background: var(--fx-color-info); border-color: transparent; color: #fff; }
    :host([severity]) .btn:hover { filter: brightness(0.88); }
    :host([severity]) .btn:focus-visible { border-color: transparent; }
    :host([size='sm']) .btn { min-height: var(--fx-size-sm); padding: var(--fx-space-sm) var(--fx-space-md); font-size: calc(var(--fx-font-size) - 2px); }
    :host([size='lg']) .btn { min-height: var(--fx-size-lg); padding: var(--fx-space-lg) var(--fx-space-xl); font-size: calc(var(--fx-font-size) + 4px); }
    :host([size='sm']) .drop { min-height: 72px; }
    :host([size='lg']) .drop { min-height: 132px; }

    /* ---- dropzone (advanced) ---- */
    .drop {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--fx-space-sm);
      min-height: 100px;
      padding: var(--fx-space-lg);
      border: 2px dashed var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      color: var(--fx-text-muted);
      cursor: pointer;
      text-align: center;
      transition: border-color var(--fx-motion-duration-normal) var(--fx-motion-easing), background var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    .drop:hover, .drop.over {
      border-color: var(--fx-color-primary);
      background: color-mix(in srgb, var(--fx-color-primary) 6%, transparent);
    }
    .drop .icon { font-size: calc(var(--fx-font-size) + 12px); line-height: 1; }
    .drop .hint { font-size: calc(var(--fx-font-size) - 2px); }

    /* ---- ícone comum ---- */
    .icon { line-height: 1; }

    /* ---- arquivo(s) selecionado(s) ---- */
    .files { display: flex; flex-direction: column; gap: var(--fx-space-xs); margin-top: var(--fx-space-sm); }
    .file {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      padding: var(--fx-space-xs) var(--fx-space-sm);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-sm);
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-default);
    }
    .file .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file .size { color: var(--fx-text-muted); white-space: nowrap; }
    .file .remove {
      border: none;
      background: transparent;
      color: var(--fx-text-muted);
      cursor: pointer;
      font-size: calc(var(--fx-font-size) + 2px);
      line-height: 1;
      padding: 0 var(--fx-space-xs);
      border-radius: var(--fx-radius-full);
    }
    .file .remove:hover { color: var(--fx-color-danger); }

    /* ---- progresso ---- */
    .progress-row { display: flex; align-items: center; gap: var(--fx-space-sm); margin-top: var(--fx-space-sm); }
    .track {
      flex: 1;
      height: 6px;
      background: var(--fx-surface-surface-hover);
      border-radius: var(--fx-radius-full);
      overflow: hidden;
    }
    .bar {
      height: 100%;
      width: 0%;
      background: var(--fx-color-primary);
      border-radius: var(--fx-radius-full);
      transition: width var(--fx-motion-duration-normal) var(--fx-motion-easing);
    }
    :host([progress='100']) .bar { background: var(--fx-color-success); }
    .pct {
      font-size: calc(var(--fx-font-size) - 2px);
      font-weight: 600;
      color: var(--fx-text-default);
      min-width: 34px;
      text-align: right;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['mode', 'size', 'severity', 'label', 'icon', 'accept', 'multiple', 'disabled', 'show-progress', 'progress', 'value'];
  }

  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) { this.setAttribute('size', value); }

  /** Nomes dos arquivos selecionados (espelho em `value`). */
  get value(): string { return this.getAttr('value'); }
  set value(v: string) { this.setAttribute('value', v); }

  get progress(): number { return Math.min(100, Math.max(0, Number(this.getAttr('progress', '0')) || 0)); }
  set progress(v: number) { this.setAttribute('progress', String(v)); }

  /** Arquivos selecionados (não serializável em atributo). */
  get files(): File[] { return this._files; }
  set files(files: File[]) {
    this._files = Array.from(files);
    this.value = this._files.map((f) => f.name).join(', ');
    this._syncFilesArea();
  }

  protected override render(): void {
    const mode = this.getAttr('mode', 'basic');
    const advanced = mode === 'advanced';
    const label = this.getAttr('label', 'Escolher arquivo');
    const icon = this.getAttr('icon');
    const accept = this.getAttr('accept');
    const multiple = this.hasAttr('multiple');
    const disabled = this.hasAttr('disabled');
    const showProgress = this.hasAttr('show-progress');
    const pct = this.progress;

    const fileInput = `<input type="file" class="picker" ${accept ? `accept="${esc(accept)}"` : ''} ${multiple ? 'multiple' : ''} ${disabled ? 'disabled' : ''} />`;

    this.setTemplate(`
      ${advanced
        ? `<div class="drop" part="dropzone" role="button" tabindex="0" aria-label="${esc(label)}">
             ${icon ? `<span class="icon" aria-hidden="true">${esc(icon)}</span>` : ''}
             <span>${esc(label)}</span>
             <span class="hint">ou arraste e solte aqui</span>
           </div>`
        : `<button type="button" class="btn" part="button">
             ${icon ? `<span class="icon" aria-hidden="true">${esc(icon)}</span>` : ''}
             <span>${esc(label)}</span>
           </button>`}
      ${fileInput}
      <div class="files" part="files"></div>
      ${showProgress ? `
      <div class="progress-row" part="progress">
        <div class="track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="bar" style="width: ${pct}%"></div>
        </div>
        <span class="pct">${pct}%</span>
      </div>` : ''}
    `);

    this._bindPicker();
    this._syncFilesArea();

    if (!this._done && showProgress && pct >= 100 && this._files.length) {
      this._done = true;
      this.dispatchEvent(new CustomEvent('complete', { bubbles: true, composed: true }));
    }
    if (pct < 100) this._done = false;
  }

  private _files: File[] = [];
  private _done = false;

  private _picker(): HTMLInputElement | null {
    return this.root.querySelector<HTMLInputElement>('.picker');
  }

  private _bindPicker(): void {
    const picker = this._picker();
    if (!picker) return;
    const trigger = this.root.querySelector('.btn') ?? this.root.querySelector('.drop');
    trigger?.addEventListener('click', () => picker.click());
    trigger?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        picker.click();
      }
    });
    picker.addEventListener('change', () => this._acceptFiles(picker.files ?? []));

    // drag & drop (advanced)
    const drop = this.root.querySelector<HTMLElement>('.drop');
    if (!drop) return;
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('over');
      if (e.dataTransfer?.files.length) this._acceptFiles(e.dataTransfer.files);
    });
  }

  private _acceptFiles(list: FileList | File[]): void {
    const picked = this.hasAttr('multiple') ? Array.from(list) : [list[0]].filter(Boolean);
    this.files = picked;
    const picker = this._picker();
    if (picker) picker.value = '';
    this.dispatchEvent(
      new CustomEvent('select', { bubbles: true, composed: true, detail: { files: picked } }),
    );
  }

  private _fmtSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Renderiza a lista de arquivos sem re-renderizar o template (mantém estado). */
  private _syncFilesArea(): void {
    const area = this.root?.querySelector?.('.files') as HTMLElement | null;
    if (!area) return;
    area.innerHTML = this._files
      .map(
        (f, i) => `
        <div class="file" part="file">
          <span class="name">${esc(f.name)}</span>
          <span class="size">${this._fmtSize(f.size)}</span>
          <button type="button" class="remove" data-i="${i}" part="remove" aria-label="Remover ${esc(f.name)}">×</button>
        </div>`,
      )
      .join('');
    area.querySelectorAll<HTMLButtonElement>('.remove').forEach((btn) =>
      btn.addEventListener('click', () => {
        const removed = this._files.splice(Number(btn.dataset.i), 1)[0];
        this.value = this._files.map((f) => f.name).join(', ');
        this.progress = 0;
        this._syncFilesArea();
        this.dispatchEvent(
          new CustomEvent('remove', { bubbles: true, composed: true, detail: { file: removed } }),
        );
      }),
    );
  }
}

export function defineFxFileUpload(): typeof FxFileUpload {
  return defineElement('fx-fileupload', FxFileUpload);
}


