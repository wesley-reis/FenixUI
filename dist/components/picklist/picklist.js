import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxPickList = class _FxPickList extends FxElement {
  constructor() {
    super(...arguments);
    this._source = [];
    this._filteredSource = null;
    this._target = [];
    this._filteredTarget = null;
    this._sourceSelection = [];
    this._targetSelection = [];
    this._sourceFilterValue = "";
    this._targetFilterValue = "";
    this._optionTemplate = null;
  }
  static get observedAttributes() {
    return [
      "source",
      "target",
      "source-key",
      "target-key",
      "filter",
      "filter-by",
      "filter-placeholder",
      "dragdrop",
      "striped",
      "selection-mode",
      "source-label",
      "target-label"
    ];
  }
  set source(value) {
    this._source = value;
    this._filteredSource = null;
    this.render();
  }
  get source() {
    return this._source;
  }
  set target(value) {
    this._target = value;
    this._filteredTarget = null;
    this.render();
  }
  get target() {
    return this._target;
  }
  set sourceSelection(value) {
    this._sourceSelection = value;
    this.render();
  }
  get sourceSelection() {
    return this._sourceSelection;
  }
  set targetSelection(value) {
    this._targetSelection = value;
    this.render();
  }
  get targetSelection() {
    return this._targetSelection;
  }
  get sourceKey() {
    return this.getAttr("source-key", "");
  }
  set sourceKey(v) {
    this.setAttribute("source-key", v);
  }
  get targetKey() {
    return this.getAttr("target-key", "");
  }
  set targetKey(v) {
    this.setAttribute("target-key", v);
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
  get sourceLabel() {
    return this.getAttr("source-label", "Disponíveis");
  }
  set sourceLabel(v) {
    this.setAttribute("source-label", v);
  }
  get targetLabel() {
    return this.getAttr("target-label", "Selecionados");
  }
  set targetLabel(v) {
    this.setAttribute("target-label", v);
  }
  get sourceFilterValue() {
    return this._sourceFilterValue;
  }
  set sourceFilterValue(v) {
    this._sourceFilterValue = v;
    this._applySourceFilter();
    this.render();
  }
  get targetFilterValue() {
    return this._targetFilterValue;
  }
  set targetFilterValue(v) {
    this._targetFilterValue = v;
    this._applyTargetFilter();
    this.render();
  }
  setOptionTemplate(template) {
    this._optionTemplate = template;
    this.render();
  }
  connectedCallback() {
    this._parseSourceAttribute();
    this._parseTargetAttribute();
    super.connectedCallback();
  }
  attributeChangedCallback() {
    if (this.getAttr("source", "") !== "") {
      this._parseSourceAttribute();
    }
    if (this.getAttr("target", "") !== "") {
      this._parseTargetAttribute();
    }
    super.attributeChangedCallback();
  }
  _parseSourceAttribute() {
    const dataAttr = this.getAttr("source", "");
    if (dataAttr) {
      try {
        this._source = JSON.parse(dataAttr);
        this._filteredSource = null;
      } catch {
        this._source = [];
      }
    }
  }
  _parseTargetAttribute() {
    const dataAttr = this.getAttr("target", "");
    if (dataAttr) {
      try {
        this._target = JSON.parse(dataAttr);
        this._filteredTarget = null;
      } catch {
        this._target = [];
      }
    }
  }
  _applySourceFilter() {
    if (!this._sourceFilterValue) {
      this._filteredSource = null;
      return;
    }
    const filterFields = this.filterBy.split(",").map((f) => f.trim());
    this._filteredSource = this._source.filter((item) => {
      return filterFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._sourceFilterValue.toLowerCase());
      });
    });
  }
  _applyTargetFilter() {
    if (!this._targetFilterValue) {
      this._filteredTarget = null;
      return;
    }
    const filterFields = this.filterBy.split(",").map((f) => f.trim());
    this._filteredTarget = this._target.filter((item) => {
      return filterFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(this._targetFilterValue.toLowerCase());
      });
    });
  }
  _getDisplaySource() {
    return this._filteredSource || this._source;
  }
  _getDisplayTarget() {
    return this._filteredTarget || this._target;
  }
  _getItemKey(item, index, isSource) {
    const keyField = isSource ? this.sourceKey : this.targetKey;
    if (keyField && item[keyField] != null) {
      return String(item[keyField]);
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
  _isSourceSelected(item, index) {
    return this._sourceSelection.some((s) => this._getItemKey(s, -1, true) === this._getItemKey(item, index, true));
  }
  _isTargetSelected(item, index) {
    return this._targetSelection.some((s) => this._getItemKey(s, -1, false) === this._getItemKey(item, index, false));
  }
  _emitMoveToTarget() {
    this.dispatchEvent(new CustomEvent("move-to-target", {
      bubbles: true,
      composed: true,
      detail: { items: [...this._sourceSelection], source: [...this._source], target: [...this._target] }
    }));
  }
  _emitMoveToSource() {
    this.dispatchEvent(new CustomEvent("move-to-source", {
      bubbles: true,
      composed: true,
      detail: { items: [...this._targetSelection], source: [...this._source], target: [...this._target] }
    }));
  }
  _emitSelectionChangeSource() {
    this.dispatchEvent(new CustomEvent("selection-change-source", {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._sourceSelection] }
    }));
  }
  _emitSelectionChangeTarget() {
    this.dispatchEvent(new CustomEvent("selection-change-target", {
      bubbles: true,
      composed: true,
      detail: { selection: [...this._targetSelection] }
    }));
  }
  render() {
    const dSrc = this._getDisplaySource();
    const dTgt = this._getDisplayTarget();
    const hasSel = this.selectionMode;
    const srcItems = dSrc.length === 0 ? `<li class="empty-message">${this.filter ? "Nenhum resultado" : "Nenhum item"}</li>` : dSrc.map((item, i) => `<li class="list-item${this._isSourceSelected(item, i) ? " selected" : ""}" data-index="${i}" data-list="source" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox"' + (this._isSourceSelected(item, i) ? " checked" : "") + " />" : ""}<span class="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join("");
    const tgtItems = dTgt.length === 0 ? `<li class="empty-message">${this.filter ? "Nenhum resultado" : "Nenhum selecionado"}</li>` : dTgt.map((item, i) => `<li class="list-item${this._isTargetSelected(item, i) ? " selected" : ""}" data-index="${i}" data-list="target" tabindex="0">${hasSel ? '<input type="checkbox" class="checkbox"' + (this._isTargetSelected(item, i) ? " checked" : "") + " />" : ""}<span class="item-content">${this._optionTemplate ? this._optionTemplate(item) : esc(this._getItemLabel(item))}</span></li>`).join("");
    this.setTemplate(`<div class="container"><div class="list-container"><div class="list-label">${esc(this.sourceLabel)} (${this._source.length})</div>${this.filter ? '<div class="filter-wrapper"><input type="text" class="filter-input source-filter" placeholder="' + this.filterPlaceholder + '" value="' + esc(this._sourceFilterValue) + '" /></div>' : ""}<div class="list-wrapper"><ul class="list source-list" role="listbox" tabindex="0">${srcItems}</ul></div></div><div class="controls"><button class="control-btn" data-action="move-target" title="Mover para destino">&gt;</button><button class="control-btn" data-action="move-all-target" title="Mover todos">&gt;&gt;</button><button class="control-btn" data-action="move-source" title="Mover para origem">&lt;</button><button class="control-btn" data-action="move-all-source" title="Mover todos">&lt;&lt;</button></div><div class="list-container"><div class="list-label">${esc(this.targetLabel)} (${this._target.length})</div>${this.filter ? '<div class="filter-wrapper"><input type="text" class="filter-input target-filter" placeholder="' + this.filterPlaceholder + '" value="' + esc(this._targetFilterValue) + '" /></div>' : ""}<div class="list-wrapper"><ul class="list target-list" role="listbox" tabindex="0">${tgtItems}</ul></div></div></div>`);
    this._attachListeners();
  }
  _attachListeners() {
    const srcFilter = this.root.querySelector(".source-filter");
    if (srcFilter) srcFilter.addEventListener("input", (e) => {
      this.sourceFilterValue = e.target.value;
    });
    const tgtFilter = this.root.querySelector(".target-filter");
    if (tgtFilter) tgtFilter.addEventListener("input", (e) => {
      this.targetFilterValue = e.target.value;
    });
    this.root.querySelectorAll(".list").forEach((list) => {
      list.addEventListener("click", (e) => {
        const t = e.target;
        const el = t.closest(".list-item");
        if (!el) return;
        const isSrc = el.dataset.list === "source";
        const idx = Number(el.dataset.index);
        const item = (isSrc ? this._getDisplaySource() : this._getDisplayTarget())[idx];
        if (isSrc) this._toggleSourceSelection(item, idx);
        else this._toggleTargetSelection(item, idx);
      });
    });
    this.root.querySelectorAll(".control-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switch (btn.dataset.action) {
          case "move-target":
            this._moveToTarget();
            break;
          case "move-all-target":
            this._moveAllToTarget();
            break;
          case "move-source":
            this._moveToSource();
            break;
          case "move-all-source":
            this._moveAllToSource();
            break;
        }
      });
    });
    this._updateControlsState();
  }
  _updateControlsState() {
    this.root.querySelectorAll(".control-btn").forEach((btn) => {
      const a = btn.dataset.action;
      btn.disabled = a === "move-target" && this._sourceSelection.length === 0 || a === "move-all-target" && this._source.length === 0 || a === "move-source" && this._targetSelection.length === 0 || a === "move-all-source" && this._target.length === 0;
    });
  }
  _moveToTarget() {
    if (!this._sourceSelection.length) return;
    const items = [...this._sourceSelection];
    this._source = this._source.filter((s) => !items.some((i) => this._getItemKey(i, -1, true) === this._getItemKey(s, -1, true)));
    this._target = [...this._target, ...items];
    this._sourceSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this.render();
    this._emitMoveToTarget();
  }
  _moveToSource() {
    if (!this._targetSelection.length) return;
    const items = [...this._targetSelection];
    this._target = this._target.filter((t) => !items.some((i) => this._getItemKey(i, -1, false) === this._getItemKey(t, -1, false)));
    this._source = [...this._source, ...items];
    this._targetSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this.render();
    this._emitMoveToSource();
  }
  _moveAllToTarget() {
    const items = [...this._source];
    this._source = [];
    this._target = [...this._target, ...items];
    this._sourceSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this.render();
    this._emitMoveToTarget();
  }
  _moveAllToSource() {
    const items = [...this._target];
    this._target = [];
    this._source = [...this._source, ...items];
    this._targetSelection = [];
    this._filteredSource = null;
    this._filteredTarget = null;
    this.render();
    this._emitMoveToSource();
  }
  _toggleSourceSelection(item, index) {
    if (!this.selectionMode) return;
    const key = this._getItemKey(item, index, true);
    const idx = this._sourceSelection.findIndex((s) => this._getItemKey(s, -1, true) === key);
    if (idx >= 0) {
      this._sourceSelection.splice(idx, 1);
    } else if (this.selectionMode === "multiple") {
      this._sourceSelection.push(item);
    } else {
      this._sourceSelection = [item];
    }
    this._emitSelectionChangeSource();
    this.render();
  }
  _toggleTargetSelection(item, index) {
    if (!this.selectionMode) return;
    const key = this._getItemKey(item, index, false);
    const idx = this._targetSelection.findIndex((s) => this._getItemKey(s, -1, false) === key);
    if (idx >= 0) {
      this._targetSelection.splice(idx, 1);
    } else if (this.selectionMode === "multiple") {
      this._targetSelection.push(item);
    } else {
      this._targetSelection = [item];
    }
    this._emitSelectionChangeTarget();
    this.render();
  }
};
_FxPickList.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .container {
      display: flex;
      gap: var(--fx-space-md);
      align-items: stretch;
    }
    .list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-sm);
    }
    .list-label {
      font-weight: 600;
      color: var(--fx-text-default);
      font-size: calc(var(--fx-font-size) - 1px);
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: var(--fx-space-xs);
      justify-content: center;
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
      min-height: 150px;
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
    .checkbox {
      cursor: pointer;
      flex-shrink: 0;
    }
    .item-content {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty-message {
      padding: var(--fx-space-md);
      text-align: center;
      color: var(--fx-text-muted);
      font-style: italic;
    }
    .control-btn {
      padding: var(--fx-space-sm);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      background: var(--fx-surface-background);
      color: var(--fx-text-default);
      cursor: pointer;
      font-size: calc(var(--fx-font-size) + 2px);
      transition: all var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .control-btn:hover:not(:disabled) {
      background: var(--fx-surface-surface-hover);
      border-color: var(--fx-color-primary);
      color: var(--fx-color-primary);
    }
    .control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
let FxPickList = _FxPickList;
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function defineFxPickList() {
  return defineElement("fx-picklist", FxPickList);
}
export {
  FxPickList,
  defineFxPickList
};
//# sourceMappingURL=picklist.js.map
