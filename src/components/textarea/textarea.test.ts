import { describe, it, expect } from 'vitest';
import './index';
import { FxTextarea } from './textarea';

describe('fx-textarea', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-textarea')).toBeDefined();
    const el = document.createElement('fx-textarea') as FxTextarea;
    document.body.appendChild(el);
    expect(el.shadowRoot?.querySelector('textarea')).toBeTruthy();
    el.remove();
  });

  it('reflete atributos e emite change composto', () => {
    const el = document.createElement('fx-textarea') as FxTextarea;
    el.setAttribute('placeholder', 'Descreva...');
    document.body.appendChild(el);
    const ta = el.shadowRoot!.querySelector('textarea')!;
    expect(ta.placeholder).toBe('Descreva...');
    let detail = '';
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail.value; });
    ta.value = 'texto';
    ta.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(el.value).toBe('texto');
    ta.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(detail).toBe('texto');
    el.remove();
  });

  it('disabled desabilita o campo interno', () => {
    const el = document.createElement('fx-textarea') as FxTextarea;
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('textarea')!.disabled).toBe(true);
    el.remove();
  });
});
