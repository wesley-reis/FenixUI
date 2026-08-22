import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

const optionsHtml =
  '<option value="a">Opção A</option><option value="b">Opção B</option>';

describe('fx-select', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é um Custom Element registrado', () => {
    expect(customElements.get('fx-select')).toBeTruthy();
  });

  it('espelha as <option> do light DOM no painel', () => {
    const el = mount(`<fx-select class="fx-select-host">${optionsHtml}</fx-select>`);
    const opts = el.shadowRoot!.querySelectorAll('.opt');
    expect(opts.length).toBe(2);
    expect(opts[0].textContent).toBe('Opção A');
  });

  it('reflete atributo value na opção selecionada (aria-selected)', () => {
    const el = mount(`<fx-select class="fx-select-host" value="b">${optionsHtml}</fx-select>`);
    const sel = el.shadowRoot!.querySelector('.opt[aria-selected="true"]')!;
    expect(sel.getAttribute('data-value')).toBe('b');
  });

  it('mostra o rótulo selecionado no trigger', () => {
    const el = mount(`<fx-select class="fx-select-host" value="b">${optionsHtml}</fx-select>`);
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toBe('Opção B');
  });

  it('abre o dropdown, escolhe opção e emite change composto', () => {
    const el = mount(`<fx-select class="fx-select-host">${optionsHtml}</fx-select>`) as any;
    let received = '';
    el.addEventListener('change', (e: Event) => {
      received = (e as CustomEvent).detail?.value ?? '';
    });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('open')).toBe(true);
    // re-consultar após re-render do open
    (el.shadowRoot.querySelector('.opt[data-value="a"]') as HTMLElement)!.click();
    expect(received).toBe('a');     // evento atravessou o Shadow DOM
    expect(el.value).toBe('a');      // refletido no host
    expect(el.hasAttribute('open')).toBe(false); // fechou após escolher
  });

  it('placeholder aparece quando nada está selecionado', () => {
    const el = mount(
      `<fx-select class="fx-select-host" placeholder="Escolha…">${optionsHtml}</fx-select>`,
    );
    expect(el.shadowRoot!.querySelector('.placeholder')!.textContent).toBe('Escolha…');
  });

  it('clearable: × limpa e emite change com valor vazio', () => {
    const el = mount(`<fx-select class="fx-select-host" clearable value="a">${optionsHtml}</fx-select>`) as any;
    let received: string | null = null;
    el.addEventListener('change', (e: Event) => { received = (e as CustomEvent).detail.value; });
    const clear = el.shadowRoot.querySelector('.clear') as HTMLElement;
    expect(clear).toBeTruthy();
    clear.click();
    expect(received).toBe('');
    expect(el.value).toBe('');
  });

  it('searchable: filtra opções ao digitar', () => {
    const el = mount(`<fx-select class="fx-select-host" searchable>${optionsHtml}</fx-select>`) as any;
    el.shadowRoot.querySelector('.trigger')!.click();
    const input = el.shadowRoot.querySelector('.search') as HTMLInputElement;
    input.value = 'B';
    input.dispatchEvent(new Event('input'));
    const opts = el.shadowRoot.querySelectorAll('.opt');
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toBe('Opção B');
  });

  it('disabled não abre o dropdown', () => {
    const el = mount(`<fx-select class="fx-select-host" disabled>${optionsHtml}</fx-select>`) as any;
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('open')).toBe(false);
  });
});
