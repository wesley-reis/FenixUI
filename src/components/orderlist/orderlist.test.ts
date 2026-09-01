import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FxOrderList, defineFxOrderList } from './orderlist';

describe('FxOrderList', () => {
  let element: FxOrderList;

  beforeEach(() => {
    defineFxOrderList();
    element = document.createElement('fx-orderlist') as FxOrderList;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should create element', () => {
    expect(element).toBeInstanceOf(FxOrderList);
  });

  it('should have default data as empty array', () => {
    expect(element.data).toEqual([]);
  });

  it('should set data correctly', () => {
    const items = [{ label: 'Item 1' }, { label: 'Item 2' }, { label: 'Item 3' }];
    element.data = items;
    expect(element.data).toEqual(items);
  });

  it('should render list items', () => {
    element.data = [{ label: 'Apple' }, { label: 'Banana' }, { label: 'Cherry' }];
    const listItems = element.shadowRoot!.querySelectorAll('.list-item');
    expect(listItems.length).toBe(3);
  });

  it('should filter items when filter is enabled', () => {
    element.data = [{ label: 'Apple' }, { label: 'Banana' }, { label: 'Cherry' }];
    element.filter = true;
    element.filterValue = 'an';
    const listItems = element.shadowRoot!.querySelectorAll('.list-item');
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain('Banana');
  });

  it('should show empty message when filter returns no results', () => {
    element.data = [{ label: 'Apple' }, { label: 'Banana' }];
    element.filter = true;
    element.filterValue = 'xyz';
    const emptyMessage = element.shadowRoot!.querySelector('.empty-message');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage!.textContent).toContain('Nenhum resultado encontrado');
  });

  it('should move item up', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    element.selection = [{ label: 'B' }];
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const upBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'up') as HTMLButtonElement;
    upBtn.click();
    expect(element.data.map(i => i.label)).toEqual(['B', 'A', 'C']);
  });

  it('should move item to top', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    element.selection = [{ label: 'C' }];
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const topBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'top') as HTMLButtonElement;
    topBtn.click();
    expect(element.data.map(i => i.label)).toEqual(['C', 'A', 'B']);
  });

  it('should emit reorder event', () => {
    element.data = [{ label: 'A' }, { label: 'B' }];
    element.selection = [{ label: 'B' }];
    let emitted = false;
    element.addEventListener('reorder', () => { emitted = true; });
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const upBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'up') as HTMLButtonElement;
    upBtn.click();
    expect(emitted).toBe(true);
  });

  it('should support single selection mode', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    element.selectionMode = 'single';
    const listItems = element.shadowRoot!.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
    listItems[0].click();
    listItems[1].click();
    expect(element.selection.length).toBe(1);
  });

  it('should support multiple selection mode', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    element.selectionMode = 'multiple';
    const listItems = element.shadowRoot!.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
    listItems[0].click();
    listItems[1].click();
    expect(element.selection.length).toBe(2);
  });

  it('should disable controls when no selection', () => {
    element.data = [{ label: 'A' }, { label: 'B' }];
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn') as NodeListOf<HTMLButtonElement>;
    buttons.forEach(btn => {
      expect(btn.disabled).toBe(true);
    });
  });

  it('should use dataKey for item identification', () => {
    element.data = [{ id: 1, label: 'A' }, { id: 2, label: 'B' }];
    element.dataKey = 'id';
    element.selection = [{ id: 1, label: 'A' }];
    const listItems = element.shadowRoot!.querySelectorAll('.list-item');
    expect(listItems[0].classList.contains('selected')).toBe(true);
    expect(listItems[1].classList.contains('selected')).toBe(false);
  });

  it('should use filterBy for multiple fields', () => {
    element.data = [{ name: 'John', city: 'NYC' }, { name: 'Jane', city: 'LA' }];
    element.filter = true;
    element.filterBy = 'name,city';
    element.filterValue = 'la';
    const listItems = element.shadowRoot!.querySelectorAll('.list-item');
    expect(listItems.length).toBe(1);
  });
it('should move multiple selected items one step up without jumping to top', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }, { label: 'E' }];
    element.selectionMode = 'multiple';
    element.selection = [{ label: 'C' }, { label: 'D' }];
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const upBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'up') as HTMLButtonElement;
    upBtn.click();
    expect(element.data.map(i => i.label)).toEqual(['A', 'C', 'D', 'B', 'E']);
  });

  it('should move multiple selected items one step down without jumping to end', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }, { label: 'E' }];
    element.selectionMode = 'multiple';
    element.selection = [{ label: 'B' }, { label: 'C' }];
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const downBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'down') as HTMLButtonElement;
    downBtn.click();
    expect(element.data.map(i => i.label)).toEqual(['A', 'D', 'B', 'C', 'E']);
  });

  it('should support select all in multiple mode with show-select-all', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    element.selectionMode = 'multiple';
    element.showSelectAll = true;
    const selectAllCheckbox = element.shadowRoot!.querySelector('.select-all-checkbox') as HTMLInputElement;
    expect(selectAllCheckbox).toBeTruthy();
    selectAllCheckbox.click();
    expect(element.selection.length).toBe(3);
    // Checkbox is re-rendered after update; re-query and click again to deselect all
    const selectAllCheckbox2 = element.shadowRoot!.querySelector('.select-all-checkbox') as HTMLInputElement;
    selectAllCheckbox2.click();
    expect(element.selection.length).toBe(0);
  });

  it('should allow selection and reordering without selection-mode attribute', () => {
    element.data = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    const listItems = element.shadowRoot!.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
    listItems[0].click();
    expect(element.selection.length).toBe(1);
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const downBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'down') as HTMLButtonElement;
    downBtn.click();
    expect(element.data.map(i => i.label)).toEqual(['B', 'A', 'C']);
  });
});

