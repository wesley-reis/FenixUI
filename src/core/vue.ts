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
import type {
  FxAutocompleteProps,
  FxAccordionPanelProps,
  FxAccordionProps,
  FxAlertProps,
  FxAvatarProps,
  FxBadgeProps,
  FxBreadcrumbProps,
  FxButtonProps,
  FxCalendarProps,
  FxCardProps,
  FxCarouselProps,
  FxCheckboxProps,
  FxChipProps,
  FxConfirmPopupProps,
  FxDatepickerProps,
  FxDialogProps,
  FxDropdownItemProps,
  FxDropdownProps,
  FxDrawerProps,
  FxEmptyStateProps,
  FxFileUploadProps,
  FxFloatlabelProps,
  FxIconProps,
  FxInputProps,
  FxKnobProps,
  FxMenuProps,
  FxMultiselectProps,
  FxOrderListProps,
  FxPaginationProps,
  FxPasswordStrengthProps,
  FxPickListProps,
  FxPopoverProps,
  FxProgressProps,
  FxRadioProps,
  FxRatingProps,
  FxSelectProps,
  FxSkeletonProps,
  FxSliderProps,
  FxSpinnerProps,
  FxStepperProps,
  FxSwitchProps,
  FxTableProps,
  FxTabPanelProps,
  FxTabsProps,
  FxTextareaProps,
  FxTimelineProps,
  FxToastProps,
  FxToggleButtonGroupProps,
  FxTooltipProps,
  FxTreeProps,
} from './jsx';

import type {} from '@vue/runtime-dom';

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
    'fx-fileupload': FxComp<FxFileUploadProps>;
    'fx-slider': FxComp<FxSliderProps>;
    'fx-chip': FxComp<FxChipProps>;
    'fx-avatar': FxComp<FxAvatarProps>;
    'fx-icon': FxComp<FxIconProps>;
    'fx-card': FxComp<FxCardProps>;
    'fx-breadcrumb': FxComp<FxBreadcrumbProps>;
    'fx-popover': FxComp<FxPopoverProps>;
    'fx-stepper': FxComp<FxStepperProps>;
    'fx-rating': FxComp<FxRatingProps>;
    'fx-menu': FxComp<FxMenuProps>;
    'fx-toggle-button-group': FxComp<FxToggleButtonGroupProps>;
    'fx-empty-state': FxComp<FxEmptyStateProps>;
    'fx-password-strength': FxComp<FxPasswordStrengthProps>;
    'fx-timeline': FxComp<FxTimelineProps>;
    'fx-carousel': FxComp<FxCarouselProps>;
    'fx-tree': FxComp<FxTreeProps>;
    'fx-confirmpopup': FxComp<FxConfirmPopupProps>;
    'fx-knob': FxComp<FxKnobProps>;
    'fx-accordion': FxComp<FxAccordionProps>;
    'fx-accordion-panel': FxComp<FxAccordionPanelProps>;
    'fx-orderlist': FxComp<FxOrderListProps>;
    'fx-picklist': FxComp<FxPickListProps>;
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
    'fx-fileupload': FxFileUploadProps;
    'fx-slider': FxSliderProps;
    'fx-chip': FxChipProps;
    'fx-avatar': FxAvatarProps;
    'fx-icon': FxIconProps;
    'fx-card': FxCardProps;
    'fx-breadcrumb': FxBreadcrumbProps;
    'fx-popover': FxPopoverProps;
    'fx-stepper': FxStepperProps;
    'fx-rating': FxRatingProps;
    'fx-menu': FxMenuProps;
    'fx-toggle-button-group': FxToggleButtonGroupProps;
    'fx-empty-state': FxEmptyStateProps;
    'fx-password-strength': FxPasswordStrengthProps;
    'fx-timeline': FxTimelineProps;
    'fx-carousel': FxCarouselProps;
    'fx-tree': FxTreeProps;
    'fx-confirmpopup': FxConfirmPopupProps;
    'fx-knob': FxKnobProps;
    'fx-accordion': FxAccordionProps;
    'fx-accordion-panel': FxAccordionPanelProps;
    'fx-orderlist': FxOrderListProps;
    'fx-picklist': FxPickListProps;
  }
}

/** Marcador para `import '@wrrdev/fenix-ui/vue'` funcionar como side-effect import. */
export const FX_VUE_TYPES = true as const;

/** Reexporta os tipos nomeados de props para consumidores Vue. */
export type * from './jsx';

