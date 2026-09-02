import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';

export interface OrderListItem {
  [key: string]: unknown;
}

/**
 * <fx-orderlist> - Componente para ordenar uma colecao de itens.
 *
 * Permite reordenar itens arrastando ou usando botoes de controle.
 * Suporta filtro, selecao, checkbox e templates customizados.
 *
 * Atributos: data, data-key, filter, filter-by, filter-placeholder, breakpoint,
 * dragdrop, selection-mode, striped, show-select-all.
 * Evento: `reorder` (composed, detail: { items }).
 * Evento: `selection-change` (composed, detail: { selection }).
 */
export class FxOrderList extends FxElement {
  static override styles = css`

    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --orderlist-primary: var(--fx-color-primary, #3b82f6);
      --orderlist-border: var(--fx-border-default, #e2e8f0);
      --orderlist-bg: var(--fx-surface-background, #ffffff);
      --orderlist-bg-hover: var(--fx-surface-surface-hover, #f1f5f9);
      --orderlist-text: var(--fx-text-default, #1e293b);
      --orderlist-text-muted: var(--fx-text-muted, #64748b);
      --orderlist-radius: var(--fx-radius-md, 8px);
      --orderlist-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      --orderlist-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    * { box-sizing: border-box; }
    .container { display: flex; flex-direction: column; gap: var(--fx-space-md, 16px); }
    .list-wrapper { display: flex; flex-direction: column; gap: var(--fx-space-sm, 8px); flex: 1; min-width: 0; }
    .select-all-bar { display: flex; align-items: center; justify-content: space-between; padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px); background: linear-gradient(135deg, var(--orderlist-bg), var(--orderlist-bg-hover)); border: 1px solid var(--orderlist-border); border-radius: var(--orderlist-radius); font-size: 0.9em; font-weight: 500; }
    .select-all-bar label { display: flex; align-items: center; gap: var(--fx-space-sm, 10px); cursor: pointer; user-select: none; color: var(--orderlist-text); }
    .select-all-bar input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--orderlist-primary); cursor: pointer; }
    .filter-wrapper { margin-bottom: var(--fx-space-xs, 4px); }
    .filter-input { width: 100%; padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px); padding-left: 42px; border: 1.5px solid var(--orderlist-border); border-radius: var(--orderlist-radius); font-family: inherit; font-size: inherit; color: var(--orderlist-text); background: var(--orderlist-bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 14px center; transition: var(--orderlist-transition); }
    .filter-input:focus { outline: none; border-color: var(--orderlist-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--orderlist-primary) 20%, transparent); }
    .filter-input::placeholder { color: var(--orderlist-text-muted); }
    .main-row { display: flex; align-items: stretch; gap: var(--fx-space-sm, 8px); }
    .list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--orderlist-border); border-radius: var(--orderlist-radius); overflow: hidden; box-shadow: var(--orderlist-shadow); max-height: 450px; overflow-y: auto; flex: 1; }
    .list::-webkit-scrollbar { width: 6px; }
    .list::-webkit-scrollbar-track { background: transparent; }
    .list::-webkit-scrollbar-thumb { background: var(--orderlist-border); border-radius: 3px; }
    .list::-webkit-scrollbar-thumb:hover { background: var(--orderlist-text-muted); }
    .selection-count { font-size: 0.85em; color: var(--orderlist-primary); background: color-mix(in srgb, var(--orderlist-primary) 12%, transparent); padding: 4px 12px; border-radius: 20px; font-weight: 600; }
    :host([striped]) .list-item:nth-child(even) { background: var(--fx-surface-surface, #f8fafc); }
    .list-item { display: flex; align-items: center; gap: var(--fx-space-sm, 10px); padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px); background: var(--orderlist-bg); border-bottom: 1px solid var(--orderlist-border); cursor: pointer; user-select: none; transition: var(--orderlist-transition); }
    .list-item:last-child { border-bottom: none; }
    .list-item:hover { background: var(--orderlist-bg-hover); }
    .list-item.selected { background: color-mix(in srgb, var(--orderlist-primary) 8%, transparent); border-left: 3px solid var(--orderlist-primary); padding-left: 11px; }
    .list-item:focus-visible { outline: none; background: color-mix(in srgb, var(--orderlist-primary) 15%, transparent); }
    .list-item.dragging { opacity: 0.5; background: var(--orderlist-bg-hover); }
    .list-item.drag-over { border-top: 2px solid var(--orderlist-primary); }
    .drag-handle { color: var(--orderlist-text-muted); cursor: grab; flex-shrink: 0; font-size: 1.2em; opacity: 0.6; transition: var(--orderlist-transition); }
    .drag-handle:hover { opacity: 1; }
    .drag-handle:active { cursor: grabbing; }
    .item-content { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .checkbox { flex-shrink: 0; width: 18px; height: 18px; accent-color: var(--orderlist-primary); cursor: pointer; transition: var(--orderlist-transition); }
    .checkbox:hover { transform: scale(1.1); }
    .empty-message { padding: var(--fx-space-xl, 32px); text-align: center; color: var(--orderlist-text-muted); font-style: italic; }
    .controls-bar {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: var(--fx-space-xs, 6px);
      background: var(--orderlist-bg);
      border: 1px solid var(--orderlist-border);
      border-radius: var(--orderlist-radius);
      box-shadow: var(--orderlist-shadow);
      height: fit-content;
      position: sticky;
      top: 0;
      align-self: flex-start;
    }
    .control-group { display: flex; flex-direction: column; gap: 3px; }
    .control-group + .control-group { margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--orderlist-border); }
    button.control-btn { display: flex; align-items: center; justify-content: center; width: 42px; height: 38px; padding: 0; border: none; border-radius: 8px; background: transparent; color: var(--orderlist-text-muted); cursor: pointer; font-size: 16px; line-height: 1; transition: var(--orderlist-transition); position: relative; }
    button.control-btn:hover:not(:disabled) { background: var(--orderlist-bg-hover); color: var(--orderlist-primary); transform: scale(1.1); }
    button.control-btn:active:not(:disabled) { transform: scale(0.92); background: color-mix(in srgb, var(--orderlist-primary) 15%, transparent); }
    button.control-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--orderlist-primary) 30%, transparent); }
    button.control-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
    .control-btn-icon { font-size: 18px; line-height: 1; }
    /* Tooltip nos botoes */
    button.control-btn:hover::after { opacity: 1; transform: translateY(-50%) translateX(0); }
    @media (max-width: 640px) { .main-row { flex-direction: column; } .controls-bar { flex-direction: row; flex-wrap: wrap; justify-content: center; position: relative; } .control-group { flex-direction: row; } .control-group + .control-group { margin-top: 0; margin-left: 4px; padding-top: 0; padding-left: 4px; border-top: none; border-left: 1px solid var(--orderlist-border); } button.control-btn { width: 44px; height: 40px; } button.control-btn::after { display: none; } .list { max-height: 300px; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    .list-item { animation: slideIn 0.2s ease-out; }
            @media (prefers-color-scheme: dark) { :host { --orderlist-border: #334155; --orderlist-bg: #1e293b; --orderlist-bg-hover: #334155; --orderlist-text: #f1f5f9; --orderlist-text-muted: #94a3b8; --orderlist-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); } }
    `;

