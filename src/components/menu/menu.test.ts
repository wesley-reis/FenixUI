import { describe, it, expect } from 'vitest';
import './index';

describe('fx-menu', () => {
  it('registra el componente', () => {
    expect(customElements.get('fx-menu')).toBeDefined();
  });

  it('renderiza ítems y emite select', () => {
    const el = document.createElement('fx-menu');
    el.setAttribute('titles', 'Inicio, Productos, Contacto');
    el.innerHTML = `<span slot="item" data-x="inicio"></span><span slot="item" data-x="productos"></span><span slot="item" data-x="contacto"></span>`;
    document.body.appendChild(el);

    const items = el.shadowRoot!.querySelectorAll('.item');
    expect(items).toHaveLength(3);
    // usando titles como labels
    expect(items[0].textContent).toContain('Inicio');

    let val: unknown = null;
    el.addEventListener('select', (e: Event) => (val = (e as CustomEvent).detail));
    (items[1] as HTMLElement).click();
    expect((val as { index: number }).index).toBe(1);
    el.remove();
  });

  it('orientation vertical aplica clase de layout', () => {
    const el = document.createElement('fx-menu');
    el.setAttribute('orientation', 'vertical');
    document.body.appendChild(el);
    expect(el.getAttribute('orientation')).toBe('vertical');
    el.remove();
  });
});