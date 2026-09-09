/**
 * Fenix Icons — biblioteca de ícones padrão do FenixUI.
 *
 * Fonte self-hosted (`fenix-icons.woff2`, Material Symbols Rounded, Apache 2.0)
 * com TODOS os ícones embarcados — nenhuma requisição externa, nenhum CDN.
 *
 * Uso geral (basta importar `@wrrdev/fenix-ui/icons` UMA vez — o auto-import
 * faz isso automaticamente quando detecta `fx-icon` no código):
 *
 *   <i class="fx-icon fx-icon-home"></i>
 *   <span class="fx-icon">settings</span>   (nome do ícone como conteúdo)
 *
 * Modificadores: fx-icon-fill (preenchido), fx-icon-bold (peso maior).
 * Tamanho via font-size, cor via currentColor.
 */

import { FENIX_ICON_NAMES } from './names';
import { FENIX_ICON_BASE_CSS, FENIX_ICON_FONT_FAMILY } from './base-css';

export { FENIX_ICON_NAMES } from './names';
export type { FenixIconName } from './names';
export { FENIX_ICON_BASE_CSS, FENIX_ICON_FONT_FAMILY, isFenixIconName } from './base-css';

/** URL da fonte woff2: no build ESM a fonte vive na mesma pasta do módulo (dist/icons). */
declare const __FENIX_ICONS_FONT_URL__: string | undefined;

function resolveFontUrl(): string {
  if (typeof __FENIX_ICONS_FONT_URL__ !== 'undefined' && __FENIX_ICONS_FONT_URL__) {
    return __FENIX_ICONS_FONT_URL__;
  }
  // IMPORTANTE: o `import.meta.url` precisa ser usado DIRETAMENTE como 2º
  // argumento do `new URL` (sem variável intermediária). É assim que Vite,
  // webpack e Rollup reconhecem o padrão de asset e copiam/reescrevem a URL
  // da fonte no build do PROJETO CONSUMIDOR — com variável, a URL permanece
  // dinâmica e quebra em produção (a fonte 404 e os ícones viram texto).
  return new URL('./fenix-icons.woff2', import.meta.url).toString();
}

const FONT_URL = resolveFontUrl();

const STYLE_ID = 'fenix-icons';

/** CSS base compartilhado (usado também dentro dos Shadow DOMs dos componentes). */
export const FENIX_ICON_DOC_BASE_CSS = FENIX_ICON_BASE_CSS;

/** Gera as regras `fx-icon-<nome>::before { content: '<nome>' }` (via ligaduras). */
function buildClassRules(): string {
  let rules = '';
  for (const name of FENIX_ICON_NAMES) {
    rules += `.fx-icon-${name}::before{content:"${name}"}`;
  }
  return rules;
}

/** Monta o CSS completo (@font-face + base + classes por ícone). */
export function buildFenixIconsCss(): string {
  return (
    `@font-face{font-family:'${FENIX_ICON_FONT_FAMILY}';font-style:normal;font-weight:100 700;` +
    `font-display:block;src:url('${FONT_URL}') format('woff2');}` +
    FENIX_ICON_DOC_BASE_CSS +
    buildClassRules()
  );
}

let injected = false;

/**
 * Injeta o CSS dos ícones no `<head>` do documento (idempotente).
 * Chamado automaticamente ao importar `@wrrdev/fenix-ui/icons`.
 * O `@font-face` registrado no documento também vale dentro dos Shadow DOMs.
 */
export function loadFenixIcons(target: Document | undefined = typeof document !== 'undefined' ? document : undefined): void {
  if (injected || !target) return;
  const style = target.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildFenixIconsCss();
  target.head.appendChild(style);
  injected = true;
}

/** Reseta o estado de injeção (uso interno/testes). */
export function __resetFenixIconsInjection(): void {
  injected = false;
}

// Import com efeito colateral: `import '@wrrdev/fenix-ui/icons'` já carrega tudo.
loadFenixIcons();
