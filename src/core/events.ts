/**
 * Registro central de eventos do FenixUI — FONTE ÚNICA das *strings* de evento.
 *
 * Por que existe
 * --------------
 * Eventos de Web Component são `CustomEvent` com `bubbles`/`composed`: sobem a
 * árvore até qualquer ancestral. Se dois componentes usassem o MESMO nome
 * genérico (`change`, `select`, `open`…), um evento disparado num filho seria
 * capturado pelo listener de um componente pai — o clássico caso do `<fx-input>`
 * (digitação → `change`) dentro de um `<fx-tabs>` (troca de aba → `change`), em
 * que o handler da aba recebia o texto digitado.
 *
 * Regra
 * -----
 *  - **Eventos de valor** (`FX_VALUE_EVENTS`) são os ÚNICOS nomes que podem se
 *    repetir: `input`/`change`/`valueChange`… espelham o comportamento nativo
 *    dos campos e alimentam `v-model` (Vue), `[(value)]` (Angular) e `onInput`
 *    (React). Só componentes form-associated os emitem.
 *  - **Todos os demais** são *namespaced*: `fx-<componente>-<ação>`
 *    (ex.: `fx-tabs-change`, `fx-dialog-open`). Como o prefixo carrega o
 *    componente, dois componentes nunca compartilham nome — sem competição.
 *
 * Usado por: os próprios componentes (`FX_EVENT.<chave>`),
 * `FX_COMPONENT_EVENTS` (teste-guarda + doc) e as tipagens de handler em
 * `src/core/jsx.ts` (`FxEventDetailMap`).
 */
export const FX_EVENT = {
  /* ----- Eventos de valor (form-associated; podem repetir) ----- */
  input: 'input',
  change: 'change',
  valueChange: 'valueChange',
  checkedChange: 'checkedChange',
  valuesChange: 'valuesChange',
  /** Autofill declarado do navegador (só nos campos). */
  autofill: 'autofill',

  /* ----- Eventos namespaced (fx-<componente>-<ação>) ----- */
  accordionChange: 'fx-accordion-change',
  accordionToggle: 'fx-accordion-panel-toggle',
  alertDismiss: 'fx-alert-dismiss',
  breadcrumbSelect: 'fx-breadcrumb-select',
  calendarChange: 'fx-calendar-change',
  carouselChange: 'fx-carousel-change',
  chipRemove: 'fx-chip-remove',
  chipClick: 'fx-chip-click',
  confirmAccept: 'fx-confirmpopup-accept',
  confirmReject: 'fx-confirmpopup-reject',
  dialogOpen: 'fx-dialog-open',
  dialogClose: 'fx-dialog-close',
  drawerOpen: 'fx-drawer-open',
  drawerClose: 'fx-drawer-close',
  dropdownSelect: 'fx-dropdown-select',
  menuSelect: 'fx-menu-select',
  orderlistReorder: 'fx-orderlist-reorder',
  orderlistSelectionChange: 'fx-orderlist-selection-change',
  paginationPageChange: 'fx-pagination-page-change',
  passwordStrengthChange: 'fx-password-strength-change',
  picklistMoveToTarget: 'fx-picklist-move-to-target',
  picklistMoveToSource: 'fx-picklist-move-to-source',
  picklistSelectionChangeSource: 'fx-picklist-selection-change-source',
  picklistSelectionChangeTarget: 'fx-picklist-selection-change-target',
  popoverShow: 'fx-popover-show',
  popoverHide: 'fx-popover-hide',
  progressComplete: 'fx-progress-complete',
  stepperChange: 'fx-stepper-change',
  stepperComplete: 'fx-stepper-complete',
  tableSortChange: 'fx-table-sort-change',
  tableFilterChange: 'fx-table-filter-change',
  tablePageChange: 'fx-table-page-change',
  tableRowClick: 'fx-table-row-click',
  tabsChange: 'fx-tabs-change',
  treeSelect: 'fx-tree-select',
  /* eventos não-valor de componentes form-associated */
  autocompleteSelect: 'fx-autocomplete-select',
  datepickerInvalid: 'fx-datepicker-invalid',
  editorReady: 'fx-editor-ready',
  editorFocus: 'fx-editor-focus',
  editorBlur: 'fx-editor-blur',
  editorError: 'fx-editor-error',
  fileuploadSelect: 'fx-fileupload-select',
  fileuploadRemove: 'fx-fileupload-remove',
  fileuploadComplete: 'fx-fileupload-complete',
} as const;

/** Todo nome de evento válido do FenixUI. */

/**
 * Eventos de valor (two-way binding de framework). São os ÚNICOS nomes que
 * podem se repetir — e só nos componentes form-associated.
 */
export const FX_VALUE_EVENTS = [
  FX_EVENT.input,
  FX_EVENT.change,
  FX_EVENT.valueChange,
  FX_EVENT.checkedChange,
  FX_EVENT.valuesChange,
  FX_EVENT.autofill,
] as const;

