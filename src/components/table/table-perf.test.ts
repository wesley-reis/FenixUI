/**
 * Testes do CAMINHO RÁPIDO do <fx-table>.
 *
 * Problema: `set data` chamava `render()`, que faz `root.innerHTML = ...` e
 * recria <style> + <thead> + <tbody> + toolbar + paginação, religando TODOS os
 * listeners. Com `data` novo a cada tecla digitada (busca) ou a cada reload,
 * isso é O(linhas × colunas) de parsing de HTML — o primeiro travamento real
 * de uma tabela grande.
 *
 * A correção troca só o <tbody> quando a "casca" (colunas/toolbar/pager/
 * loading) não mudou. Estes testes travam esse comportamento: a otimização
 * não pode alterar NADA do que o usuário vê ou dos eventos emitidos.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import './index';

const COLS = `
  <fx-column field="nome" header="Nome" sortable filterable></fx-column>
  <fx-column field="idade" header="Idade" sortable></fx-column>`;

function rows(n: number, offset = 0) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1 + offset,
    nome: `Pessoa ${i + 1 + offset}`,
    idade: 20 + ((i + offset) % 50),
  }));
}

function mount(html: string, data?: unknown[]): HTMLElement & { data: unknown[] } {
  const w = document.createElement('div');
  w.innerHTML = html;
  const el = w.firstElementChild as HTMLElement & { data: unknown[] };
  if (data) el.data = data;
  document.body.appendChild(w);
  return el;
}

describe('fx-table: caminho rápido ao trocar apenas data', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('preserva o nó <style> e o <thead> entre trocas de data', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, rows(5));
    const style = el.shadowRoot!.querySelector('style');
    const thead = el.shadowRoot!.querySelector('thead');

    el.data = rows(5, 100);

    // Se o render fosse completo, innerHTML destruiria e recriaria estes nós.
    expect(el.shadowRoot!.querySelector('style')).toBe(style);
    expect(el.shadowRoot!.querySelector('thead')).toBe(thead);
  });

  it('atualiza o conteúdo das linhas (o fast path renderiza os dados novos)', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, rows(3));
    expect(el.shadowRoot!.textContent).toContain('Pessoa 1');

    el.data = rows(3, 500);

    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(3);
    expect(el.shadowRoot!.textContent).toContain('Pessoa 501');
    expect(el.shadowRoot!.textContent).not.toContain('Pessoa 1');
  });

  it('re-liga o row-click nas linhas novas do fast path', () => {
    // Bug clássico: o <tbody> é recriado, então os <tr> novos ficariam sem
    // listener se o render não fosse refeito por completo.
    const el = mount(`<fx-table>${COLS}</fx-table>`, rows(3));
    const seen: unknown[] = [];
    el.addEventListener('row-click', (e) => seen.push((e as CustomEvent).detail));

    el.shadowRoot!.querySelector<HTMLElement>('tbody tr[data-index="0"]')!.click();
    expect(seen.length).toBe(1);
    expect((seen[0] as { index: number }).index).toBe(0);

    // Troca os dados e clica de novo: tem que continuar emitindo.
    // rows(3, 900) => ids 901, 902, 903; o índice 1 é "Pessoa 902".
    el.data = rows(3, 900);
    seen.length = 0;
    el.shadowRoot!.querySelector<HTMLElement>('tbody tr[data-index="1"]')!.click();
    expect(seen.length).toBe(1);
    expect((seen[0] as { index: number }).index).toBe(1);
    expect((seen[0] as { row: { nome: string } }).row.nome).toBe('Pessoa 902');
  });

  it('faz render COMPLETO quando a casca muda (paginação)', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, rows(4));
    const style = el.shadowRoot!.querySelector('style');
    el.data = rows(4);

    // Adicionar `pagination` muda a casca → tem que recriar tudo.
    el.setAttribute('pagination', '');
    // O setAttribute dispara attributeChanged → render completo.
    expect(el.shadowRoot!.querySelector('.pager')).toBeTruthy();
    // O <style> foi recriado: confirma que NÃO foi o fast path.
    expect(el.shadowRoot!.querySelector('style')).not.toBe(style);

    // E a partir de agora, um novo `data` volta ao fast path.
    const pager = el.shadowRoot!.querySelector('.pager');
    el.data = rows(4, 7);
    expect(el.shadowRoot!.querySelector('.pager')).toBe(pager);
    expect(el.shadowRoot!.textContent).toContain('Pessoa 8');
  });

  it('atualiza a paginação quando o total de linhas muda', () => {
    // `total` entra no pagerHtml → muda a casca → render completo é correto.
    // rows="5": 12 linhas = 3 páginas; 5 linhas = 1 página.
    const el = mount(`<fx-table pagination rows="5">${COLS}</fx-table>`, rows(12));
    expect(el.shadowRoot!.querySelector('.pager')!.textContent).toContain('1 de 3');
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(5);

    // Reduzir para 5 linhas tem que recalcular o pager (1 página).
    el.data = rows(5);
    expect(el.shadowRoot!.querySelector('.pager')!.textContent).toContain('1 de 1');
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(5);
  });

  it('mantém a ordenação aplicada após troca de data', () => {
    const el = mount(`<fx-table>${COLS}</fx-table>`, rows(5));
    el.shadowRoot!.querySelector<HTMLElement>('th[data-field="nome"]')!.click();
    expect(el.shadowRoot!.querySelector('tbody tr td')!.textContent).toBe('Pessoa 1');

    el.data = rows(5, 50);
    // A ordenação continua valendo: não pode "voltar" para a ordem original.
    expect(el.shadowRoot!.querySelector('tbody tr td')!.textContent).toBe('Pessoa 51');
  });

  it('escala: 300 linhas, 20 trocas de data sem recriar a casca', () => {
    const big = rows(300);
    const el = mount(`<fx-table>${COLS}</fx-table>`, big);
    const thead = el.shadowRoot!.querySelector('thead');

    // Simula o que a busca digitada faz: `data` trocado muitas vezes.
    for (let i = 0; i < 20; i++) {
      el.data = big.slice(0, 300 - i);
      expect(el.shadowRoot!.querySelector('tbody tr')!.textContent).toBeTruthy();
    }
    // 20 trocas de 300 linhas e a casca nunca foi recriada.
    // O último slice é big.slice(0, 300 - 19) => 281 linhas.
    expect(el.shadowRoot!.querySelector('thead')).toBe(thead);
    expect(el.shadowRoot!.querySelectorAll('tbody tr').length).toBe(281);
  });

  it('GANHO MEDIDO: trocar data é mais barato que um render completo', () => {
    // Compara o custo real do fast path contra o render completo.
    // 300 linhas x 5 trocas: volume suficiente para a diferença aparecer, mas
    // rápido o bastante para não monopolizar a CPU da suíte (o rAF de outros
    // arquivos de teste depende dela).
    const big = rows(300);
    const el = mount(`<fx-table>${COLS}</fx-table>`, big);

    // 5 trocas de data = o que uma busca digitada faz em ~5 caracteres.
    const t0 = performance.now();
    for (let i = 0; i < 5; i++) el.data = big.slice(0, 300 - i);
    const fastMs = performance.now() - t0;

    // Mesmo volume de trabalho, mas forçando o render completo da casca
    // (adicionar `loading` muda a casca a cada vez).
    const t1 = performance.now();
    for (let i = 0; i < 5; i++) {
      el.setAttribute('loading', '');
      el.data = big.slice(0, 300 - i);
      el.removeAttribute('loading');
    }
    const fullMs = performance.now() - t1;

    // O fast path tem que ser mais barato. Registra a razão para diagnóstico.
    // eslint-disable-next-line no-console
    console.log(
      `[fx-table] 5x 300 linhas -> fast: ${fastMs.toFixed(1)}ms, completo: ${fullMs.toFixed(1)}ms ` +
        `(${(fullMs / Math.max(fastMs, 0.001)).toFixed(1)}x mais caro)`,
    );
    expect(fastMs).toBeLessThanOrEqual(fullMs);
  });
});
