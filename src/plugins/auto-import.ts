/**
 * Registro de tags → subpaths para o auto-import.
 * Mantido em um módulo próprio (sem depender de DOM) para ser usado
 * também no build do cliente via plugin.
 */
export const fenixComponentMap: Record<string, string> = {
  'fx-button': '@wrrdev/fenix-ui/button',
  'fx-badge': '@wrrdev/fenix-ui/badge',
  'fx-spinner': '@wrrdev/fenix-ui/spinner',
  'fx-select': '@wrrdev/fenix-ui/select',
  'fx-multiselect': '@wrrdev/fenix-ui/multiselect',
  'fx-input': '@wrrdev/fenix-ui/input',
  'fx-switch': '@wrrdev/fenix-ui/switch',
  'fx-calendar': '@wrrdev/fenix-ui/calendar',
  'fx-datepicker': '@wrrdev/fenix-ui/datepicker',
  'fx-checkbox': '@wrrdev/fenix-ui/checkbox',
  'fx-radio': '@wrrdev/fenix-ui/radio',
  'fx-table': '@wrrdev/fenix-ui/table',
  'fx-floatlabel': '@wrrdev/fenix-ui/floatlabel',
  'fx-textarea': '@wrrdev/fenix-ui/textarea',
  'fx-dialog': '@wrrdev/fenix-ui/dialog',
  'fx-confirmpopup': '@wrrdev/fenix-ui/confirmpopup',
  'fx-fileupload': '@wrrdev/fenix-ui/fileupload',
  'fx-slider': '@wrrdev/fenix-ui/slider',
  'fx-chip': '@wrrdev/fenix-ui/chip',
  'fx-avatar': '@wrrdev/fenix-ui/avatar',
  'fx-icon': '@wrrdev/fenix-ui/icon',
  'fx-card': '@wrrdev/fenix-ui/card',
  'fx-breadcrumb': '@wrrdev/fenix-ui/breadcrumb',
  'fx-popover': '@wrrdev/fenix-ui/popover',
  'fx-stepper': '@wrrdev/fenix-ui/stepper',
  'fx-rating': '@wrrdev/fenix-ui/rating',
  'fx-menu': '@wrrdev/fenix-ui/menu',
  'fx-toggle-button-group': '@wrrdev/fenix-ui/toggle-button-group',
  'fx-empty-state': '@wrrdev/fenix-ui/empty-state',
  'fx-password-strength': '@wrrdev/fenix-ui/password-strength',
  'fx-timeline': '@wrrdev/fenix-ui/timeline',
  'fx-carousel': '@wrrdev/fenix-ui/carousel',
  'fx-tree': '@wrrdev/fenix-ui/tree',
  'fx-drawer': '@wrrdev/fenix-ui/drawer',
  'fx-toast': '@wrrdev/fenix-ui/toast',
  'fx-tooltip': '@wrrdev/fenix-ui/tooltip',
  'fx-tabs': '@wrrdev/fenix-ui/tabs',
  'fx-tab-panel': '@wrrdev/fenix-ui/tabs',
  'fx-progress': '@wrrdev/fenix-ui/progress',
  'fx-skeleton': '@wrrdev/fenix-ui/skeleton',
  'fx-alert': '@wrrdev/fenix-ui/alert',
  'fx-dropdown': '@wrrdev/fenix-ui/dropdown',
  'fx-dropdown-item': '@wrrdev/fenix-ui/dropdown',
  'fx-pagination': '@wrrdev/fenix-ui/pagination',
  'fx-autocomplete': '@wrrdev/fenix-ui/autocomplete',
  'fx-knob': '@wrrdev/fenix-ui/knob',
  'fx-accordion': '@wrrdev/fenix-ui/accordion',
  'fx-accordion-panel': '@wrrdev/fenix-ui/accordion',
  'fx-orderlist': '@wrrdev/fenix-ui/orderlist',
  'fx-picklist': '@wrrdev/fenix-ui/picklist',
  'fx-column': '@wrrdev/fenix-ui/table',
};

const TAG_RE = /<(fx-[a-z][a-z-]*)(?=[\s/>])/g;

/**
 * Detecta o uso da biblioteca de ícones por CLASSE (`class="fx-icon fx-icon-home"`).
 *
 * O prefixo `(?:^|[^</\w-])` ignora a TAG `<fx-icon…>` / `</fx-icon>`: o
 * componente carrega o @font-face leve por conta própria e não precisa das
 * ~4.300 regras `.fx-icon-<nome>` que o subpath `/icons` injeta. Também ignora
 * nomes compostos (`meu-fx-icon`), `fx-icons`, `fx-iconHome` etc.
 */
export const FENIX_ICON_CLASS_RE = /(?:^|[^</\w-])fx-icon(?:-[a-z0-9_]+)*\b/;

export interface AutoImportOptions {
  /** Prefixo do pacote (padrão '@wrrdev/fenix-ui'). */
  packageName?: string;
  /**
   * Em arquivos `.vue`, injeta também `import '@wrrdev/fenix-ui/vue'` junto com
   * o primeiro componente detectado. É a augmentação que habilita o
   * autocomplete/validação dos atributos `fx-*` no Volar/vue-tsc — sem passo
   * manual no `main.ts`. Padrão: `true`.
   */
  vueTypes?: boolean;
}

/* ------------------------------------------------------------------ */
/* Injeção em arquivos com markup (SFC Vue/Svelte e HTML)              */
/* ------------------------------------------------------------------ */

