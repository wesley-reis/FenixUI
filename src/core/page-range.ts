/**
 * Janela de páginas para paginadores (fx-pagination e fx-table).
 *
 * O padrão de mercado (MUI, Ant Design, PrimeNG) é mostrar a primeira página,
 * a última e uma janela móvel em torno da página atual, substituindo o miolo
 * por uma elipse:
 *
 *   página 1     → 1 2 3 4 5 … 1000
 *   página 500   → 1 … 499 [500] 501 … 1000
 *   página 1000  → 1 … 996 997 998 999 1000
 *
 * Assim o número de botões é constante (no máximo 7 itens) mesmo com milhares
 * de páginas — nunca renderizamos um botão por página.
 */

/** Item da janela: número de página (1-based) ou a elipse. */
export type PageRangeItem = number | 'ellipsis';

export interface PageRangeOptions {
  /** Páginas visíveis de cada lado da atual. Padrão: 1. */
  siblings?: number;
  /** Páginas fixas no início e no fim. Padrão: 1. */
  boundaries?: number;
}

/** Converte para inteiro finito, caindo no padrão quando o valor é inválido. */
function toInt(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

/** Intervalo inclusivo `[start, end]` (vazio quando `start > end`). */
function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let p = start; p <= end; p++) out.push(p);
  return out;
}

/**
 * Gera a janela de páginas de um paginador.
 *
 * @param current Página atual (1-based). Valores fora de `[1, count]` são
 *   normalizados para os limites.
 * @param count   Total de páginas. `0` devolve uma lista vazia.
 */
export function pageRange(
  current: number,
  count: number,
  options: PageRangeOptions = {},
): PageRangeItem[] {
  const pages = Math.max(0, toInt(count, 0));
  if (pages === 0) return [];

  const boundaries = Math.max(0, toInt(options.boundaries ?? 1, 1));
  const siblings = Math.max(0, toInt(options.siblings ?? 1, 1));
  const page = Math.min(Math.max(1, toInt(current, 1)), pages);

  /*
   * Quando o total cabe na janela completa (bordas + vizinhos + atual + as
   * duas elipses) não há buraco a esconder: mostra todas as páginas.
   */
  if (pages <= boundaries * 2 + siblings * 2 + 3) return range(1, pages);

  const startPages = range(1, Math.min(boundaries, pages));
  const endPages = range(
    Math.max(pages - boundaries + 1, boundaries + 1),
    pages,
  );

  // Janela em torno da atual, presa para não encostar nas bordas.
  const siblingsStart = Math.max(
    Math.min(page - siblings, pages - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblings, boundaries + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : pages - 1,
  );

  const items: PageRangeItem[] = [...startPages];

  // Elipse só quando existe buraco; se faltar apenas uma página, mostra o número.
  if (siblingsStart > boundaries + 2) items.push('ellipsis');
  else if (boundaries + 1 < pages - boundaries) items.push(boundaries + 1);

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < pages - boundaries - 1) items.push('ellipsis');
  else if (pages - boundaries > boundaries) items.push(pages - boundaries);

  items.push(...endPages);
  return items;
}
