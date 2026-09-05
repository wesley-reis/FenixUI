import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

export interface PickListItem {
  [key: string]: unknown;
}

/**
 * <fx-picklist> - Componente para transferir itens entre duas listas.
 *
 * Permite mover itens entre uma lista de origem e uma lista de destino.
 * Suporta filtro, seleção múltipla, checkbox e templates customizados.
 *
 * Atributos: source, target, source-key, target-key, filter, filter-by,
 * filter-placeholder, dragdrop, striped, selection-mode, source-label, target-label.
 * Evento: `move-to-target` (composed, detail: { items }).
 * Evento: `move-to-source` (composed, detail: { items }).
 * Evento: `selection-change-source` (composed, detail: { selection }).
 * Evento: `selection-change-target` (composed, detail: { selection }).
 */
export class FxPickList extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
      --picklist-primary: var(--fx-color-primary, #3b82f6);
      --picklist-border: var(--fx-border-default, #e2e8f0);
      --picklist-bg: var(--fx-surface-background, #ffffff);
      --picklist-bg-hover: var(--fx-surface-surface-hover, #f1f5f9);
      --picklist-text: var(--fx-text-default, #1e293b);
      --picklist-text-muted: var(--fx-text-muted, #64748b);
      --picklist-radius: var(--fx-radius-md, 8px);
      --picklist-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      --picklist-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    * { box-sizing: border-box; }
    .container {
      display: flex;
      gap: var(--fx-space-sm, 8px);
      align-items: stretch;
    }
    .list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-sm, 8px);
      min-width: 0;
    }
    .list-label {
      font-weight: 600;
      color: var(--picklist-text);
      font-size: calc(var(--fx-font-size) - 1px);
    }
    .select-all-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px);
      background: linear-gradient(135deg, var(--picklist-bg), var(--picklist-bg-hover));
      border: 1px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      font-size: 0.9em;
      font-weight: 500;
    }
    .select-all-bar label {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm, 10px);
      cursor: pointer;
      user-select: none;
      color: var(--picklist-text);
    }
    .select-all-bar input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--picklist-primary);
      cursor: pointer;
    }
    .selection-count {
      font-size: 0.85em;
      color: var(--picklist-primary);
      background: color-mix(in srgb, var(--picklist-primary) 12%, transparent);
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 4px;
      justify-content: center;
      padding: var(--fx-space-xs, 6px);
      background: var(--picklist-bg);
      border: 1px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      box-shadow: var(--picklist-shadow);
      height: fit-content;
      position: sticky;
      top: 0;
      align-self: center;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .control-group + .control-group {
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px solid var(--picklist-border);
    }
    .list-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-sm, 8px);
    }
    .filter-wrapper {
      margin-bottom: var(--fx-space-xs, 4px);
    }
    .filter-input {
      width: 100%;
      box-sizing: border-box;
      padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px);
      padding-left: 42px;
      border: 1.5px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      font-family: inherit;
      font-size: inherit;
      color: var(--picklist-text);
      background: var(--picklist-bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 14px center;
      transition: var(--picklist-transition);
    }
    .filter-input:focus {
      outline: none;
      border-color: var(--picklist-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--picklist-primary) 20%, transparent);
    }
    .filter-input::placeholder {
      color: var(--picklist-text-muted);
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid var(--picklist-border);
      border-radius: var(--picklist-radius);
      overflow: hidden;
      box-shadow: var(--picklist-shadow);
      min-height: 200px;
      max-height: 450px;
      overflow-y: auto;
      flex: 1;
    }
    .list::-webkit-scrollbar { width: 6px; }
    .list::-webkit-scrollbar-track { background: transparent; }
    .list::-webkit-scrollbar-thumb { background: var(--picklist-border); border-radius: 3px; }
    .list::-webkit-scrollbar-thumb:hover { background: var(--picklist-text-muted); }
    :host([striped]) .list-item:nth-child(even) {
      background: var(--fx-surface-surface, #f8fafc);
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm, 10px);
      padding: var(--fx-space-sm, 10px) var(--fx-space-md, 14px);
      background: var(--picklist-bg);
      border-bottom: 1px solid var(--picklist-border);
      cursor: pointer;
      user-select: none;
      transition: var(--picklist-transition);
    }
    .list-item:last-child { border-bottom: none; }
    .list-item:hover { background: var(--picklist-bg-hover); }
    .list-item.selected {
      background: color-mix(in srgb, var(--picklist-primary) 8%, transparent);
      border-left: 3px solid var(--picklist-primary);
      padding-left: 11px;
    }
    .list-item:focus-visible {
      outline: none;
      background: color-mix(in srgb, var(--picklist-primary) 15%, transparent);
    }
    .checkbox {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      accent-color: var(--picklist-primary);
      cursor: pointer;
      transition: var(--picklist-transition);
    }
    .checkbox:hover { transform: scale(1.1); }
    .item-content {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty-message {
      padding: var(--fx-space-xl, 32px);
      text-align: center;
      color: var(--picklist-text-muted);
      font-style: italic;
    }
    button.control-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 38px;
      padding: 0;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--picklist-text-muted);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      transition: var(--picklist-transition);
      position: relative;
    }
    button.control-btn:hover:not(:disabled) {
      background: var(--picklist-bg-hover);
      color: var(--picklist-primary);
      transform: scale(1.1);
    }
    button.control-btn:active:not(:disabled) {
      transform: scale(0.92);
      background: color-mix(in srgb, var(--picklist-primary) 15%, transparent);
    }
    button.control-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--picklist-primary) 30%, transparent);
    }
    button.control-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
    .control-btn-icon { font-size: 18px; line-height: 1; }

    button.control-btn:hover::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    @media (max-width: 640px) {
      .container { flex-direction: column; }
      .controls {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        position: relative;
      }
      .control-group { flex-direction: row; }
      .control-group + .control-group {
        margin-top: 0;
        margin-left: 4px;
        padding-top: 0;
        padding-left: 4px;
        border-top: none;
        border-left: 1px solid var(--picklist-border);
      }
      button.control-btn { width: 44px; height: 40px; }
      button.control-btn::after { display: none; }
      .list { max-height: 300px; min-height: 150px; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .list-item { animation: slideIn 0.2s ease-out; }
  `;

  static override get observedAttributes(): string[] {
    return [
      'source',
      'target',
      'source-key',
      'target-key',
      'filter',
      'filter-by',
      'filter-placeholder',
      'dragdrop',
      'striped',
      'selection-mode',
      'show-select-all',
      'source-label',
      'target-label',
    ];
  }

  set source(value: PickListItem[]) {
    this._source = value;
    this._filteredSource = null;
    this.render();
  }
  get source(): PickListItem[] {
    return this._source;
  }
  private _source: PickListItem[] = [];
  private _filteredSource: PickListItem[] | null = null;

  set target(value: PickListItem[]) {
    this._target = value;
    this._filteredTarget = null;
    this.render();
  }
  get target(): PickListItem[] {
    return this._target;
  }
  private _target: PickListItem[] = [];
  private _filteredTarget: PickListItem[] | null = null;

  set sourceSelection(value: PickListItem[]) {
    this._sourceSelection = value;
    this.render();
  }
  get sourceSelection(): PickListItem[] {
    return this._sourceSelection;
  }
  private _sourceSelection: PickListItem[] = [];

  set targetSelection(value: PickListItem[]) {
    this._targetSelection = value;
    this.render();
  }
  get targetSelection(): PickListItem[] {
    return this._targetSelection;
  }
  private _targetSelection: PickListItem[] = [];

  get sourceKey(): string {
    return this.getAttr('source-key', '');
  }
  set sourceKey(v: string) {
    this.setAttribute('source-key', v);
  }

  get targetKey(): string {
    return this.getAttr('target-key', '');
  }
  set targetKey(v: string) {
    this.setAttribute('target-key', v);
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

  get sourceLabel(): string {
    return this.getAttr('source-label', 'Disponíveis');
  }
  set sourceLabel(v: string) {
    this.setAttribute('source-label', v);
  }

  get targetLabel(): string {
    return this.getAttr('target-label', 'Selecionados');
  }
  set targetLabel(v: string) {
    this.setAttribute('target-label', v);
  }

  get sourceFilterValue(): string {
    return this._sourceFilterValue;
  }
  set sourceFilterValue(v: string) {
    this._sourceFilterValue = v;
    this._applySourceFilter();
    this._updateListDisplay();
  }
  private _sourceFilterValue = '';

  get targetFilterValue(): string {
    return this._targetFilterValue;
  }
  set targetFilterValue(v: string) {
    this._targetFilterValue = v;
    this._applyTargetFilter();
    this._updateListDisplay();
  }
  private _targetFilterValue = '';
  private _filterListenersAttached = false;

  private _optionTemplate: ((item: PickListItem) => string) | null = null;

  setOptionTemplate(template: (item: PickListItem) => string): void {
    this._optionTemplate = template;
    this.render();
  }

  protected override connectedCallback(): void {
    this._parseSourceAttribute();
    this._parseTargetAttribute();
    super.connectedCallback();
  }

  protected override attributeChangedCallback(): void {
    if (this.getAttr('source', '') !== '') {
      this._parseSourceAttribute();
    }
    if (this.getAttr('target', '') !== '') {
      this._parseTargetAttribute();
    }
    super.attributeChangedCallback();
  }

  private _parseSourceAttribute(): void {
    const dataAttr = this.getAttr('source', '');
    if (dataAttr) {
      try {
        this._source = JSON.parse(dataAttr);
        this._filteredSource = null;
      } catch {
        this._source = [];
      }
    }
  }

  private _parseTargetAttribute(): void {
    const dataAttr = this.getAttr('target', '');
    if (dataAttr) {
      try {
        this._target = JSON.parse(dataAttr);
        this._filteredTarget = null;
      } catch {
        this._target = [];
      }
    }
  }

  private _applySourceFilter(): void {
    if (!this._sourceFilterValue) {
      this._filteredSource = null;
      return;
    }
    const filterFields = this.filterBy.split(',').map(f => f.trim());
    this._filteredSource = this._source.filter(item => {
      return filterFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._sourceFilterValue.toLowerCase());
      });
    });
  }

  private _applyTargetFilter(): void {
    if (!this._targetFilterValue) {
      this._filteredTarget = null;
      return;
    }
    const filterFields = this.filterBy.split(',').map(f => f.trim());
    this._filteredTarget = this._target.filter(item => {
      return filterFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._targetFilterValue.toLowerCase());
      });
    });
  }

  private _getDisplaySource(): PickListItem[] {
    return this._filteredSource || this._source;
  }

  private _getDisplayTarget(): PickListItem[] {
    return this._filteredTarget || this._target;
  }

  private _getItemKey(item: PickListItem, index: number, isSource: boolean): string {
    const keyField = isSource ? this.sourceKey : this.targetKey;
    if (keyField && item[keyField] != null) {
      return String(item[keyField]);
    }
    if (item['id'] != null) return String(item['id']);
    if (item['key'] != null) return String(item['key']);
    if (item['label'] != null) return String(item['label']);
    if (item['name'] != null) return String(item['name']);
    if (item['value'] != null) return String(item['value']);
    return String(index);
  }

  private _getItemLabel(item: PickListItem): string {
    const fields = ['label', 'name', 'title', 'text', 'value'];
    for (const field of fields) {
      if (item[field] != null) {
        return String(item[field]);
      }
    }
    return JSON.stringify(item);
  }

  private _isSourceSelected(item: PickListItem, index: number): boolean {
    return this._sourceSelection.some(s => this._getItemKey(s, -1, true) === this._getItemKey(item, index, true));
  }

  private _isTargetSelected(item: PickListItem, index: number): boolean {
    return this._targetSelection.some(s => this._getItemKey(s, -1, false) === this._getItemKey(item, index, false));
  }

  private _emitMoveToTarget(): void {
    this.dispatchEvent(new CustomEvent('move-to-target', {
      bubbles: true,
      composed: true,
      detail: { items: [...this._sourceSelection], source: [...this._source], target: [...this._target] },
    }));
  }

  private _emitMoveToSource(): void {
    this.dispatchEvent(new CustomEvent('move-to-source', {
      bubbles: true,
      composed: true,
      detail: { items: [...this._targetSelection], source: [...this._source], target: [...this._target] },
    }));
  }

  private _emitSelectionChangeSource(): void {
    this.dispatchEvent(new CustomEvent('selection-change-source', {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._sourceSelection] },
    }));
  }

  private _emitSelectionChangeTarget(): void {
    this.dispatchEvent(new CustomEvent('selection-change-target', {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._targetSelection] },
    }));
  }

  protected override render(): void {
    const dSrc = this._getDisplaySource();
    const dTgt = this._getDisplayTarget();
    const hasSel = this.selectionMode;
    const showAll = hasSel === 'multiple' && this.showSelectAll;
    const srcItems = dSrc.length === 0 ? `<li class="empty-message">${this.filter ? 'Nenhum resultado' : 'Nenhum item'}</li>` : dSrc.map((item, i) => `<li class="list-item${this._isSourceSelected(item, i) ? ' selected' : ''}" data-index="${i}" data-list="source" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox"' + (this._isSourceSelected(item, i) ? ' checked' : '') + ' />' : ''}<span class="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join('');
    const tgtItems = dTgt.length === 0 ? `<li class="empty-message">${this.filter ? 'Nenhum resultado' : 'Nenhum selecionado'}</li>` : dTgt.map((item, i) => `<li class="list-item${this._isTargetSelected(item, i) ? ' selected' : ''}" data-index="${i}" data-list="target" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox"' + (this._isTargetSelected(item, i) ? ' checked' : '') + ' />' : ''}<span class="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join('');
    const srcAllBar = showAll ? `<div class="select-all-bar" part="select-all-bar"><label><input type="checkbox" class="select-all-checkbox" data-list="source" ${this._sourceSelection.length > 0 && this._sourceSelection.length === this._source.length ? 'checked' : ''} aria-label="Selecionar todos da origem" /> Selecionar Todos</label><span class="selection-count">${this._sourceSelection.length} selecionado(s)</span></div>` : '';
    const tgtAllBar = showAll ? `<div class="select-all-bar" part="select-all-bar"><label><input type="checkbox" class="select-all-checkbox" data-list="target" ${this._targetSelection.length > 0 && this._targetSelection.length === this._target.length ? 'checked' : ''} aria-label="Selecionar todos do destino" /> Selecionar Todos</label><span class="selection-count">${this._targetSelection.length} selecionado(s)</span></div>` : '';

    this.setTemplate(`<div class="container"><div class="list-container"><div class="list-label">${esc(this.sourceLabel)} (${this._source.length})</div>${this.filter ? '<div class="filter-wrapper"><input type="text" class="filter-input source-filter" placeholder="' + this.filterPlaceholder + '" value="' + esc(this._sourceFilterValue) + '" /></div>' : ''}${srcAllBar}<div class="list-wrapper"><ul class="list source-list" role="listbox" tabindex="0">${srcItems}</ul></div></div><div class="controls"><div class="control-group"><button class="control-btn" data-action="move-all-target" part="control-btn" aria-label="Mover todos para destino"><span class="control-btn-icon">»</span></button><button class="control-btn" data-action="move-target" part="control-btn" aria-label="Mover para destino"><span class="control-btn-icon">→</span></button></div><div class="control-group"><button class="control-btn" data-action="move-source" part="control-btn" aria-label="Mover para origem"><span class="control-btn-icon">←</span></button><button class="control-btn" data-action="move-all-source" part="control-btn" aria-label="Mover todos para origem"><span class="control-btn-icon">«</span></button></div></div><div class="list-container"><div class="list-label">${esc(this.targetLabel)} (${this._target.length})</div>${this.filter ? '<div class="filter-wrapper"><input type="text" class="filter-input target-filter" placeholder="' + this.filterPlaceholder + '" value="' + esc(this._targetFilterValue) + '" /></div>' : ''}${tgtAllBar}<div class="list-wrapper"><ul class="list target-list" role="listbox" tabindex="0">${tgtItems}</ul></div></div></div>`);

    this._attachListeners();
  }

  private _attachListeners(): void {
    // Listeners delegados no root, anexados uma unica vez (sobrevivem a re-renders)
    if (!this._filterListenersAttached) {
      this._filterListenersAttached = true;

      this.root.addEventListener('input', (e) => {
        const t = e.target as HTMLElement;
        if (t.classList.contains('select-all-checkbox')) {
          this._handleSelectAll(t as HTMLInputElement);
          return;
        }
        if (t.classList.contains('source-filter')) {
          this.sourceFilterValue = (t as HTMLInputElement).value;
        } else if (t.classList.contains('target-filter')) {
          this.targetFilterValue = (t as HTMLInputElement).value;
        }
      });

      this.root.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;
        const btn = t.closest('.control-btn') as HTMLButtonElement | null;
        if (btn) {
          switch (btn.dataset.action) {
            case 'move-target': this._moveToTarget(); break;
            case 'move-all-target': this._moveAllToTarget(); break;
            case 'move-source': this._moveToSource(); break;
            case 'move-all-source': this._moveAllToSource(); break;
          }
          return;
        }
        const el = t.closest('.list-item') as HTMLElement | null;
        if (!el) return;
        const isSrc = el.dataset.list === 'source';
        const idx = Number(el.dataset.index);
        const item = (isSrc ? this._getDisplaySource() : this._getDisplayTarget())[idx];
        if (isSrc) this._toggleSourceSelection(item, idx); else this._toggleTargetSelection(item, idx);
      });
    }
    this._updateControlsState();
  }

  private _handleSelectAll(checkbox: HTMLInputElement): void {
    const isSrc = checkbox.dataset.list === 'source';
    if (isSrc) {
      this._sourceSelection = checkbox.checked ? [...this._getDisplaySource()] : [];
      this._emitSelectionChangeSource();
    } else {
      this._targetSelection = checkbox.checked ? [...this._getDisplayTarget()] : [];
      this._emitSelectionChangeTarget();
    }
    this._updateSelectionDisplay();
    this._updateControlsState();
  }

  /**
   * Atualiza a selecao visual in-place (classes e checkboxes dos itens existentes),
   * sem recriar o DOM — mantendo referencias de elementos validas durante cliques.
   */
  private _updateSelectionDisplay(): void {
    const updateList = (listSel: HTMLElement | null, isSelFn: (item: PickListItem, i: number) => boolean, getData: () => PickListItem[]): void => {
      if (!listSel) return;
      listSel.querySelectorAll<HTMLElement>('.list-item').forEach(el => {
        const idx = Number(el.dataset.index);
        const selected = isSelFn(getData()[idx], idx);
        el.classList.toggle('selected', selected);
        el.setAttribute('aria-selected', String(selected));
        const cb = el.querySelector<HTMLInputElement>('.checkbox');
        if (cb) cb.checked = selected;
      });
    };
    updateList(this.root.querySelector('.source-list'), (it, i) => this._isSourceSelected(it, i), () => this._getDisplaySource());
    updateList(this.root.querySelector('.target-list'), (it, i) => this._isTargetSelected(it, i), () => this._getDisplayTarget());
    this._updateSelectAllBars();
  }

  /** Sincroniza as barras "Selecionar Todos" (checkbox + contador) sem re-render completo. */
  private _updateSelectAllBars(): void {
    if (!(this.selectionMode === 'multiple' && this.showSelectAll)) return;
    const bars = [
      { el: this.root.querySelector<HTMLInputElement>('.select-all-checkbox[data-list="source"]'), total: this._source.length, sel: this._sourceSelection.length },
      { el: this.root.querySelector<HTMLInputElement>('.select-all-checkbox[data-list="target"]'), total: this._target.length, sel: this._targetSelection.length },
    ];
    bars.forEach(({ el, total, sel }) => {
      if (!el) return;
      el.checked = total > 0 && sel === total;
      const count = el.closest('.select-all-bar')?.querySelector('.selection-count');
      if (count) count.textContent = `${sel} selecionado(s)`;
    });
  }

  private _updateControlsState(): void {
    this.root.querySelectorAll<HTMLButtonElement>('.control-btn').forEach(btn => {
      const a = btn.dataset.action;
      btn.disabled = (a === 'move-target' && this._sourceSelection.length === 0) || (a === 'move-all-target' && this._source.length === 0) || (a === 'move-source' && this._targetSelection.length === 0) || (a === 'move-all-source' && this._target.length === 0);
    });
  }

  private _moveToTarget(): void {
    if (!this._sourceSelection.length) return;
    const items = [...this._sourceSelection];
    this._source = this._source.filter(s => !items.some(i => this._getItemKey(i, -1, true) === this._getItemKey(s, -1, true)));
    this._target = [...this._target, ...items];
    this._sourceSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToTarget();
  }

  private _moveToSource(): void {
    if (!this._targetSelection.length) return;
    const items = [...this._targetSelection];
    this._target = this._target.filter(t => !items.some(i => this._getItemKey(i, -1, false) === this._getItemKey(t, -1, false)));
    this._source = [...this._source, ...items];
    this._targetSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToSource();
  }

  private _moveAllToTarget(): void {
    const items = [...this._source];
    this._source = [];
    this._target = [...this._target, ...items];
    this._sourceSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToTarget();
  }

  private _moveAllToSource(): void {
    const items = [...this._target];
    this._target = [];
    this._source = [...this._source, ...items];
    this._targetSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this._updateListDisplay();
    this._updateControlsState();
    this._emitMoveToSource();
  }

  private _toggleSourceSelection(item: PickListItem, index: number): void {
    // Sem selection-mode definido, permite selecao simples (um item por vez)
    const mode = this.selectionMode || 'single';
    const key = this._getItemKey(item, index, true);
    const idx = this._sourceSelection.findIndex(s => this._getItemKey(s, -1, true) === key);
    if (idx >= 0) {
      this._sourceSelection.splice(idx, 1);
    } else if (mode === 'multiple') {
      this._sourceSelection.push(item);
    } else {
      this._sourceSelection = [item];
    }
    this._emitSelectionChangeSource();
    this._updateSelectionDisplay();
    this._updateControlsState();
  }

  private _toggleTargetSelection(item: PickListItem, index: number): void {
    // Sem selection-mode definido, permite selecao simples (um item por vez)
    const mode = this.selectionMode || 'single';
    const key = this._getItemKey(item, index, false);
    const idx = this._targetSelection.findIndex(s => this._getItemKey(s, -1, false) === key);
    if (idx >= 0) {
      this._targetSelection.splice(idx, 1);
    } else if (mode === 'multiple') {
      this._targetSelection.push(item);
    } else {
      this._targetSelection = [item];
    }
    this._emitSelectionChangeTarget();
    this._updateSelectionDisplay();
    this._updateControlsState();
  }

  private _updateListDisplay(): void {
    const srcWrapper = this.root.querySelector('.source-list')?.parentElement;
    const tgtWrapper = this.root.querySelector('.target-list')?.parentElement;
    const srcLabel = this.root.querySelector('.list-container:first-of-type .list-label');
    const tgtLabel = this.root.querySelector('.list-container:last-of-type .list-label');
    if (!srcWrapper || !tgtWrapper) { this.render(); return; }
    const dSrc = this._getDisplaySource();
    const dTgt = this._getDisplayTarget();
    const hasSel = this.selectionMode;
    const srcItems = dSrc.length === 0 ? `<li class="empty-message" part="empty-message">${this.filter ? 'Nenhum resultado' : 'Nenhum item'}</li>` : dSrc.map((item, i) => `<li class="list-item${this._isSourceSelected(item, i) ? ' selected' : ''}" part="list-item" data-index="${i}" data-list="source" role="option" aria-selected="${this._isSourceSelected(item, i)}" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox" part="checkbox"' + (this._isSourceSelected(item, i) ? ' checked' : '') + ' />' : ''}<span class="item-content" part="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join('');
    const tgtItems = dTgt.length === 0 ? `<li class="empty-message" part="empty-message">${this.filter ? 'Nenhum resultado' : 'Nenhum selecionado'}</li>` : dTgt.map((item, i) => `<li class="list-item${this._isTargetSelected(item, i) ? ' selected' : ''}" part="list-item" data-index="${i}" data-list="target" role="option" aria-selected="${this._isTargetSelected(item, i)}" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox" part="checkbox"' + (this._isTargetSelected(item, i) ? ' checked' : '') + ' />' : ''}<span class="item-content" part="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join('');
    srcWrapper.innerHTML = `<ul class="list source-list" role="listbox" tabindex="0">${srcItems}</ul>`;
    tgtWrapper.innerHTML = `<ul class="list target-list" role="listbox" tabindex="0">${tgtItems}</ul>`;
    if (srcLabel) srcLabel.textContent = `${this.sourceLabel} (${this._source.length})`;
    if (tgtLabel) tgtLabel.textContent = `${this.targetLabel} (${this._target.length})`;
    this._updateSelectAllBars();
    this._attachListeners();
  }
}

export function defineFxPickList(): typeof FxPickList {
  return defineElement('fx-picklist', FxPickList);
}