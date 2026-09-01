import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxOrderList = class _FxOrderList extends FxElement {
  constructor() {
    super(...arguments);
    this._data = [];
    this._filteredData = null;
    this._selection = [];
    this._filterValue = "";
    this._draggedIndex = null;
    this._optionTemplate = null;
  }
  static get observedAttributes() {
    return [
      "data",
      "data-key",
      "filter",
      "filter-by",
      "filter-placeholder",
      "breakpoint",
      "controls-location",
      "dragdrop",
      "striped",
      "selection-mode"
    ];
  }
  set data(value) {
    this._data = value;
    this._filteredData = null;
    this.render();
  }
  get data() {
    return this._data;
  }
  set selection(value) {
    this._selection = value;
    this.render();
  }
  get selection() {
    return this._selection;
  }
  get dataKey() {
    return this.getAttr("data-key", "");
  }
  set dataKey(v) {
    this.setAttribute("data-key", v);
  }
  get filter() {
    return this.hasAttr("filter");
  }
  set filter(v) {
    this.toggleAttr("filter", v);
  }
  get filterBy() {
    return this.getAttr("filter-by", "label");
  }
  set filterBy(v) {
    this.setAttribute("filter-by", v);
  }
  get filterPlaceholder() {
    return this.getAttr("filter-placeholder", "Buscar...");
  }
  set filterPlaceholder(v) {
    this.setAttribute("filter-placeholder", v);
  }
  get breakpoint() {
    return this.getAttr("breakpoint", "960px");
  }
  set breakpoint(v) {
    this.setAttribute("breakpoint", v);
  }
  get dragdrop() {
    return this.hasAttr("dragdrop");
  }
  set dragdrop(v) {
    this.toggleAttr("dragdrop", v);
  }
  get striped() {
    return this.hasAttr("striped");
  }
  set striped(v) {
    this.toggleAttr("striped", v);
  }
  get selectionMode() {
    const s = this.getAttr("selection-mode", "");
    return s === "single" || s === "multiple" ? s : "";
  }
  set selectionMode(v) {
    this.setAttribute("selection-mode", v);
  }
  get filterValue() {
    return this._filterValue;
  }
  set filterValue(v) {
    this._filterValue = v;
    this._applyFilter();
    this.render();
  }
  setOptionTemplate(template) {
    this._optionTemplate = template;
    this.render();
  }
  connectedCallback() {
    this._parseDataAttribute();
    super.connectedCallback();
  }
  attributeChangedCallback() {
    if (this.getAttr("data", "") !== "") {
      this._parseDataAttribute();
    }
    super.attributeChangedCallback();
  }
  _parseDataAttribute() {
    const dataAttr = this.getAttr("data", "");
    if (dataAttr) {
      try {
        this._data = JSON.parse(dataAttr);
        this._filteredData = null;
      } catch {
        this._data = [];
      }
    }
  }
  _applyFilter() {
    if (!this._filterValue) {
      this._filteredData = null;
      return;
    }
    const filterFields = this.filterBy.split(",").map((f) => f.trim());
    this._filteredData = this._data.filter((item) => {
      return filterFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._filterValue.toLowerCase());
      });
    });
  }
  _getDisplayData() {
    return this._filteredData || this._data;
  }
  _getItemKey(item, index) {
    if (this.dataKey && item[this.dataKey] != null) {
      return String(item[this.dataKey]);
    }
    if (item["id"] != null) return String(item["id"]);
    if (item["key"] != null) return String(item["key"]);
    if (item["label"] != null) return String(item["label"]);
    if (item["name"] != null) return String(item["name"]);
    if (item["value"] != null) return String(item["value"]);
    return String(index);
  }
  _getItemLabel(item) {
    const fields = ["label", "name", "title", "text", "value"];
    for (const field of fields) {
      if (item[field] != null) {
        return String(item[field]);
      }
    }
    return JSON.stringify(item);
  }
  _isSelected(item) {
    return this._selection.some((s) => this._getItemKey(s, -1) === this._getItemKey(item, -1));
  }
  _moveItem(fromIndex, toIndex) {
    const actualFrom = this._getActualIndex(fromIndex);
    const actualTo = this._getActualIndex(toIndex);
    if (actualFrom === -1 || actualTo === -1) return;
    const item = this._data.splice(actualFrom, 1)[0];
    this._data.splice(actualTo, 0, item);
    this._applyFilter();
    this.render();
    this._emitReorder();
  }
  _getActualIndex(displayIndex) {
    if (this._filteredData) {
      const item = this._filteredData[displayIndex];
      return this._data.findIndex((d) => this._getItemKey(d, -1) === this._getItemKey(item, -1));
    }
    return displayIndex;
  }
  _emitReorder() {
    this.dispatchEvent(new CustomEvent("reorder", {
      bubbles: true,
      composed: true,
      detail: { items: [...this._data] }
    }));
  }
  _emitSelectionChange() {
    this.dispatchEvent(new CustomEvent("selection-change", {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._selection] }
    }));
  }
  _toggleSelection(item) {
    if (!this.selectionMode) return;
    const key = this._getItemKey(item, -1);
    const index = this._selection.findIndex((s) => this._getItemKey(s, -1) === key);
    if (index >= 0) {
      this._selection.splice(index, 1);
    } else if (this.selectionMode === "multiple") {
      this._selection.push(item);
    } else {
      this._selection = [item];
    }
    this._emitSelectionChange();
    this.render();
  }
  render() {
    const displayData = this._getDisplayData();
    const hasSelection = this.selectionMode;
    this.setTemplate(`
      <div class="container" part="container">
        ${this.filter ? `
          <div class="filter-wrapper" part="filter-wrapper">
            <input type="text" class="filter-input" part="filter-input"
              placeholder="${this.filterPlaceholder}"
              value="${esc(this._filterValue)}"
              aria-label="Filtrar lista" />
          </div>
        ` : ""}
        <div class="list-wrapper" part="list-wrapper">
          <ul class="list" part="list" role="listbox"
            aria-multiselectable="${this.selectionMode === "multiple"}"
            tabindex="0">
            ${displayData.length === 0 ? `
              <li class="empty-message" part="empty-message">
                ${this.filter ? "Nenhum resultado encontrado" : "Nenhum item disponivel"}
              </li>
            ` : displayData.map((item, index) => {
      const key = this._getItemKey(item, index);
      const label = this._getItemLabel(item);
      const isSelected = this._isSelected(item);
      const content = this._optionTemplate ? this._optionTemplate(item) : esc(label);
      return `
                <li class="list-item${isSelected ? " selected" : ""}" part="list-item"
                  data-index="${index}" data-key="${esc(key)}"
                  role="option" aria-selected="${isSelected}"
                  ${this.dragdrop ? 'draggable="true"' : ""}
                  tabindex="0">
                  ${this.dragdrop ? '<span class="drag-handle" part="drag-handle" aria-label="Arrastar">::</span>' : ""}
                  ${hasSelection ? `
                    <input type="checkbox" class="checkbox" part="checkbox"
                      ${isSelected ? "checked" : ""}
                      aria-label="Selecionar ${esc(label)}" />
                  ` : ""}
                  <span class="item-content" part="item-content">${content}</span>
                </li>
              `;
    }).join("")}
          </ul>
        </div>
        <div class="controls" part="controls">
          <div class="controls-row">
            <button class="control-btn" data-action="top" part="control-btn" aria-label="Mover para o inicio" title="Inicio">|&lt;</button>
            <button class="control-btn" data-action="up" part="control-btn" aria-label="Mover para cima" title="Cima">^</button>
          </div>
          <div class="controls-row">
            <button class="control-btn" data-action="down" part="control-btn" aria-label="Mover para baixo" title="Baixo">v</button>
            <button class="control-btn" data-action="bottom" part="control-btn" aria-label="Mover para o fim" title="Fim">&gt;|</button>
          </div>
        </div>
      </div>
    `);
    this._attachListeners();
  }
  _attachListeners() {
    const filterInput = this.root.querySelector(".filter-input");
    if (filterInput) {
      filterInput.addEventListener("input", (e) => {
        this.filterValue = e.target.value;
      });
    }
    const list = this.root.querySelector(".list");
    if (!list) return;
    list.addEventListener("click", (e) => {
      const target = e.target;
      const itemEl = target.closest(".list-item");
      if (!itemEl) return;
      if (target.classList.contains("checkbox")) {
        e.stopPropagation();
        const index2 = Number(itemEl.dataset.index);
        const item2 = this._getDisplayData()[index2];
        this._toggleSelection(item2);
        return;
      }
      const index = Number(itemEl.dataset.index);
      const item = this._getDisplayData()[index];
      this._toggleSelection(item);
    });
    list.addEventListener("keydown", (e) => {
      const target = e.target;
      if (!target.classList.contains("list-item")) return;
      const items = Array.from(list.querySelectorAll(".list-item"));
      const currentIndex = items.indexOf(target);
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1].focus();
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1].focus();
          }
          break;
        case "Home":
          e.preventDefault();
          items[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
        case " ":
        case "Enter":
          if (this.selectionMode) {
            e.preventDefault();
            const index = Number(target.dataset.index);
            const item = this._getDisplayData()[index];
            this._toggleSelection(item);
          }
          break;
      }
    });
    if (this.dragdrop) {
      this._attachDragAndDrop(list);
    }
    const buttons = this.root.querySelectorAll(".control-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        this._handleMoveAction(action);
      });
    });
    this._updateControlsState();
  }
  _attachDragAndDrop(list) {
    let dragOverElement = null;
    list.addEventListener("dragstart", (e) => {
      const target = e.target;
      if (!target.classList.contains("list-item")) return;
      this._draggedIndex = Number(target.dataset.index);
      target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    list.addEventListener("dragend", (e) => {
      const target = e.target;
      target.classList.remove("dragging");
      this._draggedIndex = null;
      list.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
    });
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      const target = e.target.closest(".list-item");
      if (!target || target.classList.contains("dragging")) return;
      if (dragOverElement) {
        dragOverElement.classList.remove("drag-over");
      }
      target.classList.add("drag-over");
      dragOverElement = target;
    });
    list.addEventListener("drop", (e) => {
      e.preventDefault();
      if (this._draggedIndex === null) return;
      const target = e.target.closest(".list-item");
      if (!target) return;
      const toIndex = Number(target.dataset.index);
      target.classList.remove("drag-over");
      dragOverElement = null;
      this._moveItem(this._draggedIndex, toIndex);
    });
  }
  _handleMoveAction(action) {
    if (!this._selection.length) return;
    const displayData = this._getDisplayData();
    const selectedIndices = this._selection.map((s) => displayData.findIndex((d) => this._getItemKey(d, -1) === this._getItemKey(s, -1))).filter((i) => i >= 0).sort((a, b) => a - b);
    if (selectedIndices.length === 0) return;
    switch (action) {
      case "top":
        this._moveSelectedTo(selectedIndices, 0);
        break;
      case "up":
        if (selectedIndices[0] > 0) {
          this._moveSelectedBy(selectedIndices, -1);
        }
        break;
      case "down":
        if (selectedIndices[selectedIndices.length - 1] < displayData.length - 1) {
          this._moveSelectedBy(selectedIndices, 1);
        }
        break;
      case "bottom":
        this._moveSelectedTo(selectedIndices, displayData.length - 1);
        break;
    }
  }
  _moveSelectedTo(indices, targetIndex) {
    const items = indices.map((i) => this._data[this._getActualIndex(i)]);
    const actualIndices = indices.map((i) => this._getActualIndex(i)).sort((a, b) => b - a);
    actualIndices.forEach((i) => this._data.splice(i, 1));
    const actualTarget = this._getActualIndex(targetIndex);
    this._data.splice(actualTarget, 0, ...items);
    this._applyFilter();
    this.render();
    this._emitReorder();
  }
  _moveSelectedBy(indices, delta) {
    const firstIndex = indices[0] + delta;
    const lastIndex = indices[indices.length - 1] + delta;
    if (firstIndex < 0 || lastIndex >= this._getDisplayData().length) return;
    const items = indices.map((i) => {
      const actualIdx = this._getActualIndex(i);
      return { item: this._data[actualIdx], originalIndex: actualIdx };
    });
    items.sort((a, b) => b.originalIndex - a.originalIndex);
    items.forEach(({ originalIndex }) => this._data.splice(originalIndex, 1));
    const newFirstActual = this._getActualIndex(firstIndex);
    const sortedItems = items.map(({ item }) => item).reverse();
    this._data.splice(newFirstActual, 0, ...sortedItems);
    this._applyFilter();
    this.render();
    this._emitReorder();
  }
  _updateControlsState() {
    const displayData = this._getDisplayData();
    const selectedIndices = this._selection.map((s) => displayData.findIndex((d) => this._getItemKey(d, -1) === this._getItemKey(s, -1))).filter((i) => i >= 0);
    const buttons = this.root.querySelectorAll(".control-btn");
    buttons.forEach((btn) => {
      const action = btn.dataset.action;
      let disabled = selectedIndices.length === 0;
      if (!disabled) {
        switch (action) {
          case "top":
          case "up":
            disabled = selectedIndices[0] === 0;
            break;
          case "bottom":
          case "down":
            disabled = selectedIndices[selectedIndices.length - 1] === displayData.length - 1;
            break;
        }
      }
      btn.disabled = disabled;
    });
  }
};
_FxOrderList.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-md);
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-xs);
    }
    .controls-row {
      display: flex;
      gap: var(--fx-space-xs);
    }
    .list-wrapper {
      flex: 1;
    }
    .filter-wrapper {
      margin-bottom: var(--fx-space-sm);
    }
    .filter-input {
      width: 100%;
      box-sizing: border-box;
      padding: var(--fx-space-sm) var(--fx-space-md);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      font-family: inherit;
      font-size: inherit;
      color: var(--fx-text-default);
      background: var(--fx-surface-background);
      transition: border-color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .filter-input:focus {
      outline: none;
      border-color: var(--fx-color-primary);
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    .filter-input::placeholder {
      color: var(--fx-text-muted);
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      overflow: hidden;
    }
    :host([striped]) .list-item:nth-child(even) {
      background: var(--fx-surface-surface);
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: var(--fx-space-sm);
      padding: var(--fx-space-sm) var(--fx-space-md);
      background: var(--fx-surface-background);
      border-bottom: 1px solid var(--fx-border-default);
      cursor: pointer;
      user-select: none;
      transition: background-color var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .list-item:last-child {
      border-bottom: none;
    }
    .list-item:hover {
      background: var(--fx-surface-surface-hover);
    }
    .list-item.selected {
      background: color-mix(in srgb, var(--fx-color-primary) 10%, transparent);
    }
    .list-item:focus-visible {
      outline: none;
      background: color-mix(in srgb, var(--fx-color-primary) 15%, transparent);
    }
    .list-item.dragging {
      opacity: 0.5;
    }
    .list-item.drag-over {
      border-top: 2px solid var(--fx-color-primary);
    }
    .drag-handle {
      color: var(--fx-text-muted);
      cursor: grab;
      flex-shrink: 0;
    }
    .drag-handle:active {
      cursor: grabbing;
    }
    .item-content {
      flex: 1;
    }
    .checkbox {
      flex-shrink: 0;
    }
    .empty-message {
      padding: var(--fx-space-lg);
      text-align: center;
      color: var(--fx-text-muted);
    }
    button.control-btn {
      padding: var(--fx-space-sm);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-sm);
      background: var(--fx-surface-background);
      color: var(--fx-text-default);
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      transition: all var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    button.control-btn:hover:not(:disabled) {
      background: var(--fx-surface-surface-hover);
      border-color: var(--fx-border-hover);
    }
    button.control-btn:focus-visible {
      outline: none;
      box-shadow: var(--fx-effect-focus-ring, none);
    }
    button.control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
let FxOrderList = _FxOrderList;
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function defineFxOrderList() {
  return defineElement("fx-orderlist", FxOrderList);
}
export {
  FxOrderList,
  defineFxOrderList
};
//# sourceMappingURL=orderlist.js.map
