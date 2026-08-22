import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const w = document.createElement('div');
  w.innerHTML = html;
  const el = w.firstElementChild as HTMLElement;
  document.body.appendChild(w);
  return el;
}

describe('fx-radio', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('é registrado com role radio', () => {
    expect(customElements.get('fx-radio')).toBeTruthy();
    const el = mount('<fx-radio value="a">Opção A</fx-radio>');
    expect(el.shadowRoot!.querySelector('[role="radio"]')).toBeTruthy();
  });

    it('marca checked ao clicar e emite change composto', () => {
    const el = mount('<fx-radio value="a">A</fx-radio>') as any;
    let detail: unknown;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    el.shadowRoot!.querySelector('.box')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(el.checked).toBe(true);
    expect((detail as any)?.checked).toBe(true);
    expect((detail as any)?.value).toBe('a');
  });

  it('não alterna quando disabled', () => {
    const el = mount('<fx-radio disabled></fx-radio>') as any;
    el.shadowRoot!.querySelector('.box')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(el.checked).toBe(false);
  });
});