/** Componentes form-associated (estendem `FxFormElement`) — emitem eventos de valor. */
export const FX_FORM_COMPONENTS = [
  'fx-input',
  'fx-textarea',
  'fx-select',
  'fx-multiselect',
  'fx-autocomplete',
  'fx-datepicker',
  'fx-checkbox',
  'fx-radio',
  'fx-switch',
  'fx-slider',
  'fx-rating',
  'fx-knob',
  'fx-editor',
  'fx-fileupload',
  'fx-toggle-button-group',
] as const;

/**
 * Manifesto tag → eventos emitidos. Fonte única do teste-guarda de
 * unicidade/formato e da documentação.
 */
export const FX_COMPONENT_EVENTS: Record<string, readonly FxEventName[]> = {
  'fx-accordion': [FX_EVENT.accordionChange],
  'fx-accordion-panel': [FX_EVENT.accordionToggle],
  'fx-alert': [FX_EVENT.alertDismiss],
  'fx-breadcrumb': [FX_EVENT.breadcrumbSelect],
  'fx-calendar': [FX_EVENT.calendarChange],
  'fx-carousel': [FX_EVENT.carouselChange],
  'fx-chip': [FX_EVENT.chipRemove, FX_EVENT.chipClick],
  'fx-confirmpopup': [FX_EVENT.confirmAccept, FX_EVENT.confirmReject],
  'fx-dialog': [FX_EVENT.dialogOpen, FX_EVENT.dialogClose],
  'fx-drawer': [FX_EVENT.drawerOpen, FX_EVENT.drawerClose],
  'fx-dropdown': [FX_EVENT.dropdownSelect],
  'fx-menu': [FX_EVENT.menuSelect],
  'fx-orderlist': [FX_EVENT.orderlistReorder, FX_EVENT.orderlistSelectionChange],
  'fx-pagination': [FX_EVENT.paginationPageChange],
  'fx-password-strength': [FX_EVENT.passwordStrengthChange],
  'fx-picklist': [
    FX_EVENT.picklistMoveToTarget,
    FX_EVENT.picklistMoveToSource,
    FX_EVENT.picklistSelectionChangeSource,
    FX_EVENT.picklistSelectionChangeTarget,
  ],
  'fx-popover': [FX_EVENT.popoverShow, FX_EVENT.popoverHide],
  'fx-progress': [FX_EVENT.progressComplete],
  'fx-stepper': [FX_EVENT.stepperChange, FX_EVENT.stepperComplete],
  'fx-table': [
    FX_EVENT.tableSortChange,
    FX_EVENT.tableFilterChange,
    FX_EVENT.tablePageChange,
    FX_EVENT.tableRowClick,
  ],
  'fx-tabs': [FX_EVENT.tabsChange],
  'fx-tree': [FX_EVENT.treeSelect],
  'fx-input': [FX_EVENT.input, FX_EVENT.change, FX_EVENT.valueChange, FX_EVENT.autofill],
  'fx-textarea': [FX_EVENT.input, FX_EVENT.change, FX_EVENT.valueChange, FX_EVENT.autofill],
  'fx-select': [FX_EVENT.input, FX_EVENT.change, FX_EVENT.valueChange],
  'fx-multiselect': [FX_EVENT.change, FX_EVENT.valuesChange],
  'fx-autocomplete': [FX_EVENT.autocompleteSelect, FX_EVENT.input, FX_EVENT.valueChange, FX_EVENT.autofill],
  'fx-datepicker': [FX_EVENT.change, FX_EVENT.input, FX_EVENT.valueChange, FX_EVENT.datepickerInvalid],
  'fx-checkbox': [FX_EVENT.change, FX_EVENT.checkedChange],
  'fx-radio': [FX_EVENT.change, FX_EVENT.checkedChange],
  'fx-switch': [FX_EVENT.change, FX_EVENT.checkedChange],
  'fx-slider': [FX_EVENT.input, FX_EVENT.change, FX_EVENT.valueChange],
  'fx-rating': [FX_EVENT.change, FX_EVENT.valueChange],
  'fx-knob': [FX_EVENT.change, FX_EVENT.valueChange],
  'fx-editor': [
    FX_EVENT.input,
    FX_EVENT.change,
    FX_EVENT.valueChange,
    FX_EVENT.editorReady,
    FX_EVENT.editorFocus,
    FX_EVENT.editorBlur,
    FX_EVENT.editorError,
  ],
  'fx-fileupload': [
    FX_EVENT.fileuploadSelect,
    FX_EVENT.fileuploadRemove,
    FX_EVENT.fileuploadComplete,
  ],
  'fx-toggle-button-group': [FX_EVENT.change, FX_EVENT.valuesChange],
};

export type FxEventName = (typeof FX_EVENT)[keyof typeof FX_EVENT];
