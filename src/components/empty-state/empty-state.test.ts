import { describe, it, expect } from 'vitest';
import './index';

describe('fx-empty-state', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-empty-state')).toBeDefined();
  });

  it('renderiza icon, heading e description', () => {
    const el = document.createElement('fx-empty-state');
    el.setAttribute('icon', '📦');
    el.setAttribute('heading', 'Nada por aqui');
    el.setAttribute('description', 'Adicione itens para começar.');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.icon')?.textContent).toBe('📦');
    expect(el.shadowRoot!.querySelector('h4')?.textContent).toBe('Nada por aqui');
    expect(el.shadowRoot!.querySelector('p')?.textContent).toBe('Adicione itens para começar.');
    el.remove();
  });

  it('esconde heading/description quando vazios', () => {
    const el = document.createElement('fx-empty-state');
    document.body.appendChild(el);
    expect((el.shadowRoot!.querySelector('h4') as HTMLElement).hidden).toBe(true);
    expect((el.shadowRoot!.querySelector('p') as HTMLElement).hidden).toBe(true);
    el.remove();
  });
});