  static override get observedAttributes(): string[] {
    return [
      'data',
      'data-key',
      'filter',
      'filter-by',
      'filter-placeholder',
      'breakpoint',
      'controls-location',
      'dragdrop',
      'striped',
      'selection-mode',
      'show-select-all',
    ]
      }

  set data(value: OrderListItem[]) {
    this._data = value;
    this._filteredData = null;
    this.render();
  }
  get data(): OrderListItem[] {
    return this._data;
  }
  private _data: OrderListItem[] = [];
  private _filteredData: OrderListItem[] | null = null;

  set selection(value: OrderListItem[]) {
    this._selection = value;
    this.render();
  }
  get selection(): OrderListItem[] {
    return this._selection;
  }
    private _selection: OrderListItem[] = [];

  get dataKey(): string {
    return this.getAttr('data-key', '');
  }
  set dataKey(v: string) {
    this.setAttribute('data-key', v);
  }

  get filter(): boolean {
    return this.hasAttr('filter');
  }
    set filter(v: boolean) {
    this.toggleAttr('filter', v);
  }

  get filterBy(): string {
    return this.getAttr('filter-by', 'label');
  }
  set filterBy(v: string) {
    this.setAttribute('filter-by', v);
  }

  get filterPlaceholder(): string {
    return this.getAttr('filter-placeholder', 'Buscar...');
  }
  set filterPlaceholder(v: string) {
        this.setAttribute('filter-placeholder', v);
  }