/** Bloco `<script>` INLINE (sem `src=`) — é dentro dele que o import entra. */
const INLINE_SCRIPT_RE = /<script\b(?![^>]*\bsrc=)[^>]*>/i;

/** Arquivo com markup (SFC Vue/Svelte ou HTML) — detectado pelo id ou conteúdo. */
function isMarkup(id: string, code: string): boolean {
  return (
    /\.(vue|svelte|html?)$/i.test(id) ||
    /^\s*<(?:template|script|style|!doctype|html)\b/i.test(code)
  );
}

/** Quebra de linha do arquivo — preserva o CRLF de projetos Windows. */
function eolOf(code: string): string {
  return code.includes('\r\n') ? '\r\n' : '\n';
}

/**
 * Injeta os imports como primeira linha do bloco `<script>`.
 *
 * Tolerante a CRLF e a conteúdo na mesma linha da tag (`<script setup>const a=1`)
 * — a versão antiga exigia `>\n` e, no Windows, colava os imports FORA do
 * `<script>`, onde o compilador de SFC os descarta (componente nunca registrado).
 */
function injectIntoScriptBlock(code: string, lines: string[]): string | null {
  const open = INLINE_SCRIPT_RE.exec(code);
  if (!open) return null;
  const at = open.index + open[0].length;
  const br = eolOf(code);
  return `${code.slice(0, at)}${br}${lines.join(br)}${code.slice(at)}`;
}

/**
 * Cria o bloco `<script>` quando o arquivo não tem nenhum.
 *
 * Um `import` fora de `<script>` é descartado pelo compilador de SFC — este é o
 * único fallback válido para um `.vue`/`.svelte` que só tem `<template>`.
 */
function createScriptBlock(code: string, lines: string[], html: boolean): string {
  const br = eolOf(code);
  const body = `${br}${lines.join(br)}${br}`;
  if (!html) return `<script>${body}</script>${br}${code}`;
  // HTML: `<script type="module">` inline (o Vite transforma) antes do </body>.
  const block = `<script type="module">${body}</script>${br}`;
  const bodyAt = code.search(/<\/body\s*>/i);
  if (bodyAt >= 0) return `${code.slice(0, bodyAt)}${block}${code.slice(bodyAt)}`;
  return `${block}${code}`;
}

/**
 * Injeta `import '<subpath>'` para cada componente fx-* usado no código
 * que ainda não foi importado. Retorna o código transformado ou o original.
 *
 * `id` (caminho do módulo, opcional) habilita os tratamentos de arquivo com
 * markup: injeção dentro do `<script>` e augmentação de tipos do Vue (SFC).
 */
export function transformSource(
  code: string,
  options: AutoImportOptions = {},
  id = '',
): string {
  const pkg = options.packageName ?? '@wrrdev/fenix-ui';
  // Subpaths do mapa são reescritos quando um pacote custom é informado.
  const resolve = (sub: string): string =>
    pkg === '@wrrdev/fenix-ui' ? sub : sub.replace('@wrrdev/fenix-ui', pkg);
  const hasImport = (target: string): boolean =>
    code.includes(`'${target}'`) || code.includes(`"${target}"`);

  // Componentes usados e ainda não importados explicitamente.
  const needed = new Set<string>();
  for (const m of code.matchAll(TAG_RE)) {
    const sub = fenixComponentMap[m[1]];
    if (!sub) continue;
    const target = resolve(sub);
    if (!hasImport(target)) needed.add(target);
  }
  // Biblioteca de ícones: classes fx-icon / fx-icon-<nome> injetam o subpath /icons.
  const iconsSub = resolve('@wrrdev/fenix-ui/icons');
  if (FENIX_ICON_CLASS_RE.test(code) && !hasImport(iconsSub)) {
    needed.add(iconsSub);
  }

  const markup = isMarkup(id, code);
  // Vue (SFC): a augmentação de tipos entra junto do primeiro import injetado.
  const vueSub = resolve('@wrrdev/fenix-ui/vue');
  if (options.vueTypes !== false && /\.vue$/i.test(id) && needed.size > 0 && !hasImport(vueSub)) {
    needed.add(vueSub);
  }
  if (!needed.size) return code;

  const lines = [...needed].map((s) => `import '${s}';`);

  // SFC (Vue/Svelte) e HTML: o import precisa ficar DENTRO de um <script>.
  if (markup) {
    const injected = injectIntoScriptBlock(code, lines);
    if (injected) return injected;
    return createScriptBlock(code, lines, /\.html?$/i.test(id));
  }

  // TS/JS: injeta após o último import existente (ou no topo).
  let lastEnd = -1;
  for (const m of code.matchAll(/^[ \t]*import\b[^;]*?['"][^'"]+['"];?[^\S\n]*$/gm)) {
    lastEnd = Math.max(lastEnd, m.index + m[0].length);
  }
  if (lastEnd === -1) return `${lines.join('\n')}\n${code}`;
  return `${code.slice(0, lastEnd)}\n${lines.join('\n')}${code.slice(lastEnd)}`;
}

/** Verifica se o arquivo deve ser transformado. */
export function shouldTransform(id: string): boolean {
  return (
    !id.includes('node_modules') &&
    !id.endsWith('.d.ts') &&
    !id.endsWith('.css') &&
    /\.(ts|js|tsx|jsx|vue|html|svelte)$/.test(id)
  );
}

