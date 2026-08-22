import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(attrs = ''): HTMLElement {
  const el = document.createElement('fx-button');
  if (attrs) {
    for (const attr of attrs.split(' ')) {
      const [name, value] = attr.includes('=') ? attr.split('=') : [attr, undefined];
      el.setAttribute(name, value ?? '');
    }
  }
  el.innerHTML = 'Salvar';
  document.body.appendChild(el);
  return el;
}

const bodies = () => document.body.querySelectorAll('fx-button');

describe('fx-button', () => {
  beforeEach(() => {
    bodies().forEach((el) => el.remove());
  });

  it('é um Custom Element registrado', () => {
    expect(customElements.get('fx-button')).toBeTruthy();
  });

  it('renderiza um <button> interno com slot default para o rótulo', () => {
    const el = mount();
    const btn = el.shadowRoot!.querySelector('button')!;
    // jsdom não projeta light DOM em <slot>; validamos slot + light DOM separadamente.
    expect(btn.querySelector('.btn__label > slot')).toBeTruthy();
    expect(el.textContent).toContain('Salvar');
  });

  it('aplica variantes via atributo', () => {
    const el = mount('variant=danger');
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(el.getAttribute('variant')).toBe('danger');
    expect(btn.className).toContain('btn');
  });

  it('propriedade disabled reflete para o botão interno', () => {
    const el = mount('');
    expect((el as any).disabled).toBe(false);
    (el as any).disabled = true;
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.shadowRoot!.querySelector('button')!.hasAttribute('disabled')).toBe(true);
  });

  it('loading renderiza spinner e desabilita o botão', () => {
    const el = mount('loading');
    expect(el.shadowRoot!.querySelector('.btn__spinner')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('button')!.hasAttribute('aria-busy')).toBe(true);
    expect(el.shadowRoot!.querySelector('button')!.hasAttribute('disabled')).toBe(true);
  });

  it('esconde o container do ícone quando o slot icon está vazio (centralização)', () => {
    const el = mount();
    const iconWrap = el.shadowRoot!.querySelector('.btn__icon')!;
    expect(iconWrap.hasAttribute('hidden')).toBe(true);
  });

  it('dispara evento de clique no host (composed)', () => {
    const el = mount();
    let clicked = 0;
    el.addEventListener('click', () => clicked++);
    el.shadowRoot!.querySelector('button')!.click();
    expect(clicked).toBe(1);
  });
});