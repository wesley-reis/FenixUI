import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './index';
import { __resetFenixIconsFontInjection } from '../../icons/font';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

describe('fx-icon', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.getElementById('fenix-icons-font')?.remove();
    __resetFenixIconsFontInjection();
  });

  it('registra o elemento', () => {
    expect(customElements.get('fx-icon')).toBeDefined();
  });

  it('renderiza o glifo por ligadura (o nome vira o conteúdo)', () => {
    const el = mount('<fx-icon name="home"></fx-icon>');
    const icon = el.shadowRoot!.querySelector('.icon')!;
    expect(icon.tagName).toBe('I');
    expect(icon.classList.contains('fx-icon')).toBe(true);
    expect(icon.textContent).toBe('home');
  });

  it('texto livre/emoji sai como texto puro (sem a fonte de ícones)', () => {
    const el = mount('<fx-icon name="⚠️"></fx-icon>');
    const icon = el.shadowRoot!.querySelector('.icon')!;
    expect(icon.tagName).toBe('SPAN');
    expect(icon.classList.contains('fx-icon')).toBe(false);
    expect(icon.textContent).toBe('⚠️');
  });

  it('a11y: sem label é decorativo; com label vira role=img', () => {
    const deco = mount('<fx-icon name="home"></fx-icon>');
    expect(deco.shadowRoot!.querySelector('.icon')!.getAttribute('aria-hidden')).toBe('true');

    const labelled = mount('<fx-icon name="home" label="Início"></fx-icon>');
    const icon = labelled.shadowRoot!.querySelector('.icon')!;
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Início');
  });

  it('observa name/size/label/fill/bold e re-renderiza', () => {
    const observed = (customElements.get('fx-icon') as unknown as { observedAttributes: string[] })
      .observedAttributes;
    expect(observed).toEqual(expect.arrayContaining(['name', 'size', 'label', 'fill', 'bold']));
    const el = mount('<fx-icon name="home"></fx-icon>');
    el.setAttribute('name', 'settings');
    expect(el.shadowRoot!.querySelector('.icon')!.textContent).toBe('settings');
  });

  it('size e as variantes usam tokens de CSS', () => {
    const el = mount('<fx-icon name="home" size="lg" fill bold></fx-icon>');
    const css = (el.shadowRoot!.querySelector('style')?.textContent ?? '').replace(/\s+/g, ' ');
    expect(css).toContain(":host([size='lg']) { font-size: var(--fx-icon-size-lg, 24px); }");
    expect(css).toContain(":host([fill]) .icon { font-variation-settings: 'FILL' 1");
    expect(css).toContain(":host([bold]) .icon { font-variation-settings: 'FILL' 0, 'wght' 600");
  });

  it('carrega só o @font-face leve ao conectar (sem as classes por ícone)', () => {
    mount('<fx-icon name="home"></fx-icon>');
    const style = document.getElementById('fenix-icons-font');
    expect(style).toBeTruthy();
    const css = style!.textContent ?? '';
    expect(css).toContain('@font-face');
    expect(css).toContain('.fx-icon {');
    // As classes fx-icon-<nome> não atravessam o shadow root: não devem vir.
    expect(css).not.toContain('.fx-icon-home::before');
  });

  it('propriedades imperativas name/size/label', () => {
    const el = mount('<fx-icon></fx-icon>') as HTMLElement & {
      name: string;
      size: string;
      label: string;
    };
    el.name = 'home';
    el.size = 'lg';
    el.label = 'Início';
    expect(el.getAttribute('name')).toBe('home');
    expect(el.getAttribute('size')).toBe('lg');
    expect(el.getAttribute('label')).toBe('Início');
    el.size = '';
    expect(el.hasAttribute('size')).toBe(false);
  });
});
