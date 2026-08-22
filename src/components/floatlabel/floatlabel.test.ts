import { describe, it, expect, beforeEach } from 'vitest';
import { defineFxFloatlabel } from './floatlabel';
import '../input';
import '../select';

describe('<fx-floatlabel>', () => {
  beforeEach(() => {
    defineFxFloatlabel();
  });

  const mount = (html: string): HTMLElement => {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
    return div.firstElementChild as HTMLElement;
  };

  it('registra a tag e renderiza o slot', () => {
    const el = mount(`
      <fx-floatlabel>
        <fx-input id="nome"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    expect(el.shadowRoot).toBeTruthy();
    expect(el.hasAttribute('active')).toBe(false);
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

  it('ativa quando o dropdown abre', () => {
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
    // A atualização ocorre via MutationObserver (assíncrono).
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(el.hasAttribute('active')).toBe(true);
        resolve();
      }, 10);
    });
  });
});
