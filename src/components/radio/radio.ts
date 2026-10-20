import { FxFormElement } from '../../core/form-element';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

/**
 * <fx-radio> — Botão de opção. Radios com o mesmo `name` formam um grupo
 * (seleção exclusiva gerenciada pelo próprio componente, escopado à árvore
 * em que o radio vive — document OU o shadow DOM do app consumidor).
 *
 * Form-Associated Custom Element: dentro de um <form> só o radio MARCADO
 * entra no FormData (via atributo `name`, com `value` ou 'on'), igual ao
 * radio nativo. Recebe reset/disable do form.
 *
 * Atributos: checked, disabled, value, name, size (sm|md|lg).
 * Eventos: `change` e `checkedChange` (composed, detail: { checked, value }) —
 * `checkedChange` é o two-way binding do Angular [(checked)].
 *
 * Vue: use `:checked="estado"` + `@change` (o `v-model` padrão de elemento
 * customizado usa `value` + `input`, não `checked`).
 */
export class FxRadio extends FxFormElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .box {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-sm);
      cursor: pointer;
      user-select: none;
      color: var(--fx-text-default);
      -webkit-tap-highlight-color: transparent;
    }
    .control {
      width: var(--fx-size-radio, var(--_fx-size-radio, 18px));
      height: var(--fx-size-radio, var(--_fx-size-radio, 18px));
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--fx-border-hover);
      border-radius: var(--fx-radius-full);
      background: var(--fx-surface-background);
      transition:
        border-color var(--fx-motion-duration-fast) var(--fx-motion-easing),
        box-shadow var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .box:hover .control { border-color: var(--fx-color-primary); }
    .box:focus-visible .control {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .dot {
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      border-radius: var(--fx-radius-full);
      background: var(--fx-color-primary);
      transform: scale(0);
      transition: transform var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    :host([checked]) .control { border-color: var(--fx-color-primary); }
    :host([checked]) .dot { transform: scale(1); }
    /* Validação */
    :host([error]) .control,
    :host([invalid]) .control { border-color: var(--fx-color-danger, #dc2626); }
    :host([success]) .control,
    :host([valid]) .control { border-color: var(--fx-color-success, #16a34a); }
    .label { display: inline-flex; align-items: center; }
    :host([disabled]) .box {
      opacity: 0.55;
      cursor: not-allowed;
      pointer-events: none;
    }
  `;

  static override get observedAttributes(): string[] {
    return ['checked', 'disabled', 'size'];
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

  /**
   * Grupo = radios com o mesmo `name` NA MESMA árvore. `getRootNode()` devolve
   * o document OU o ShadowRoot do app consumidor — grupos com o mesmo name
   * em shadow DOMs diferentes ficam isolados (o `document` global cruzaria
   * fronteiras indevidamente).
   */
  private _group(): FxRadio[] {
    const name = this.getAttr('name');
    if (!name) return [this];
    const root = this.getRootNode() as ParentNode;
    // Escape manual para seletor de atributo com aspas duplas (o global `CSS`
    // não existe em todos os ambientes — ex.: jsdom).
    const safeName = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return Array.from(
      root.querySelectorAll(`fx-radio[name="${safeName}"]`),
    ) as FxRadio[];
  }

  /** No FormData: só o radio MARCADO envia `value` (ou 'on'). */
  protected override getFormValue(): string | FormData | null {
    return this.checked ? (this.getAttr('value') || 'on') : null;
  }

  /** getter/setter `value` — sem o setter o Vue não consegue escrever a propriedade. */
  get value(): string { return this.getAttr('value'); }
  set value(v: string | null | undefined) {
    this.setAttribute('value', v == null ? '' : String(v));
    this.updateFormValue();
  }

  /** Tamanho do controle. Padrão: `'md'`. */
  get size(): string {
    const s = this.getAttr('size', 'md');
    return s === 'sm' || s === 'lg' ? s : 'md';
  }
  set size(value: string) {
    this.setAttribute('size', value);
  }

  protected override render(): void {
    const px = this.size === 'sm' ? '14px' : this.size === 'lg' ? '22px' : '18px';
    // Token interno: um `--fx-size-radio` do consumidor continua vencendo.
    this.style.setProperty('--_fx-size-radio', px);

    this.setTemplate(`
      <span class="box" part="box" role="radio" tabindex="0"
        aria-checked="${this.checked}" aria-disabled="${this.disabled}">
        <span class="control" part="control"><span class="dot" part="dot"></span></span>
        <span class="label" part="label"><slot></slot></span>
      </span>
    `);

    const box = this.root.querySelector<HTMLElement>('.box');
    if (!box) return;
    box.addEventListener('click', () => this.select());
    box.addEventListener('keydown', (e) => {
      const key = (e as KeyboardEvent).key;
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        this.select();
        return;
      }
      // Setas: movem o foco (e marcam) entre os radios do grupo — igual ao
      // <input type="radio"> nativo (roam pelo grupo, sem sair dele).
      if (key === 'ArrowDown' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowLeft') {
        e.preventDefault();
        this._moveFocus(key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1);
      }
    });

    // Publica name/value no form (ElementInternals) a cada render.
    this.updateFormValue();
  }

  /** Move o foco/marcação para o próximo (ou anterior) radio do grupo. */
  private _moveFocus(dir: 1 | -1): void {
    const group = this._group().filter((r) => !r.disabled);
    if (group.length < 2) return;
    const i = group.indexOf(this);
    const next = group[(i + dir + group.length) % group.length]!;
    next.focus(); // delegatesFocus leva o foco ao .box interno
    // Fallback (ex.: jsdom sem delegatesFocus): foca o .box interno direto.
    if (!next.root.activeElement) {
      next.root.querySelector<HTMLElement>('.box')?.focus();
    }
    if (!next.checked) next.select();
  }

  private select(): void {
    if (this.disabled || this.checked) return;
    // Desmarca os outros radios do mesmo grupo (mesmo name, mesma árvore).
    for (const r of this._group()) {
      if (r !== this) r.checked = false;
    }
    this.checked = true;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { checked: true, value: this.getAttr('value') },
      }),
    );
    // Two-way binding do Angular: [(checked)] = [checked] + (checkedChange).
    this.dispatchEvent(
      new CustomEvent('checkedChange', {
        bubbles: true,
        composed: true,
        detail: { checked: true, value: this.getAttr('value') },
      }),
    );
  }

  /** Estado marcado inicial (para form.reset() restaurar o grupo). */
  private _initialChecked = false;
  private _initialCheckedCaptured = false;

  protected override connectedCallback(): void {
    if (!this._initialCheckedCaptured) {
      this._initialCheckedCaptured = true;
      this._initialChecked = this.checked;
    }
    super.connectedCallback();
  }

  /** form.reset(): restaura o estado marcado inicial do grupo. */
  override formResetCallback(): void {
    this.checked = this._initialChecked;
    this.updateFormValue();
  }
}

export function defineFxRadio(): typeof FxRadio {
  return defineElement('fx-radio', FxRadio);
}
