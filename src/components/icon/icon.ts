import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';
import { FENIX_ICON_BASE_CSS, isFenixIconName } from '../../icons/base-css';
import { loadFenixIconsFont } from '../../icons/font';

/**
 * <fx-icon> — Glifo da Fenix Icons com AUTOCOMPLETE no editor.
 *
 * Por que existe: a forma antiga (`<i class="fx-icon fx-icon-home">`) é CSS
 * puro — o TypeScript não valida nem sugere nada enquanto você digita, e o
 * auto-import só injeta o import. Com o elemento, o atributo `name` é tipado
 * como `FenixIconName`, então Volar/vue-tsc, React e TSX listam os +4.000
 * glifos válidos (e o hover mostra a assinatura do atributo).
 *
 * Atributos:
 *  - name  → nome do glifo (ex.: `home`); texto livre/emoji também funciona
 *  - size  → sm | md | lg | xl (default: 1em, herda o texto ao redor)
 *  - label → nome acessível; sem label o ícone é aria-hidden (decorativo)
 *  - fill  → variante preenchida
 *  - bold  → traço mais pesado
 *
 * O glifo sai por LIGADURA (o nome vira o conteúdo de texto com a
 * font-family de ícones) — por isso funciona dentro do Shadow DOM, onde as
 * classes `fx-icon-<nome>` do documento não atravessam a fronteira.
 *
 * Tamanho via CSS: --fx-icon-size (-sm/-md/-lg/-xl).
 */
export class FxIcon extends FxElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      line-height: 1;
      color: currentColor;
      font-size: var(--fx-icon-size, 1em);
    }
    :host([size='sm']) { font-size: var(--fx-icon-size-sm, 16px); }
    :host([size='md']) { font-size: var(--fx-icon-size-md, 20px); }
    :host([size='lg']) { font-size: var(--fx-icon-size-lg, 24px); }
    :host([size='xl']) { font-size: var(--fx-icon-size-xl, 32px); }
    :host([hidden]) { display: none; }
    .icon { display: inline-block; }
    /* Variantes da fonte (FILL/wght): vencem a classe base .fx-icon. */
    :host([fill]) .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    :host([bold]) .icon { font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24; }
    ${FENIX_ICON_BASE_CSS}
  `;

  static override get observedAttributes(): string[] {
    return ['name', 'size', 'label', 'fill', 'bold'];
  }

  /** Nome do glifo (ou texto livre/emoji). */
  get name(): string {
    return this.getAttr('name');
  }
  set name(value: string) {
    this.setAttribute('name', value);
  }

  /** Tamanho: '' (herda 1em) | 'sm' | 'md' | 'lg' | 'xl'. */
  get size(): string {
    return this.getAttr('size');
  }
  set size(value: string) {
    if (value) this.setAttribute('size', value);
    else this.removeAttribute('size');
  }

  /** Nome acessível; vazio = ícone decorativo (aria-hidden). */
  get label(): string {
    return this.getAttr('label');
  }
  set label(value: string) {
    if (value) this.setAttribute('label', value);
    else this.removeAttribute('label');
  }

  protected override connectedCallback(): void {
    // O glifo depende do @font-face: garante o CSS leve (sem as 4k classes).
    loadFenixIconsFont();
    super.connectedCallback();
  }

  protected override render(): void {
    const name = this.getAttr('name').trim();
    const label = this.getAttr('label').trim();
    const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
    if (!name) {
      this.setTemplate(`<span class="icon" part="icon" ${a11y}></span>`);
      return;
    }
    // Nome válido → ligadura (glifo). Emoji/texto livre → texto puro.
    const inner = isFenixIconName(name)
      ? `<i class="icon fx-icon" part="icon" ${a11y}>${esc(name)}</i>`
      : `<span class="icon" part="icon" ${a11y}>${esc(name)}</span>`;
    this.setTemplate(inner);
  }
}

export function defineFxIcon(): typeof FxIcon {
  return defineElement('fx-icon', FxIcon);
}
