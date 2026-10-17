/**
 * Utilitários de tabela do <fx-editor>.
 *
 * O editor usa `td/th` com colspan/rowspan; para mesclar/dividir células
 * precisamos de uma matriz lógica que considere os spans. Este módulo é puro
 * (recebe a tabela e o Range) para poder ser testado sem o componente.
 */

export interface TableCellPosition {
  row: number;
  col: number;
}

export interface TableMatrix {
  rows: HTMLTableRowElement[];
  matrix: Array<Array<HTMLTableCellElement | null>>;
}

/** Constrói a matriz lógica da tabela respeitando colspan/rowspan. */
export function tableMatrix(table: HTMLTableElement): TableMatrix {
  const rows = Array.from(table.rows);
  const matrix: Array<Array<HTMLTableCellElement | null>> = rows.map(() => []);

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    for (const cell of Array.from(row.cells)) {
      let col = 0;
      while (matrix[rowIndex][col]) col++;

      const rowspan = Math.max(1, Math.min(cell.rowSpan || 1, rows.length - rowIndex));
      const colspan = Math.max(1, cell.colSpan || 1);

      for (let r = rowIndex; r < rowIndex + rowspan; r++) {
        if (!matrix[r]) matrix[r] = [];
        for (let c = col; c < col + colspan; c++) matrix[r][c] = cell;
      }
    }
  }

  const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  for (const row of matrix) {
    while (row.length < width) row.push(null);
  }

  return { rows, matrix };
}

/** Posição lógica (primeira célula da matriz) de uma célula. */
export function cellPosition(table: HTMLTableElement, cell: HTMLTableCellElement): TableCellPosition | null {
  const { matrix } = tableMatrix(table);
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === cell) return { row, col };
    }
  }
  return null;
}

/** Células tocadas pela seleção atual. */
export function selectedCells(table: HTMLTableElement, range: Range): HTMLTableCellElement[] {
  return Array.from(table.querySelectorAll<HTMLTableCellElement>('td,th')).filter((cell) => {
    try {
      return range.intersectsNode(cell);
    } catch {
      return false;
    }
  });
}

function copyCellAttributes(from: HTMLTableCellElement, to: HTMLTableCellElement): void {
  for (const attr of Array.from(from.attributes)) {
    if (attr.name === 'colspan' || attr.name === 'rowspan') continue;
    to.setAttribute(attr.name, attr.value);
  }
}

/**
 * Mescla as células selecionadas em uma única célula retangular.
 * Retorna a célula mesclada ou null quando a seleção não forma um retângulo
 * simples (spans que saem da área, seleção em uma única célula etc.).
 */
export function mergeSelectedCells(
  table: HTMLTableElement,
  range: Range,
): HTMLTableCellElement | null {
  const cells = selectedCells(table, range);
  if (cells.length < 2) return null;

  const { matrix } = tableMatrix(table);
  const positions = cells
    .map((cell) => ({ cell, position: cellPosition(table, cell) }))
    .filter((item): item is { cell: HTMLTableCellElement; position: TableCellPosition } => Boolean(item.position));
  if (positions.length !== cells.length) return null;

  const minRow = Math.min(...positions.map((item) => item.position.row));
  const maxRow = Math.max(...positions.map((item) => item.position.row));
  const minCol = Math.min(...positions.map((item) => item.position.col));
  const maxCol = Math.max(...positions.map((item) => item.position.col));

  // Nenhuma célula selecionada pode extrapolar o retângulo.
  for (const { cell, position } of positions) {
    if (position.row < minRow || position.col < minCol) return null;
    if (position.row + Math.max(1, cell.rowSpan || 1) - 1 > maxRow) return null;
    if (position.col + Math.max(1, cell.colSpan || 1) - 1 > maxCol) return null;
  }

  // O retângulo inteiro precisa estar coberto pelas células selecionadas.
  const selected = new Set(cells);
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const cell = matrix[row]?.[col];
      if (!cell || !selected.has(cell)) return null;
    }
  }

  const anchor = matrix[minRow]?.[minCol];
  if (!anchor) return null;

  const tag = cells.every((cell) => cell.tagName.toLowerCase() === 'th') ? 'th' : 'td';
  const merged = document.createElement(tag) as HTMLTableCellElement;
  copyCellAttributes(anchor, merged);
  if (tag === 'td') merged.removeAttribute('scope');

  merged.colSpan = maxCol - minCol + 1;
  merged.rowSpan = maxRow - minRow + 1;
  if (merged.colSpan === 1) merged.removeAttribute('colspan');
  if (merged.rowSpan === 1) merged.removeAttribute('rowspan');

  for (const cell of cells) {
    while (cell.firstChild) merged.appendChild(cell.firstChild);
  }

  anchor.replaceWith(merged);
  for (const cell of cells) {
    if (cell !== anchor && cell.parentNode) cell.remove();
  }

  return merged;
}

/** Insere uma célula na posição lógica `col` de uma linha. */
function insertCellAtColumn(
  table: HTMLTableElement,
  row: HTMLTableRowElement,
  col: number,
  cell: HTMLTableCellElement,
): void {
  const rowIndex = Array.from(table.rows).indexOf(row);
  const { matrix } = tableMatrix(table);
  let before: HTMLTableCellElement | null = null;

  for (const existing of Array.from(row.cells)) {
    let start = -1;
    for (let c = 0; c < (matrix[rowIndex]?.length ?? 0); c++) {
      if (matrix[rowIndex][c] === existing) {
        start = c;
        break;
      }
    }
    if (start >= col) {
      before = existing;
      break;
    }
  }

  row.insertBefore(cell, before);
}

/**
 * Divide uma célula mesclada.
 * Retorna as células criadas (sem a original) ou [] se não havia merge.
 */
export function splitCell(table: HTMLTableElement, cell: HTMLTableCellElement): HTMLTableCellElement[] {
  const colspan = Math.max(1, cell.colSpan || 1);
  const rowspan = Math.max(1, cell.rowSpan || 1);
  if (colspan === 1 && rowspan === 1) return [];

  const position = cellPosition(table, cell);
  if (!position) return [];

  const rows = Array.from(table.rows);
  const makeCell = (): HTMLTableCellElement => {
    const next = document.createElement(cell.tagName.toLowerCase()) as HTMLTableCellElement;
    if (next.tagName.toLowerCase() === 'th') {
      next.setAttribute('scope', cell.getAttribute('scope') ?? 'col');
    }
    next.innerHTML = '<p><br></p>';
    return next;
  };

  const created: HTMLTableCellElement[] = [];

  // Linha da célula original: abre as colunas extras ao lado dela.
  let last: Element = cell;
  for (let index = 1; index < colspan; index++) {
    const next = makeCell();
    last.after(next);
    last = next;
    created.push(next);
  }

  // Libera a área lógica antes de preencher as linhas abaixo.
  cell.removeAttribute('colspan');
  cell.removeAttribute('rowspan');

  // Linhas abaixo: preenche a área do rowspan.
  for (let index = 1; index < rowspan; index++) {
    const row = rows[position.row + index];
    if (!row) break;
    for (let offset = 0; offset < colspan; offset++) {
      const next = makeCell();
      insertCellAtColumn(table, row, position.col + offset, next);
      created.push(next);
    }
  }

  return created;
}

