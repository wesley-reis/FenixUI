import { describe, it, expect } from 'vitest';
import './index';

describe('fx-carousel', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-carousel')).toBeDefined();
  });

  it('renderiza slides e navega com setas', () => {
    const el = document.createElement('fx-carousel');
    el.setAttribute('show-arrows', '');
    el.setAttribute('show-indicators', '');
    el.innerHTML = `
      <div slot="slide">Slide 1</div>
      <div slot="slide">Slide 2</div>
      <div slot="slide">Slide 3</div>`;
    document.body.appendChild(el);

    expect(el.slideCount).toBe(3);
    expect(el.active).toBe(0);
    expect(el.shadowRoot!.querySelectorAll('.slide')).toHaveLength(3);

    let idx = -1;
    el.addEventListener('change', (e: Event) => (idx = (e as CustomEvent).detail.index));

    (el.shadowRoot!.querySelector('.arrow.next') as HTMLElement).click();
    expect(el.active).toBe(1);
    expect(idx).toBe(1);
    (el.shadowRoot!.querySelector('.arrow.prev') as HTMLElement).click();
    expect(el.active).toBe(0);
    el.remove();
  });

  it('loop volta ao início ao avançar do último', () => {
    const el = document.createElement('fx-carousel');
    el.setAttribute('loop', '');
    el.innerHTML = `<div slot="slide">A</div><div slot="slide">B</div>`;
    document.body.appendChild(el);
    el.setAttribute('active', '1');
    el.next();
    expect(el.active).toBe(0); // loop
    el.remove();
  });

  it('indicadores navegam direto para o slide', () => {
    const el = document.createElement('fx-carousel');
    el.setAttribute('show-indicators', '');
    el.innerHTML = `<div slot="slide">A</div><div slot="slide">B</div><div slot="slide">C</div>`;
    document.body.appendChild(el);
    const dot2 = el.shadowRoot!.querySelector('.dot[data-i="2"]') as HTMLElement;
    dot2.click();
    expect(el.active).toBe(2);
    el.remove();
  });
});