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
import type { FenixIconName } from '../icons/types';

/** Marcador de runtime: permite `import '@wrrdev/fenix-ui/jsx'` como side-effect import. */
export const FX_JSX_TYPES = true as const;

/* Uniões auxiliares (variants, enums) */
export type FxButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline';
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
export type FxChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type FxAvatarVariant = 'image' | 'text' | 'icon';
export type FxAvatarShape = 'circle' | 'rounded' | 'square';
export type FxCardVariant = 'elevated' | 'flat' | 'outline' | 'ghost';
/** Arredondamento do container do card. */
export type FxCardRadius = 'sm' | 'md' | 'lg';
export type FxPopoverTrigger = 'click' | 'hover';
export type FxPopoverPosition = 'auto' | 'top' | 'bottom';
export type FxMenuOrientation = 'horizontal' | 'vertical';
export type FxTimelineOrientation = 'vertical' | 'horizontal';
export type FxSelectionMode = 'single' | 'multiple';

/* Props por componente */
export interface FxButtonProps extends FxElementProps {
  variant?: FxButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  size?: FxSize;
  loading?: boolean;
  full?: boolean;
  icon?: string;
  'icon-pos'?: 'left' | 'right';
}
export interface FxBadgeProps extends FxElementProps {
  variant?: FxBadgeVariant;
  round?: boolean;
}
export interface FxSpinnerProps extends FxElementProps { size?: FxSize; }
export interface FxInputProps extends FxElementProps {
  type?: FxInputType;
  size?: FxSize;
  placeholder?: string;
  readonly?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  clearable?: boolean;
  full?: boolean;
  icon?: string;
  'icon-pos'?: 'left' | 'right';
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
  full?: boolean;
  error?: boolean;
  invalid?: boolean;
  success?: boolean;
  valid?: boolean;
}
export interface FxSwitchProps extends FxElementProps { checked?: boolean; size?: FxSize; }
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
  full?: boolean;
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
  full?: boolean;
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
  full?: boolean;
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
  full?: boolean;
  error?: boolean;
  invalid?: boolean;
  success?: boolean;
  valid?: boolean;
  active?: boolean;
  'error-text'?: string;
}
export interface FxDialogProps extends FxElementProps { open?: boolean; size?: FxSize; heading?: string; }
export interface FxDrawerProps extends FxElementProps { open?: boolean; title?: string; position?: FxDrawerPosition; }
export interface FxToastProps extends FxElementProps {
  kind?: FxToastKind;
  title?: string;
  message?: string;
  duration?: number;
  position?: FxToastPosition;
  /** Força o esquema de cores do card independentemente do tema global. */
  mode?: 'light' | 'dark';
}
export interface FxTooltipProps extends FxElementProps { content?: string; position?: FxTooltipPosition; }
export interface FxTabsProps extends FxElementProps { value?: string; }
export interface FxTabPanelProps extends FxElementProps { tab?: string; hidden?: boolean; }
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
export interface FxAlertProps extends FxElementProps { variant?: FxAlertVariant; title?: string; dismissible?: boolean; }
export interface FxDropdownProps extends FxElementProps { label?: string; position?: FxDropdownPosition; open?: boolean; }
export interface FxDropdownItemProps extends FxElementProps { value?: string; }
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
  full?: boolean;
}
export interface FxFileUploadProps extends FxElementProps {
  mode?: 'basic' | 'advanced';
  size?: FxSize;
  severity?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  label?: string;
  icon?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  'show-progress'?: boolean;
  progress?: number;
  full?: boolean;
}

/* Props dos componentes de layout/dados/navegação/feedback */
export interface FxSliderProps extends FxElementProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: FxSize;
  'show-value'?: boolean;
}
export interface FxStepperProps extends FxElementProps {
  active?: number;
  linear?: boolean;
  'show-numbers'?: boolean;
}
export interface FxChipProps extends FxElementProps {
  variant?: FxChipVariant;
  size?: FxSize;
  icon?: string;
  removable?: boolean;
  selectable?: boolean;
  selected?: boolean;
}
export interface FxAvatarProps extends FxElementProps {
  variant?: FxAvatarVariant;
  src?: string;
  alt?: string;
  size?: FxSize;
  shape?: FxAvatarShape;
}
/**
 * <fx-icon> — glifo da Fenix Icons com autocomplete no editor.
 *
 * `name` é uma união literal com TODOS os nomes da fonte (+4.000): o editor
 * (Volar/vue-tsc, React/TSX) sugere os válidos ao digitar. A tipagem aceita
 * qualquer string (escotilha `(string & {})`), então nomes montados por
 * variável/dynamic imports continuam compilando sem erro.
 */
