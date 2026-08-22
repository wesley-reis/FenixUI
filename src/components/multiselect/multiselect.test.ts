import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

const opts =
  '<option value="a">Alpha</option><option value="b">Beta</option><option value="c">Gama</option>';

describe('fx-multiselect', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é registrado e renderiza opções do light DOM', () => {
    expect(customElements.get('fx-multiselect')).toBeTruthy();
    const el = mount(`<fx-multiselect>${opts}</fx-multiselect>`);
    expect(el.shadowRoot!.querySelectorAll('.opt').length).toBe(3);
  });

  it('seleciona múltiplos valores e emite change com array', () => {
    const el = mount(`<fx-multiselect>${opts}</fx-multiselect>`) as any;
    const received: unknown[] = [];
    el.addEventListener('change', (e: Event) => received.push((e as CustomEvent).detail.values));
    const shadow = el.shadowRoot as ShadowRoot;
    const optButtons = shadow.querySelectorAll<HTMLElement>('.opt');
    optButtons.forEach((o) => o.click());
    expect(el.values).toEqual(['a', 'b', 'c']);
    expect(received.at(-1)).toEqual(['a', 'b', 'c']);
    // chips visíveis
    expect(el.shadowRoot.querySelectorAll('.chip').length).toBe(3);
  });

  it('remove item individual pelo × do chip', () => {
    const el = mount(`<fx-multiselect values="a,b">${opts}</fx-multiselect>`) as any;
    expect(el.values).toEqual(['a', 'b']);
    (el.shadowRoot.querySelector('.chip__x') as HTMLElement).click();
    expect(el.values).toEqual(['b']);
  });

  it('clearable limpa tudo e emite values vazio', () => {
    const el = mount(`<fx-multiselect clearable values="a">${opts}</fx-multiselect>`) as any;
    let detail: any;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    (el.shadowRoot.querySelector('.clear') as HTMLElement).click();
    expect(el.values).toEqual([]);
    expect(detail.values).toEqual([]);
  });

  it('searchable filtra opções e mostra no-results', () => {
    const el = mount(
      `<fx-multiselect searchable no-results="Nada aqui">${opts}</fx-multiselect>`,
    ) as any;
    const shadow = () => el.shadowRoot as ShadowRoot;
    let search = shadow().querySelector('.search') as HTMLInputElement;
    search.value = 'bet';
    search.dispatchEvent(new Event('input'));
    const visible = shadow().querySelectorAll('.opt');
    expect(visible.length).toBe(1);
    expect(visible[0].textContent?.trim()).toBe('Beta');
    // Re-consulta: o campo é recriado a cada render.
    search = shadow().querySelector('.search') as HTMLInputElement;
    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    expect(shadow().querySelector('.empty')?.textContent).toContain('Nada aqui');
  });

  it('abre/fecha o painel com o trigger e clique fora', () => {
    const el = mount(`<fx-multiselect>${opts}</fx-multiselect>`) as any;
    (el.shadowRoot.querySelector('.trigger') as HTMLElement).click();
    expect(el.hasAttribute('open')).toBe(true);
    const panel = el.shadowRoot.querySelector('.panel') as HTMLElement;
    expect(getComputedStyle(panel).display).not.toBe('none');
    document.body.click();
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('clearable mostra contador e "Limpar tudo" no cabeçalho do painel', () => {
    const el = mount(`<fx-multiselect clearable values="a,b">${opts}</fx-multiselect>`) as any;
    (el.shadowRoot.querySelector('.trigger') as HTMLElement).click();
    const header = el.shadowRoot.querySelector('.panel-header') as HTMLElement;
    expect(header.textContent).toContain('2 selecionados');
    expect(header.textContent).toContain('Limpar tudo');
    (header.querySelector('.clear-all') as HTMLElement).click();
    expect(el.values).toEqual([]);
    // Painel permanece aberto (comportamento PrimeVue) para nova seleção.
    expect(el.hasAttribute('open')).toBe(true);
  });
});
