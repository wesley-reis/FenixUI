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

  it('usa <fx-select> temático para itens por página', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const root = el.shadowRoot!;
    expect(root.querySelector('select')).toBeNull();
    const sel = root.querySelector('fx-select.rows-sel') as HTMLElement;
    expect(sel).toBeTruthy();
    // Escolhe a opção "5" no dropdown customizado.
    const opt = sel.shadowRoot!.querySelector('.opt[data-value="5"]') as HTMLElement;
    expect(opt).toBeTruthy();
    opt.click();
    expect(el.getAttribute('rows')).toBe('5');
  });
});

/* ---- Templates de célula (PrimeNG-style) ---- */

describe('fx-table — templates de célula', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renderiza {{ value }} simples num template', () => {
    const el = mount(`<fx-table><fx-column field="nome" header="Nome"><template>{{ value }}</template></fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.textContent).toContain('Ana');
  });

  it('renderiza pipe de currency (R$)', () => {
    const data = [{ id: 1, preco: 1500.5 }];
    const el = mount(`<fx-table><fx-column field="preco" header="Preço"><template>{{ value | currency }}</template></fx-column></fx-table>`, data);
    expect(el.shadowRoot!.textContent).toContain('R$');
    expect(el.shadowRoot!.textContent).toContain('1.500,50');
  });

  it('renderiza pipe de date com estilo short', () => {
    const data = [{ id: 1, data: new Date(2024, 0, 15) }];
    const el = mount(`<fx-table><fx-column field="data" header="Data"><template>{{ value | date: 'short' }}</template></fx-column></fx-table>`, data);
    expect(el.shadowRoot!.textContent).toContain('15/01/2024');
  });

  it('renderiza ternário condicional', () => {
    const el = mount(`<fx-table><fx-column field="idade" header="Idade"><template>{{ value }} - {{ value >= 30 ? 'senior' : 'junior' }}</template></fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.textContent).toContain('30 - senior');
  });

  it('renderiza ícone dinâmico via acesso a row.ativo', () => {
    const data = [{ id: 1, nome: 'Ana', ativo: true }];
    const el = mount(`<fx-table><fx-column field="nome" header="Nome"><template><i class="pi pi-{{ row.ativo ? 'check' : 'times' }}"></i></template></fx-column></fx-table>`, data);
    expect(el.shadowRoot!.querySelector('td')?.innerHTML).toContain('pi-check');
  });

  it('suporta conteúdo direto no fx-column (não usa <template>)', () => {
    const el = mount(`<fx-table><fx-column field="idade" header="Idade">{{ value }} anos</fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.textContent).toContain('30 anos');
  });

  it('suporta múltiplas expressões no mesmo template', () => {
    const data = [{ id: 1, nome: 'Ana', idade: 30 }];
    const el = mount(`<fx-table><fx-column field="id" header="ID"><template>{{ value }}: {{ row.nome }} ({{ row.idade }} anos)</template></fx-column></fx-table>`, data);
    expect(el.shadowRoot!.textContent).toContain('1: Ana (30 anos)');
  });

  it('escapa HTML do valor da célula (previne XSS)', () => {
    const data = [{ id: 1, nome: '<img src=x onerror=alert(1)>' }];
    const el = mount(`<fx-table><fx-column field="nome" header="Nome"></fx-column></fx-table>`, data);
    expect(el.shadowRoot!.querySelector('td')?.innerHTML).not.toContain('<img');
  });
});
/* ---- Header, ordenação e toolbar ---- */

describe('fx-table — header, sort e toolbar', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('mostra a setinha de ordenação em colunas sortable (mesmo sem ordenação ativa)', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    const ind = el.shadowRoot!.querySelector('th[data-field="nome"] .sort-ind');
    expect(ind).toBeTruthy();
    expect(ind!.textContent).toBe('⇅');
  });

  it('destaca a setinha quando a coluna está ordenada', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS) as any;
    el.shadowRoot!.querySelector('th[data-field="nome"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const ind = el.shadowRoot!.querySelector('th[data-field="nome"] .sort-ind');
    expect(ind!.className).toContain('active');
    expect(ind!.textContent).toBe('▲');
  });

  it('header usa fundo cinza claro (--fx-surface-surface)', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent;
    expect(style).toMatch(/th\s*\{[^}]*background:\s*var\(--fx-surface-surface\)/s);
  });

  it('host tem fundo opaco para não mostrar o quadriculado', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent;
    expect(style).toMatch(/:host\s*\{[^}]*background:\s*var\(--fx-surface-background\)/s);
  });

  it('hover da paginação não se aplica à página atual', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent;
    expect(style).toContain('.pg-btn:hover:not(:disabled):not([aria-current=');
  });

  it('renderiza a toolbar acima do header', () => {
    const el = mount(`<fx-table><template slot="toolbar"><button>Exportar</button></template>${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('.toolbar')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.toolbar')!.textContent).toContain('Exportar');
  });

  it('busca global da toolbar filtra por fields indicados em data-search-fields', () => {
    const data = [
      { id: 1, nome: 'Ana', cargo: 'Dev' },
      { id: 2, nome: 'Bruno', cargo: 'QA' },
      { id: 3, nome: 'Carla', cargo: 'Dev' },
    ];
    const el = mount(`<fx-table><template slot="toolbar"><input data-search-fields="cargo"></template><fx-column field="nome" header="Nome"></fx-column><fx-column field="cargo" header="Cargo"></fx-column></fx-table>`, data);
    const inp = el.shadowRoot!.querySelector('[data-search-fields]') as HTMLInputElement;
    inp.value = 'dev';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('busca sem data-search-fields procura em todas as colunas', () => {
    const data = [
      { id: 1, nome: 'Ana', cargo: 'Dev' },
      { id: 2, nome: 'Bruno', cargo: 'QA' },
      { id: 3, nome: 'Carla', cargo: 'Dev' },
    ];
    const el = mount(`<fx-table><template slot="toolbar"><input data-search-fields></template><fx-column field="nome" header="Nome"></fx-column><fx-column field="cargo" header="Cargo"></fx-column></fx-table>`, data);
    const inp = el.shadowRoot!.querySelector('[data-search-fields]') as HTMLInputElement;
    inp.value = 'carla';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(1);
  });
});

/* ---- Modo lazy (busca no servidor) ---- */

describe('fx-table — modo lazy (busca no servidor)', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('não pagina localmente — exibe data como está e usa o total do servidor no pager', () => {
    const data = [{ id: 1, nome: 'Ana', idade: 30 }, { id: 2, nome: 'Bruno', idade: 25 }];
    const el = mount(`<fx-table lazy total="30" pagination rows="10">${COLS}</fx-table>`, data);
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(2);
    expect(el.shadowRoot!.textContent).toContain('30 registros');
  });

  it('emite page-change com flag lazy=true para o consumidor re-buscar', () => {
    const el = mount(`<fx-table lazy total="30" pagination rows="2">${COLS}</fx-table>`, ROWS) as any;
    let detail: unknown;
    el.addEventListener('page-change', (e: Event) => { detail = (e as CustomEvent).detail; });
    el.shadowRoot!.querySelector('[data-pg="next"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((detail as any)?.lazy).toBe(true);
    expect((detail as any)?.page).toBe(2);
  });

  it('modo local (sem lazy) continua paginando e flag lazy=false', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS) as any;
    let detail: unknown;
    el.addEventListener('page-change', (e: Event) => { detail = (e as CustomEvent).detail; });
    el.shadowRoot!.querySelector('[data-pg="next"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((detail as any)?.lazy).toBe(false);
  });

  it('atributo loading renderiza overlay com spinner', () => {
    const el = mount(`<fx-table loading>${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('.loading-overlay')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.tbl-spinner')).toBeTruthy();
  });

  it('emite filter-change ao filtrar por coluna (composed, com flag lazy)', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS) as any;
    let detail: unknown;
    el.addEventListener('filter-change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const inp = el.shadowRoot!.querySelector('.filter[data-field="nome"]') as HTMLInputElement;
    inp.value = 'ana';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    expect((detail as any)?.field).toBe('nome');
    expect((detail as any)?.value).toBe('ana');
  });
});

