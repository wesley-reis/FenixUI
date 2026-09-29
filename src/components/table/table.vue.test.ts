import { describe, it, expect, beforeEach } from 'vitest';
import './index';
// @ts-ignore -- subpath do Vue com compiler; sem .d.ts dedicado
import { createApp, type App } from 'vue/dist/vue.esm-bundler.js';

/** Monta um app Vue real com o template informado e devolve o root. */
function mountVue(template: string, data: Record<string, unknown> = {}): HTMLElement {
  document.body.innerHTML = '';
  const root = document.createElement('div');
  document.body.appendChild(root);
  const app: App = createApp({ template, data: () => data });
  app.config.compilerOptions.isCustomElement = (tag: string) => tag.startsWith('fx-');
  app.mount(root);
  return root;
}

const ROWS = [
  { nome: 'Ana', cargo: 'Analista', salario: 1234.5 },
  { nome: 'Bruno', cargo: 'Dev', salario: 7000 },
];

/** Todas as células do corpo da tabela, na ordem das linhas. */
function cellsOf(root: HTMLElement): NodeListOf<HTMLTableCellElement> {
  return root.querySelector('fx-table')!.shadowRoot!.querySelectorAll('tbody tr td');
}

describe('fx-table dentro de um app Vue real — regra do v-pre', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('SEM v-pre: o Vue compila {{ }} e a célula não recebe o template', () => {
    const root = mountVue(
      `<fx-table :data="rows">
         <fx-column field="nome" header="Nome"></fx-column>
         <fx-column field="salario" header="Salário"><fx-cell>R$ {{ value | number }}</fx-cell></fx-column>
       </fx-table>`,
      { rows: ROWS },
    );
    // O `innerHTML` do fx-cell chegou vazio: o Vue consumiu a interpolação.
    expect(root.querySelector('fx-cell')!.innerHTML.trim()).not.toContain('{{');
  });

  it('COM v-pre: o texto chega intacto e o motor do fx-table renderiza', () => {
    const root = mountVue(
      `<fx-table :data="rows">
         <fx-column field="nome" header="Nome"></fx-column>
         <fx-column field="salario" header="Salário"><fx-cell v-pre>R$ {{ value | number }}</fx-cell></fx-column>
       </fx-table>`,
      { rows: ROWS },
    );
    expect(root.querySelector('fx-cell')!.innerHTML).toContain('{{ value | number }}');
    const cells = cellsOf(root);
    expect(cells[1].textContent).toBe('R$ 1.234,5');
  });

  it('v-pre também preserva HTML aninhado + row.*', () => {
    const root = mountVue(
      `<fx-table :data="rows">
         <fx-column field="nome" header="Nome"></fx-column>
         <fx-column field="salario" header="S"><fx-cell v-pre><b>{{ row.cargo }}</b>: {{ value &gt;= 6000 ? 'Sênior' : 'Júnior' }}</fx-cell></fx-column>
       </fx-table>`,
      { rows: ROWS },
    );
    const cells = cellsOf(root);
    expect(cells[1].querySelector('b')!.textContent).toBe('Analista');
    expect(cells[1].textContent).toBe('Analista: Júnior');
  });
});
