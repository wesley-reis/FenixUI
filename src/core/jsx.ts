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
/**
 * Cor semântica compartilhada (atributo `severity`).
 *
 * Padrão da lib: **cor ≠ forma**. `severity` carrega a COR em todos os
 * componentes; `variant` carrega a FORMA/estilo (nunca cor). Exportada para
 * reaproveitamento em wrappers e código imperativo.
 */
export type FxSeverity = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Forma do <fx-button>: `solid` (padrão) · `outline` · `ghost`.
 *
 * Os valores de cor antigos (`primary`…`info`) continuam aceitos como ALIAS
 * legado — equivalem a `variant="solid"` + `severity=<cor>`.
 */
export type FxButtonVariant = 'solid' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
/** Cor do <fx-button> — alias canônico de {@link FxSeverity}. */
export type FxButtonSeverity = FxSeverity;
export type FxBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type FxAlertVariant = 'info' | 'success' | 'warning' | 'danger';
export type FxProgressVariant = 'primary' | 'success' | 'warning' | 'danger';
export type FxSkeletonVariant = 'text' | 'circle' | 'rect';
export type FxFloatlabelVariant = 'on' | 'in' | 'over';
/**
 * Tipos aceitos pelo `<fx-input>`: só os que o componente desenha com os
 * tokens do tema. Qualquer outro valor normaliza para `'text'` — para
 * email/tel/url/date/… use o `<input>` nativo do tipo desejado.
 */
export type FxInputType = 'text' | 'number' | 'password';
export type FxFieldStatus = 'error' | 'invalid' | 'success' | 'valid';
export type FxToastKind = 'success' | 'error' | 'info' | 'warning';
export type FxToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type FxTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
/**
 * O que o `<fx-datepicker>` exibe no popover.
 *
 * - `date` (padrão) — só o calendário;
 * - `time` — só a seleção de hora (valor `HH:mm:ss`);
 * - `datetime` — calendário + hora (valor `YYYY-MM-DDTHH:mm:ss`).
 *
 * O atributo legado `show-time` equivale a `datetime`.
 */
export type FxDatepickerPicker = 'date' | 'time' | 'datetime';
export type FxDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type FxDropdownPosition = 'left' | 'center' | 'right' | 'bottom-left' | 'bottom-right';
export type FxPaginationPosition = 'left' | 'center' | 'right';
export type FxChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type FxAvatarVariant = 'image' | 'text' | 'icon';
/** Modo de exibição do <fx-avatar> (canônico) — `variant` é alias legado. */
export type FxAvatarMode = 'image' | 'text' | 'icon';
export type FxAvatarShape = 'circle' | 'rounded' | 'square';
export type FxCardVariant = 'elevated' | 'flat' | 'outline' | 'ghost';
/** Arredondamento do container do card. */
export type FxCardRadius = 'sm' | 'md' | 'lg';
/**
 * Arredondamento das bordas do <fx-table>.
 *
 * - `none` — bordas retas (0);
 * - `sm` / `md` / `lg` — tokens `--fx-radius-sm|md|lg`.
 *
 * O padrão é `md`. O atributo `radius` é aceito como alias de `rounded`
 * (mesma convenção do <fx-card>).
 */
export type FxTableRadius = 'none' | 'sm' | 'md' | 'lg';
export type FxPopoverTrigger = 'click' | 'hover';
export type FxPopoverPosition = 'auto' | 'top' | 'bottom';
export type FxMenuOrientation = 'horizontal' | 'vertical';
export type FxTimelineOrientation = 'vertical' | 'horizontal';
export type FxSelectionMode = 'single' | 'multiple';
export type FxEditorToolbar = 'minimal' | 'basic' | 'standard' | 'full' | 'none';
export type FxEditorPasteMode = 'clean' | 'plain';

