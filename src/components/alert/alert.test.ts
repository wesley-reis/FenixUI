import { describe, it, expect } from 'vitest';
import './index';

describe('fx-alert', () => {
  it('registra, aplica variante e título', () => {
    expect(customElements.get('fx-alert')).toBeDefined();
    const el = document.createElement('fx-alert');
    el.setAttribute('variant', 'danger');
    el.setAttribute('title', 'Erro!');
    document.body.appendChild(el);
    const html = el.shadowRoot!.innerHTML;
    expect(html).toContain('danger');
    expect(html).toContain('Erro!');
    el.remove();
  });

  it('dismissible oculta e emite dismiss', () => {
    const el = document.createElement('fx-alert');
    el.setAttribute('dismissible', '');
    document.body.appendChild(el);
    let dismissed = false;
    el.addEventListener('dismiss', () => (dismissed = true));
    (el.shadowRoot!.querySelector('.close') as HTMLButtonElement)?.click();
    expect(dismissed).toBe(true);
    expect(el.hidden).toBe(true);
  });
});
