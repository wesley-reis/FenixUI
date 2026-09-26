/**
 * Carregamento LEVE da fonte de ícones (@font-face + classe base).
 *
 * Separado de ./index de propósito: importar este módulo NÃO injeta o CSS
 * completo com as ~4.300 regras `fx-icon-<nome>`. É o que o <fx-icon> usa —
 * dentro do Shadow DOM o glifo vem da ligadura (o nome como conteúdo), então
 * as classes por ícone não atravessam a fronteira do shadow root.
 */

import { FENIX_ICON_BASE_CSS, FENIX_ICON_FONT_FAMILY } from './base-css';

/** URL da fonte woff2: no build ESM a fonte vive na mesma pasta do módulo (dist/icons). */
declare const __FENIX_ICONS_FONT_URL__: string | undefined;

function resolveFontUrl(): string {
  if (typeof __FENIX_ICONS_FONT_URL__ !== 'undefined' && __FENIX_ICONS_FONT_URL__) {
    return __FENIX_ICONS_FONT_URL__;
  }
  // IMPORTANTE: o `import.meta.url` precisa ser usado DIRETAMENTE como 2º
  // argumento de `new URL` (sem variável intermediária). É assim que Vite,
  // webpack e Rollup reconhecem o padrão de asset e copiam/reescrevem a URL
  // da fonte no build do PROJETO CONSUMIDOR — com variável, a URL permanece
  // dinâmica e quebra em produção (a fonte 404 e os ícones viram texto).
  return new URL('./fenix-icons.woff2', import.meta.url).toString();
}

/** URL resolvida da fonte (reutilizada por ./index para o CSS completo). */
export const FENIX_ICONS_FONT_URL = resolveFontUrl();

/** Id do <style> com @font-face + classe base. */
export const FENIX_ICONS_FONT_STYLE_ID = 'fenix-icons-font';

/** Id do <style> com o CSS completo (@font-face + base + classes por ícone). */
export const FENIX_ICONS_STYLE_ID = 'fenix-icons';

/** CSS do @font-face. */
export function buildFenixIconsFontFaceCss(): string {
  return (
    `@font-face{font-family:'${FENIX_ICON_FONT_FAMILY}';font-style:normal;font-weight:100 700;` +
    `font-display:block;src:url('${FENIX_ICONS_FONT_URL}') format('woff2');}`
  );
}

/** CSS leve: @font-face + classe base (sem as classes por ícone). */
export function buildFenixIconsFontCss(): string {
  return buildFenixIconsFontFaceCss() + FENIX_ICON_BASE_CSS;
}

let fontInjected = false;

/**
 * Injeta @font-face + classe base no <head> (idempotente). Não duplica quando
 * o CSS completo (`fenix-icons`) já foi carregado por `import '.../icons'`.
 */
export function loadFenixIconsFont(
  target: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): void {
  if (fontInjected || !target) return;
  if (target.getElementById(FENIX_ICONS_STYLE_ID)) {
    fontInjected = true;
    return;
  }
  const style = target.createElement('style');
  style.id = FENIX_ICONS_FONT_STYLE_ID;
  style.textContent = buildFenixIconsFontCss();
  target.head.appendChild(style);
  fontInjected = true;
}

/** Reseta o estado de injeção da fonte (uso interno/testes). */
export function __resetFenixIconsFontInjection(): void {
  fontInjected = false;
}