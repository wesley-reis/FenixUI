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

/**
 * URL do `<script>` que AVALIOU este módulo (bundle UMD/CDN), capturada no
 * carregamento — `document.currentScript` só é válido durante a execução do
 * script, então não dá para consultá-lo depois, na hora de injetar o CSS.
 *
 * No bundle CDN a fonte é copiada para a MESMA pasta do UMD e o define aponta
 * `./fenix-icons.woff2`. Sem absolutizar, a URL relativa de um `<style>` inline
 * resolveria contra a PÁGINA (ex.: `/app/home.jsp` pediria
 * `/app/fenix-icons.woff2` → 404) e os ícones apareceriam como TEXTO.
 * Em ESM/SSR é `''` (sem efeito).
 */
const SCRIPT_URL: string = (() => {
  if (typeof document === 'undefined') return '';
  const current = document.currentScript as HTMLScriptElement | null;
  return current?.src ?? '';
})();

/**
 * Absolutiza um caminho de fonte RELATIVO contra a URL do bundle (ou uma base
 * explícita). Só age em caminhos relativos:
 *  - `https://…`, `//cdn/…` e `/raiz/…` ficam intactos — o próprio navegador já
 *    os resolve corretamente dentro do `<style>` injetado (e um subset
 *    root-relative precisa continuar apontando para o site do consumidor);
 *  - em SSR/teste sem DOM devolve o valor original.
 */
export function absolutizeFontUrl(url: string, base?: string): string {
  const value = url.trim();
  if (!value) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//') || value.startsWith('/')) {
    return value;
  }
  const origin = base ?? SCRIPT_URL;
  if (origin) return new URL(value, origin).href;
  if (typeof document === 'undefined') return value;
  return new URL(value, document.baseURI).href;
}