/* Props por componente */
export interface FxButtonProps extends FxElementProps {
  /** Forma (solid|outline|ghost). Valores de cor legados seguem aceitos. */
  variant?: FxButtonVariant;
  /** Cor semântica (separada da forma). */
  severity?: FxButtonSeverity;
  type?: 'button' | 'submit' | 'reset';
  size?: FxSize;
  loading?: boolean;
  full?: boolean;
  icon?: string;
  'icon-pos'?: 'left' | 'right';
}
export interface FxBadgeProps extends FxElementProps {
  variant?: FxBadgeVariant;
  /** Cor semântica (canônica). */
  severity?: FxSeverity;
  round?: boolean;
}
export interface FxSpinnerProps extends FxElementProps { size?: FxSize; }
export interface FxInputProps extends FxElementProps {
  type?: FxInputType;
  size?: FxSize;
  placeholder?: string;
  readonly?: boolean;
  /**
   * Repassado ao `<input>` interno (default `'off'`): o campo real vive no
   * Shadow DOM, então sem este atributo o navegador autopreenche o campo com
   * credenciais salvas. Use os tokens semânticos quando o autofill for
   * desejado: `'username'`, `'current-password'`, `'new-password'`,
   * `'one-time-code'`, `'email'`, `'street-address'`, … Sem token semântico o
   * autofill é **desfeito** pelo componente (ver `emit-autofill`).
   */
  autocomplete?: string;
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
  /**
   * Aceita o valor colocado no campo pelo navegador (autofill/gerenciador de
   * senha/script): `input`/`change`/`valueChange` também nesse caminho. Sem ele
   * — e sem token semântico em `autocomplete` — o autofill é **desfeito**: o
   * campo volta ao valor do host e nada é propagado (ver core/user-edit.ts).
   */
  'emit-autofill'?: boolean;
}
export interface FxSelectProps extends FxElementProps {
  value?: string | number;
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
  /** Repassado ao `<textarea>` interno (default `'off'`) — mesma regra do fx-input. */
  autocomplete?: string;
  full?: boolean;
  error?: boolean;
  invalid?: boolean;
  success?: boolean;
  valid?: boolean;
  /** `input`/`change`/`valueChange` também em autofill (ver core/user-edit.ts). */
  'emit-autofill'?: boolean;
}
export interface FxEditorProps extends FxElementProps, FxEventHandlers<'fx-editor'> {
  value?: string;
  name?: string;
  required?: boolean;
  readonly?: boolean;
  placeholder?: string;
  toolbar?: FxEditorToolbar;
  features?: string;
  'paste-mode'?: FxEditorPasteMode;
  'min-height'?: string;
  'max-height'?: string;
  'show-count'?: boolean;
  maxlength?: number;
  fullscreen?: boolean;
  uploadImage?: (file: File) => Promise<string | { url: string; alt?: string; width?: string }>;
  sanitizeHtml?: (html: string) => string;
}
export interface FxMultiselectProps extends FxElementProps {
  values?: string[] | string;
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
export interface FxCalendarProps extends FxElementProps, FxEventHandlers<'fx-calendar'> {
  value?: string;
  start?: string;
  end?: string;
  min?: string;
  max?: string;
  mode?: 'single' | 'range' | 'multiple';
  values?: string[] | string;
  locale?: string;
  disabled?: boolean;
}
export interface FxDatepickerProps extends FxElementProps, FxEventHandlers<'fx-datepicker'> {
  value?: string;
  start?: string;
  end?: string;
  values?: string[] | string;
  mode?: 'single' | 'range' | 'multiple';
  min?: string;
  max?: string;
  placeholder?: string;
  size?: FxSize;
  format?: string;
  /** O que exibir: `date` (padrão) · `time` · `datetime`. */
  picker?: FxDatepickerPicker;
  /** Alias legado de `picker="datetime"`. */
  'show-time'?: boolean;
  'free-text'?: boolean;
  clearable?: boolean;
  full?: boolean;
  error?: boolean;
  invalid?: boolean;
  success?: boolean;
  valid?: boolean;
}
export interface FxTableProps extends FxElementProps, FxEventHandlers<'fx-table'> {
  pagination?: boolean;
  rows?: number;
  'rows-options'?: string;
  striped?: boolean;
  hover?: boolean;
  'empty-message'?: string;
  'pagination-position'?: FxPaginationPosition;
  total?: number;
  page?: number;
  lazy?: boolean;
  loading?: boolean;
  'loading-message'?: string;
  'sort-field'?: string;
  'sort-order'?: 'asc' | 'desc' | '';
  /**
   * Arredondamento das bordas. `none` deixa retas; `sm`/`md`/`lg` usam os
   * tokens `--fx-radius-*`. Padrão: `md`.
   */
  rounded?: FxTableRadius;
  /** Alias de `rounded` (mesma convenção do <fx-card>). */
  radius?: FxTableRadius;
  /** Remove apenas as bordas laterais, mantendo topo e base. */
  'no-borders-x'?: boolean;
  /** Referência ao markup da toolbar: `#id`/`id` de um elemento fora da tabela. */
  toolbar?: string;
}
/**
 * <fx-column> — declaração de coluna (light DOM do <fx-table>).
 *
 * O template de célula vai em `<fx-cell>` (tag imune a Vue/React/Angular) ou,
 * em markup estático, em `template="#id"`. A forma antiga com `<template>`
 * dentro da coluna continua aceita.
 */
export interface FxColumnProps extends FxElementProps {
  field?: string;
  header?: string;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
  /** Referência a um elemento de template: `#id` ou `id`. */
  template?: string;
}
/**
 * <fx-cell> — template de renderização de uma célula do <fx-table>.
 *
 * Substitui o `<template>` nativo, que é interceptado por Vue/React/Angular.
 * Aceita expressões `{{ }}`, pipes e acesso a `row.*`. Não tem atributos
 * próprios: o conteúdo vem de `children`.
 *
 * ⚠️ SÓ FUNCIONA DENTRO DE <fx-column> (filho direto), que por sua vez só
 *    existe dentro de <fx-table>. Fora da tabela a tag é inerte.
 *
 * ⚠️ O conteúdo é TEXTO CRU: o `{{ }}` é avaliado pelo motor do <fx-table>,
 *    não pelo framework. O TypeScript não consegue tipar isso (é uma string),
 *    então cada stack precisa neutralizar a própria sintaxe de template:
 *
 *    - Vue 3 / Nuxt ... <fx-cell v-pre>{{ value }}</fx-cell>
 *      Sem `v-pre` o Vue compila a interpolação (`_toDisplayString(_ctx.value)`),
 *      o texto não chega ao componente e o vue-tsc acusa `value` inexistente.
 *    - React / JSX .... <fx-cell>{'{{ value }}'}</fx-cell>
 *      O `{{ }}` solto é ERRO de sintaxe no parser JSX — deve ser string JS.
 *    - Angular ........ <fx-cell ngNonBindable>…</fx-cell>
 *    - Svelte ......... <fx-cell>{'{{ value }}'}</fx-cell>
 *                      ou &lbrace;&lbrace; value &rbrace;&rbrace;
 *    - HTML/CDN ....... <fx-cell>{{ value }}</fx-cell> (nada a fazer)
 *
 *    Variáveis do escopo: `value` (campo da coluna), `row` (objeto da linha,
 *    `row.campo`), literais `true`/`false`/`null`, pipes `currency`, `number`,
 *    `date`, `dateTime`, operadores `+ - * /`, comparações e ternário `? :`.
 */
export interface FxCellProps extends FxElementProps {}
/**
 * <fx-toolbar> — barra de ações acima do header do <fx-table>.
 *
 * Substitui `<template slot="toolbar">`. Inputs com `data-search-fields`
 * viram busca global. Sem atributos próprios.
 */
export interface FxToolbarProps extends FxElementProps {}
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
export interface FxDialogProps extends FxElementProps, FxEventHandlers<'fx-dialog'> { open?: boolean; size?: FxSize; heading?: string; }
export interface FxDrawerProps extends FxElementProps, FxEventHandlers<'fx-drawer'> { open?: boolean; title?: string; position?: FxDrawerPosition; dismissible?: boolean; }
export interface FxToastProps extends FxElementProps {
  kind?: FxToastKind;
  /** Alias canônico de cor (padrão da lib). `danger`↔`error`. */
  severity?: FxSeverity;
  title?: string;
  message?: string;
  duration?: number;
  position?: FxToastPosition;
  /** Força o esquema de cores do card independentemente do tema global. */
  mode?: 'light' | 'dark';
  /**
   * Barra de contagem regressiva na base do card, na cor do `kind`.
   * Vazio ou `'always'` = corre sempre; `'hover'` = só sob cursor/foco;
   * `'paused'` = barra cheia e imóvel. Sem efeito com `duration: 0`.
   */
  progress?: FxToastProgress | boolean;
  /**
   * Lado a partir do qual a barra esvazia. `'left'` (padrão) ancora a barra à
   * esquerda; `'right'` a ancora à direita (espelhado). Exige `progress`.
   */
  'progress-origin'?: FxToastOrigin;
}
/** Modos da barra de contagem regressiva do <fx-toast>. */
export type FxToastProgress = 'always' | 'hover' | 'paused';
/** Lado pelo qual a barra de contagem do <fx-toast> esvazia. */
export type FxToastOrigin = 'left' | 'right';
export interface FxTooltipProps extends FxElementProps { content?: string; position?: FxTooltipPosition; }
export interface FxTabsProps extends FxElementProps, FxEventHandlers<'fx-tabs'> { value?: string; }
export interface FxTabPanelProps extends FxElementProps { tab?: string; hidden?: boolean; }
export interface FxProgressProps extends FxElementProps, FxEventHandlers<'fx-progress'> {
  value?: number;
  indeterminate?: boolean;
  variant?: FxProgressVariant;
  /** Cor semântica (canônica). */
  severity?: FxSeverity;
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
export interface FxAlertProps extends FxElementProps, FxEventHandlers<'fx-alert'> { variant?: FxAlertVariant; severity?: FxSeverity; title?: string; dismissible?: boolean; }
export interface FxDropdownProps extends FxElementProps, FxEventHandlers<'fx-dropdown'> { label?: string; position?: FxDropdownPosition; open?: boolean; }
export interface FxDropdownItemProps extends FxElementProps { value?: string; }
export interface FxPaginationProps extends FxElementProps, FxEventHandlers<'fx-pagination'> {
  page?: number;
  total?: number;
  rows?: number;
  'rows-options'?: string;
  position?: FxPaginationPosition;
}
export interface FxAutocompleteProps extends FxElementProps, FxEventHandlers<'fx-autocomplete'> {
  value?: string;
  size?: FxSize;
  placeholder?: string;
  source?: string;
  disabled?: boolean;
  'min-chars'?: number;
  full?: boolean;
  /** `input`/`valueChange` também em autofill (ver core/user-edit.ts). */
  'emit-autofill'?: boolean;
}
export interface FxFileUploadProps extends FxElementProps, FxEventHandlers<'fx-fileupload'> {
  mode?: 'basic' | 'advanced';
  size?: FxSize;
  severity?: FxSeverity;
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
export interface FxStepperProps extends FxElementProps, FxEventHandlers<'fx-stepper'> {
  active?: number;
  linear?: boolean;
  'show-numbers'?: boolean;
}
export interface FxChipProps extends FxElementProps, FxEventHandlers<'fx-chip'> {
  variant?: FxChipVariant;
  /** Cor semântica (canônica). */
  severity?: FxSeverity;
  size?: FxSize;
  icon?: string;
  removable?: boolean;
  selectable?: boolean;
  selected?: boolean;
}
export interface FxAvatarProps extends FxElementProps {
  variant?: FxAvatarVariant;
  /** Modo de exibição (canônico): image|text|icon. */
  mode?: FxAvatarMode;
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
export interface FxBreadcrumbProps extends FxElementProps, FxEventHandlers<'fx-breadcrumb'> {
  size?: FxSize;
  separator?: string;
}
export interface FxPopoverProps extends FxElementProps, FxEventHandlers<'fx-popover'> {
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
export interface FxMenuProps extends FxElementProps, FxEventHandlers<'fx-menu'> {
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
export interface FxPasswordStrengthProps extends FxElementProps, FxEventHandlers<'fx-password-strength'> {
  value?: string;
  size?: FxSize;
}
export interface FxTimelineProps extends FxElementProps {
  orientation?: FxTimelineOrientation;
  size?: FxSize;
  marker?: string;
}
export interface FxCarouselProps extends FxElementProps, FxEventHandlers<'fx-carousel'> {
  active?: number;
  'show-arrows'?: boolean;
  'show-indicators'?: boolean;
  loop?: boolean;
  autoplay?: number;
}
export interface FxTreeProps extends FxElementProps, FxEventHandlers<'fx-tree'> {
  data?: string;
  'expand-all'?: boolean;
  size?: FxSize;
}
export interface FxConfirmPopupProps extends FxElementProps, FxEventHandlers<'fx-confirmpopup'> {
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
export interface FxAccordionProps extends FxElementProps, FxEventHandlers<'fx-accordion'> {
  value?: string;
  multiple?: boolean;
}
export interface FxAccordionPanelProps extends FxElementProps, FxEventHandlers<'fx-accordion-panel'> {
  value?: string;
  header?: string;
}
export interface FxOrderListProps extends FxElementProps, FxEventHandlers<'fx-orderlist'> {
  data?: string;
  /**
   * Array de itens — alias de `data` para binding de framework
   * (`:items="lista"` no Vue / `items={lista}` no React). Também aceita
   * JSON no atributo (`items='[{"label":"A"}]'`).
   */
  items?: import('../components/orderlist/orderlist').OrderListItem[];
  'data-key'?: string;
  filter?: boolean;
  'filter-by'?: string;
  'filter-placeholder'?: string;
  dragdrop?: boolean;
  striped?: boolean;
  'selection-mode'?: FxSelectionMode;
  'show-select-all'?: boolean;
}
export interface FxPickListProps extends FxElementProps, FxEventHandlers<'fx-picklist'> {
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
/* ------------------------------------------------------------------ *
 * Eventos tipados por framework
 * ------------------------------------------------------------------ *
 * Os nomes *namespaced* (`fx-<componente>-<ação>`) são únicos por construção,
 * então cada um pertence a um componente. A prop do handler depende do stack:
 *
 *  - Vue 3.5 (Volar): `@fx-tabs-change` → prop `onFxTabsChange`
 *    (o compilador cameliza o nome; o runtime volta a hifenizar via
 *    `hyphenate()`, então o evento DOM continua `fx-tabs-change`).
 *  - React 19: prop = `on` + nome EXATO do evento → `onfx-tabs-change`
 *    (`setValueForPropertyOnCustomComponent` faz `name.slice(2)`).
 *  - HTML/TS puro, Angular, Svelte: `addEventListener('fx-tabs-change', …)`.
 *
 * Os eventos de VALOR (`input`/`change`/`valueChange`/…) seguem a sintaxe
 * documentada por framework (v-model / [value]+(valueChange) / onInput / on:input).
 */

/** `'fx-tabs-change'` → `'FxTabsChange'` (Vue cameliza o nome do evento). */
type FxCamelCase<S extends string> = S extends `${infer A}-${infer B}`
  ? `${A}${FxCamelCase<Capitalize<B>>}`
  : S;

/** Payload (`detail`) de cada evento eventspaced — chaves = valores de `FX_EVENT`. */
export interface FxEventDetailMap {
  'fx-accordion-change': { value: string[] };
  'fx-accordion-panel-toggle': { panel: HTMLElement };
  'fx-alert-dismiss': void;
  'fx-breadcrumb-select': { item: unknown; index: number };
  'fx-calendar-change': { value?: string; start?: string; end?: string; values?: string[] };
  'fx-carousel-change': { index: number };
  'fx-chip-remove': void;
  'fx-chip-click': void;
  'fx-confirmpopup-accept': void;
  'fx-confirmpopup-reject': void;
  'fx-dialog-open': void;
  'fx-dialog-close': void;
  'fx-drawer-open': void;
  'fx-drawer-close': void;
  'fx-dropdown-select': { value: string };
  'fx-menu-select': { index: number; label: string };
  'fx-orderlist-reorder': { items: unknown[] };
  'fx-orderlist-selection-change': { selection: unknown[] };
  'fx-pagination-page-change': { page: number; rows: number };
  'fx-password-strength-change': { score: number; value: string };
  'fx-picklist-move-to-target': { items: unknown[]; source: unknown[]; target: unknown[] };
  'fx-picklist-move-to-source': { items: unknown[]; source: unknown[]; target: unknown[] };
  'fx-picklist-selection-change-source': { selection: unknown[] };
  'fx-picklist-selection-change-target': { selection: unknown[] };
  'fx-popover-show': void;
  'fx-popover-hide': void;
  'fx-progress-complete': void;
  'fx-stepper-change': { index: number };
  'fx-stepper-complete': void;
  'fx-table-sort-change': { field: string; direction: 'asc' | 'desc'; lazy: boolean };
  'fx-table-filter-change': { field: string; value: string; lazy: boolean };
  'fx-table-page-change': { page: number; pages: number; rowsPerPage: number; total: number; lazy: boolean };
  'fx-table-row-click': { row: Record<string, unknown>; index: number };
  'fx-tabs-change': { value: string };
  'fx-tree-select': { node: unknown };
  'fx-autocomplete-select': { value: string };
  'fx-datepicker-invalid': { text: string };
  'fx-editor-ready': void;
  'fx-editor-focus': void;
  'fx-editor-blur': void;
  'fx-editor-error': { message: string };
  'fx-fileupload-select': { files: File[] };
  'fx-fileupload-remove': { file: File };
  'fx-fileupload-complete': void;
}

/**
 * Handlers de evento de um elemento `fx-*`, nas convenções Vue e React.
 *
 * Ex.: para `fx-tabs` gera `onFxTabsChange` (Vue `@fx-tabs-change`) e
 * `'onfx-tabs-change'` (React 19).
 */
export type FxEventHandlers<Tag extends string> = {
  [K in Extract<keyof FxEventDetailMap, `${Tag}-${string}`> as `on${FxCamelCase<Capitalize<K>>}`]?: (
    event: CustomEvent<FxEventDetailMap[K]>,
  ) => void;
} & {
  [K in Extract<keyof FxEventDetailMap, `${Tag}-${string}`> as `on${K}`]?: (
    event: CustomEvent<FxEventDetailMap[K]>,
  ) => void;
};


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
  'fx-editor': FxEditorProps;
  'fx-multiselect': FxMultiselectProps;
  'fx-calendar': FxCalendarProps;
  'fx-datepicker': FxDatepickerProps;
  'fx-table': FxTableProps;
  'fx-column': FxColumnProps;
  'fx-cell': FxCellProps;
  'fx-toolbar': FxToolbarProps;
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
    /* Subtags do <fx-table>: não são custom elements (ficam inertes no light
       DOM), mas precisam existir no mapa para `createElement('fx-cell')` não
       cair no overload genérico de `createElement(tag: string)`. */
    'fx-column': HTMLElement;
    'fx-cell': HTMLElement;
    'fx-toolbar': HTMLElement;
  }
}
