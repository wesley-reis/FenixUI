import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FxPickList, defineFxPickList } from './picklist';

describe('FxPickList', () => {
  let element: FxPickList;

  beforeEach(() => {
    defineFxPickList();
    element = document.createElement('fx-picklist') as FxPickList;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should create element', () => {
    expect(element).toBeInstanceOf(FxPickList);
  });

  it('should have default source and target as empty arrays', () => {
    expect(element.source).toEqual([]);
    expect(element.target).toEqual([]);
  });

  it('should set source correctly', () => {
    const items = [{ label: 'Item 1' }, { label: 'Item 2' }];
    element.source = items;
    expect(element.source).toEqual(items);
  });

  it('should set target correctly', () => {
    const items = [{ label: 'Item A' }];
    element.target = items;
    expect(element.target).toEqual(items);
  });

  it('should render source and target lists', () => {
    element.source = [{ label: 'Apple' }, { label: 'Banana' }];
    element.target = [{ label: 'Cherry' }];
    const lists = element.shadowRoot!.querySelectorAll('.list');
    expect(lists.length).toBe(2);
    expect(lists[0].querySelectorAll('.list-item').length).toBe(2);
    expect(lists[1].querySelectorAll('.list-item').length).toBe(1);
  });

  it('should move item to target', () => {
    element.source = [{ label: 'A' }, { label: 'B' }];
    element.target = [];
    element.selectionMode = 'single';
    const sourceList = element.shadowRoot!.querySelector('.source-list')!;
    const firstItem = sourceList.querySelector('.list-item') as HTMLElement;
    firstItem.click();
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const moveTargetBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-target') as HTMLButtonElement;
    moveTargetBtn.click();
    expect(element.source.length).toBe(1);
    expect(element.target.length).toBe(1);
  });

  it('should move all items to target', () => {
    element.source = [{ label: 'A' }, { label: 'B' }];
    element.target = [];
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const moveAllBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-all-target') as HTMLButtonElement;
    moveAllBtn.click();
    expect(element.source.length).toBe(0);
    expect(element.target.length).toBe(2);
  });

  it('should move item back to source', () => {
    element.source = [];
    element.target = [{ label: 'A' }, { label: 'B' }];
    element.selectionMode = 'single';
    const targetList = element.shadowRoot!.querySelector('.target-list')!;
    const firstItem = targetList.querySelector('.list-item') as HTMLElement;
    firstItem.click();
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const moveSourceBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-source') as HTMLButtonElement;
    moveSourceBtn.click();
    expect(element.source.length).toBe(1);
    expect(element.target.length).toBe(1);
  });

  it('should filter source items', () => {
    element.source = [{ label: 'Apple' }, { label: 'Banana' }, { label: 'Cherry' }];
    element.filter = true;
    element.sourceFilterValue = 'an';
    const sourceList = element.shadowRoot!.querySelector('.source-list')!;
    const items = sourceList.querySelectorAll('.list-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Banana');
  });

  it('should filter target items', () => {
    element.target = [{ label: 'Apple' }, { label: 'Banana' }];
    element.filter = true;
    element.targetFilterValue = 'ba';
    const targetList = element.shadowRoot!.querySelector('.target-list')!;
    const items = targetList.querySelectorAll('.list-item');
    expect(items.length).toBe(1);
  });

  it('should emit move-to-target event', () => {
    element.source = [{ label: 'A' }];
    element.target = [];
    element.selectionMode = 'single';
    let emitted = false;
    element.addEventListener('move-to-target', () => { emitted = true; });
    const sourceList = element.shadowRoot!.querySelector('.source-list')!;
    const firstItem = sourceList.querySelector('.list-item') as HTMLElement;
    firstItem.click();
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn');
    const moveTargetBtn = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-target') as HTMLButtonElement;
    moveTargetBtn.click();
    expect(emitted).toBe(true);
  });

  it('should support single selection mode', () => {
    element.source = [{ label: 'A' }, { label: 'B' }];
    element.selectionMode = 'single';
    const sourceList = element.shadowRoot!.querySelector('.source-list')!;
    const items = sourceList.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
    items[0].click();
    items[1].click();
    expect(element.sourceSelection.length).toBe(1);
  });

  it('should support multiple selection mode', () => {
    element.source = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    element.selectionMode = 'multiple';
    const sourceList = element.shadowRoot!.querySelector('.source-list')!;
    const items = sourceList.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
    items[0].click();
    items[1].click();
    expect(element.sourceSelection.length).toBe(2);
  });

  it('should disable controls when no selection', () => {
    element.source = [{ label: 'A' }];
    element.target = [];
    const buttons = element.shadowRoot!.querySelectorAll('.control-btn') as NodeListOf<HTMLButtonElement>;
    const moveTarget = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-target');
    const moveAllTarget = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-all-target');
    const moveSource = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-source');
    const moveAllSource = Array.from(buttons).find(b => b.getAttribute('data-action') === 'move-all-source');
    expect(moveTarget!.disabled).toBe(true);
    expect(moveAllTarget!.disabled).toBe(false);
    expect(moveSource!.disabled).toBe(true);
    expect(moveAllSource!.disabled).toBe(true);
  });

  it('should use sourceKey and targetKey', () => {
    element.source = [{ id: 1, label: 'A' }, { id: 2, label: 'B' }];
    element.sourceKey = 'id';
    element.selectionMode = 'single';
    const sourceList = element.shadowRoot!.querySelector('.source-list')!;
    const items = sourceList.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
    items[0].click();
    expect(element.sourceSelection.length).toBe(1);
  });
});

