import { FxElement } from '../../core/base';
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
export declare class FxPickList extends FxElement {
    static styles: string;
    static get observedAttributes(): string[];
    set source(value: PickListItem[]);
    get source(): PickListItem[];
    private _source;
    private _filteredSource;
    set target(value: PickListItem[]);
    get target(): PickListItem[];
    private _target;
    private _filteredTarget;
    set sourceSelection(value: PickListItem[]);
    get sourceSelection(): PickListItem[];
    private _sourceSelection;
    set targetSelection(value: PickListItem[]);
    get targetSelection(): PickListItem[];
    private _targetSelection;
    get sourceKey(): string;
    set sourceKey(v: string);
    get targetKey(): string;
    set targetKey(v: string);
    get filter(): boolean;
    set filter(v: boolean);
    get filterBy(): string;
    set filterBy(v: string);
    get filterPlaceholder(): string;
    set filterPlaceholder(v: string);
    get dragdrop(): boolean;
    set dragdrop(v: boolean);
    get striped(): boolean;
    set striped(v: boolean);
    get selectionMode(): string;
    set selectionMode(v: string);
    get showSelectAll(): boolean;
    set showSelectAll(v: boolean);
    get sourceLabel(): string;
    set sourceLabel(v: string);
    get targetLabel(): string;
    set targetLabel(v: string);
    get sourceFilterValue(): string;
    set sourceFilterValue(v: string);
    private _sourceFilterValue;
    get targetFilterValue(): string;
    set targetFilterValue(v: string);
    private _targetFilterValue;
    private _filterListenersAttached;
    private _optionTemplate;
    setOptionTemplate(template: (item: PickListItem) => string): void;
    protected connectedCallback(): void;
    protected attributeChangedCallback(): void;
    private _parseSourceAttribute;
    private _parseTargetAttribute;
    private _applySourceFilter;
    private _applyTargetFilter;
    private _getDisplaySource;
    private _getDisplayTarget;
    private _getItemKey;
    private _getItemLabel;
    private _isSourceSelected;
    private _isTargetSelected;
    private _emitMoveToTarget;
    private _emitMoveToSource;
    private _emitSelectionChangeSource;
    private _emitSelectionChangeTarget;
    protected render(): void;
    private _attachListeners;
    private _handleSelectAll;
    /**
     * Atualiza a selecao visual in-place (classes e checkboxes dos itens existentes),
     * sem recriar o DOM — mantendo referencias de elementos validas durante cliques.
     */
    private _updateSelectionDisplay;
    /** Sincroniza as barras "Selecionar Todos" (checkbox + contador) sem re-render completo. */
    private _updateSelectAllBars;
    private _updateControlsState;
    private _moveToTarget;
    private _moveToSource;
    private _moveAllToTarget;
    private _moveAllToSource;
    private _toggleSourceSelection;
    private _toggleTargetSelection;
    private _updateListDisplay;
}
export declare function defineFxPickList(): typeof FxPickList;
//# sourceMappingURL=picklist.d.ts.map