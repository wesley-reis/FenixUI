import { describe, it, expect } from 'vitest';
import './index';

describe('fx-password-strength', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-password-strength')).toBeDefined();
  });

  it('avalia força fraca (poucos caracteres)', () => {
    const el = document.createElement('fx-password-strength');
    el.setAttribute('value', 'abc');
    document.body.appendChild(el);
    expect(el.dataset.score).toBe('0');
    const on = el.shadowRoot!.querySelectorAll('.bar.on');
    expect(on).toHaveLength(0);
    el.remove();
  });

  it('avalia força forte (comprimento + variedade)', () => {
    const el = document.createElement('fx-password-strength');
    el.setAttribute('value', 'Abc123!@#x');
    document.body.appendChild(el);
    expect(el.dataset.score).toBe('4');
    const on = el.shadowRoot!.querySelectorAll('.bar.on');
    expect(on).toHaveLength(4);
    // rótulo exibido
    expect(el.shadowRoot!.querySelector('.label strong')?.textContent).toBe('Muito forte');
    el.remove();
  });

  it('emite change quando o nível muda', () => {
    const el = document.createElement('fx-password-strength');
    document.body.appendChild(el);
    const scores: number[] = [];
    el.addEventListener('change', (e: Event) => scores.push((e as CustomEvent).detail.score));
    el.setAttribute('value', 'abc');
    el.setAttribute('value', 'Abc123!@#x');
    expect(scores).toEqual([0, 4]);
    el.remove();
  });
});