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

/* ---- Template de célula imune a frameworks (Vue/React/Angular) ---- */

describe('fx-table — <fx-cell> (template seguro para frameworks)', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('<fx-cell> renderiza igual ao <template> legado', () => {
    const el = mount(`<fx-table><fx-column field="salario" header="Salário"><fx-cell>R$ {{ value | number }}</fx-cell></fx-column></fx-table>`,
      [{ id: 1, salario: 1234.5 }]);
    expect(el.shadowRoot!.querySelector('td')!.textContent).toContain('R$');
    expect(el.shadowRoot!.querySelector('td')!.textContent).toContain('1.234,5');
  });

  it('<fx-cell> aceita pipes, ternários e row.*', () => {
    const el = mount(
      `<fx-table><fx-column field="salario" header="S"><fx-cell>{{ value >= 6000 ? 'Sênior' : 'Júnior' }} de {{ row.cargo }}</fx-cell></fx-column></fx-table>`,
      [{ id: 1, salario: 7000, cargo: 'Dev' }]);
    expect(el.shadowRoot!.querySelector('td')!.textContent).toBe('Sênior de Dev');
  });

  it('<fx-cell> não é renderizado na tela (light DOM do fx-table é inerte)', () => {
    const el = mount(`<fx-table><fx-column field="nome" header="Nome"><fx-cell>{{ value }}</fx-cell></fx-column></fx-table>`, ROWS);
    // O conteúdo-fonte só existe na coluna; a tabela usa shadow root sem <slot>.
    expect(el.querySelector('fx-cell')?.textContent).toBe('{{ value }}');
    expect(el.shadowRoot!.querySelector('slot')).toBeNull();
    expect(el.shadowRoot!.textContent).toContain('Ana');
  });

  it('<fx-cell> tem precedência sobre <template> quando ambos existem', () => {
    const el = mount(
      `<fx-table><fx-column field="nome" header="Nome"><template>LEGADO</template><fx-cell>NOVO</fx-cell></fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('td')!.textContent).toBe('NOVO');
  });

  it('template="#id" aponta para um <template> declarado fora da tabela', () => {
    const tpl = document.createElement('template');
    tpl.id = 'tpl-externo';
    tpl.innerHTML = 'R$ {{ value | number }}';
    document.body.appendChild(tpl);
    const el = mount(`<fx-table><fx-column field="salario" header="S" template="#tpl-externo"></fx-column></fx-table>`,
      [{ id: 1, salario: 99.9 }]);
    expect(el.shadowRoot!.querySelector('td')!.textContent).toContain('99,9');
    tpl.remove();
  });

  it('template="id" (sem #) também resolve', () => {
    const tpl = document.createElement('template');
    tpl.id = 'tpl-sem-hash';
    tpl.innerHTML = 'VIA ID';
    document.body.appendChild(tpl);
    const el = mount(`<fx-table><fx-column field="nome" header="Nome" template="tpl-sem-hash"></fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('td')!.textContent).toBe('VIA ID');
    tpl.remove();
  });

  it('template com id inexistente não quebra a renderização', () => {
    const el = mount(`<fx-table><fx-column field="nome" header="Nome" template="#nao-existe"></fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(ROWS.length);
    expect(el.shadowRoot!.textContent).toContain('Ana');
  });

  it('seletor CSS inválido em template degrada sem lançar erro', () => {
    const el = mount(`<fx-table><fx-column field="nome" header="Nome" template="[[["></fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.textContent).toContain('Ana');
  });

  it('<template> legado continua funcionando (compatibilidade)', () => {
    const el = mount(`<fx-table><fx-column field="nome" header="Nome"><template>LEGADO</template></fx-column></fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('td')!.textContent).toBe('LEGADO');
  });

  it('<fx-toolbar> substitui <template slot="toolbar">', () => {
    const el = mount(`<fx-table><fx-toolbar><input data-search-fields="nome"><button>Exportar</button></fx-toolbar>${COLS}</fx-table>`, ROWS);
    const bar = el.shadowRoot!.querySelector('.toolbar')!;
    expect(bar.querySelector('[data-search-fields]')).toBeTruthy();
    expect(bar.textContent).toContain('Exportar');
  });

  it('<template slot="toolbar"> legado continua funcionando', () => {
    const el = mount(`<fx-table><template slot="toolbar"><button>Exportar</button></template>${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('.toolbar')!.textContent).toContain('Exportar');
  });

  it('toolbar="#id" aponta para um elemento externo', () => {
    const bar = document.createElement('div');
    bar.id = 'bar-externa';
    bar.innerHTML = '<button>Salvar</button>';
    document.body.appendChild(bar);
    const el = mount(`<fx-table toolbar="#bar-externa">${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('.toolbar')!.textContent).toContain('Salvar');
    bar.remove();
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

  it('striped usa a superfície cinza (nunca a cor do fundo do host)', () => {
    const el = mount(`<fx-table striped>${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent;
    // Regressão: usava --fx-surface-background, que é a MESMA cor do :host —
    // pintava branco sobre branco e o listrado não aparecia.
    const regra = style.match(/:host\(\[striped\]\) tbody tr:nth-child\(even\)\s*\{[^}]*\}/s)?.[0];
    expect(regra).toBeTruthy();
    expect(regra).toContain('var(--fx-surface-surface');
    expect(regra).not.toContain('--fx-surface-background');
  });

  it('hover das linhas é opt-in pelo atributo hover', () => {
    const el = mount(`<fx-table hover>${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent;
    expect(style).toContain(':host([hover]) tbody tr:hover');
    // Não pode sobrar hover de linha incondicional (fora do :host([hover])).
    const regras = style.match(/[^\n]*tbody tr:hover/g) ?? [];
    expect(regras).toHaveLength(1);
    expect(regras[0]).toContain(':host([hover])');
    expect(el.hasAttribute('hover')).toBe(true);
  });

  it('o pager usa glifos da Fenix Icons (não caracteres Unicode)', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const root = el.shadowRoot!;
    const ico = (sel: string) => root.querySelector(`${sel} .fx-icon`)?.textContent;
    expect(ico('[data-pg="first"]')).toBe('first_page');
    expect(ico('[data-pg="prev"]')).toBe('navigate_before');
    expect(ico('[data-pg="next"]')).toBe('navigate_next');
    expect(ico('[data-pg="last"]')).toBe('last_page');
    // Glifos Unicode («, ‹, ›, ») não podem mais aparecer no pager.
    expect(root.querySelector('.pager')!.textContent).not.toMatch(/[«‹›»]/);
  });

  it('o glifo do pager tem 1px a mais que o dígito (altura óptica)', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent;
    expect(style).toMatch(/\.pg-btn \.fx-icon\s*\{\s*font-size:\s*calc\(var\(--fx-font-size\) - 1px\)/s);
  });

  it('honra a ordenação inicial via sort-field / sort-order', () => {
    const el = mount(`<fx-table sort-field="nome" sort-order="asc">${COLS}</fx-table>`, ROWS);
    const celulas = [...el.shadowRoot!.querySelectorAll('tbody tr td:first-child')].map((td) => td.textContent);
    expect(celulas).toEqual([...celulas].sort((a, b) => a!.localeCompare(b!, 'pt-BR')));
    const desc = mount(`<fx-table sort-field="nome" sort-order="desc">${COLS}</fx-table>`, ROWS);
    const c2 = [...desc.shadowRoot!.querySelectorAll('tbody tr td:first-child')].map((td) => td.textContent);
    expect(c2).toEqual([...c2].sort((a, b) => b!.localeCompare(a!, 'pt-BR')));
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

/* ---- Bordas: arredondamento (rounded) e remoção das laterais (no-borders-x) ---- */

describe('fx-table — bordas e arredondamento', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('o padrão é rounded="md" via --fx-table-radius', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    expect(style).toContain('--fx-table-radius: var(--fx-radius-md);');
  });

  it('rounded aceita none|sm|md|lg (radius como alias)', () => {
    ['none', 'sm', 'md', 'lg'].forEach((v) => {
      const a = mount(`<fx-table rounded="${v}">${COLS}</fx-table>`, ROWS);
      const b = mount(`<fx-table radius="${v}">${COLS}</fx-table>`, ROWS);
      const esperado =
        v === 'none' ? 'var(--fx-radius-none, 0)' : `var(--fx-radius-${v})`;
      for (const el of [a, b]) {
        const style = el.shadowRoot!.querySelector('style')!.textContent!;
        expect(style).toContain(esperado);
      }
    });
  });

  it('rounded="none" zera o raio e as regras de borda usam a variável', () => {
    const el = mount(`<fx-table rounded="none">${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    const regra = style.match(/:host\(\[rounded="none"\]\)[^{]*\{[^}]*\}/s)?.[0];
    expect(regra).toContain('--fx-table-radius: var(--fx-radius-none, 0)');
    // A moldura, a tabela, a toolbar e o pager leem a variável (nada de
    // --fx-radius-md hardcoded, que era a causa do raio fixo).
    expect(style).not.toMatch(/\.frame\s*\{[^}]*--fx-radius-md/s);
    expect(style).toMatch(/\.frame\s*\{[^}]*border-radius:\s*var\(--fx-table-radius\)/s);
    expect(style).toMatch(/\.scroll\s*\{[^}]*var\(--fx-table-radius\)/s);
    expect(style).toMatch(/\.pager\s*\{[^}]*var\(--fx-table-radius\)/s);
  });

  it('no-borders-x remove só as bordas laterais da moldura e da toolbar', () => {
    const el = mount(`<fx-table no-borders-x><fx-toolbar>x</fx-toolbar>${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    const regra = style.match(/:host\(\[no-borders-x\]\)[^{]*\{[^}]*\}/s)?.[0];
    expect(regra).toBeTruthy();
    expect(regra).toContain('border-left: none');
    expect(regra).toContain('border-right: none');
    // Topo e base continuam: as regras não podem zerar border-top/bottom.
    expect(regra).not.toContain('border-top: none');
    expect(regra).not.toContain('border-bottom: none');
  });

  it('rounded e no-borders-x são observedAttributes (reagem a mudança em runtime)', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS) as any;
    const obs = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(obs).toContain('rounded');
    expect(obs).toContain('radius');
    expect(obs).toContain('no-borders-x');
  });
});

/* ---- Moldura: a paginação faz parte do contorno da tabela ---- */

describe('fx-table — moldura (borda envolvendo tabela + paginação)', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('tabela e paginação ficam dentro da mesma moldura .frame', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const frame = el.shadowRoot!.querySelector('.frame')!;
    expect(frame).toBeTruthy();
    expect(frame.querySelector('.scroll table')).toBeTruthy();
    expect(frame.querySelector('.pager')).toBeTruthy();
  });

  it('a borda fica na moldura, não no elemento rolável (evita a "borda flutuando")', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    const scroll = style.match(/\.scroll\s*\{[^}]*\}/s)?.[0];
    expect(scroll).toBeTruthy();
    expect(scroll).not.toContain('border:');
    // A moldura é quem desenha o contorno único.
    expect(style).toMatch(/\.frame\s*\{[^}]*border:\s*1px solid var\(--fx-border-default\)/s);
  });

  it('o pager ganha border-top, padding lateral e raio inferior da moldura', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    const pager = style.match(/\.pager\s*\{[^}]*\}/s)?.[0];
    expect(pager).toContain('border-top: 1px solid var(--fx-border-default)');
    expect(pager).toContain('padding: var(--fx-space-sm) var(--fx-space-md)');
    expect(pager).toContain('border-radius: 0 0 var(--fx-table-radius) var(--fx-table-radius)');
  });

  it('sem paginação o .scroll fecha o raio inferior da moldura', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('.pager')).toBeNull();
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    expect(style).toMatch(/:host\(:not\(\[pagination\]\)\) \.scroll\s*\{[^}]*border-radius:\s*var\(--fx-table-radius\)/s);
  });

  it('com toolbar a moldura não repete a borda superior', () => {
    const el = mount(`<fx-table><fx-toolbar>busca</fx-toolbar>${COLS}</fx-table>`, ROWS);
    const frame = el.shadowRoot!.querySelector('.frame')!;
    expect(frame.classList.contains('has-toolbar')).toBe(true);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    expect(style).toMatch(/\.frame\.has-toolbar\s*\{[^}]*border-top:\s*none/s);
  });

  it('sem toolbar a moldura não recebe a classe has-toolbar', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('.frame')!.classList.contains('has-toolbar')).toBe(false);
  });

  it('a moldura expõe part="frame" para estilização externa', () => {
    const el = mount(`<fx-table pagination>${COLS}</fx-table>`, ROWS);
    expect(el.shadowRoot!.querySelector('[part="frame"]')).toBeTruthy();
  });
});

/* ---- Seletor "Por página": largura compacta (só números) ---- */

describe('fx-table — seletor de itens por página compacto', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('limita a largura no HOST do fx-select, não só no trigger', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    const host = style.match(/fx-select\.rows-sel\s*\{[^}]*\}/)?.[0];
    expect(host).toBeTruthy();
    // O host do <fx-select> tem min-width 200px (180px em size="sm"): sem
    // sobrescrever as duas custom properties o rodapé fica largo demais.
    expect(host).toContain('--fx-select-min-width: 56px');
    expect(host).toContain('--fx-select-min-width-sm: 56px');
    // Não deixa o flex do .pager esticar nem esmagar o controle.
    expect(host).toContain('flex: none');
  });

  it('não usa mais !important no trigger (o limite real está no host)', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    const trigger = style.match(/fx-select\.rows-sel::part\(trigger\)\s*\{[^}]*\}/)?.[0];
    expect(trigger).toBeTruthy();
    expect(trigger).not.toContain('!important');
    expect(trigger).toContain('min-width: 0');
  });

  it('o seletor continua dentro do pager (não quebra o fluxo do rodapé)', () => {
    const el = mount(`<fx-table pagination rows="2">${COLS}</fx-table>`, ROWS);
    const sel = el.shadowRoot!.querySelector('fx-select.rows-sel')!;
    expect(sel.closest('.pager')).toBeTruthy();
    expect(sel.getAttribute('size')).toBe('sm');
  });
});


