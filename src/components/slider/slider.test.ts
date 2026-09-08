import { describe, it, expect } from 'vitest';
import './index';

describe('fx-slider', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-slider')).toBeDefined();
  });

  it('valor respeita min/max e step', () => {
    const el = document.createElement('fx-slider');
    el.setAttribute('min', '0');
    el.setAttribute('max', '10');
    el.setAttribute('step', '2.5');
    document.body.appendChild(el);
    el.value = 7; // arredonda para 7.5 (múltiplo de 2.5)
    expect(el.value).toBe(7.5);
    el.value = 99;
    expect(el.value).toBe(10);
    el.value = -5;
    expect(el.value).toBe(0);
    el.remove();
  });

  it('arraste com ponteiro emite input e change', () => {
    const el = document.createElement('fx-slider');
    document.body.appendChild(el);
    const inputs: number[] = [];
    const changes: number[] = [];
    el.addEventListener('input', (e: Event) => inputs.push((e as CustomEvent).detail.value));
    el.addEventListener('change', (e: Event) => changes.push((e as CustomEvent).detail.value));

    const wrap = el.shadowRoot!.querySelector('.track-wrap') as HTMLElement;
    // jsdom não faz layout: rect width 0 → ratio 0 → value = min
    wrap.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 0 }));
    window.dispatchEvent(new MouseEvent('pointerup', { clientX: 0 }));
    expect(inputs.length).toBeGreaterThan(0);
    expect(changes).toHaveLength(1);
    expect(el.value).toBe(0);
    el.remove();
  });

  it('navegação por teclado (setas, Home, End) emite eventos', () => {
    const el = document.createElement('fx-slider');
    el.setAttribute('value', '50');
    document.body.appendChild(el);
    const changes: number[] = [];
    el.addEventListener('change', (e: Event) => changes.push((e as CustomEvent).detail.value));

    const wrap = el.shadowRoot!.querySelector('.track-wrap') as HTMLElement;
    const press = (key: string): void => {
      wrap.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    };

    press('ArrowRight');
    expect(el.value).toBe(51);
    press('ArrowLeft');
    expect(el.value).toBe(50);
    press('Home');
    expect(el.value).toBe(0);
    press('End');
    expect(el.value).toBe(100);
    expect(changes).toEqual([51, 50, 0, 100]);
    el.remove();
  });

  it('disabled bloqueia interação', () => {
    const el = document.createElement('fx-slider');
    el.setAttribute('value', '50');
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    const wrap = el.shadowRoot!.querySelector('.track-wrap') as HTMLElement;
    wrap.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 1000 }));
    wrap.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.value).toBe(50);
    el.remove();
  });
});

