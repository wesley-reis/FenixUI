/**
 * Contrato de HTML do <fx-editor>.
 *
 * Este arquivo é a fonte única de verdade do que pode existir no HTML salvo.
 * `sanitize-html.ts` usa estas listas para remover conteúdo perigoso e
 * `normalize-html.ts` usa as mesmas listas para canonicalizar a estrutura.
 */

/** Tags que podem permanecer no HTML final. */
export const ALLOWED_TAGS = new Set<string>([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup',
  'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'video', 'source',
  'iframe', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'colgroup', 'col', 'hr', 'span', 'div', 'small', 'mark',
]);

/** Tags cujo conteúdo deve ser descartado por inteiro (não basta remover a tag). */
export const DROP_CONTENT_TAGS = new Set<string>([
  'script', 'style', 'template', 'noscript', 'svg', 'math', 'object', 'embed',
  'form', 'input', 'button', 'textarea', 'select', 'option', 'meta', 'link',
  'base', 'title', 'head', 'audio', 'canvas', 'map', 'area',
]);

/** Tags vazias (void) — não recebem fechamento. */
export const VOID_TAGS = new Set<string>([
  'br', 'img', 'source', 'hr', 'col', 'input', 'meta', 'link', 'base',
]);

/** Atributos aceitos em qualquer tag permitida. */
export const GLOBAL_ATTRS = new Set<string>([
  'title', 'dir', 'lang', 'role',
]);

/** Atributos aceitos por tag. */
export const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'download']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  video: new Set(['src', 'poster', 'controls', 'preload', 'width', 'height', 'muted', 'loop', 'playsinline']),
  source: new Set(['src', 'type']),
  iframe: new Set([
    'src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'sandbox',
    'referrerpolicy', 'loading',
  ]),
  td: new Set(['colspan', 'rowspan', 'scope', 'style', 'class', 'data-align']),
  th: new Set(['colspan', 'rowspan', 'scope', 'style', 'class', 'data-align']),
  table: new Set(['style', 'class', 'role', 'data-cols', 'data-stack']),
  col: new Set(['span', 'style', 'width']),
  colgroup: new Set(['span', 'style']),
  figure: new Set(['class', 'style', 'data-align', 'data-cols']),
  figcaption: new Set(['class', 'style']),
  span: new Set(['class', 'style']),
  div: new Set(['class', 'style']),
  p: new Set(['class', 'style']),
  h1: new Set(['class', 'style']),
  h2: new Set(['class', 'style']),
  h3: new Set(['class', 'style']),
  h4: new Set(['class', 'style']),
  h5: new Set(['class', 'style']),
  h6: new Set(['class', 'style']),
  blockquote: new Set(['class', 'style']),
  pre: new Set(['class', 'style']),
  code: new Set(['class']),
  li: new Set(['class', 'style', 'value']),
  ol: new Set(['class', 'style', 'start', 'type']),
  ul: new Set(['class', 'style']),
  hr: new Set(['class', 'style']),
  small: new Set(['class']),
  mark: new Set(['class', 'style']),
};

/** Propriedades CSS permitidas em `style` inline. */
export const ALLOWED_STYLE_PROPS = new Set<string>([
  'color', 'background-color', 'text-align', 'font-size', 'font-family',
  'font-weight', 'font-style', 'text-decoration', 'text-decoration-line',
  'vertical-align', 'width', 'height', 'max-width', 'min-width',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-collapse', 'border-spacing', 'border-radius', 'float', 'display',
  'line-height', 'white-space', 'word-break', 'overflow-wrap', 'list-style-type',
]);

/** Classes `fx-*` que podem ser preservadas no HTML salvo. */
export const ALLOWED_CLASS_RE = /^fx-[a-z0-9-]+$/i;

/** Hosts autorizados para embed de vídeo. */
export const ALLOWED_EMBED_HOSTS = new Set<string>([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
]);

/** Protocolos permitidos em links. */
export const SAFE_LINK_PROTOCOLS = new Set<string>(['http:', 'https:', 'mailto:', 'tel:']);

/** Protocolos permitidos em mídia. */
export const SAFE_MEDIA_PROTOCOLS = new Set<string>(['http:', 'https:']);

/** Data URL de imagem segura (SVG é bloqueado de propósito). */
export const SAFE_IMAGE_DATA_RE = /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i;

/** Limite padrão para imagens em base64 (bytes aproximados do data URL). */
export const DEFAULT_MAX_DATA_IMAGE_BYTES = 2 * 1024 * 1024;

/** Limite padrão para vídeo em base64 (bytes aproximados do data URL). */
export const DEFAULT_MAX_DATA_VIDEO_BYTES = 4 * 1024 * 1024;

/** Atributos que nunca podem existir no HTML salvo. */
export const FORBIDDEN_ATTRS = new Set<string>([
  'contenteditable', 'spellcheck', 'tabindex', 'autofocus', 'id',
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
  'onmouseout', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress',
  'onload', 'onerror', 'onfocus', 'onblur', 'oninput', 'onchange',
  'onsubmit', 'onreset', 'onselect', 'ondrag', 'ondrop', 'onpaste',
  'oncopy', 'oncut', 'onscroll', 'onwheel', 'onanimationstart',
  'onanimationend', 'ontransitionend', 'formaction', 'srcdoc',
  'xlink:href', 'xmlns', 'http-equiv', 'ping',
]);