  get breakpoint(): string {
    return this.getAttr('breakpoint', '960px');
  }
  set breakpoint(v: string) {
    this.setAttribute('breakpoint', v);
  }

  get dragdrop(): boolean {
    return this.hasAttr('dragdrop');
  }
  set dragdrop(v: boolean) {
    this.toggleAttr('dragdrop', v);
  }

  get striped(): boolean {
    return this.hasAttr('striped');
  }
    set striped(v: boolean) {
    this.toggleAttr('striped', v);
  }

  get selectionMode(): string {
    const s = this.getAttr('selection-mode', '');
    return s === 'single' || s === 'multiple' ? s : '';
  }
  set selectionMode(v: string) {
    this.setAttribute('selection-mode', v);
  }

  get showSelectAll(): boolean {
    return this.hasAttr('show-select-all');
  }
    set showSelectAll(v: boolean) {
    this.toggleAttr('show-select-all', v);
  }

  get filterValue(): string {
    return this._filterValue;
  }
  set filterValue(v: string) {
    this._filterValue = v;
    this._applyFilter();
    this._updateListDisplay();
  }
  private _filterValue = '';

  private _draggedIndex: number | null = null;
  private _listenersAttached = false;
  private _optionTemplate: ((item: OrderListItem) => string) | null = null;

  setOptionTemplate(template: (item: OrderListItem) => string): void {
    this._optionTemplate = template;
        this.render();
  }

  protected override connectedCallback(): void {
    this._parseDataAttribute();
    super.connectedCallback();
  }

  protected override attributeChangedCallback(): void {
    if (this.getAttr('data', '') !== '') {
      this._parseDataAttribute();
    }
    super.attributeChangedCallback();
  }

  private _parseDataAttribute(): void {
    const dataAttr = this.getAttr('data', '');
    if (dataAttr) {
      try {
        this._data = JSON.parse(dataAttr);
        this._filteredData = null;
      } catch {
        this._data = [];
      }
    }
  }

