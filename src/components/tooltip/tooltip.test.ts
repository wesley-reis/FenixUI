import { describe, it, expect } from 'vitest';
import './index';

describe('fx-tooltip', () => {
  it('registra e renderiza o conteúdo', () => {
    expect(customElements.get('fx-tooltip')).toBeDefined();
    const el = document.createElement('fx-tooltip');
    el.setAttribute('content', 'Ajuda aqui');
    document.body.appendChild(el);
    expect(el.shadowRoot!.innerHTML).toContain('Ajuda aqui');
    el.remove();
  });
});
