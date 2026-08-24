import { describe, it, expect } from 'vitest';
import './index';

describe('fx-pagination', () => {
  it('registra e emite page-change ao navegar', async () => {
    expect(customElements.get('fx-pagination')).toBeDefined();
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '50');
    el.setAttribute('rows', '10');
    document.body.appendChild(el);
    await Promise.resolve();
    let detail: any = null;
    el.addEventListener('page-change', (e) => { detail = (e as CustomEvent).detail; });
    const next = el.shadowRoot!.querySelector('[part="next"]') as HTMLButtonElement;
    next?.click();
    await Promise.resolve();
    expect(detail?.page).toBe(2);
    expect(el.getAttribute('page')).toBe('2');
    el.remove();
  });
});
