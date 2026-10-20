import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

describe('fx-input', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é um Custom Element registrado', () => {
    expect(customElements.get('fx-input')).toBeTruthy();
  });

  it('reflete value no input interno', () => {
    const el = mount('<fx-input value="Fenix"></fx-input>') as any;
    const field = el.shadowRoot.querySelector('input')!;
    expect(field.value).toBe('Fenix');
  });

  it('emite input/change compostos com detail.value e reflete no host', () => {
    const el = mount('<fx-input></fx-input>') as any;
    let gotInput = '';
    el.addEventListener('input', (e: Event) => { gotInput = (e as CustomEvent).detail.value; });
    const field = el.shadowRoot.querySelector('input')!;
    field.value = 'abc';
    field.dispatchEvent(new Event('input'));
    expect(gotInput).toBe('abc');
    expect(el.value).toBe('abc');
  });

  it('type padrão é text e a propriedade reflete no input interno', () => {
    const el = mount('<fx-input></fx-input>') as any;
    expect(el.type).toBe('text');
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).type).toBe('text');

    el.type = 'password';
    expect(el.getAttribute('type')).toBe('password');
    expect(el.type).toBe('password');
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).type).toBe('password');

    el.type = 'number';
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).type).toBe('number');
  });

  it('repassa tipos nativos de input (date/email/time)', () => {
    const el = mount('<fx-input type="date"></fx-input>') as any;
    expect(el.type).toBe('date');
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).type).toBe('date');

    el.setAttribute('type', 'email');
    expect(el.type).toBe('email');
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).type).toBe('email');

    el.setAttribute('type', 'time');
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).type).toBe('time');
  });

  it('type number aplica min/max/step e disabled desabilita', () => {
    const el = mount('<fx-input type="number" min="1" max="10" step="2" disabled></fx-input>') as any;
    const field = el.shadowRoot!.querySelector('input')!;
    expect(field.type).toBe('number');
    expect(field.min).toBe('1');
    expect(field.max).toBe('10');
    expect(field.step).toBe('2');
    expect(field.hasAttribute('disabled')).toBe(true);
  });

  it('NÃO perde o foco ao digitar (reflexão de value não re-renderiza)', () => {
    const el = mount('<fx-input></fx-input>') as any;
    const field = el.shadowRoot.querySelector('input')!;
    field.focus();
    field.value = 'a';
    field.dispatchEvent(new Event('input'));
    expect(el.value).toBe('a');
    expect(document.activeElement).toBe(el);                 // foco mantido (host)
    expect(el.shadowRoot.activeElement).toBe(field);          // campo interno focado
    expect(el.shadowRoot.querySelector('input')).toBe(field); // sem re-render
  });

  it('emite um único input por tecla e um change no blur', () => {
    const el = mount('<fx-input></fx-input>');
    const field = el.shadowRoot!.querySelector('input')!;
    let inputs = 0;
    let changes = 0;
    let valueChanges = 0;
    el.addEventListener('input', () => { inputs += 1; });
    el.addEventListener('change', () => { changes += 1; });
    el.addEventListener('valueChange', () => { valueChanges += 1; });

    field.value = 'ab';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    expect(inputs).toBe(1);
    expect(valueChanges).toBe(1);
    expect(changes).toBe(0);

    field.dispatchEvent(new Event('change', { bubbles: true }));
    expect(inputs).toBe(1);
    expect(changes).toBe(1);
  });

  it('placeholder é aplicado', () => {
    const el = mount('<fx-input placeholder="Digite…"></fx-input>');
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).placeholder).toBe('Digite…');
  });
});