  private _applyFilter(): void {
    if (!this._filterValue) {
      this._filteredData = null;
      return;
    }
    const filterFields = this.filterBy.split(',').map(f => f.trim());
    this._filteredData = this._data.filter(item => {
      return filterFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._filterValue.toLowerCase());
      });
    });
  }

  private _getDisplayData(): OrderListItem[] {
    return this._filteredData || this._data;
  }

  private _getItemKey(item: OrderListItem, index: number): string {
    if (this.dataKey && item[this.dataKey] != null) {
      return String(item[this.dataKey]);
    }
    if (item['id'] != null) return String(item['id']);
    if (item['key'] != null) return String(item['key']);
    if (item['label'] != null) return String(item['label']);
    if (item['name'] != null) return String(item['name']);
    if (item['value'] != null) return String(item['value']);
    return String(index);
  }

  private _getItemLabel(item: OrderListItem): string {
    const fields = ['label', 'name', 'title', 'text', 'value'];
    for (const field of fields) {
      if (item[field] != null) {
        return String(item[field]);
      }
    }
        return JSON.stringify(item);
  }

  private _isSelected(item: OrderListItem): boolean {
    return this._selection.some(s => this._getItemKey(s, -1) === this._getItemKey(item, -1));
  }

  private _moveItem(fromIndex: number, toIndex: number): void {
    const actualFrom = this._getActualIndex(fromIndex);
    const actualTo = this._getActualIndex(toIndex);
    if (actualFrom === -1 || actualTo === -1) return;
    const item = this._data.splice(actualFrom, 1)[0];
    this._data.splice(actualTo, 0, item);
    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }

  private _getActualIndex(displayIndex: number): number {
    if (this._filteredData) {
      const item = this._filteredData[displayIndex];
      return this._data.findIndex(d => this._getItemKey(d, -1) === this._getItemKey(item, -1));
    }
    return displayIndex;
  }

  private _emitReorder(): void {
    this.dispatchEvent(new CustomEvent('reorder', {
      bubbles: true,
      composed: true,
      detail: { items: [...this._data] },
    }));
  }

  private _emitSelectionChange(): void {
    this.dispatchEvent(new CustomEvent('selection-change', {
      bubbles: true,
      composed: true,
            detail: { selection: [...this._selection] },
    }));
  }

  private _toggleSelection(item: OrderListItem): void {
    const key = this._getItemKey(item, -1);
    const index = this._selection.findIndex(s => this._getItemKey(s, -1) === key);
    if (index >= 0) {
      this._selection.splice(index, 1);
    } else if (this.selectionMode === 'multiple') {
      this._selection.push(item);
    } else {
      this._selection = [item];
    }
    this._emitSelectionChange();
    this._updateListDisplay();
    this._updateControlsState();
  }

  private _selectAll(): void {
    const displayData = this._getDisplayData();
    this._selection = [...displayData];
    this._emitSelectionChange();
    this._updateListDisplay();
    this._updateControlsState();
  }

  private _deselectAll(): void {
    this._selection = [];
    this._emitSelectionChange();
    this._updateListDisplay();
    this._updateControlsState();
  }

  private _toggleSelectAll(): void {
    const displayData = this._getDisplayData();
    if (this._selection.length === displayData.length) {
      this._deselectAll();
    } else {
            this._selectAll();
    }
  }

  protected override render(): void {
    const displayData = this._getDisplayData();
    const hasSelection = this.selectionMode;
    const hasMultipleSelection = this.selectionMode === 'multiple';
    const allSelected = hasMultipleSelection && displayData.length > 0 && this._selection.length === displayData.length;

    this.setTemplate(`
      <div class="container" part="container">
        ${this.filter ? `
          <div class="filter-wrapper" part="filter-wrapper">
            <input type="text" class="filter-input" part="filter-input"
              placeholder="${this.filterPlaceholder}"
              value="${esc(this._filterValue)}"
              aria-label="Filtrar lista" />
          </div>
        ` : ''}
        <div class="main-row" part="main-row">
          <div class="controls-bar" part="controls-bar">
            <div class="control-group">
              <button class="control-btn" data-action="top" part="control-btn" aria-label="Mover para o inicio">
                <span class="control-btn-icon">\u00AB</span>
              </button>
              <button class="control-btn" data-action="up" part="control-btn" aria-label="Mover para cima">
                <span class="control-btn-icon">\u2191</span>
              </button>
            </div>
            <div class="control-group">
              <button class="control-btn" data-action="down" part="control-btn" aria-label="Mover para baixo">
                <span class="control-btn-icon">\u2193</span>
              </button>
              <button class="control-btn" data-action="bottom" part="control-btn" aria-label="Mover para o fim">
                <span class="control-btn-icon">\u00BB</span>
              </button>
            </div>
          </div>
          <div class="list-wrapper" part="list-wrapper">
            ${hasMultipleSelection && this.showSelectAll ? `
              <div class="select-all-bar" part="select-all-bar">
                <label>
                  <input type="checkbox" class="select-all-checkbox"
                    ${allSelected ? 'checked' : ''}
                    aria-label="Selecionar todos" />
                  Selecionar Todos
                </label>
                <span class="selection-count">${this._selection.length} selecionado(s)</span>
              </div>
            ` : ''}
            <ul class="list" part="list" role="listbox"
              aria-multiselectable="${hasMultipleSelection}"
              tabindex="0">
              ${displayData.length === 0 ? `
                <li class="empty-message" part="empty-message">
                  ${this.filter ? 'Nenhum resultado encontrado' : 'Nenhum item disponivel'}
                </li>
              ` : displayData.map((item, index) => {
                const key = this._getItemKey(item, index);
                const label = this._getItemLabel(item);
                const isSelected = this._isSelected(item);
                const content = this._optionTemplate ? this._optionTemplate(item) : esc(label);
                return `
                  <li class="list-item${isSelected ? ' selected' : ''}" part="list-item"
                    data-index="${index}" data-key="${esc(key)}"
                    role="option" aria-selected="${isSelected}"
                    ${this.dragdrop ? 'draggable="true"' : ''}
                    tabindex="0">
                    ${this.dragdrop ? '<span class="drag-handle" part="drag-handle" aria-label="Arrastar">\u22EE\u22EE</span>' : ''}
                    ${hasSelection ? `
                      <input type="checkbox" class="checkbox" part="checkbox"
                        ${isSelected ? 'checked' : ''}
                        aria-label="Selecionar ${esc(label)}" />
                    ` : ''}
                    <span class="item-content" part="item-content">${content}</span>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        </div>
      </div>
    `);

        this._attachListeners();
        this._attachItemListeners(this.root.querySelector('.list') as HTMLElement);
        this._updateControlsState();
  }

  private _attachListeners(): void {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    const root = this.root;

    // Filtro - delega input
    root.addEventListener('input', (e) => {
      const t = e.target as HTMLElement;
      if (t.classList.contains('filter-input')) {
        this.filterValue = (t as HTMLInputElement).value;
      }
    });

    // Selecionar todos - delega change
    root.addEventListener('change', (e) => {
      const t = e.target as HTMLElement;
      if (t.classList.contains('select-all-checkbox')) {
        this._toggleSelectAll();
      }
    });

    // Clique - delega click nos botoes (itens anexados direto em cada render)
    root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.control-btn') as HTMLButtonElement;
      if (btn) {
        this._handleMoveAction(btn.dataset.action);
      }
    });

    // Drag and drop
    // Drag and drop - delega no root
    let dragOverElement: HTMLElement | null = null;
    root.addEventListener('dragstart', (e) => {
      const target = (e.target as HTMLElement).closest('.list-item') as HTMLElement;
      if (!target) return;
      this._draggedIndex = Number(target.dataset.index);
      target.classList.add('dragging');
      (e as DragEvent).dataTransfer!.effectAllowed = 'move';
    });
    root.addEventListener('dragend', (e) => {
      const target = e.target as HTMLElement;
      target.classList.remove('dragging');
      this._draggedIndex = null;
      root.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      dragOverElement = null;
    });
    root.addEventListener('dragover', (e) => {
      e.preventDefault();
      const target = (e.target as HTMLElement).closest('.list-item') as HTMLElement;
      if (!target || target.classList.contains('dragging')) return;
      if (dragOverElement) dragOverElement.classList.remove('drag-over');
      target.classList.add('drag-over');
      dragOverElement = target;
    });
    root.addEventListener('drop', (e) => {
      e.preventDefault();
      if (this._draggedIndex === null) return;
      const target = (e.target as HTMLElement).closest('.list-item') as HTMLElement;
      if (!target) return;
      const toIndex = Number(target.dataset.index);
      target.classList.remove('drag-over');
      dragOverElement = null;
      this._moveItem(this._draggedIndex, toIndex);
      this._draggedIndex = null;
    });
    this._updateControlsState();
  }

  private _attachItemListeners(list: HTMLElement): void {
    if (!list) return;
    list.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const itemEl = target.closest('.list-item') as HTMLElement;
      if (!itemEl) return;
      if (target.classList.contains('checkbox')) {
        e.stopPropagation();
        const idxC = Number(itemEl.dataset.index);
        this._toggleSelection(this._getDisplayData()[idxC]);
        return;
      }
      const idxI = Number(itemEl.dataset.index);
      this._toggleSelection(this._getDisplayData()[idxI]);
    });
    list.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('list-item')) return;
      const items = Array.from(list.querySelectorAll('.list-item')) as HTMLElement[];
      const currentIndex = items.indexOf(target);
      const ke = e as KeyboardEvent;
      switch (ke.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) items[currentIndex - 1].focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < items.length - 1) items[currentIndex + 1].focus();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (this.selectionMode) {
            const index = Number(target.dataset.index);
            this._toggleSelection(this._getDisplayData()[index]);
          }
          break;
      }
    });
  }
  private _updateListDisplay(): void {
    const listWrapper = this.root.querySelector('.list-wrapper');
    if (!listWrapper) {
      this.render();
      return;
    }
    const displayData = this._getDisplayData();
    const hasSelection = this.selectionMode;
    const hasMultipleSelection = this.selectionMode === 'multiple';
    const allSelected = hasMultipleSelection && displayData.length > 0 && this._selection.length === displayData.length;

    listWrapper.innerHTML = `
      ${hasMultipleSelection && this.showSelectAll ? `
        <div class="select-all-bar" part="select-all-bar">
          <label>
            <input type="checkbox" class="select-all-checkbox"
              ${allSelected ? 'checked' : ''}
              aria-label="Selecionar todos" />
            Selecionar Todos
          </label>
          <span class="selection-count">${this._selection.length} selecionado(s)</span>
        </div>
      ` : ''}
      <ul class="list" part="list" role="listbox"
        aria-multiselectable="${hasMultipleSelection}"
        tabindex="0">
        ${displayData.length === 0 ? `
          <li class="empty-message" part="empty-message">
            ${this.filter ? 'Nenhum resultado encontrado' : 'Nenhum item disponivel'}
          </li>
        ` : displayData.map((item, index) => {
          const key = this._getItemKey(item, index);
          const label = this._getItemLabel(item);
          const isSelected = this._isSelected(item);
          const content = this._optionTemplate ? this._optionTemplate(item) : esc(label);
          return `
            <li class="list-item${isSelected ? ' selected' : ''}" part="list-item"
              data-index="${index}" data-key="${esc(key)}"
              role="option" aria-selected="${isSelected}"
              ${this.dragdrop ? 'draggable="true"' : ''}
              tabindex="0">
              ${this.dragdrop ? '<span class="drag-handle" part="drag-handle" aria-label="Arrastar">\u22EE\u22EE</span>' : ''}
              ${hasSelection ? `
                <input type="checkbox" class="checkbox" part="checkbox"
                  ${isSelected ? 'checked' : ''}
                  aria-label="Selecionar ${esc(label)}" />
              ` : ''}
              <span class="item-content" part="item-content">${content}</span>
            </li>
          `;
        }).join('')}
            </ul>
    `;
    this._attachListeners();
    this._attachItemListeners(this.root.querySelector('.list') as HTMLElement);
  }


  private _handleMoveAction(action: string | undefined): void {
    if (!this._selection.length) return;
    const displayData = this._getDisplayData();
    const selectedIndices = this._selection
      .map(s => displayData.findIndex(d => this._getItemKey(d, -1) === this._getItemKey(s, -1)))
      .filter(i => i >= 0)
      .sort((a, b) => a - b);

    if (selectedIndices.length === 0) return;

    switch (action) {
      case 'top':
        this._moveSelectedToStart(selectedIndices);
        break;
      case 'up':
        this._moveSelectedByOne(selectedIndices, -1);
        break;
      case 'down':
        this._moveSelectedByOne(selectedIndices, 1);
        break;
      case 'bottom':
        this._moveSelectedToEnd(selectedIndices);
        break;
    }
  }

  private _moveSelectedToStart(indices: number[]): void {
    const items: OrderListItem[] = [];
    const actualIndices: number[] = [];

    for (const idx of indices) {
      const actualIdx = this._getActualIndex(idx);
      items.push(this._data[actualIdx]);
      actualIndices.push(actualIdx);
    }

    actualIndices.sort((a, b) => b - a).forEach(i => this._data.splice(i, 1));

    const insertIdx = this._getActualIndex(0);
    this._data.splice(insertIdx, 0, ...items);

    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }

  private _moveSelectedToEnd(indices: number[]): void {
    const items: OrderListItem[] = [];
    const actualIndices: number[] = [];

    for (const idx of indices) {
      const actualIdx = this._getActualIndex(idx);
      items.push(this._data[actualIdx]);
      actualIndices.push(actualIdx);
    }

    actualIndices.sort((a, b) => b - a).forEach(i => this._data.splice(i, 1));

    const displayData = this._getDisplayData();
    const insertIdx = this._getActualIndex(displayData.length - 1);
    this._data.splice(insertIdx + 1, 0, ...items);

    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }

  private _moveSelectedByOne(indices: number[], delta: number): void {
    const displayData = this._getDisplayData();
    if (displayData.length === 0) return;

    // Get actual indices in _data array and sort them
    const actualIndices = indices
      .map(idx => this._getActualIndex(idx))
      .filter(idx => idx >= 0)
      .sort((a, b) => a - b);

    if (actualIndices.length === 0) return;

    // Check if movement is possible
    if (delta < 0 && actualIndices[0] <= 0) return;
    if (delta > 0 && actualIndices[actualIndices.length - 1] >= this._data.length - 1) return;

    // Extract selected items in order
    const selectedItems = actualIndices.map(idx => this._data[idx]);

    // Remove selected items from data (from highest to lowest to preserve indices)
    for (let i = actualIndices.length - 1; i >= 0; i--) {
      this._data.splice(actualIndices[i], 1);
    }

    // Calculate new insertion point
    let insertIndex: number;
    if (delta < 0) {
      // Moving up: insert before the first selected item position
      insertIndex = actualIndices[0] - 1;
    } else {
      // Moving down: insert after the last selected item position
      // Since we removed items, we need to adjust
      insertIndex = actualIndices[actualIndices.length - 1] - actualIndices.length + 1 + 1;
    }

    // Ensure insertIndex is within bounds
    insertIndex = Math.max(0, Math.min(insertIndex, this._data.length));

    // Insert items at new position
    this._data.splice(insertIndex, 0, ...selectedItems);

    this._applyFilter();
    this._updateListDisplay();
    this._updateControlsState();
    this._emitReorder();
  }

  private _updateControlsState(): void {
    const displayData = this._getDisplayData();
    const selectedIndices = this._selection
      .map(s => displayData.findIndex(d => this._getItemKey(d, -1) === this._getItemKey(s, -1)))
      .filter(i => i >= 0);

    const buttons = this.root.querySelectorAll<HTMLButtonElement>('.control-btn');
    buttons.forEach(btn => {
      const action = btn.dataset.action;
      let disabled = selectedIndices.length === 0;

      if (!disabled) {
        switch (action) {
          case 'top':
          case 'up':
            disabled = selectedIndices[0] === 0;
            break;
          case 'bottom':
          case 'down':
            disabled = selectedIndices[selectedIndices.length - 1] === displayData.length - 1;
            break;
        }
      }

      btn.disabled = disabled;
    });
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function defineFxOrderList(): typeof FxOrderList {
  return defineElement('fx-orderlist', FxOrderList);
}