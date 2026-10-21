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

  it('registra a tag, renderiza a label no shadow e a move do light DOM', () => {
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
    // A label original foi MOVIDA para o Shadow DOM (não escondida com
    // `hidden`): não existe cópia no light DOM para o consumidor reexibir.
    expect(el.querySelector('label')).toBeNull();
    expect(flabel.hasAttribute('hidden')).toBe(false);
    expect(el.querySelectorAll('label').length).toBe(0);
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
        // Dropdown aberto também destaca a label (focus), mesmo sem foco
        // dentro do host (ex.: aberto por código).
        expect(el.hasAttribute('focus')).toBe(true);
        resolve();
      }, 10);
    });
  });

  it('aplica focus só com foco real e mantém active quando há valor', async () => {
    const el = mount(`
      <fx-floatlabel>
        <fx-input id="nome" value="Wesley"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    const input = el.querySelector('fx-input') as HTMLElement;
    const inner = input.shadowRoot!.querySelector('input') as HTMLElement;

    // Valor sem foco: label levantada (active) e neutra (sem focus).
    expect(el.hasAttribute('active')).toBe(true);
    expect(el.hasAttribute('focus')).toBe(false);

    // jsdom não implementa delegatesFocus: foca o controle interno direto
    // (no browser, clicar/focar o fx-input chega ao mesmo input).
    inner.focus();
    expect(el.hasAttribute('focus')).toBe(true);

    inner.blur();
    // O focusout reavalia no próximo tick (activeElement já fora do campo).
    await new Promise((r) => setTimeout(r, 0));
    expect(el.hasAttribute('focus')).toBe(false);
    expect(el.hasAttribute('active')).toBe(true);
  });

  it('pinta a label por --_flabel-color, alimentada por focus/error/success', () => {
    const el = mount(`
      <fx-floatlabel variant="in">
        <fx-input id="nome"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    const styles = (el.constructor as any).styles as string;

    // Cor única para a label.
    expect(styles).toMatch(
      /\.flabel\s*\{[^}]*color:\s*var\(--_flabel-color\)/,
    );
    // Foco define a primária na variável (e não por [active]).
    expect(styles).toMatch(
      /:host\(\[focus\]\)\s*\{\s*--_flabel-color:\s*var\(--fx-color-primary/,
    );
    expect(styles).not.toMatch(/:host\(\[active\]\)\s+\.flabel\s*\{/);
    // variant="in" + active não fixa color: uma declaração direta nesse
    // seletor (variant+active) venceria :host([error]) e :host([focus]).
    const variantInActive =
      /:host\(\[variant="in"\]\[active\]\)\s*\.flabel\s*\{([^}]*)\}/.exec(
        styles,
      )?.[1] ?? '';
    expect(variantInActive).not.toMatch(/(^|[^-])color\s*:/);
    // Erro/sucesso vêm depois do foco: a validação vence pela ordem.
    expect(styles.indexOf(':host([error])')).toBeGreaterThan(
      styles.indexOf(':host([focus])'),
    );
  });
});