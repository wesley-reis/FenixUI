import { describe, expect, it } from 'vitest';
import { pageRange } from './page-range';

describe('pageRange', () => {
  it('devolve lista vazia sem páginas', () => {
    expect(pageRange(1, 0)).toEqual([]);
  });

  it('mostra todas as páginas quando cabem na janela', () => {
    expect(pageRange(1, 1)).toEqual([1]);
    expect(pageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    // 2 bordas + 2 vizinhos + atual + 2 elipses = 7 itens: sem buraco.
    expect(pageRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('no início mantém a janela encostada na borda esquerda', () => {
    expect(pageRange(1, 1000)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 1000]);
    expect(pageRange(2, 1000)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 1000]);
    expect(pageRange(3, 1000)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 1000]);
  });

  it('no meio mostra elipses dos dois lados', () => {
    expect(pageRange(500, 1000)).toEqual([1, 'ellipsis', 499, 500, 501, 'ellipsis', 1000]);
  });

  it('no fim mantém a janela encostada na borda direita', () => {
    expect(pageRange(1000, 1000)).toEqual([1, 'ellipsis', 996, 997, 998, 999, 1000]);
    expect(pageRange(999, 1000)).toEqual([1, 'ellipsis', 996, 997, 998, 999, 1000]);
  });

  it('nunca gera mais de 7 itens, qualquer que seja o total', () => {
    for (const page of [1, 2, 3, 4, 5, 6, 250, 499, 500, 501, 750, 995, 999, 1000]) {
      const items = pageRange(page, 1000);
      expect(items.length).toBeLessThanOrEqual(7);
      expect(items.filter((i) => typeof i === 'number')).toContain(page);
      // As bordas nunca desaparecem.
      expect(items[0]).toBe(1);
      expect(items[items.length - 1]).toBe(1000);
    }
  });

  it('normaliza página atual fora dos limites', () => {
    expect(pageRange(0, 1000)).toEqual(pageRange(1, 1000));
    expect(pageRange(-5, 1000)).toEqual(pageRange(1, 1000));
    expect(pageRange(5000, 1000)).toEqual(pageRange(1000, 1000));
    expect(pageRange(Number.NaN, 1000)).toEqual(pageRange(1, 1000));
  });

  it('respeita siblings e boundaries customizados', () => {
    // Janela de 2 vizinhos de cada lado, mantendo as bordas.
    expect(pageRange(3, 20, { siblings: 2, boundaries: 1 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      'ellipsis',
      20,
    ]);
    // Sem bordas: a janela começa direto na página atual.
    expect(pageRange(10, 100, { siblings: 1, boundaries: 0 })).toEqual([
      'ellipsis',
      9,
      10,
      11,
      'ellipsis',
    ]);
  });
});
