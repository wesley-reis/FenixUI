import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

/** Digitação do usuário: `beforeinput` (prova de edição) + `input`. */
function typeInto(field: HTMLInputElement, value: string): void {
  field.dispatchEvent(
    new InputEvent('beforeinput', { inputType: 'insertText', data: value, bubbles: true, cancelable: true }),
  );
  field.value = value;
  field.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: value, bubbles: true }));
}

/** Autofill do navegador: valor no campo + `input`/`change` SEM `beforeinput`. */
function autofill(field: HTMLInputElement, value: string): void {
  field.value = value;
  field.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
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
    typeInto(field, 'abc');
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
    typeInto(field, 'a');
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

    typeInto(field, 'ab');
    expect(inputs).toBe(1);
    expect(valueChanges).toBe(1);
    expect(changes).toBe(0);

    field.dispatchEvent(new Event('change', { bubbles: true }));
    expect(inputs).toBe(1);
    expect(changes).toBe(1);
  });

  it('autofill do navegador NÃO emite input/valueChange/change (v-model intocado)', () => {
    const el = mount('<fx-input name="usuario"></fx-input>') as any;
    const field = el.shadowRoot.querySelector('input')!;
    let inputs = 0;
    let changes = 0;
    let valueChanges = 0;
    let autofillDetail: unknown = null;
    el.addEventListener('input', () => { inputs += 1; });
    el.addEventListener('change', () => { changes += 1; });
    el.addEventListener('valueChange', () => { valueChanges += 1; });
    el.addEventListener('autofill', (e: Event) => { autofillDetail = (e as CustomEvent).detail; });

    autofill(field, 'usuario.salvo');

    expect(inputs).toBe(0);
    expect(valueChanges).toBe(0);
    expect(changes).toBe(0);                                  // change do autofill absorvido
    expect(autofillDetail).toEqual({ value: 'usuario.salvo' }); // aviso próprio
    expect(el.value).toBe('usuario.salvo');                    // value/FormData sincronizados
    expect(el.getAttribute('value')).toBe('usuario.salvo');    // atributo → fx-floatlabel
  });

  it('autofill do Firefox (insertReplacementText não cancelável) também não emite input', () => {
    const el = mount('<fx-input></fx-input>') as any;
    const field = el.shadowRoot.querySelector('input')!;
    let inputs = 0;
    let autofills = 0;
    el.addEventListener('input', () => { inputs += 1; });
    el.addEventListener('autofill', () => { autofills += 1; });

    field.dispatchEvent(
      new InputEvent('beforeinput', { inputType: 'insertReplacementText', cancelable: false }),
    );
    field.value = 'ff';
    field.dispatchEvent(new InputEvent('input', { inputType: 'insertReplacementText' }));

    expect(inputs).toBe(0);
    expect(autofills).toBe(1);
    expect(el.value).toBe('ff');
  });

  it('emit-autofill restaura o comportamento antigo (input também no autofill)', () => {
    const el = mount('<fx-input emit-autofill></fx-input>') as any;
    const field = el.shadowRoot.querySelector('input')!;
    let inputs = 0;
    let autofills = 0;
    el.addEventListener('input', () => { inputs += 1; });
    el.addEventListener('autofill', () => { autofills += 1; });

    autofill(field, 'legado');

    expect(inputs).toBe(1);
    expect(autofills).toBe(0);
    expect(el.value).toBe('legado');
  });

  it('clearable emite input + change uma única vez e limpa o valor', () => {
    const el = mount('<fx-input clearable value="Fenix"></fx-input>') as any;
    const field = el.shadowRoot.querySelector('input')!;
    let inputs = 0;
    let changes = 0;
    el.addEventListener('input', () => { inputs += 1; });
    el.addEventListener('change', () => { changes += 1; });

    (el.shadowRoot.querySelector('.clear') as HTMLButtonElement).click();

    expect(field.value).toBe('');
    expect(el.value).toBe('');
    expect(inputs).toBe(1);
    expect(changes).toBe(1);
  });

  it('placeholder é aplicado', () => {
    const el = mount('<fx-input placeholder="Digite…"></fx-input>');
    expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).placeholder).toBe('Digite…');
  });
});
