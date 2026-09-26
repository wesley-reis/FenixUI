import { describe, it, expect, beforeEach } from 'vitest';
import './input/index';
import './textarea/index';
import './autocomplete/index';
import './select/index';
import './multiselect/index';
import './datepicker/index';
import './button/index';
import './fileupload/index';
import './toggle-button-group/index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

/** Recupera o CSS injetado no Shadow DOM (whitespace normalizado). */
function shadowCss(el: HTMLElement): string {
  const style = el.shadowRoot?.querySelector('style');
  return (style?.textContent ?? '').replace(/\s+/g, ' ');
}

/**
 * Contrato de altura: todos os controles de linha única renderizam EXATAMENTE
 * no token --fx-size-* (sm 32 / md 40 / lg 48) — igual para todos os tamanhos
 * e igual para input, select, calendário (datepicker), botão etc.
 *
 * Garantia: line-height fixo + padding vertical dentro do orçamento do token,
 * para que o min-height (e não o padding) governe a caixa.
 */
describe('alturas padronizadas pelos tokens size', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  /** Controles de linha única com altura = token exato. */
  const SINGLE_LINE = [
    'fx-input',
    'fx-autocomplete',
    'fx-select',
    'fx-multiselect',
    'fx-datepicker',
    'fx-button',
    'fx-fileupload',
    'fx-toggle-button-group',
  ];

  it.each(SINGLE_LINE)('%s usa min-height nos tokens --fx-size-sm/md/lg', (tag) => {
    const css = shadowCss(mount(`<${tag}></${tag}>`));
    expect(css).toContain('min-height: var(--fx-size-md)');
    expect(css).toContain('min-height: var(--fx-size-sm)');
    expect(css).toContain('min-height: var(--fx-size-lg)');
  });

  it.each([...SINGLE_LINE, 'fx-textarea'])(
    '%s fixa line-height (herança da página não estoura a altura do token)',
    (tag) => {
      const css = shadowCss(mount(`<${tag}></${tag}>`));
      expect(css).toContain('line-height: var(--fx-font-line-height)');
    },
  );

  it.each(SINGLE_LINE)(
    '%s limita o padding vertical da caixa a xs/sm (orçamento do token)',
    (tag) => {
      const css = shadowCss(mount(`<${tag}></${tag}>`));
      // Regra base do controle (.field/.trigger/.btn/.option) nunca cresce
      // verticalmente além do orçamento: senão o min-height seria estourado.
      expect(css).toMatch(/\.(field|trigger|btn|option) \{[^}]*padding: var\(--fx-space-(xs|sm)\) /);
    },
  );

  it.each(['fx-input', 'fx-textarea', 'fx-autocomplete', 'fx-button', 'fx-fileupload', 'fx-toggle-button-group'])(
    '%s no size sm usa padding vertical xs (caixa = 32px)',
    (tag) => {
      const css = shadowCss(mount(`<${tag}></${tag}>`));
      expect(css).toMatch(
        new RegExp(`:host\\(\\[size='sm'\\]\\) \\.(field|btn|option) \\{[^}]*padding: var\\(--fx-space-xs\\)`),
      );
    },
  );

  it('fx-datepicker não fixa altura em px — segue os tokens do preset', () => {
    const css = shadowCss(mount('<fx-datepicker></fx-datepicker>'));
    expect(css).not.toContain('min-height: 32px');
    expect(css).not.toContain('min-height: 40px');
    expect(css).not.toContain('min-height: 48px');
    expect(css).toContain('min-height: var(--fx-size-md)');
  });
});
