import { FxElement } from '../../core/base';
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
export declare class FxOrderList extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    set data(value: OrderListItem[]);
    get data(): OrderListItem[];
    private _data;
    private _filteredData;
    set selection(value: OrderListItem[]);
    get selection(): OrderListItem[];
    private _selection;
    get dataKey(): string;
    set dataKey(v: string);
    get filter(): boolean;
    set filter(v: boolean);
    get filterBy(): string;
    set filterBy(v: string);
    get filterPlaceholder(): string;
    set filterPlaceholder(v: string);
    get breakpoint(): string;
    set breakpoint(v: string);
    get dragdrop(): boolean;
    set dragdrop(v: boolean);
    get striped(): boolean;
    set striped(v: boolean);
    get selectionMode(): string;
    set selectionMode(v: string);
    get showSelectAll(): boolean;
    set showSelectAll(v: boolean);
    get filterValue(): string;
    set filterValue(v: string);
    private _filterValue;
    private _draggedIndex;
    private _listenersAttached;
    private _optionTemplate;
    setOptionTemplate(template: (item: OrderListItem) => string): void;
    protected connectedCallback(): void;
    protected attributeChangedCallback(): void;
    private _parseDataAttribute;
    private _applyFilter;
    private _getDisplayData;
    private _getItemKey;
    private _getItemLabel;
    private _isSelected;
    private _moveItem;
    private _getActualIndex;
    private _emitReorder;
    private _emitSelectionChange;
    private _toggleSelection;
    private _selectAll;
    private _deselectAll;
    private _toggleSelectAll;
    protected render(): void;
    private _attachListeners;
    private _attachItemListeners;
    private _updateListDisplay;
    private _handleMoveAction;
    private _moveSelectedToStart;
    private _moveSelectedToEnd;
    private _moveSelectedByOne;
    private _updateControlsState;
}
export declare function defineFxOrderList(): typeof FxOrderList;
//# sourceMappingURL=orderlist.d.ts.map