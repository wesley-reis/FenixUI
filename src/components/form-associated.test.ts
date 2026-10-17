/**
 * Integração dos componentes de formulário com <form> nativo.
 *
 * Cobre a ponta que quebrava em apps reais:
 *  - Enter no fx-input dispara a submissão do form (o <input> interno não se
 *    associa ao <form> do light DOM — a fronteira do shadow corta a associação);
 *  - fx-button type="submit"/"reset" aciona o form em que vive;
 *  - setter de `value` atualiza o campo interno na tela (binding de framework);
 *  - `autofocus` foca o campo ao montar;
 *  - grupos de fx-radio ficam escopados à árvore (document OU shadow DOM).
 *
 * Nota: jsdom expõe `attachInternals` parcial (sem `setFormValue`/associação
 * de form) — asserções de FormData real rodam só onde a API completa existe
 * (browsers). A sonda abaixo detecta o suporte real.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import './input/index';
import './textarea/index';
import './autocomplete/index';
import './checkbox/index';
import './radio/index';
import './switch/index';
import './select/index';
import './multiselect/index';
import './datepicker/index';
import './slider/index';
import './rating/index';
import './knob/index';
import './toggle-button-group/index';
import './fileupload/index';
import './button/index';
import './floatlabel/index';

function mount(html: string): HTMLElement & any {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper.firstElementChild as HTMLElement & any;
}

// Sonda de suporte real: cria um fx-input e checa se o ElementInternals
// devolvido tem setFormValue (jsdom tem attachInternals parcial — sem).
const HAS_INTERNALS = (() => {
  try {
    const probe = document.createElement('fx-input') as any;
    return typeof probe.internals?.setFormValue === 'function';
  } catch {
    return false;
  }
})();

describe('componentes de formulário dentro de <form>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('são form-associated (static formAssociated = true)', () => {
    for (const tag of [
      'fx-input', 'fx-textarea', 'fx-autocomplete', 'fx-select', 'fx-multiselect',
      'fx-datepicker', 'fx-checkbox', 'fx-radio', 'fx-switch', 'fx-slider',
      'fx-rating', 'fx-knob', 'fx-toggle-button-group', 'fx-fileupload', 'fx-button',
    ]) {
      const ctor = customElements.get(tag) as any;
      expect(ctor, tag).toBeTruthy();
      expect(ctor.formAssociated, `${tag} deveria ser formAssociated`).toBe(true);
    }
  });

  it('Enter no fx-input dispara requestSubmit do form', () => {
    const form = mount(`
      <form>
        <fx-input name="email" value="a@b.c"></fx-input>
      </form>
    `);
    const input = form.querySelector('fx-input');
    const field = input.shadowRoot.querySelector('input');
    const spy = vi.spyOn(form, 'requestSubmit');
    field.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('Enter no fx-input emite submit cancelável (submit.prevent funciona)', () => {
    const form = mount(`
      <form>
        <fx-input name="q"></fx-input>
      </form>
    `);
    const field = form.querySelector('fx-input').shadowRoot.querySelector('input');
    let submitted = false;
    form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      submitted = true;
    });
    field.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    expect(submitted).toBe(true);
  });

  it('fx-button type=submit submete o form; type=reset limpa', () => {
    const form = mount(`
      <form>
        <fx-input name="nome" value="x"></fx-input>
        <fx-button type="submit">Salvar</fx-button>
        <fx-button type="reset">Limpar</fx-button>
      </form>
    `);
    const submitSpy = vi.spyOn(form, 'requestSubmit');
    const resetSpy = vi.spyOn(form, 'reset');
    form.querySelector('fx-button[type="submit"]').shadowRoot.querySelector('button').click();
    expect(submitSpy).toHaveBeenCalledTimes(1);
    form.querySelector('fx-button[type="reset"]').shadowRoot.querySelector('button').click();
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });

  it('setter de value atualiza o campo interno sem re-render (input e textarea)', () => {
    const input = mount('<fx-input></fx-input>');
    input.value = 'novo valor';
    expect(input.shadowRoot.querySelector('input').value).toBe('novo valor');

    const textarea = mount('<fx-textarea></fx-textarea>');
    textarea.value = 'texto novo';
    expect(textarea.shadowRoot.querySelector('textarea').value).toBe('texto novo');
  });

  it('setter de value preserva o foco do campo interno', () => {
    const input = mount('<fx-input></fx-input>');
    const field = input.shadowRoot.querySelector('input');
    field.focus();
    field.setSelectionRange(0, 0);
    input.value = 'digitando';
    expect(input.shadowRoot.querySelector('input')).toBe(field); // sem re-render
    expect(input.shadowRoot.activeElement).toBe(field); // foco mantido
  });

  it('autofocus foca o componente ao montar', async () => {
    const el = mount('<fx-input autofocus></fx-input>');
    await new Promise((r) => setTimeout(r, 0));
    expect(document.activeElement).toBe(el);
  });
});

describe('componentes de formulário — estado e grupos', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('checkbox/switch refletem estado ao interagir e radio agrupa por name', () => {
    const r1 = mount('<fx-radio name="g" value="1"></fx-radio>');
    const r2 = mount('<fx-radio name="g" value="2"></fx-radio>');
    r1.shadowRoot.querySelector('.box').click();
    expect(r1.hasAttribute('checked')).toBe(true);
    r2.shadowRoot.querySelector('.box').click();
    expect(r1.hasAttribute('checked')).toBe(false);
    expect(r2.hasAttribute('checked')).toBe(true);

    const cb = mount('<fx-checkbox value="termos"></fx-checkbox>');
    cb.shadowRoot.querySelector('.box').click();
    expect(cb.hasAttribute('checked')).toBe(true);

    const sw = mount('<fx-switch></fx-switch>');
    sw.shadowRoot.querySelector('.switch').click();
    expect(sw.hasAttribute('checked')).toBe(true);
  });

  it('grupo de radio com mesmo name fica isolado entre árvores (shadow DOM do app)', () => {
    // Radio dentro de um shadow host do "app consumidor"…
    const host = mount('<div id="host"></div>');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<fx-radio name="g" value="inner"></fx-radio>';
    const inner = shadow.querySelector('fx-radio') as any;

    // …e radio no document com o MESMO name.
    const outer = mount('<fx-radio name="g" value="outer"></fx-radio>');

    outer.shadowRoot.querySelector('.box').click();
    expect(outer.hasAttribute('checked')).toBe(true);
    expect(inner.hasAttribute('checked')).toBe(false); // isolado por árvore

    inner.shadowRoot.querySelector('.box').click();
    expect(inner.hasAttribute('checked')).toBe(true);
    expect(outer.hasAttribute('checked')).toBe(true); // outro escopo: não desmarca
  });

  it('setas do teclado movem foco/marcação entre os radios do grupo', () => {
    const r1 = mount('<fx-radio name="cores" value="azul"></fx-radio>');
    const r2 = mount('<fx-radio name="cores" value="verde"></fx-radio>');
    const box1 = r1.shadowRoot.querySelector('.box');
    const box2 = r2.shadowRoot.querySelector('.box');
    box1.click();
    box2.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
    );
    // ArrowUp a partir do verde volta para o azul — foco e marcação.
    expect(document.activeElement).toBe(r1);
    expect(r1.hasAttribute('checked')).toBe(true);
    expect(r2.hasAttribute('checked')).toBe(false);
  });

  it('floatlabel adota a label: nenhuma cópia no light DOM e nenhum hidden', () => {
    const el = mount(`
      <fx-floatlabel>
        <fx-input id="nome"></fx-input>
        <label for="nome">Nome</label>
      </fx-floatlabel>
    `);
    expect(el.querySelector('label')).toBeNull();
    const flabel = el.shadowRoot.querySelector('.flabel');
    expect(flabel).toBeTruthy();
    expect(flabel.textContent.trim()).toBe('Nome');
    expect(flabel.hasAttribute('hidden')).toBe(false);
    // O campo continua renderizado no wrapper (slot intacto).
    expect(el.querySelector('fx-input')).toBeTruthy();
  });
});

describe.skipIf(!HAS_INTERNALS)('FormData real (só em ambientes com ElementInternals)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('componentes entram no FormData do form', () => {
    const form = mount(`
      <form>
        <fx-input name="email" value="a@b.c"></fx-input>
        <fx-textarea name="msg" value="olá"></fx-textarea>
        <fx-checkbox name="termos" value="aceito" checked></fx-checkbox>
        <fx-radio name="plano" value="pro" checked></fx-radio>
        <fx-switch name="alerts" value="sim" checked></fx-switch>
      </form>
    `);
    const fd = new FormData(form);
    expect(fd.get('email')).toBe('a@b.c');
    expect(fd.get('msg')).toBe('olá');
    expect(fd.get('termos')).toBe('aceito');
    expect(fd.get('plano')).toBe('pro');
    expect(fd.get('alerts')).toBe('sim');
  });

  it('checkbox desmarcado não entra no FormData (igual ao nativo)', () => {
    const form = mount(`
      <form>
        <fx-checkbox name="termos" value="aceito"></fx-checkbox>
        <fx-checkbox name="outro" checked></fx-checkbox>
      </form>
    `);
    const fd = new FormData(form);
    expect(fd.get('termos')).toBeNull();
    expect(fd.get('outro')).toBe('on');
  });

  it('multiselect envia uma entrada por valor selecionado', () => {
    const form = mount(`
      <form>
        <fx-multiselect name="tags" values="a,b">
          <option value="a">A</option>
          <option value="b">B</option>
        </fx-multiselect>
      </form>
    `);
    const fd = new FormData(form);
    expect(fd.getAll('tags')).toEqual(['a', 'b']);
  });

  it('form.reset() restaura o valor inicial', () => {
    const form = mount(`
      <form>
        <fx-input name="nome" value="Wesley"></fx-input>
      </form>
    `);
    const input = form.querySelector('fx-input') as any;
    input.value = 'Outro';
    form.reset();
    expect(input.value).toBe('Wesley');
    expect(input.shadowRoot.querySelector('input').value).toBe('Wesley');
  });
});
