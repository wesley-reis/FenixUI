import { describe, it, expect } from 'vitest';
import './index';

describe('fx-autocomplete', () => {
  it('registra e filtra a fonte ao digitar', async () => {
    expect(customElements.get('fx-autocomplete')).toBeDefined();
    const el = document.createElement('fx-autocomplete');
    el.setAttribute('source', JSON.stringify(['São Paulo', 'Santos', 'Rio de Janeiro']));
    document.body.appendChild(el);
    await Promise.resolve();
    const input = el.shadowRoot!.querySelector('input')!;
    input.value = 'são';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 350)); // debounce
    const items = el.shadowRoot!.textContent || '';
    expect(items.toLowerCase()).not.toContain('rio de janeiro');
    el.remove();
  });
});