export interface FxIconProps extends FxElementProps {
  /** Nome do glifo (ex.: `home`). Texto livre/emoji também é aceito. */
  name?: FenixIconName;
  /** Tamanho do glifo. Sem atributo, herda o tamanho do texto (1em). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Nome acessível; sem label o ícone é aria-hidden (decorativo). */
  label?: string;
  /** Variante preenchida. */
  fill?: boolean;
  /** Traço mais pesado. */
  bold?: boolean;
}
export interface FxCardProps extends FxElementProps {
  variant?: FxCardVariant;
  /** Arredondamento do container (radius sm/md/lg). */
  radius?: FxCardRadius;
  /** @deprecated use `radius`. */
  size?: FxSize;
  padded?: boolean;
  heading?: string;
}
export interface FxBreadcrumbProps extends FxElementProps {
  size?: FxSize;
  separator?: string;
}
export interface FxPopoverProps extends FxElementProps {
  open?: boolean;
  target?: string;
  trigger?: FxPopoverTrigger;
  position?: FxPopoverPosition;
  dismissible?: boolean;
}
export interface FxRatingProps extends FxElementProps {
  value?: number;
  max?: number;
  readonly?: boolean;
  'allow-half'?: boolean;
  size?: FxSize;
}
export interface FxMenuProps extends FxElementProps {
  orientation?: FxMenuOrientation;
  size?: FxSize;
  titles?: string;
}
export interface FxToggleButtonGroupProps extends FxElementProps {
  multiple?: boolean;
  value?: string;
  size?: FxSize;
}
export interface FxEmptyStateProps extends FxElementProps {
  icon?: string;
  heading?: string;
  description?: string;
}
export interface FxPasswordStrengthProps extends FxElementProps {
  value?: string;
  size?: FxSize;
}
export interface FxTimelineProps extends FxElementProps {
  orientation?: FxTimelineOrientation;
  size?: FxSize;
  marker?: string;
}
export interface FxCarouselProps extends FxElementProps {
  active?: number;
  'show-arrows'?: boolean;
  'show-indicators'?: boolean;
  loop?: boolean;
  autoplay?: number;
}
export interface FxTreeProps extends FxElementProps {
  data?: string;
  'expand-all'?: boolean;
  size?: FxSize;
}
export interface FxConfirmPopupProps extends FxElementProps {
  open?: boolean;
  target?: string;
  message?: string;
  icon?: string;
  'accept-label'?: string;
  'reject-label'?: string;
  position?: FxPopoverPosition;
}
export interface FxKnobProps extends FxElementProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: FxSize;
  'stroke-width'?: number;
  'value-color'?: string;
  'range-color'?: string;
  'value-template'?: string;
  readonly?: boolean;
}
export interface FxAccordionProps extends FxElementProps {
  value?: string;
  multiple?: boolean;
}
export interface FxAccordionPanelProps extends FxElementProps {
  value?: string;
  header?: string;
}
export interface FxOrderListProps extends FxElementProps {
  data?: string;
  'data-key'?: string;
  filter?: boolean;
  'filter-by'?: string;
  'filter-placeholder'?: string;
  dragdrop?: boolean;
  striped?: boolean;
  'selection-mode'?: FxSelectionMode;
  'show-select-all'?: boolean;
}
export interface FxPickListProps extends FxElementProps {
  source?: string;
  target?: string;
  'source-key'?: string;
  'target-key'?: string;
  filter?: boolean;
  'filter-by'?: string;
  'source-label'?: string;
  'target-label'?: string;
  'selection-mode'?: FxSelectionMode;
  'show-select-all'?: boolean;
  striped?: boolean;
}
/* Augmentation global de JSX (React clássico/TSX, Preact, Vue JSX, …).
   Cada tag fx-* recebe autocomplete + validação de atributos.
   A interface é exportada para que o módulo opt-in `@wrrdev/fenix-ui/react`
   também registre as tags em React.JSX (usado quando "jsx": "react-jsx"). */
export interface FxJsxIntrinsicElements {
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
declare global {
  namespace JSX {
    interface IntrinsicElements extends FxJsxIntrinsicElements {}
  }
}

/* Tipagem imperativa: document.createElement('fx-...').
   As tags abaixo não declaradas nos próprios componentes ganham tipagem aqui;
   as demais (alert, dialog, drawer, dropdown, pagination, progress, skeleton,
   tabs, textarea, toast, tooltip, autocomplete) já são tipadas com a classe
   concreta nos respectivos index.ts. */
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
    'fx-accordion': HTMLElement;
    'fx-accordion-panel': HTMLElement;
    'fx-orderlist': HTMLElement;
    'fx-picklist': HTMLElement;
  }
}
