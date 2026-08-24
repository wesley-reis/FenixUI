import { describe, it, expect } from 'vitest';
import './index';

describe('fx-progress', () => {
  it('registra e reflete o valor', () => {
    expect(customElements.get('fx-progress')).toBeDefined();
    const el = document.createElement('fx-progress');
    el.setAttribute('value', '60');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.bar')).toBeTruthy();
    expect(el.shadowRoot!.innerHTML).toContain('60%');
    el.remove();
  });

  it('modo indeterminado', () => {
    const el = document.createElement('fx-progress');
    el.setAttribute('indeterminate', '');
    document.body.appendChild(el);
    expect(el.shadowRoot!.innerHTML).toContain('40%');
    el.remove();
  });
});
