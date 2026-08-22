import { describe, it, expect, beforeEach } from 'vitest';
import './index';

const ROWS = [
  { id: 1, nome: 'Ana', idade: 30 },
  { id: 2, nome: 'Bruno', idade: 25 },
  { id: 3, nome: 'Carla', idade: 35 },
  { id: 4, nome: 'Diego', idade: 28 },
  { id: 5, nome: 'Elisa', idade: 22 },
  { id: 6, nome: 'Felipe', idade: 40 },
];

function mount(html: string, data?: unknown[]): HTMLElement {
  const w = document.createElement('div');
  w.innerHTML = html;
  const el = w.firstElementChild as HTMLElement;
  if (data) (el as any).data = data;
  document.body.appendChild(w);
  return el as HTMLElement;
}

const COLS = `
  <fx-column field="nome" header="Nome" sortable filterable></fx-column>
  <fx-column field="idade" header="Idade" sortable></fx-column>`;

describe('fx-table', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renderiza colunas do light DOM e todas as linhas', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelectorAll('th').length).toBeGreaterThanOrEqual(2);
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(6);
    expect(el.shadowRoot!.textContent).toContain('Ana');
  });

  it('ordena ao clicar no header sortable', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS) as any;
    let detail: unknown;
    el.addEventListener('sort-change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const th = el.shadowRoot.querySelector('th[data-field="nome"]')!;
    th.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((detail as any)?.direction).toBe('asc');
    th.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((detail as any)?.direction).toBe('desc');
  });

  it('filtra por coluna preservando o foco', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    const root = el.shadowRoot!;
    const inp = root.querySelector<HTMLInputElement>('.filter[data-field="nome"]')!;
    inp.value = 'ana';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    const rows = root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(root.activeElement?.classList.contains('filter')).toBeTruthy();
  });

  it('pagina com rows por página e emite page-change', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS) as any;
    const root = el.shadowRoot!;
    expect(root.querySelectorAll('tbody tr').length).toBe(2);
    let detail: unknown;
    el.addEventListener('page-change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const next = root.querySelector('[data-pg="next"]') as HTMLButtonElement;
    next.click();
    expect((detail as any)?.page).toBe(2);
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('emite row-click com o dado da linha', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS) as any;
    let detail: unknown;
    el.addEventListener('row-click', (e: Event) => { detail = (e as CustomEvent).detail; });
    el.shadowRoot!.querySelector('tbody tr')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((detail as any)?.row?.nome).toBe('Ana');
  });
});
