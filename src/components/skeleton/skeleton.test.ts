import { describe, it, expect } from 'vitest';
import './index';

describe('fx-skeleton', () => {
  it('registra e renderiza variantes', () => {
    expect(customElements.get('fx-skeleton')).toBeDefined();
    const el = document.createElement('fx-skeleton');
    el.setAttribute('variant', 'text');
    el.setAttribute('lines', '3');
    document.body.appendChild(el);
    expect(el.shadowRoot!.innerHTML.length).toBeGreaterThan(0);
    el.remove();
  });
});
