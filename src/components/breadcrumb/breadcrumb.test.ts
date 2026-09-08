import { describe, it, expect } from 'vitest';
import './index';

describe('fx-breadcrumb', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-breadcrumb')).toBeDefined();
  });

  it('renderiza itens com separador e último como current', () => {
    const el = document.createElement('fx-breadcrumb');
    el.innerHTML = `
      <a slot="item" href="/">Home</a>
      <a slot="item" href="/produtos">Produtos</a>
      <span slot="item">Detalhe</span>`;
    document.body.appendChild(el);
    const nav = el.shadowRoot!.querySelector('nav')!;
    const items = nav.querySelectorAll('[slot="item"]');
    expect(items).toHaveLength(3);
    // separadores ficam no nav (n-1), entre os itens
    const seps = nav.querySelectorAll('.sep');
    expect(seps).toHaveLength(2);
    expect(seps[0].textContent).toBe('/');
    // último item é aria-current=page
    expect(items[2].getAttribute('aria-current')).toBe('page');
    expect(items[0].getAttribute('aria-current')).toBe('false');
    el.remove();
  });

  it('separator customizado e tamanho', () => {
    const el = document.createElement('fx-breadcrumb');
    el.setAttribute('separator', '›');
    el.setAttribute('size', 'lg');
    el.innerHTML = `
      <span slot="item">A</span>
      <span slot="item">B</span>`;
    document.body.appendChild(el);
    const nav = el.shadowRoot!.querySelector('nav')!;
    const sep = nav.querySelector('.sep');
    expect(sep?.textContent).toBe('›');
    el.remove();
  });
});
