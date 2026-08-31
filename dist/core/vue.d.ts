/**
 * Tipagem de componentes <fx-*> para Vue 3 (Volar / vue-tsc).
 *
 * Este mÃ³dulo Ã© OPT-IN: importe `@wrrdev/fenix-ui/vue` uma Ãºnica vez
 * (ex.: no `main.ts`) para habilitar autocomplete + validaÃ§Ã£o de atributos
 * dos elementos `fx-*` nos templates SFC.
 *
 * - `IntrinsicElementAttributes` (Vue 3.5+): ponto oficial de extensÃ£o para
 *   elementos nativos/custom â€” alimenta `NativeElements` e o
 *   `JSX.IntrinsicElements` usado pelo Volar para tags com hÃ­fen.
 * - `GlobalComponents`: registro adicional como componentes globais.
 */
import type { FxAutocompleteProps, FxAlertProps, FxBadgeProps, FxButtonProps, FxCalendarProps, FxCheckboxProps, FxDatepickerProps, FxDialogProps, FxDropdownItemProps, FxDropdownProps, FxDrawerProps, FxFloatlabelProps, FxInputProps, FxMultiselectProps, FxPaginationProps, FxProgressProps, FxRadioProps, FxSelectProps, FxSkeletonProps, FxSpinnerProps, FxSwitchProps, FxTableProps, FxTabPanelProps, FxTabsProps, FxTextareaProps, FxToastProps, FxTooltipProps } from './jsx';
type FxComp<P> = import('vue').FunctionalComponent<P>;
declare module '@vue/runtime-core' {
    interface GlobalComponents {
        'fx-button': FxComp<FxButtonProps>;
        'fx-badge': FxComp<FxBadgeProps>;
        'fx-spinner': FxComp<FxSpinnerProps>;
        'fx-input': FxComp<FxInputProps>;
        'fx-select': FxComp<FxSelectProps>;
        'fx-switch': FxComp<FxSwitchProps>;
        'fx-checkbox': FxComp<FxCheckboxProps>;
        'fx-radio': FxComp<FxRadioProps>;
        'fx-textarea': FxComp<FxTextareaProps>;
        'fx-multiselect': FxComp<FxMultiselectProps>;
        'fx-calendar': FxComp<FxCalendarProps>;
        'fx-datepicker': FxComp<FxDatepickerProps>;
        'fx-table': FxComp<FxTableProps>;
        'fx-floatlabel': FxComp<FxFloatlabelProps>;
        'fx-dialog': FxComp<FxDialogProps>;
        'fx-drawer': FxComp<FxDrawerProps>;
        'fx-toast': FxComp<FxToastProps>;
        'fx-tooltip': FxComp<FxTooltipProps>;
        'fx-tabs': FxComp<FxTabsProps>;
        'fx-tab-panel': FxComp<FxTabPanelProps>;
        'fx-progress': FxComp<FxProgressProps>;
        'fx-skeleton': FxComp<FxSkeletonProps>;
        'fx-alert': FxComp<FxAlertProps>;
        'fx-dropdown': FxComp<FxDropdownProps>;
        'fx-dropdown-item': FxComp<FxDropdownItemProps>;
        'fx-pagination': FxComp<FxPaginationProps>;
        'fx-autocomplete': FxComp<FxAutocompleteProps>;
    }
}
declare module '@vue/runtime-dom' {
    interface IntrinsicElementAttributes {
        'fx-button': FxButtonProps;
        'fx-badge': FxBadgeProps;
        'fx-spinner': FxSpinnerProps;
        'fx-input': FxInputProps;
        'fx-select': FxSelectProps;
        'fx-switch': FxSwitchProps;
        'fx-checkbox': FxCheckboxProps;
        'fx-radio': FxRadioProps;
        'fx-textarea': FxTextareaProps;
        'fx-multiselect': FxMultiselectProps;
        'fx-calendar': FxCalendarProps;
        'fx-datepicker': FxDatepickerProps;
        'fx-table': FxTableProps;
        'fx-floatlabel': FxFloatlabelProps;
        'fx-dialog': FxDialogProps;
        'fx-drawer': FxDrawerProps;
        'fx-toast': FxToastProps;
        'fx-tooltip': FxTooltipProps;
        'fx-tabs': FxTabsProps;
        'fx-tab-panel': FxTabPanelProps;
        'fx-progress': FxProgressProps;
        'fx-skeleton': FxSkeletonProps;
        'fx-alert': FxAlertProps;
        'fx-dropdown': FxDropdownProps;
        'fx-dropdown-item': FxDropdownItemProps;
        'fx-pagination': FxPaginationProps;
        'fx-autocomplete': FxAutocompleteProps;
    }
}
/** Marcador para `import '@wrrdev/fenix-ui/vue'` funcionar como side-effect import. */
export declare const FX_VUE_TYPES: true;
export {};
//# sourceMappingURL=vue.d.ts.map