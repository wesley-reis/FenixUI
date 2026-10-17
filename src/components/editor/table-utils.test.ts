import { beforeEach, describe, expect, it } from 'vitest';
import { mergeSelectedCells, splitCell, tableMatrix } from './table-utils';

function buildTable(html: string): HTMLTableElement {
  const table = document.createElement('table');
  table.innerHTML = html;
  document.body.appendChild(table);
  return table;
}

function selectBetween(start: Node, end: Node): Range {
  const range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, end.childNodes.length);
  return range;
}

describe('table-utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('constrói a matriz respeitando rowspan/colspan', () => {
    const table = buildTable(
      '<tbody><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr></tbody>',
    );
    const { matrix } = tableMatrix(table);
    expect(matrix.length).toBe(2);
    expect(matrix[0][0]).toBe(table.rows[0].cells[0]);
    expect(matrix[1][0]).toBe(table.rows[0].cells[0]);
    expect(matrix[1][1]).toBe(table.rows[1].cells[0]);
  });

  it('mescla um retângulo 2x2 e divide de volta', () => {
    const table = buildTable(
      '<tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody>',
    );
    const first = table.rows[0].cells[0];
    const last = table.rows[1].cells[1];
    const merged = mergeSelectedCells(table, selectBetween(first, last));

    expect(merged).toBeTruthy();
    expect(merged!.colSpan).toBe(2);
    expect(merged!.rowSpan).toBe(2);
    expect(merged!.textContent).toContain('A');
    expect(merged!.textContent).toContain('D');
    expect(table.rows[0].cells.length).toBe(1);

    const created = splitCell(table, merged!);
    expect(created.length).toBe(3);
    expect(merged!.hasAttribute('colspan')).toBe(false);
    expect(merged!.hasAttribute('rowspan')).toBe(false);
    expect(table.rows[0].cells.length).toBe(2);
    expect(table.rows[1].cells.length).toBe(2);
  });

  it('não mescla seleção em L (não retangular)', () => {
    const table = buildTable(
      '<tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody>',
    );
    const range = document.createRange();
    range.setStart(table.rows[0].cells[0], 0);
    range.setEnd(table.rows[1].cells[0], table.rows[1].cells[0].childNodes.length);
    // A seleção linear toca A, B e C; o retângulo 2x2 não está completo.
    expect(mergeSelectedCells(table, range)).toBeNull();
  });
});
