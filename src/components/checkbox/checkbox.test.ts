
import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const w = document.createElement('div');
  w.innerHTML = html;
  const el = w.firstElementChild as HTMLElement;
  document.body.appendChild(w);
  return el;
}

describe('fx-checkbox', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('é registrado com role checkbox', async () => {
    expect(customElements.get('fx-checkbox')).toBeTruthy();
    const el = mount('<fx-checkbox>Aceito</fx-checkbox>');
    await new Promise((r) => setTimeout(r, 50));
    expect(el.shadowRoot!.querySelector('[role="checkbox"]')).toBeTruthy();
  });

  it('alterna checked ao clicar e emite change', async () => {
    const el = mount('<fx-checkbox>Aceito</fx-checkbox>') as any;
    let detail: unknown;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    await new Promise((r) => setTimeout(r, 30));
    el.shadowRoot!.querySelector('.box')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(el.checked).toBe(true);
    expect((detail as any)?.checked).toBe(true);
  });

  it('respeita checked inicial e indeterminado', async () => {
    const el = mount('<fx-checkbox checked indeterminate></fx-checkbox>') as any;
    await new Promise((r) => setTimeout(r, 30));
    expect(el.hasAttribute('checked')).toBe(true);
    expect(el.hasAttribute('indeterminate')).toBe(true);
    expect(el.indeterminate).toBe(true);
  });

  it('não alterna quando disabled', async () => {
    const el = mount('<fx-checkbox disabled>X</fx-checkbox>') as any;
    await new Promise((r) => setTimeout(r, 30));
    el.shadowRoot!.querySelector('.box')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(el.checked).toBe(false);
  });
});
