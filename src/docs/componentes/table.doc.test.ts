/**
 * Contrato das regras de compilação do <fx-cell> documentadas em
 * `table-cell-rules.ts`.
 *
 * Estas são as MESMAS armadilhas que a doc descreve, então os testes as fixam:
 * cada framework tem sintaxe própria para `{}` e vai consumir o `{{ }}` antes
 * do componente receber. Aqui verificamos o que dá para testar sem instalar
 * Angular/Svelte no projeto: o contrato de markup (o que cada engine precisa
 * receber para o texto chegar intacto) e o comportamento final do componente.
 *
 * A regra do Vue tem suíte própria e mais forte, com um app Vue real:
 * ver `table.vue.test.ts`.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import '../../components/table/index';
import { FX_CELL_FRAMEWORK_SECTIONS } from './table-cell-rules';

const ROWS = [{ nome: 'Ana', cargo: 'Analista', salario: 1234.5 }];

function mount(html: string, data?: unknown[]): HTMLElement {
  const w = document.createElement('div');
  w.innerHTML = html;
  const el = w.firstElementChild as HTMLElement;
  if (data) (el as any).data = data;
  document.body.appendChild(w);
  return el;
}

/** Markup canônico: coluna com salário formatado. */
const withCell = (cellInner: string, cellAttrs = ''): string =>
  `<fx-table><fx-column field="nome" header="Nome"></fx-column>` +
  `<fx-column field="salario" header="Salário"><fx-cell ${cellAttrs}>${cellInner}</fx-cell></fx-column></fx-table>`;

describe('fx-cell — contrato de escape por framework', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('HTML puro: {{ }} direto renderiza (nenhum escape necessário)', () => {
    const el = mount(withCell('R$ {{ value | number }}'), ROWS);
    expect(el.shadowRoot!.querySelectorAll('td')[1].textContent).toBe('R$ 1.234,5');
  });

  it('Vue: o atributo v-pre é inerte para o componente (não altera o resultado)', () => {
    // O v-pre age no COMPILADOR do Vue, não aqui — mas não pode atrapalhar:
    // se sobrar no DOM, o motor do fx-table lê o mesmo texto.
    const el = mount(withCell('R$ {{ value | number }}', 'v-pre'), ROWS);
    expect(el.shadowRoot!.querySelectorAll('td')[1].textContent).toBe('R$ 1.234,5');
  });

  it('Angular: ngNonBindable também é inerte aqui e o texto chega igual', () => {
    const el = mount(withCell('R$ {{ value | number }}', 'ngNonBindable'), ROWS);
    expect(el.shadowRoot!.querySelectorAll('td')[1].textContent).toBe('R$ 1.234,5');
  });

  it('Svelte/JSX: as entidades HTML produzem o mesmo texto que o {{ }} literal', () => {
    // O compilador de cada um enxerga &lbrace; como texto comum; o browser
    // decodifica para { antes do componente ver. O resultado precisa ser idêntico.
    const el = mount(withCell('R$ &lbrace;&lbrace; value | number &rbrace;&rbrace;'), ROWS);
    expect(el.querySelector('fx-cell')!.innerHTML).toBe('R$ {{ value | number }}');
    expect(el.shadowRoot!.querySelectorAll('td')[1].textContent).toBe('R$ 1.234,5');
  });

  it('o texto-fonte do fx-cell nunca é exibido (a tabela não usa slot)', () => {
    const el = mount(withCell('R$ {{ value | number }}'), ROWS);
    expect(el.shadowRoot!.querySelector('slot')).toBeNull();
    expect(el.querySelector('fx-cell')!.textContent).toBe('R$ {{ value | number }}');
  });

  it('fx-cell fora do fx-table é inerte: não renderiza nada nem quebra', () => {
    document.body.innerHTML = '<div><fx-cell>{{ value | number }}</fx-cell></div>';
    const cell = document.querySelector('fx-cell')!;
    // Sem tabela não há motor de expressões: o texto fica como está, inerte.
    expect(cell.innerHTML).toBe('{{ value | number }}');
    expect(cell.closest('fx-table')).toBeNull();
  });
});

describe('fx-cell — a documentação cobre o que o motor suporta', () => {
  const html = FX_CELL_FRAMEWORK_SECTIONS.map((s) => s.html).join('\n');

  it('lista a neutralização de cada framework suportado', () => {
    for (const marker of [
      'v-pre',                   // Vue / Nuxt
      'dangerouslySetInnerHTML', // React
      'ngNonBindable',           // Angular
      '&lbrace;&lbrace;',        // Svelte (entidades HTML → `{` no DOM)
      'CUSTOM_ELEMENTS_SCHEMA',
      'isCustomElement',
    ]) {
      // O texto é realce de sintaxe: comparamos no DOM, que só escapa o HTML.
      const probe = document.createElement('div');
      probe.innerHTML = html;
      expect(probe.textContent, `doc sem a regra "${marker}"`).toContain(marker);
    }
  });

  it('documenta as variáveis e pipes do motor de expressões', () => {
    for (const token of [
      'row', 'value', 'currency', 'number', 'date', 'dateTime',
    ]) {
      expect(html, `doc sem a variável/pipe "${token}"`).toContain(token);
    }
  });

  it('avisa que o fx-cell só funciona dentro do fx-table', () => {
    expect(html).toContain('só funciona dentro do');
  });

  it('explica que o conteúdo é texto cru e não tipado pelo TypeScript', () => {
    expect(html).toContain('texto cru');
    expect(html).toContain('TypeScript');
  });
});
