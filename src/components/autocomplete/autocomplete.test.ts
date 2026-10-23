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
    // Digitação do usuário = `beforeinput` (prova de edição) + `input`.
    input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', cancelable: true }));
    input.value = 'são';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
    await new Promise((r) => setTimeout(r, 350)); // debounce
    const items = el.shadowRoot!.textContent || '';
    expect(items.toLowerCase()).not.toContain('rio de janeiro');
    el.remove();
  });

  it('autofill NÃO emite input/valueChange (só autofill) e não abre a lista', async () => {
    const el = document.createElement('fx-autocomplete') as any;
    el.setAttribute('source', JSON.stringify(['São Paulo', 'Santos']));
    document.body.appendChild(el);
    await Promise.resolve();
    const input = el.shadowRoot!.querySelector('input')!;
    let inputs = 0;
    let valueChanges = 0;
    let autofillDetail: unknown = null;
    el.addEventListener('input', () => { inputs += 1; });
    el.addEventListener('valueChange', () => { valueChanges += 1; });
    el.addEventListener('autofill', (e: Event) => { autofillDetail = (e as CustomEvent).detail; });

    // Autofill: valor + `input` sem `beforeinput`.
    input.value = 'Santos';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
    await new Promise((r) => setTimeout(r, 350));

    expect(inputs).toBe(0);
    expect(valueChanges).toBe(0);
    expect(autofillDetail).toEqual({ value: 'Santos' });
    expect(el.value).toBe('Santos');
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
  });

  it('emit-autofill restaura o comportamento antigo', async () => {
    const el = document.createElement('fx-autocomplete') as any;
    el.setAttribute('source', JSON.stringify(['São Paulo', 'Santos']));
    el.setAttribute('emit-autofill', '');
    document.body.appendChild(el);
    await Promise.resolve();
    const input = el.shadowRoot!.querySelector('input')!;
    let inputs = 0;
    el.addEventListener('input', () => { inputs += 1; });

    input.value = 'Santos';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));

    expect(inputs).toBe(1);
    expect(el.value).toBe('Santos');
    el.remove();
  });
});
