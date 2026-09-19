import { describe, it, expect, beforeEach } from 'vitest';
import './input/index';
import './textarea/index';
import './autocomplete/index';
import './select/index';
import './multiselect/index';
import './datepicker/index';
import './fileupload/index';
import './floatlabel/index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

/** Recupera o CSS injetado no Shadow DOM do componente (whitespace normalizado). */
function shadowCss(el: HTMLElement): string {
  const style = el.shadowRoot?.querySelector('style');
  return (style?.textContent ?? '').replace(/\s+/g, ' ');
}

describe('form full width (opt-in)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const CASES: Array<[string, RegExp]> = [
    ['fx-input', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
    ['fx-textarea', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
    ['fx-autocomplete', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
    ['fx-select', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
    ['fx-multiselect', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
    ['fx-datepicker', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
    ['fx-fileupload', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
    ['fx-floatlabel', /:host\(\[full\]\) \{ display: block; width: 100%; \}/],
  ];

  it.each(CASES)('%s expõe CSS full (host block + width 100%)', (tag, re) => {
    const el = mount(`<${tag}></${tag}>`) as unknown as HTMLElement;
    expect(shadowCss(el)).toMatch(re);
  });

  it('fx-input full estica o campo interno (CSS width 100% no .field)', () => {
    const el = mount('<fx-input full></fx-input>') as unknown as HTMLElement;
    expect(shadowCss(el)).toMatch(/:host\(\[full\]\) \.field \{ width: 100%; \}/);
  });

  it('fx-input clearable expõe part="wrap" (não trava largura via ::part)', () => {
    const el = mount('<fx-input clearable full></fx-input>') as unknown as HTMLElement;
    const wrap = el.shadowRoot!.querySelector('[part="wrap"]');
    expect(wrap).toBeTruthy();
    expect(shadowCss(el)).toMatch(/:host\(\[full\]\) \.wrap \{ display: flex; width: 100%; \}/);
    expect(shadowCss(el)).toMatch(/:host\(\[clearable\]\[full\]\) \.field \{ flex: 1 1 auto; \}/);
  });

  it('fx-select full remove min-width do trigger para permitir layout estreito', () => {
    const el = mount('<fx-select full></fx-select>') as unknown as HTMLElement;
    expect(shadowCss(el)).toMatch(/:host\(\[full\]\) \.trigger \{ width: 100%; min-width: 0; \}/);
  });

  it('fx-multiselect full sobrepõe width fixa do trigger', () => {
    const el = mount('<fx-multiselect full></fx-multiselect>') as unknown as HTMLElement;
    expect(shadowCss(el)).toMatch(/:host\(\[full\]\) \.trigger \{ width: 100%; \}/);
  });

  it('sem full, o default (largura fixa) é preservado — sem breaking change', () => {
    const input = mount('<fx-input></fx-input>') as unknown as HTMLElement;
    expect(shadowCss(input)).toMatch(/\.field[\s\S]*?width: 260px/);
    const multi = mount('<fx-multiselect></fx-multiselect>') as unknown as HTMLElement;
    expect(shadowCss(multi)).toMatch(/\.trigger[\s\S]*?width: 240px/);
  });

  it('fx-autocomplete estiliza por .field (não mais por seletor de elemento)', () => {
    const el = mount('<fx-autocomplete></fx-autocomplete>') as unknown as HTMLElement;
    const css = shadowCss(el);
    expect(css).toMatch(/\.field \{/);
    expect(css).toMatch(/:host\(\[full\]\) \.field \{ width: 100%; \}/);
  });

  it('fx-datepicker full descarta min-width para layout estreito', () => {
    const el = mount('<fx-datepicker full></fx-datepicker>') as unknown as HTMLElement;
    expect(shadowCss(el)).toMatch(/:host\(\[full\]\) \.field \{ min-width: 0; \}/);
  });

  it('fx-floatlabel full é PROPAGADO para o controle interno (o campo estica junto)', () => {
    const el = mount(
      '<fx-floatlabel full><fx-input></fx-input><label>Nome</label></fx-floatlabel>',
    ) as unknown as HTMLElement;
    const control = el.querySelector('fx-input');
    expect(control!.hasAttribute('full')).toBe(true);
    expect(shadowCss(control as unknown as HTMLElement)).toMatch(/:host\(\[full\]\) \.field \{ width: 100%; \}/);
  });

  it('fx-floatlabel sem full não injeta full no controle; ao adicionar em runtime, propaga (playground)', () => {
    const el = mount(
      '<fx-floatlabel><fx-input></fx-input><label>Nome</label></fx-floatlabel>',
    ) as unknown as HTMLElement;
    const control = el.querySelector('fx-input');
    expect(control!.hasAttribute('full')).toBe(false);
    // Toggle do playground: setAttribute dispara observedAttributes -> re-render -> applyFull.
    el.setAttribute('full', '');
    expect(control!.hasAttribute('full')).toBe(true);
    el.removeAttribute('full');
    expect(control!.hasAttribute('full')).toBe(false);
  });

  it('floatlabel variant="in" + ícone: label placeholder começa DEPOIS do glifo (icon-indent)', () => {
    const el = mount(
      '<fx-floatlabel variant="in"><fx-input icon="lock" type="password"></fx-input><label>Senha</label></fx-floatlabel>',
    ) as unknown as HTMLElement;
    const flabel = el.shadowRoot!.querySelector('.flabel')!;
    expect(flabel.classList.contains('icon-indent')).toBe(true);
    // CSS: offset após o ícone quando placeholder; volta ao padrão quando sobe (active).
    const css = shadowCss(el);
    expect(css).toMatch(/:host\(\[variant="in"\]\) \.flabel\.icon-indent \{ left: calc\(/);
    expect(css).toMatch(/:host\(\[variant="in"\]\[active\]\) \.flabel\.icon-indent \{ left: var\(--fx-space-md, 12px\); \}/);
  });

  it('floatlabel variant="in" SEM ícone (ou ícone à direita) não indenta a label', () => {
    const plain = mount(
      '<fx-floatlabel variant="in"><fx-input></fx-input><label>Senha</label></fx-floatlabel>',
    ) as unknown as HTMLElement;
    expect(plain.shadowRoot!.querySelector('.flabel')!.classList.contains('icon-indent')).toBe(false);

    const right = mount(
      '<fx-floatlabel variant="in"><fx-input icon="lock" icon-pos="right" type="password"></fx-input><label>Senha</label></fx-floatlabel>',
    ) as unknown as HTMLElement;
    expect(right.shadowRoot!.querySelector('.flabel')!.classList.contains('icon-indent')).toBe(false);
  });

  it('floatlabel: ícone adicionado em runtime indenta a label (observer icon/icon-pos)', async () => {
    const el = mount(
      '<fx-floatlabel variant="in"><fx-input></fx-input><label>Senha</label></fx-floatlabel>',
    ) as unknown as HTMLElement;
    const control = el.querySelector('fx-input')!;
    const flabel = el.shadowRoot!.querySelector('.flabel')!;
    expect(flabel.classList.contains('icon-indent')).toBe(false);
    // O MutationObserver dispara em microtask.
    control.setAttribute('icon', 'lock');
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(flabel.classList.contains('icon-indent')).toBe(true);
    control.setAttribute('icon-pos', 'right');
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(flabel.classList.contains('icon-indent')).toBe(false);
  });
});

describe('ícones nos componentes (attr icon + slot icon)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('fx-input icon="home" renderiza glifo Fenix Icons por LIGADURA no Shadow DOM', () => {
    const el = mount('<fx-input icon="home"></fx-input>') as unknown as HTMLElement;
    const glyph = el.shadowRoot!.querySelector('.field-icon .fx-icon') as HTMLElement;
    expect(glyph).toBeTruthy();
    // Ligadura: o nome do ícone é o CONTEÚDO (regras ::before do documento
    // não atravessam o shadow root — só o @font-face).
    expect(glyph.textContent).toBe('home');
  });

  it('fx-input icon-pos="right" renderiza o ícone após o campo', () => {
    const el = mount('<fx-input icon="search" icon-pos="right"></fx-input>') as unknown as HTMLElement;
    const box = el.shadowRoot!.querySelector('.field-icon')!;
    expect(box.classList.contains('icon-right')).toBe(true);
    const children = Array.from(box.children);
    expect(children[0].tagName).toBe('INPUT');
    expect((children[1] as HTMLElement).textContent).toBe('search');
  });

  it('ícone fica DENTRO do campo (position absolute + padding) e tamanho via --fx-input-icon-size', () => {
    const el = mount('<fx-input icon="search"></fx-input>') as unknown as HTMLElement;
    const css = shadowCss(el);
    expect(css).toMatch(/\.field-icon\.icon-left \.fx-icon, \.field-icon\.icon-left ::slotted\(\[slot='icon'\]\) \{ left: var\(--fx-space-md\); \}/);
    expect(css).toContain('--fx-input-icon-size, calc(var(--fx-font-size) + 6px)');
    expect(css).toMatch(/\.field-icon\.icon-left \.field \{ padding-left: calc\(var\(--fx-input-icon-size, calc\(var\(--fx-font-size\) \+ 6px\)\) \+ var\(--fx-space-md\) \+ var\(--fx-space-sm\)\); \}/);
  });

  it('fx-input sem icon não renderiza o wrapper de ícone', () => {
    const el = mount('<fx-input></fx-input>') as unknown as HTMLElement;
    expect(el.shadowRoot!.querySelector('.field-icon')).toBeNull();
  });

  it('slot icon vence o atributo icon (flexível para qualquer fx-icon)', () => {
    const el = mount(
      '<fx-input icon="home"><i slot="icon" class="fx-icon fx-icon-search"></i></fx-input>',
    ) as unknown as HTMLElement;
    // O slot fica dentro do wrapper; a ligadura do atributo NÃO é renderizada.
    expect(el.shadowRoot!.querySelector('.field-icon slot[name="icon"][part="icon"]')).toBeTruthy();
    expect(el.shadowRoot!.querySelectorAll('.field-icon .fx-icon').length).toBe(0);
  });

  it('fx-input com emoji no icon renderiza texto puro (sem classe de glifo)', () => {
    const el = mount('<fx-input icon="📎"></fx-input>') as unknown as HTMLElement;
    const glyph = el.shadowRoot!.querySelector('.field-icon .fx-icon');
    expect(glyph).toBeNull();
    expect(el.shadowRoot!.querySelector('.field-icon')!.textContent).toContain('📎');
  });

  it('fx-fileupload basic icon="upload_file" renderiza glifo por ligadura no botão', () => {
    const el = mount('<fx-fileupload icon="upload_file"></fx-fileupload>') as unknown as HTMLElement;
    const glyph = el.shadowRoot!.querySelector('.btn .icon .fx-icon') as HTMLElement;
    expect(glyph).toBeTruthy();
    expect(glyph.textContent).toBe('upload_file');
  });

  it('fx-fileupload advanced icon="upload_file" renderiza glifo por ligadura na dropzone', () => {
    const el = mount('<fx-fileupload mode="advanced" icon="upload_file"></fx-fileupload>') as unknown as HTMLElement;
    const glyph = el.shadowRoot!.querySelector('.drop .icon .fx-icon') as HTMLElement;
    expect(glyph).toBeTruthy();
    expect(glyph.textContent).toBe('upload_file');
  });

  it('helper fenixIconHtml: nome válido vira ligadura, texto livre é escapado', async () => {
    const { fenixIconHtml, isFenixIconName } = await import('../icons/base-css');
    expect(isFenixIconName('home')).toBe(true);
    expect(fenixIconHtml('home')).toBe('<i class="fx-icon" aria-hidden="true">home</i>');
    expect(fenixIconHtml('📎')).toBe('<span aria-hidden="true">📎</span>');
    expect(fenixIconHtml('<script>')).toBe('<span aria-hidden="true">&lt;script&gt;</span>');
  });
});

describe('form validation states (error / success)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  // fx-autocomplete agora tem CSS de validação (adicionado junto da doc).
  const VALIDATION_CASES: Array<[string, string]> = [
    ['fx-input', '.field'],
    ['fx-textarea', '.field'],
    ['fx-autocomplete', '.field'],
    ['fx-select', '.trigger'],
    ['fx-multiselect', '.trigger'],
    ['fx-datepicker', '.field'],
  ];

  it.each(VALIDATION_CASES)('%s tem CSS de validação para error/invalid e success/valid', (tag, inner) => {
    const el = mount(`<${tag}></${tag}>`) as unknown as HTMLElement;
    const css = shadowCss(el);
    expect(css).toContain(`:host([error]) ${inner}`);
    expect(css).toContain(`:host([invalid]) ${inner}`);
    expect(css).toContain(`:host([success]) ${inner}`);
    expect(css).toContain(`:host([valid]) ${inner}`);
  });

  it.each(VALIDATION_CASES)('%s observa error/success (toggle re-renderiza no playground e no submit)', (tag) => {
    const observed = (customElements.get(tag) as any).observedAttributes as string[];
    expect(observed).toContain('error');
    expect(observed).toContain('success');
  });

  it('fx-input error re-renderiza e pinta a borda de vermelho', () => {
    const el = mount('<fx-input placeholder="Nome"></fx-input>') as unknown as HTMLElement;
    el.setAttribute('error', '');
    // setAttribute dispara attributeChangedCallback → render; o input interno
    // precisa continuar existindo com o placeholder intacto.
    const field = el.shadowRoot!.querySelector('.field') as HTMLInputElement;
    expect(field).toBeTruthy();
    expect(field.getAttribute('placeholder')).toBe('Nome');
    expect(shadowCss(el)).toContain(':host([error]) .field');
  });

  it('fx-select error re-renderiza sem fechar quebrar o dropdown', () => {
    const el = mount('<fx-select placeholder="UF"><option value="sp">SP</option></fx-select>') as unknown as HTMLElement;
    el.setAttribute('error', '');
    expect(el.shadowRoot!.querySelector('.trigger')).toBeTruthy();
  });
});
