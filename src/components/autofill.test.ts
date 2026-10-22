/**
 * Autofill / gerenciador de senhas — guarda de regressão.
 *
 * Por que este arquivo existe: o controle NATIVO de praticamente todo
 * componente vive no Shadow DOM. O `autocomplete` declarado no HOST (light DOM)
 * não chega sozinho ao `<input>`/`<textarea>` interno, e o default da spec é
 * `on` — o navegador passa a autopreencher campos comuns (busca, filtro,
 * diálogos) com o usuário/senha salvos, além de oferecer "Salvar senha?".
 *
 * Contrato verificado aqui:
 *   1. campos de texto editáveis saem com `autocomplete="off"` (default);
 *   2. o atributo declarado no HOST vence o default (autofill semântico:
 *      `username`, `current-password`, `new-password`, …);
 *   3. `name`/`id` do host descem para o campo interno (classificação);
 *   4. `fx-input`/`fx-textarea` refletem mudanças em runtime;
 *   5. os campos internos de busca/filtro (select, multiselect, table,
 *      datepicker, orderlist, picklist, editor) também saem com `off`.
 *
 * Fora da regra (não são alvos de autofill de credenciais): `type="file"`,
 * `type="color"`, `type="checkbox"` e controles `hidden`.
 */
import { describe, it, expect, beforeEach } from 'vitest';

import './input/index';
import './textarea/index';
import './autocomplete/index';
import './select/index';
import './multiselect/index';
import './table/index';
import './datepicker/index';
import './orderlist/index';
import './picklist/index';
import './editor/index';

function mount(html: string): HTMLElement & { shadowRoot: ShadowRoot } {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement & { shadowRoot: ShadowRoot };
  document.body.appendChild(wrapper);
  return el;
}

/** Controle nativo dentro do shadow do host. */
function inner(host: HTMLElement, selector: string): Element {
  const el = host.shadowRoot!.querySelector(selector);
  if (!el) throw new Error(`controle interno não encontrado: ${selector}`);
  return el;
}

describe('autofill: fx-input', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('o <input> interno sai com autocomplete="off" por padrão', () => {
    const el = mount('<fx-input></fx-input>');
    expect(inner(el, 'input').getAttribute('autocomplete')).toBe('off');
  });

  it('o atributo declarado no HOST vence o default', () => {
    const el = mount('<fx-input type="password" autocomplete="current-password"></fx-input>');
    expect(inner(el, 'input').getAttribute('autocomplete')).toBe('current-password');
  });

  it('mudar autocomplete em runtime reflete no campo interno', () => {
    const el = mount('<fx-input></fx-input>');
    el.setAttribute('autocomplete', 'new-password');
    expect(inner(el, 'input').getAttribute('autocomplete')).toBe('new-password');
  });

  it('name e id do host descem para o campo interno', () => {
    const el = mount('<fx-input id="usuario" name="usuario"></fx-input>');
    const field = inner(el, 'input');
    expect(field.getAttribute('name')).toBe('usuario');
    expect(field.getAttribute('id')).toBe('usuario');
  });

  it('sem name/id no host o campo interno não recebe os atributos', () => {
    const el = mount('<fx-input></fx-input>');
    const field = inner(el, 'input');
    expect(field.hasAttribute('name')).toBe(false);
    expect(field.hasAttribute('id')).toBe(false);
  });

  it('autocomplete é observado (está em observedAttributes)', () => {
    const observed = (customElements.get('fx-input') as unknown as {
      observedAttributes: string[];
    }).observedAttributes;
    expect(observed).toContain('autocomplete');
    expect(observed).toContain('name');
    expect(observed).toContain('id');
  });
});

describe('autofill: fx-textarea', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('o <textarea> interno sai com autocomplete="off" por padrão', () => {
    const el = mount('<fx-textarea></fx-textarea>');
    expect(inner(el, 'textarea').getAttribute('autocomplete')).toBe('off');
  });

  it('o atributo declarado no HOST vence o default', () => {
    const el = mount('<fx-textarea autocomplete="street-address"></fx-textarea>');
    expect(inner(el, 'textarea').getAttribute('autocomplete')).toBe('street-address');
  });

  it('name e id do host descem para o campo interno', () => {
    const el = mount('<fx-textarea id="obs" name="obs"></fx-textarea>');
    const field = inner(el, 'textarea');
    expect(field.getAttribute('name')).toBe('obs');
    expect(field.getAttribute('id')).toBe('obs');
  });

  it('mudar autocomplete em runtime reflete no campo interno', () => {
    const el = mount('<fx-textarea></fx-textarea>');
    el.setAttribute('autocomplete', 'off');
    expect(inner(el, 'textarea').getAttribute('autocomplete')).toBe('off');
  });
});

describe('autofill: fx-autocomplete', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('o campo interno é sempre autocomplete="off" (regra fixa)', () => {
    const el = mount('<fx-autocomplete source="[]"></fx-autocomplete>');
    expect(inner(el, 'input').getAttribute('autocomplete')).toBe('off');
  });
});

describe('autofill: campos internos de busca/filtro', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('fx-select searchable: o input de busca sai com off', () => {
    const el = mount(
      '<fx-select searchable><option value="a">A</option></fx-select>',
    );
    expect(inner(el, 'input.search').getAttribute('autocomplete')).toBe('off');
  });

  it('fx-multiselect searchable: o input de busca sai com off', () => {
    const el = mount(
      '<fx-multiselect searchable><option value="a">A</option></fx-multiselect>',
    );
    expect(inner(el, 'input.search').getAttribute('autocomplete')).toBe('off');
  });

  it('fx-table filterable: o input da linha de filtros sai com off', () => {
    const el = mount(
      '<fx-table><fx-column field="nome" header="Nome" filterable></fx-column></fx-table>',
    );
    expect(inner(el, 'input.filter').getAttribute('autocomplete')).toBe('off');
  });

  it('fx-datepicker: o input de exibição sai com off', () => {
    const el = mount('<fx-datepicker></fx-datepicker>');
    expect(inner(el, 'input.display').getAttribute('autocomplete')).toBe('off');
  });

  it('fx-datepicker show-time: os inputs de hora saem com off', () => {
    const el = mount('<fx-datepicker show-time></fx-datepicker>');
    for (const cls of ['t-h', 't-m', 't-s']) {
      expect(inner(el, `input.${cls}`).getAttribute('autocomplete')).toBe('off');
    }
  });

  it('fx-orderlist filter: o input de filtro sai com off', () => {
    const el = mount('<fx-orderlist filter></fx-orderlist>');
    expect(inner(el, 'input.filter-input').getAttribute('autocomplete')).toBe('off');
  });

  it('fx-picklist filter: os dois inputs de filtro saem com off', () => {
    const el = mount('<fx-picklist filter></fx-picklist>');
    const filters = el.shadowRoot!.querySelectorAll('input.filter-input');
    expect(filters.length).toBe(2);
    filters.forEach((f) => expect(f.getAttribute('autocomplete')).toBe('off'));
  });

  it('fx-editor: os inputs do diálogo saem com off', () => {
    const el = mount('<fx-editor></fx-editor>') as HTMLElement & {
      shadowRoot: ShadowRoot;
      openDialog: (kind: 'link' | 'image' | 'video') => void;
    };
    el.openDialog('link');
    const url = el.shadowRoot.querySelector('[data-field="url"]')!;
    expect(url.getAttribute('autocomplete')).toBe('off');
    expect(url.getAttribute('type')).toBe('url');
  });
});
