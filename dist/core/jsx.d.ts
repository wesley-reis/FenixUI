/**
 * Tipagens de propriedades + augmentations JSX do FenixUI.
 *
 * Importar este módulo — diretamente (`@wrrdev/fenix-ui/jsx`) ou via o
 * índice principal (`@wrrdev/fenix-ui`) — habilita, no TypeScript:
 *
 *  1. autocomplete + validação de atributos em templates JSX/TSX;
 *  2. tipos nomeados (`FxButtonProps`, `FxInputProps`, …) para wrappers ou código imperativo.
 *
 * A biblioteca NÃO depende de React/Vue: os atributos comuns
 * (`className`, `onClick`, `style`, `children`, …) são aceitos via assinatura
 * de índice, funcionando com qualquer runtime JSX.
 */
import type { FxElementProps, FxSize } from './types';
/** Marcador de runtime: permite `import '@wrrdev/fenix-ui/jsx'` como side-effect import. */
export declare const FX_JSX_TYPES: true;
export type FxButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
export type FxBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type FxAlertVariant = 'info' | 'success' | 'warning' | 'danger';
export type FxProgressVariant = 'primary' | 'success' | 'warning' | 'danger';
export type FxSkeletonVariant = 'text' | 'circle' | 'rect';
export type FxFloatlabelVariant = 'on' | 'in' | 'over';
export type FxInputType = 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';
export type FxFieldStatus = 'error' | 'invalid' | 'success' | 'valid';
export type FxToastKind = 'success' | 'error' | 'info' | 'warning';
export type FxToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type FxTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type FxDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type FxDropdownPosition = 'left' | 'center' | 'right' | 'bottom-left' | 'bottom-right';
export type FxPaginationPosition = 'left' | 'center' | 'right';
export interface FxButtonProps extends FxElementProps {
    variant?: FxButtonVariant;
    type?: 'button' | 'submit' | 'reset';
    size?: FxSize;
    loading?: boolean;
    full?: boolean;
}
export interface FxBadgeProps extends FxElementProps {
    variant?: FxBadgeVariant;
    round?: boolean;
}
export interface FxSpinnerProps extends FxElementProps {
    size?: FxSize;
}
export interface FxInputProps extends FxElementProps {
    type?: FxInputType;
    size?: FxSize;
    placeholder?: string;
    readonly?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    clearable?: boolean;
    error?: boolean;
    invalid?: boolean;
    success?: boolean;
    valid?: boolean;
}
export interface FxSelectProps extends FxElementProps {
    value?: string;
    size?: FxSize;
    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;
    'search-placeholder'?: string;
    'no-results'?: string;
    error?: boolean;
    invalid?: boolean;
    success?: boolean;
    valid?: boolean;
}
export interface FxSwitchProps extends FxElementProps {
    checked?: boolean;
    size?: FxSize;
}
export interface FxCheckboxProps extends FxElementProps {
    checked?: boolean;
    indeterminate?: boolean;
    value?: string;
    size?: FxSize;
}
export interface FxRadioProps extends FxElementProps {
    checked?: boolean;
    value?: string;
    name?: string;
    size?: FxSize;
}
export interface FxTextareaProps extends FxElementProps {
    value?: string;
    size?: FxSize;
    placeholder?: string;
    readonly?: boolean;
    rows?: number;
    maxlength?: number;
    error?: boolean;
    invalid?: boolean;
    success?: boolean;
    valid?: boolean;
}
export interface FxMultiselectProps extends FxElementProps {
    values?: string;
    size?: FxSize;
    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;
    open?: boolean;
    error?: boolean;
    invalid?: boolean;
    success?: boolean;
    valid?: boolean;
}
export interface FxCalendarProps extends FxElementProps {
    value?: string;
    start?: string;
    end?: string;
    min?: string;
    max?: string;
    mode?: 'single' | 'range' | 'multiple';
    values?: string;
    locale?: string;
    disabled?: boolean;
}
export interface FxDatepickerProps extends FxElementProps {
    value?: string;
    start?: string;
    end?: string;
    values?: string;
    mode?: 'single' | 'range' | 'multiple';
    min?: string;
    max?: string;
    placeholder?: string;
    size?: FxSize;
    format?: string;
    'show-time'?: boolean;
    'free-text'?: boolean;
    clearable?: boolean;
    error?: boolean;
    invalid?: boolean;
    success?: boolean;
    valid?: boolean;
}
export interface FxTableProps extends FxElementProps {
    pagination?: boolean;
    rows?: number;
    'rows-options'?: string;
    striped?: boolean;
    'empty-message'?: string;
    'pagination-position'?: FxPaginationPosition;
    total?: number;
    page?: number;
}
export interface FxFloatlabelProps extends FxElementProps {
    variant?: FxFloatlabelVariant;
    error?: boolean;
    invalid?: boolean;
    success?: boolean;
    valid?: boolean;
    active?: boolean;
    'error-text'?: string;
}
export interface FxDialogProps extends FxElementProps {
    open?: boolean;
    size?: FxSize;
    heading?: string;
}
export interface FxDrawerProps extends FxElementProps {
    open?: boolean;
    title?: string;
    position?: FxDrawerPosition;
}
export interface FxToastProps extends FxElementProps {
    kind?: FxToastKind;
    title?: string;
    message?: string;
    duration?: number;
    position?: FxToastPosition;
}
export interface FxTooltipProps extends FxElementProps {
    content?: string;
    position?: FxTooltipPosition;
}
export interface FxTabsProps extends FxElementProps {
    value?: string;
}
export interface FxTabPanelProps extends FxElementProps {
    tab?: string;
    hidden?: boolean;
}
export interface FxProgressProps extends FxElementProps {
    value?: number;
    indeterminate?: boolean;
    variant?: FxProgressVariant;
    label?: string;
    'hide-label'?: boolean;
    size?: FxSize;
}
export interface FxSkeletonProps extends FxElementProps {
    variant?: FxSkeletonVariant;
    width?: string;
    height?: string;
    lines?: number;
}
export interface FxAlertProps extends FxElementProps {
    variant?: FxAlertVariant;
    title?: string;
    dismissible?: boolean;
}
export interface FxDropdownProps extends FxElementProps {
    label?: string;
    position?: FxDropdownPosition;
    open?: boolean;
}
export interface FxDropdownItemProps extends FxElementProps {
    value?: string;
}
export interface FxPaginationProps extends FxElementProps {
    page?: number;
    total?: number;
    rows?: number;
    'rows-options'?: string;
    position?: FxPaginationPosition;
}
export interface FxAutocompleteProps extends FxElementProps {
    value?: string;
    size?: FxSize;
    placeholder?: string;
    source?: string;
    disabled?: boolean;
    'min-chars'?: number;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
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
}
declare global {
    interface HTMLElementTagNameMap {
        'fx-button': HTMLElement;
        'fx-badge': HTMLElement;
        'fx-spinner': HTMLElement;
        'fx-input': HTMLElement;
        'fx-select': HTMLElement;
        'fx-switch': HTMLElement;
        'fx-checkbox': HTMLElement;
        'fx-radio': HTMLElement;
        'fx-multiselect': HTMLElement;
        'fx-calendar': HTMLElement;
        'fx-datepicker': HTMLElement;
        'fx-table': HTMLElement;
        'fx-floatlabel': HTMLElement;
    }
}
//# sourceMappingURL=jsx.d.ts.map