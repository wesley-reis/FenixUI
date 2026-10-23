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
    // Digitação do usuário = `beforeinput` (prova de edição) + `input`.
    ta.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', cancelable: true }));
    ta.value = 'texto';
    ta.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true, composed: true }));
    expect(el.value).toBe('texto');
    ta.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(detail).toBe('texto');
    el.remove();
  });

  it('autofill NÃO emite input/valueChange/change (só autofill)', () => {
    const el = document.createElement('fx-textarea') as FxTextarea;
    document.body.appendChild(el);
    const ta = el.shadowRoot!.querySelector('textarea')!;
    let inputs = 0;
    let changes = 0;
    let autofillDetail: unknown = null;
    el.addEventListener('input', () => { inputs += 1; });
    el.addEventListener('change', () => { changes += 1; });
    el.addEventListener('autofill', (e: Event) => { autofillDetail = (e as CustomEvent).detail; });

    ta.value = 'texto do autofill';
    ta.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true, composed: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect(inputs).toBe(0);
    expect(changes).toBe(0);
    expect(autofillDetail).toEqual({ value: 'texto do autofill' });
    expect(el.value).toBe('texto do autofill');
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
