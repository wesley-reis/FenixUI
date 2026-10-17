import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './index';
import { FxEditor } from './editor';

function mount(html = '<fx-editor name="conteudo" value="&lt;p&gt;Olá &lt;strong&gt;mundo&lt;/strong&gt;&lt;/p&gt;"></fx-editor>'): FxEditor {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const el = wrap.firstElementChild as FxEditor;
  document.body.appendChild(wrap);
  return el;
}

const wait = (ms = 30): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('fx-editor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registra o componente e renderiza a toolbar', () => {
    const el = mount();
    expect(customElements.get('fx-editor')).toBeDefined();
    expect(el.shadowRoot?.querySelector('.content')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('.toolbar')).toBeTruthy();
    expect(el.shadowRoot?.querySelectorAll('.tb-btn').length).toBeGreaterThan(4);
  });

  it('aplica o value inicial e expõe HTML canônico', () => {
    const el = mount();
    expect(el.getText()).toBe('Olá mundo');
    expect(el.getHtml()).toContain('<strong>mundo</strong>');
  });

  it('value property sanitiza script/atributos perigosos', () => {
    const el = mount();
    el.value = '<p onclick="x()">Oi</p><script>alert(1)</script>';
    expect(el.getHtml()).toContain('Oi');
    expect(el.getHtml()).not.toContain('script');
    expect(el.getHtml()).not.toContain('onclick');
  });

  it('emite input/valueChange com detail sanitizado', async () => {
    const el = mount('<fx-editor></fx-editor>');
    let detail: { value: string; text: string } | null = null;
    el.addEventListener('input', (event) => {
      detail = (event as CustomEvent).detail;
    });
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    content.innerHTML = '<p>Oi <b>forte</b></p><script>alert(1)</script>';
    content.dispatchEvent(new Event('input', { bubbles: true }));
    await wait();
    expect(detail).toBeTruthy();
    expect(detail!.text).toContain('Oi forte');
    expect(detail!.value).toContain('<strong>forte</strong>');
    expect(detail!.value).not.toContain('script');
  });

  it('expõe name/value para integração com formulário', () => {
    const el = mount('<fx-editor name="conteudo" value="&lt;p&gt;Oi&lt;/p&gt;"></fx-editor>');
    expect(el.getAttribute('name')).toBe('conteudo');
    expect(el.value).toContain('<p>Oi</p>');
  });

  it('readonly desliga o contenteditable e esconde a toolbar', () => {
    const el = mount('<fx-editor readonly value="&lt;p&gt;Oi&lt;/p&gt;"></fx-editor>');
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    expect(content.getAttribute('contenteditable')).toBe('false');
    expect(el.shadowRoot!.querySelector<HTMLElement>('.toolbar')!.hidden).toBe(true);
  });

  it('placeholder aparece quando vazio', () => {
    const el = mount('<fx-editor placeholder="Escreva..." ></fx-editor>');
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    expect(content.classList.contains('is-empty')).toBe(true);
    expect(content.getAttribute('data-placeholder')).toBe('Escreva...');
  });

  it('source view aplica HTML sanitizado', () => {
    const el = mount();
    el.toggleSource();
    const source = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.source')!;
    source.value = '<p>Novo</p><script>alert(1)</script>';
    (el.shadowRoot!.querySelector('.source-apply') as HTMLButtonElement).click();
    expect(el.getHtml()).toContain('<p>Novo</p>');
    expect(el.getHtml()).not.toContain('script');
  });

  it('preserva tabela e grid no HTML salvo', () => {
    const el = mount();
    el.value = '<figure class="fx-table"><table><tr><td>A</td></tr></table></figure>';
    expect(el.getHtml()).toContain('<table>');
    expect(el.getHtml()).toContain('A');

    el.value = '<table class="fx-grid" data-cols="2"><tr><td>A</td><td>B</td></tr></table>';
    expect(el.getHtml()).toContain('role="presentation"');
    expect(el.getHtml()).toContain('data-cols="2"');
  });

  it('mescla e divide células pela API pública', () => {
    const el = mount();
    el.value =
      '<figure class="fx-table"><table><tbody>' +
      '<tr><td>A</td><td>B</td></tr>' +
      '<tr><td>C</td><td>D</td></tr>' +
      '</tbody></table></figure>';

    const table = el.shadowRoot!.querySelector<HTMLTableElement>('.content table')!;
    const range = document.createRange();
    range.setStart(table.rows[0].cells[0], 0);
    range.setEnd(table.rows[1].cells[1], table.rows[1].cells[1].childNodes.length);
    const fakeSelection = {
      rangeCount: 1,
      getRangeAt: () => range,
      removeAllRanges: () => undefined,
      addRange: () => undefined,
    } as unknown as Selection;
    const spy = vi.spyOn(document, 'getSelection').mockReturnValue(fakeSelection);

    try {
      expect(el.mergeCells()).toBe(true);
      expect(el.getHtml()).toContain('colspan="2"');
      expect(el.getHtml()).toContain('rowspan="2"');
      expect(table.rows[0].cells.length).toBe(1);

      range.selectNodeContents(table.rows[0].cells[0]);
      expect(el.splitCell()).toBe(true);
      expect(table.rows[0].cells.length).toBe(2);
      expect(table.rows[1].cells.length).toBe(2);
    } finally {
      spy.mockRestore();
    }
  });

  it('mostra handles de redimensionamento ao clicar na imagem', () => {
    const el = mount();
    el.value =
      '<figure class="fx-image" data-align="center" style="width:100%">' +
      '<img src="https://a.com/x.png" alt="X"></figure>';

    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const figure = content.querySelector<HTMLElement>('figure.fx-image')!;
    const overlay = el.shadowRoot!.querySelector<HTMLElement>('.media-overlay')!;
    const body = overlay.parentElement!;

    vi.spyOn(figure, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 20, width: 100, height: 50, right: 110, bottom: 70,
      x: 10, y: 20, toJSON: () => ({}),
    } as unknown as DOMRect);
    vi.spyOn(body, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200,
      x: 0, y: 0, toJSON: () => ({}),
    } as unknown as DOMRect);

    figure.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(overlay.hidden).toBe(false);
    expect(overlay.querySelectorAll('.media-handle').length).toBe(4);
    expect(overlay.querySelector('.media-delete')).toBeTruthy();
    expect(overlay.style.width).toBe('100px');
    expect(overlay.querySelector('.media-size')?.textContent).toContain('100');
  });

  it('exclui imagem pelo botão do overlay', () => {
    const el = mount();
    el.value =
      '<figure class="fx-image" data-align="center" style="width:100%">' +
      '<img src="https://a.com/x.png" alt="X"></figure>';
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const figure = content.querySelector<HTMLElement>('figure.fx-image')!;
    const overlay = el.shadowRoot!.querySelector<HTMLElement>('.media-overlay')!;
    const body = overlay.parentElement!;

    vi.spyOn(figure, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 20, width: 100, height: 50, right: 110, bottom: 70,
      x: 10, y: 20, toJSON: () => ({}),
    } as unknown as DOMRect);
    vi.spyOn(body, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200,
      x: 0, y: 0, toJSON: () => ({}),
    } as unknown as DOMRect);

    figure.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    (overlay.querySelector('.media-delete') as HTMLButtonElement).click();

    expect(el.getHtml()).not.toContain('<img');
    expect(overlay.hidden).toBe(true);
  });

  it('insere vídeo com alinhamento', async () => {
    const el = mount();
    el.openDialog('video');
    const body = el.shadowRoot!.querySelector<HTMLElement>('.dialog-body')!;
    (body.querySelector('[data-field="src"]') as HTMLInputElement).value =
      'https://www.youtube.com/watch?v=abc123';
    (body.querySelector('[data-field="align"]') as HTMLSelectElement).value = 'left';
    (body.querySelector('[data-field="width"]') as HTMLSelectElement).value = '50';
    (el.shadowRoot!.querySelector('.dialog-ok') as HTMLButtonElement).click();
    await wait(60);

    const html = el.getHtml();
    expect(html).toContain('fx-embed');
    expect(html).toContain('data-align="left"');
    expect(html).toMatch(/width:\s*50%/);
  });

  it('quick actions de vídeo alinham e excluem', () => {
    const el = mount();
    el.value =
      '<figure class="fx-video" data-align="center" style="width:100%">' +
      '<video controls src="https://a.com/v.mp4"></video></figure>';

    const figure = el.shadowRoot!.querySelector<HTMLElement>('.content figure.fx-video')!;
    expect(figure.querySelectorAll(':scope > .fx-media-quick').length).toBe(4);

    (figure.querySelector('.quick-left') as HTMLButtonElement).click();
    expect(figure.getAttribute('data-align')).toBe('left');
    expect(el.getHtml()).toContain('data-align="left"');

    (figure.querySelector('.quick-delete') as HTMLButtonElement).click();
    expect(el.getHtml()).not.toContain('<video');
  });

  it('mostra overlay do link e abre no target configurado', () => {
    const el = mount('<fx-editor value="&lt;p&gt;&lt;a href=&quot;https://a.com&quot; target=&quot;_blank&quot;&gt;A&lt;/a&gt;&lt;/p&gt;"></fx-editor>');
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const anchor = content.querySelector<HTMLAnchorElement>('a')!;
    const overlay = el.shadowRoot!.querySelector<HTMLElement>('.link-overlay')!;
    const body = overlay.parentElement!;

    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 10, width: 80, height: 18, right: 90, bottom: 28,
      x: 10, y: 10, toJSON: () => ({}),
    } as unknown as DOMRect);
    vi.spyOn(body, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200,
      x: 0, y: 0, toJSON: () => ({}),
    } as unknown as DOMRect);
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(overlay.hidden).toBe(false);

    (overlay.querySelector('[data-link-action="open"]') as HTMLButtonElement).click();
    expect(open).toHaveBeenCalledWith('https://a.com', '_blank', 'noopener,noreferrer');

    anchor.setAttribute('target', '_self');
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    (overlay.querySelector('[data-link-action="open"]') as HTMLButtonElement).click();
    expect(open).toHaveBeenLastCalledWith('https://a.com', '_self', undefined);
  });

  it('insere link novo pelo diálogo', async () => {
    const el = mount('<fx-editor></fx-editor>');
    el.value = '<p>Texto</p>';
    el.openDialog('link');

    const body = el.shadowRoot!.querySelector<HTMLElement>('.dialog-body')!;
    (body.querySelector('[data-field="url"]') as HTMLInputElement).value = 'https://novo.com';
    (body.querySelector('[data-field="text"]') as HTMLInputElement).value = 'Novo';
    (body.querySelector('[data-field="target"]') as HTMLSelectElement).value = '_self';
    (el.shadowRoot!.querySelector('.dialog-ok') as HTMLButtonElement).click();
    await wait(60);

    const html = el.getHtml();
    expect(html).toContain('href="https://novo.com"');
    expect(html).toContain('target="_self"');
    expect(html).toContain('Novo');
  });

  it('edita link existente sem criar outro', async () => {
    const el = mount('<fx-editor></fx-editor>');
    el.value = '<p><a href="https://old.com" target="_blank">Antigo</a></p>';
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const anchor = content.querySelector<HTMLAnchorElement>('a')!;
    const overlay = el.shadowRoot!.querySelector<HTMLElement>('.link-overlay')!;

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    (overlay.querySelector('[data-link-action="edit"]') as HTMLButtonElement).click();

    const body = el.shadowRoot!.querySelector<HTMLElement>('.dialog-body')!;
    const url = body.querySelector<HTMLInputElement>('[data-field="url"]')!;
    const target = body.querySelector<HTMLSelectElement>('[data-field="target"]')!;
    expect(url.value).toBe('https://old.com');
    expect(target.value).toBe('_blank');

    url.value = 'https://new.com';
    target.value = '_self';
    (el.shadowRoot!.querySelector('.dialog-ok') as HTMLButtonElement).click();
    await wait(60);

    expect(content.querySelectorAll('a').length).toBe(1);
    expect(anchor.getAttribute('href')).toBe('https://new.com');
    expect(anchor.getAttribute('target')).toBe('_self');
  });

  it('maxlength padrão e bloqueio de digitação acima do limite', () => {
    const el = mount('<fx-editor maxlength="5"><p>abcdef</p></fx-editor>');
    expect(el.maxlength).toBe(5);
    expect((mount('<fx-editor></fx-editor>') as FxEditor).maxlength).toBe(30000);
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const event = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: 'x',
      bubbles: true,
      cancelable: true,
    });
    content.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);

    el.maxlength = 0;
    expect(el.getAttribute('maxlength')).toBe('0');
    expect(el.maxlength).toBe(0);
    const allowed = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: 'x',
      bubbles: true,
      cancelable: true,
    });
    content.dispatchEvent(allowed);
    expect(allowed.defaultPrevented).toBe(false);
  });

  it('usa roving tabindex e abre/fecha o dialog de link', () => {
    const el = mount();
    const buttons = Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.tb-btn'));
    expect(buttons[0].getAttribute('tabindex')).toBe('0');
    expect(buttons[1].getAttribute('tabindex')).toBe('-1');

    buttons[1].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(buttons[1].getAttribute('tabindex')).toBe('0');
    expect(buttons[0].getAttribute('tabindex')).toBe('-1');

    el.openDialog('link');
    const backdrop = el.shadowRoot!.querySelector<HTMLElement>('.backdrop')!;
    expect(backdrop.hidden).toBe(false);
    expect(backdrop.querySelector('input')).toBeTruthy();

    (backdrop.querySelector('.dialog-ok') as HTMLButtonElement).click();
    expect(backdrop.hidden).toBe(true);
  });

  it('métodos públicos básicos funcionam', () => {
    const el = mount();
    el.clear();
    expect(el.getHtml()).toBe('');
    el.insertHTML('<h2>Título</h2>');
    expect(el.getHtml()).toContain('<h2>Título</h2>');
  });
});
