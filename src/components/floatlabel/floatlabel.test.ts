import { describe, it, expect, beforeEach } from 'vitest';
import { defineFxFloatlabel } from './floatlabel';
import '../input';
import '../select';

function mount(html: string): HTMLElement & any {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host.firstElementChild as any;
}

describe('<fx-floatlabel>', () => {
  beforeEach(() => {
    defineFxFloatlabel();
  });

  it('registra a tag, renderiza a label no shadow e esconde a original', () => {
    const el = mount(`
      <fx-floatlabel>
        <fx-input id="nome"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    expect(el.shadowRoot).toBeTruthy();
    const flabel = el.shadowRoot.querySelector('.flabel');
    expect(flabel).toBeTruthy();
    expect(flabel.textContent).toBe('Nome');
    expect(flabel.getAttribute('for')).toBe('nome');
    const original = el.querySelector('label');
    expect(original.hasAttribute('hidden')).toBe(true);
  });

  it('aplica a variante como atributo (CSS responde via :host([variant]))', () => {
    const el = mount(`
      <fx-floatlabel variant="in">
        <fx-input id="x"></fx-input>
        <label for="x">X</label>
      </fx-floatlabel>
    `);
    expect(el.getAttribute('variant')).toBe('in');
  });

  it('ativa quando o campo contém valor inicial', () => {
    const el = mount(`
      <fx-floatlabel>
        <fx-input id="nome" value="Wesley"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    expect(el.hasAttribute('active')).toBe(true);
  });

  it('ativa/desativa ao digitar ou limpar valor', () => {
    const el = mount(`
      <fx-floatlabel>
        <fx-input id="nome"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    const input = el.querySelector('fx-input') as any;
    expect(el.hasAttribute('active')).toBe(false);

    input.value = 'João';
    input.dispatchEvent(new CustomEvent('input', { bubbles: true }));
    expect(el.hasAttribute('active')).toBe(true);

    input.value = '';
    input.dispatchEvent(new CustomEvent('input', { bubbles: true }));
    expect(el.hasAttribute('active')).toBe(false);
  });

  it('mostra a mensagem de erro e espelha no campo ao ter error', () => {
    const el = mount(`
      <fx-floatlabel error error-text="Campo obrigatório">
        <fx-input id="nome"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    const errMsg = el.shadowRoot.querySelector('.error-message');
    expect(errMsg).toBeTruthy();
    expect(errMsg.textContent).toBe('Campo obrigatório');
    expect(getComputedStyle(errMsg).display).not.toBe('none');
    const input = el.querySelector('fx-input');
    expect(input.hasAttribute('error')).toBe(true);
  });

  it('ativa quando o dropdown do select abre', () => {
    const el = mount(`
      <fx-floatlabel>
        <fx-select id="estado">
          <option value="sp">São Paulo</option>
        </fx-select>
        <label for="estado">Estado</label>
      </fx-floatlabel>
    `);
    const select = el.querySelector('fx-select') as any;
    expect(el.hasAttribute('active')).toBe(false);

    select.setAttribute('open', '');
    // Atualização via MutationObserver (assíncrono).
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(el.hasAttribute('active')).toBe(true);
        resolve();
      }, 10);
    });
  });
});