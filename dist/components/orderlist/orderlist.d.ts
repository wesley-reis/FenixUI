import { FxElement } from '../../core/base';
export interface OrderListItem {
    [key: string]: unknown;
}
/**
 * <fx-orderlist> - Componente para ordenar uma coleção de itens.
 *
 * Permite reordenar itens arrastando ou usando botões de controle.
 * Suporta filtro, seleção, checkbox e templates customizados.
 *
 * Atributos: data, data-key, filter, filter-by, filter-placeholder, breakpoint,
 * dragdrop, selection-mode, striped.
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
    get filterValue(): string;
    set filterValue(v: string);
    private _filterValue;
    private _draggedIndex;
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
    protected render(): void;
    private _attachListeners;
    private _attachDragAndDrop;
    private _handleMoveAction;
    private _moveSelectedTo;
    private _moveSelectedBy;
    private _updateControlsState;
}
export declare function defineFxOrderList(): typeof FxOrderList;
//# sourceMappingURL=orderlist.d.ts.map