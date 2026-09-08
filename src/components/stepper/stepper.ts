import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-stepper> — Asistente de pasos (wizard) para flujos multi-etapa.
 *
 * Uso declarativo: cada hijo directo con el atributo `step` define un paso.
 * Uso imperativo: leer/escribir la propiedad `active` para navegar.
 *
 * Atributos: active (índice del paso activo), linear (solo avanzar en orden),
 * show-numbers (muestra el número en el indicador).
 * Slots: `header` (customiza el indicador de pasos), un slot por paso
 * (slot="step-0", slot="step-1", ...).
 *
 * Eventos (composed): `change` (detail: { index }) y `complete` al llegar al último.
 */
export class FxStepper extends FxElement {
  static override styles = css`
    :host { display: block; font-family: var(--fx-font-family); font-size: var(--fx-font-size); }
    :host([linear]) .step-num.activated { cursor: not-allowed; }

    .steps {
      display: flex;
      align-items: center;
      gap: var(--fx-space-md);
      flex-wrap: wrap;
      padding: var(--fx-space-md) var(--fx-space-lg);
    }
    .step {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-sm);
      padding: var(--fx-space-xs) var(--fx-space-md);
      border-radius: var(--fx-radius-full);
      color: var(--fx-text-muted);
      font-weight: 600;
      user-select: none;
      cursor: pointer;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing), color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .step.active { background: var(--fx-color-primary); color: #fff; }
    .step.done { color: var(--fx-color-primary); }
    .step[hidden] { display: none; }
    .num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; min-width: 24px;
      border: 1.5px solid currentColor;
      border-radius: var(--fx-radius-full);
      font-size: calc(var(--fx-font-size) - 2px);
      line-height: 1;
    }

    .panel { padding: var(--fx-space-lg) var(--fx-space-xl); min-height: 80px; }
    .actions {
      display: flex;
      justify-content: space-between;
      gap: var(--fx-space-sm);
      padding: var(--fx-space-md) var(--fx-space-lg);
      border-top: 1px solid var(--fx-border-default);
    }
    .nav-btn {
      font-family: var(--fx-font-family);
      font-size: calc(var(--fx-font-size) - 2px);
      padding: var(--fx-space-xs) var(--fx-space-lg);
      min-height: var(--fx-size-sm);
      border-radius: var(--fx-radius-sm);
      border: 1px solid var(--fx-border-default);
      background: var(--fx-surface-background);
      color: var(--fx-text-default);
      cursor: pointer;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .nav-btn:hover:not(:disabled) { background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.04)); }
    .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .nav-btn.primary {
      background: var(--fx-color-primary);
      border-color: var(--fx-color-primary);
      color: #fff;
    }
    .nav-btn.primary:hover:not(:disabled) { filter: brightness(0.92); background: var(--fx-color-primary); }
  `;

  static override get observedAttributes(): string[] {
    return ['active', 'linear', 'show-numbers'];
  }

  get stepCount(): number { return this._titles.length; }
  get active(): number {
    const n = Number(this.getAttr('active', '0'));
    return Math.min(this.stepCount - 1, Math.max(0, Number.isFinite(n) ? n : 0));
  }
  set active(v: number) {
    this.setAttribute('active', String(Math.min(this.stepCount - 1, Math.max(0, v))));
  }

  get isLast(): boolean { return this.active >= this.stepCount - 1; }

  /** Navega al paso (emite change). Con linear, solo permite avanzar de a uno. */
  goTo(index: number): void {
    const target = Math.min(this.stepCount - 1, Math.max(0, index));
    if (this.hasAttr('linear') && target > this.active + 1) return;
    this.active = target;
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: { index: this.active } }));
    if (this.isLast) {
      this.dispatchEvent(new CustomEvent('complete', { bubbles: true, composed: true }));
    }
  }

  next(): void { this.goTo(this.active + 1); }
  prev(): void { this.goTo(this.active - 1); }

  private _titles: string[] = [];
  private _panels: Element[] = [];

  protected override render(): void {
    this._panels = Array.from(this.children).filter((el) =>
      el.matches('[slot^="step-"]'),
    );
    this._titles = this._panels.map((p, i) =>
      p.getAttribute('step-title') || `Paso ${i + 1}`,
    );
    const active = Math.min(this.active, Math.max(0, this._titles.length - 1));

    const stepsHtml = this._titles
      .map((title, i) => {
        const state = i === active ? 'active' : i < active ? 'done' : '';
        // sem show-numbers: passos concluídos exibem ✓; com show-numbers: sempre número
        const marker = i < active && !this.hasAttr('show-numbers') ? '✓' : String(i + 1);
        return `<span class="step ${state}" part="step" data-i="${i}"><span class="num">${marker}</span>${esc(title)}</span>`;
      })
      .join('');

    const panelsHtml = this._panels
      .map((p, i) => `<section class="panel" part="panel" ${i === active ? '' : 'hidden'}>${p.innerHTML}</section>`)
      .join('');

    this.setTemplate(`
      <div class="steps" part="steps">${stepsHtml}</div>
      <div class="panel-wrap">${panelsHtml}</div>
      <div class="actions" part="actions">
        <button type="button" class="nav-btn prev" part="prev" ${active === 0 ? 'disabled' : ''}>Anterior</button>
        <button type="button" class="nav-btn primary next" part="next">${active === this._titles.length - 1 ? 'Concluir' : 'Próximo'}</button>
      </div>
    `);

    this._bindSteps();
  }

  private _bindSteps(): void {
    const steps = Array.from(this.root.querySelectorAll<HTMLElement>('.step'));
    steps.forEach((step) => {
      const i = Number(step.dataset.i);
      step.addEventListener('click', () => {
        if (this.hasAttr('linear') && i > this.active + 1) return;
        this.goTo(i);
      });
      step.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          e.preventDefault();
          this.goTo(i);
        }
      });
    });

    this.root.querySelector<HTMLElement>('.nav-btn.prev')?.addEventListener('click', () => this.prev());
    this.root.querySelector<HTMLElement>('.nav-btn.next')?.addEventListener('click', () => this.next());
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    if (this._titles.length === 0) this.render();
  }
}

export function defineFxStepper(): typeof FxStepper {
  return defineElement('fx-stepper', FxStepper);
}