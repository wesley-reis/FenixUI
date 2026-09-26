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
 *   <fx-icon name="home" />                 (com autocomplete no editor)
 *
 * Modificadores: fx-icon-fill (preenchido), fx-icon-bold (peso maior).
 * Tamanho via font-size, cor via currentColor.
 */

import { FENIX_ICON_NAMES } from './names';
import { FENIX_ICON_BASE_CSS } from './base-css';
import {
  FENIX_ICONS_STYLE_ID,
  buildFenixIconsFontFaceCss,
  __resetFenixIconsFontInjection,
} from './font';

export { FENIX_ICON_NAMES } from './names';
export type { FenixIconName, FenixIconKnownName } from './types';
export { FENIX_ICON_BASE_CSS, FENIX_ICON_FONT_FAMILY, isFenixIconName } from './base-css';
// Carregamento leve da fonte (usado pelo <fx-icon>) — ver ./font.
export { buildFenixIconsFontCss, loadFenixIconsFont, __resetFenixIconsFontInjection } from './font';

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
  return buildFenixIconsFontFaceCss() + FENIX_ICON_DOC_BASE_CSS + buildClassRules();
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
  style.id = FENIX_ICONS_STYLE_ID;
  style.textContent = buildFenixIconsCss();
  target.head.appendChild(style);
  injected = true;
}

/** Reseta o estado de injeção (uso interno/testes). */
export function __resetFenixIconsInjection(): void {
  injected = false;
  __resetFenixIconsFontInjection();
}

// Import com efeito colateral: `import '@wrrdev/fenix-ui/icons'` já carrega tudo.
loadFenixIcons();