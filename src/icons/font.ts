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

/**
 * Sobrescreve a URL da fonte em tempo de execução.
 *
 * Use para apontar para um SUBSET próprio (só os glifos que o app usa), o que
 * derruba a fonte de ~5 MB para algumas dezenas de KB:
 *
 *   import { setFenixIconsFontUrl } from '@wrrdev/fenix-ui/icons';
 *   setFenixIconsFontUrl('/fonts/fenix-icons-subset.woff2');
 *
 * Deve ser chamado ANTES do primeiro `loadFenixIcons()`/`loadFenixIconsFont()`
 * (ou de `<fx-icon>` ser montado). A tipagem dos ícones não muda: continua
 * valendo a lista completa de `FenixIconName` — o subset precisa conter os
 * glifos que você realmente usa. Passe `''` para voltar à URL do build.
 */
export function setFenixIconsFontUrl(url: string): void {
  const next = url.trim() || undefined;
  if (fontUrlOverride === next) return;
  fontUrlOverride = next;
  // O CSS já injetado embute a URL antiga: remove e reinjeta com a nova,
  // senão a troca não teria efeito em apps que já carregaram a fonte.
  const target = typeof document !== 'undefined' ? document : undefined;
  if (!target) return;
  const hadFull = !!target.getElementById(FENIX_ICONS_STYLE_ID);
  const hadFont = !!target.getElementById(FENIX_ICONS_FONT_STYLE_ID);
  resetInjectedStyles(target);
  if (hadFull) reinjectFull(target, fullNamesRef);
  if (hadFont) injectFontStyle(target);
}

/**
 * Nomes registrados por ./index, usados só se for preciso recriar o CSS
 * completo. Evita que ./font dependa da lista de ~4.300 nomes.
 */
let fullNamesRef: readonly string[] = [];

/** Informa os nomes disponíveis para a reinjeção do CSS completo. */
export function __setFenixIconNames(names: readonly string[]): void {
  fullNamesRef = names;
}

let fontUrlOverride: string | undefined;

/** URL efetiva: a sobrescrita em runtime tem prioridade sobre a do build. */
function currentFontUrl(): string {
  return fontUrlOverride ?? FENIX_ICONS_FONT_URL;
}

/** Id do <style> com @font-face + classe base. */
export const FENIX_ICONS_FONT_STYLE_ID = 'fenix-icons-font';

/** Id do <style> com o CSS completo (@font-face + base + classes por ícone). */
export const FENIX_ICONS_STYLE_ID = 'fenix-icons';

/** CSS do @font-face. */
export function buildFenixIconsFontFaceCss(): string {
  return (
    `@font-face{font-family:'${FENIX_ICON_FONT_FAMILY}';font-style:normal;font-weight:100 700;` +
    // `swap` (e não `block`): com `block` o texto fica INVISÍVEL até a fonte
    // baixar — em 3G/4G isso vira tela branca por vários segundos. `swap`
    // mostra o glifo de fallback imediatamente e troca quando a fonte chega.
    `font-display:swap;src:url('${currentFontUrl()}') format('woff2');}`
  );
}

/** CSS leve: @font-face + classe base (sem as classes por ícone). */
export function buildFenixIconsFontCss(): string {
  return buildFenixIconsFontFaceCss() + FENIX_ICON_BASE_CSS;
}

/**
 * CSS completo (@font-face + base + uma regra por ícone), com a URL de fonte
 * vigente. Vive aqui (e não só em ./index) para que `setFenixIconsFontUrl`
 * consiga recriar o estilo completo sem importar outro módulo.
 */
export function buildFullCss(names: readonly string[]): string {
  let rules = '';
  for (const name of names) {
    rules += `.fx-icon-${name}::before{content:"${name}"}`;
  }
  return buildFenixIconsFontFaceCss() + FENIX_ICON_BASE_CSS + rules;
}

let fontInjected = false;

/**
 * Remove os <style> de ícones já injetados, para reinjetar com outra URL.
 * Usado por `setFenixIconsFontUrl`.
 */
function resetInjectedStyles(
  target: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): void {
  fontInjected = false;
  if (!target) return;
  target.getElementById(FENIX_ICONS_FONT_STYLE_ID)?.remove();
  target.getElementById(FENIX_ICONS_STYLE_ID)?.remove();
}

/** Cria e anexa o <style> leve (@font-face + classe base) no <head>. */
function injectFontStyle(target: Document): void {
  const style = target.createElement('style');
  style.id = FENIX_ICONS_FONT_STYLE_ID;
  style.textContent = buildFenixIconsFontCss();
  target.head.appendChild(style);
  fontInjected = true;
}

/**
 * Reinjeta o CSS completo (o de `./index`).
 *
 * Fica aqui para que a troca de URL da fonte recrie o estilo. Não usa o flag
 * `injected` de ./index: o <style> antigo já foi removido do DOM, então
 * recriá-lo aqui é sempre seguro e evita depender do estado de outro módulo.
 */
function reinjectFull(target: Document, names: readonly string[]): void {
  if (target.getElementById(FENIX_ICONS_STYLE_ID)) return;
  const style = target.createElement('style');
  style.id = FENIX_ICONS_STYLE_ID;
  style.textContent = buildFullCss(names);
  target.head.appendChild(style);
}

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
  injectFontStyle(target);
}

/** Reseta o estado de injeção da fonte (uso interno/testes). */
export function __resetFenixIconsFontInjection(): void {
  fontInjected = false;
}