function resolveFontUrl(): string {
  if (typeof __FENIX_ICONS_FONT_URL__ !== 'undefined' && __FENIX_ICONS_FONT_URL__) {
    // Caminho do bundle CDN/UMD (define de vite.cdn.config.ts): a fonte vive ao
    // lado do UMD, mas a URL precisa ser ABSOLUTA para não cair na página.
    return absolutizeFontUrl(__FENIX_ICONS_FONT_URL__);
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

/** Valores de `font-display` aceitos para o @font-face. */
export type FenixIconsFontDisplay = 'swap' | 'block' | 'optional' | 'fallback';

const DISPLAY_VALUES: ReadonlySet<string> = new Set(['swap', 'block', 'optional', 'fallback']);

/** `font-display` vigente (default `swap`: nunca deixa o glifo invisível). */
let fontDisplay: FenixIconsFontDisplay = 'swap';

/**
 * Sobrescreve o `font-display` do @font-face (default `swap`).
 *
 * `swap` é o padrão seguro: mostra o glifo de fallback imediatamente e troca
 * quando a fonte chega — nunca fica invisível. Combine com o preload
 * (`preloadFenixIconsFont`) para que a janela de troca seja ~0 ms. Use os
 * demais valores só em casos específicos:
 *  - `block`/`optional` escondem o glifo até a fonte carregar (pode "sumir" o
 *    glifo em rede lenta);
 *  - `fallback` dá ao navegador o menor período de troca.
 *
 * Deve ser chamado ANTES do primeiro `loadFenixIcons()`/`loadFenixIconsFont()`
 * (ou de `<fx-icon>` ser montado). Se já houver CSS injetado, reinjeta com o
 * novo valor.
 */
export function setFenixIconsFontDisplay(display: FenixIconsFontDisplay): void {
  if (!DISPLAY_VALUES.has(display) || display === fontDisplay) return;
  fontDisplay = display;
  const target = typeof document !== 'undefined' ? document : undefined;
  if (!target) return;
  const hadFull = !!target.getElementById(FENIX_ICONS_STYLE_ID);
  const hadFont = !!target.getElementById(FENIX_ICONS_FONT_STYLE_ID);
  resetInjectedStyles(target);
  if (hadFull) reinjectFull(target, fullNamesRef);
  if (hadFont) injectFontStyle(target);
}

/** `font-display` efetivo (o sobrescrito tem prioridade sobre o default). */
function currentFontDisplay(): FenixIconsFontDisplay {
  return fontDisplay;
}

/** CSS do @font-face. */
export function buildFenixIconsFontFaceCss(): string {
  return (
    `@font-face{font-family:'${FENIX_ICON_FONT_FAMILY}';font-style:normal;font-weight:100 700;` +
    `font-display:${currentFontDisplay()};src:url('${currentFontUrl()}') format('woff2');}`
  );
}

/** CSS leve: @font-face + classe base (sem as classes por ícone). */
export function buildFenixIconsFontCss(): string {
  return buildFenixIconsFontFaceCss() + FENIX_ICON_BASE_CSS;
}

/**
 * CSS apenas com as regras `.fx-icon-<nome>::before` dos nomes informados
 * (sem @font-face e sem a classe base). Útil para injeção sob demanda.
 */
export function buildFenixIconsClassCss(names: readonly string[]): string {
  let rules = '';
  for (const name of names) {
    rules += `.fx-icon-${name}::before{content:"${name}"}`;
  }
  return rules;
}

/**
 * CSS completo (@font-face + base + uma regra por ícone), com a URL de fonte
 * vigente. Vive aqui (e não só em ./index) para que `setFenixIconsFontUrl`
 * consiga recriar o estilo completo sem importar outro módulo.
 */
export function buildFullCss(names: readonly string[]): string {
  return buildFenixIconsFontFaceCss() + FENIX_ICON_BASE_CSS + buildFenixIconsClassCss(names);
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
 * Injeta @font-face + classe base no <head> (idempotente) e dispara o download
 * antecipado da fonte. Não duplica quando o CSS completo (`fenix-icons`) já foi
 * carregado por `import '.../icons'`.
 */
export function loadFenixIconsFont(
  target: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): void {
  if (fontInjected || !target) return;
  if (target.getElementById(FENIX_ICONS_STYLE_ID)) {
    fontInjected = true;
    preloadFenixIconsFont(target);
    return;
  }
  injectFontStyle(target);
  preloadFenixIconsFont(target);
}

/** Id do `<style>` com apenas as classes por ícone (injeção sob demanda). */
export const FENIX_ICONS_CLASSES_STYLE_ID = 'fenix-icons-classes';

/**
 * Injeta, sob demanda, apenas as regras `.fx-icon-<nome>::before` dos nomes
 * informados (além de garantir o `@font-face` + classe base via
 * `loadFenixIconsFont`). Evita pagar as ~4.300 regras quando o app usa poucos
 * ícones por CLASSE. Idempotente por nome.
 */
export function loadFenixIconClasses(
  names: readonly string[],
  target: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): void {
  if (!target) return;
  // O CSS completo (`fenix-icons`) já cobre qualquer classe — nada a fazer.
  if (target.getElementById(FENIX_ICONS_STYLE_ID)) return;
  loadFenixIconsFont(target);
  let style = target.getElementById(FENIX_ICONS_CLASSES_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = target.createElement('style');
    style.id = FENIX_ICONS_CLASSES_STYLE_ID;
    target.head.appendChild(style);
  }
  const existing = new Set<string>();
  for (const match of (style.textContent ?? '').matchAll(/\.fx-icon-([a-z0-9_]+)::before/g)) {
    existing.add(match[1]);
  }
  const missing = names.filter((name) => !existing.has(name) && /^[a-z][a-z0-9_]*$/.test(name));
  if (missing.length > 0) {
    style.textContent += buildFenixIconsClassCss(missing);
  }
}

/** Id do `<link rel="preload">` da fonte. */
export const FENIX_ICONS_PRELOAD_ID = 'fenix-icons-preload';

/** Classe adicionada ao `<html>` quando a fonte está pronta (evita o flash de texto). */
export const FENIX_ICONS_READY_CLASS = 'fenix-icons-ready';

let fontReady = false;
let readyTimeout: ReturnType<typeof setTimeout> | undefined;

type ReadyListener = () => void;
const readyListeners = new Set<ReadyListener>();

function markFontReady(target: Document): void {
  if (fontReady) return;
  fontReady = true;
  if (readyTimeout) {
    clearTimeout(readyTimeout);
    readyTimeout = undefined;
  }
  target.documentElement.classList.add(FENIX_ICONS_READY_CLASS);
  for (const listener of [...readyListeners]) listener();
  readyListeners.clear();
}

/**
 * Registra um callback para quando a fonte estiver pronta (ou após o timeout de
 * segurança). Uso interno do `<fx-icon>` para não exibir o nome do glifo como
 * texto durante o carregamento.
 */
export function __onFenixIconsReady(listener: ReadyListener): void {
  if (fontReady) {
    listener();
    return;
  }
  readyListeners.add(listener);
}

/**
 * Força o download ANTECIPADO da fonte (sem esperar a renderização do glifo) e
 * prepara o sinal de "pronto".
 *
 * 1. Injeta `<link rel="preload" as="font" type="font/woff2" crossorigin>`. O
 *    `crossorigin` é obrigatório: fontes são buscadas em modo CORS mesmo
 *    same-origin, e sem ele o preload vira uma segunda requisição.
 * 2. `document.fonts.load()` força o fetch via Font Loading API e marca o
 *    `<html>` como pronto assim que a face carrega.
 * 3. Um timeout curto garante que o glifo NUNCA fique escondido para sempre
 *    (offline/erro cai de volta para o comportamento de `swap`).
 */
export function preloadFenixIconsFont(
  target: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): void {
  if (!target) return;
  const url = currentFontUrl();
  if (!url) return;
  if (!target.getElementById(FENIX_ICONS_PRELOAD_ID)) {
    const link = target.createElement('link');
    link.id = FENIX_ICONS_PRELOAD_ID;
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = url;
    target.head.appendChild(link);
  }
  if (fontReady) return;
  try {
    if (typeof target.fonts !== 'undefined' && typeof target.fonts.load === 'function') {
      target.fonts
        .load(`24px '${FENIX_ICON_FONT_FAMILY}'`)
        .then(() => markFontReady(target))
        .catch(() => markFontReady(target));
    }
  } catch {
    // jsdom/SSR podem não implementar a Font Loading API — o timeout abaixo
    // garante o sinal de "pronto" mesmo assim.
  }
  if (readyTimeout === undefined) {
    readyTimeout = setTimeout(() => markFontReady(target), 1500);
  }
}

/** Reseta o estado de injeção da fonte (uso interno/testes). */
export function __resetFenixIconsFontInjection(): void {
  fontInjected = false;
  fontReady = false;
  readyListeners.clear();
  if (readyTimeout) {
    clearTimeout(readyTimeout);
    readyTimeout = undefined;
  }
  fontDisplay = 'swap';
  const doc = typeof document !== 'undefined' ? document : undefined;
  doc?.getElementById(FENIX_ICONS_PRELOAD_ID)?.remove();
  doc?.documentElement.classList.remove(FENIX_ICONS_READY_CLASS);
}