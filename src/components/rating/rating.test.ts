import { describe, it, expect } from 'vitest';
import './index';

describe('fx-rating', () => {
  it('registra el componente', () => {
    expect(customElements.get('fx-rating')).toBeDefined();
  });

  it('max define número de estrellas y value emite change', () => {
    const el = document.createElement('fx-rating');
    el.setAttribute('max', '5');
    document.body.appendChild(el);
    const stars = el.shadowRoot!.querySelectorAll('.star');
    expect(stars).toHaveLength(5);

    let val = 0;
    el.addEventListener('change', (e: Event) => (val = (e as CustomEvent).detail.value));
    const star3 = el.shadowRoot!.querySelector('.star[data-n="3"]') as HTMLElement;
    star3.click();
    expect(el.value).toBe(3);
    expect(val).toBe(3);
    el.remove();
  });

  it('readonly bloquea cambio de valor', () => {
    const el = document.createElement('fx-rating');
    el.setAttribute('value', '2');
    el.setAttribute('readonly', '');
    document.body.appendChild(el);
    const star5 = el.shadowRoot!.querySelector('.star[data-n="5"]') as HTMLElement;
    star5.click();
    expect(el.value).toBe(2);
    el.remove();
  });

  it('fill visual marca estrellas llenas', () => {
    const el = document.createElement('fx-rating');
    el.setAttribute('value', '3');
    document.body.appendChild(el);
    const filled = el.shadowRoot!.querySelectorAll('.star.filled');
    expect(filled).toHaveLength(3);
    // estrella 4 no está llena
    const star4 = el.shadowRoot!.querySelector('.star[data-n="4"]') as HTMLElement;
    expect(star4.classList.contains('filled')).toBe(false);
    el.remove();
  });
});