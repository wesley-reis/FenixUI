/**
 * Sanitizador de HTML do <fx-editor>.
 *
 * Estratégia: allowlist + DOMParser inerte + serialização única.
 * Nada de regex para decidir o que é seguro: a árvore é percorrida e cada
 * nó/atributo é validado individualmente.
 *
 * O resultado é DEFENSE IN DEPTH. O HTML salvo também deve ser sanitizado
 * no backend antes de ser renderizado em outro contexto.
 */

import {
  ALLOWED_CLASS_RE,
  ALLOWED_EMBED_HOSTS,
  ALLOWED_STYLE_PROPS,
  ALLOWED_TAGS,
  DEFAULT_MAX_DATA_IMAGE_BYTES,
  DEFAULT_MAX_DATA_VIDEO_BYTES,
  DROP_CONTENT_TAGS,
  FORBIDDEN_ATTRS,
  GLOBAL_ATTRS,
  SAFE_IMAGE_DATA_RE,
  SAFE_LINK_PROTOCOLS,
  SAFE_MEDIA_PROTOCOLS,
  TAG_ATTRS,
} from './schema';

export interface SanitizeOptions {
  allowBase64Images?: boolean;
  allowBase64Videos?: boolean;
  allowEmbeds?: boolean;
  maxDataImageBytes?: number;
  maxDataVideoBytes?: number;
}

type Options = Required<SanitizeOptions>;

const DEFAULTS: Options = {
  allowBase64Images: true,
  allowBase64Videos: false,
  allowEmbeds: true,
  maxDataImageBytes: DEFAULT_MAX_DATA_IMAGE_BYTES,
  maxDataVideoBytes: DEFAULT_MAX_DATA_VIDEO_BYTES,
};

const SAFE_DATA_VIDEO_RE = /^data:video\/(?:mp4|webm);base64,[a-z0-9+/=\s]+$/i;

/** Remove caracteres de controle e normaliza espaços de uma URL. */
function cleanRawUrl(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F\s]+/g, '').trim();
}

function isRelativeUrl(value: string): boolean {
  return !value.startsWith('//') && /^(?:#|\/|\.{1,2}\/)/.test(value);
}

/** Valida um link (href). Retorna '' quando não é seguro. */
export function sanitizeLinkUrl(value: string): string {
  const raw = cleanRawUrl(value);
  if (!raw) return '';
  if (isRelativeUrl(raw)) return raw;

  const lower = raw.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return '';
  }

  try {
    const url = new URL(raw);
    return SAFE_LINK_PROTOCOLS.has(url.protocol) ? raw : '';
  } catch {
    // Links relativos sem prefixo (`pagina.html`) são aceitos.
    return /^[a-z0-9][a-z0-9._~!$&'()*+,;=:@%/?#-]*$/i.test(raw) ? raw : '';
  }
}

/** Valida src/poster de mídia. */
export function sanitizeMediaUrl(value: string, tag: string, options: SanitizeOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };
  const raw = cleanRawUrl(value);
  if (!raw) return '';

  if (raw.toLowerCase().startsWith('data:')) {
    if (tag === 'img' && opts.allowBase64Images) {
      return SAFE_IMAGE_DATA_RE.test(raw) && raw.length <= opts.maxDataImageBytes ? raw : '';
    }
    if ((tag === 'video' || tag === 'source') && opts.allowBase64Videos) {
      return SAFE_DATA_VIDEO_RE.test(raw) && raw.length <= opts.maxDataVideoBytes ? raw : '';
    }
    return '';
  }

  if (isRelativeUrl(raw)) return raw;

  const lower = raw.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return '';
  }

  try {
    const url = new URL(raw);
    return SAFE_MEDIA_PROTOCOLS.has(url.protocol) ? raw : '';
  } catch {
    return '';
  }
}

/** Valida e canonicaliza um iframe de embed. */
export function sanitizeEmbedUrl(value: string): string {
  let raw = cleanRawUrl(value);
  if (!raw) return '';
  if (raw.startsWith('//')) raw = `https:${raw}`;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return '';
  }

  if (url.protocol !== 'https:') return '';
  if (!ALLOWED_EMBED_HOSTS.has(url.hostname.toLowerCase())) return '';

  const path = url.pathname.toLowerCase();
  const isValidPath =
    (url.hostname.includes('youtube') && path.startsWith('/embed/')) ||
    (url.hostname.includes('vimeo') && path.startsWith('/video/'));
  if (!isValidPath) return '';

  return url.toString();
}

/** Filtra o atributo style por propriedade e valor. */
function sanitizeStyle(value: string): string {
  if (!value) return '';

  const probe = document.createElement('span');
  probe.setAttribute('style', value);
  const out: string[] = [];

  for (let i = 0; i < probe.style.length; i++) {
    const prop = probe.style.item(i);
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    const val = probe.style.getPropertyValue(prop).trim();
    if (!val) continue;
    if (/\\/.test(val)) continue;
    if (/url\s*\(|expression\s*\(|javascript\s*:|@import|behavior\s*:|-moz-binding/i.test(val)) continue;
    out.push(`${prop}: ${val}`);
  }

  return out.join('; ');
}

function sanitizeAttributes(el: Element, tag: string, opts: Options): void {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    if (FORBIDDEN_ATTRS.has(name) || name.startsWith('on')) {
      el.removeAttribute(attr.name);
      continue;
    }

    const allowed = GLOBAL_ATTRS.has(name) || TAG_ATTRS[tag]?.has(name);
    if (!allowed) {
      el.removeAttribute(attr.name);
      continue;
    }

    if (name === 'style') {
      const safe = sanitizeStyle(value);
      if (safe) el.setAttribute('style', safe);
      else el.removeAttribute('style');
      continue;
    }

    if (name === 'class') {
      const classes = value.split(/\s+/).filter((c) => ALLOWED_CLASS_RE.test(c));
      if (classes.length) el.setAttribute('class', classes.join(' '));
      else el.removeAttribute('class');
      continue;
    }

    if (name === 'href') {
      const safe = sanitizeLinkUrl(value);
      if (safe) el.setAttribute('href', safe);
      else el.removeAttribute('href');
      continue;
    }

    if (name === 'src') {
      const safe = sanitizeMediaUrl(value, tag, opts);
      if (safe) el.setAttribute('src', safe);
      else el.removeAttribute('src');
      continue;
    }

    if (name === 'poster') {
      const safe = sanitizeMediaUrl(value, 'img', opts);
      if (safe) el.setAttribute('poster', safe);
      else el.removeAttribute('poster');
      continue;
    }

    if (name === 'target') {
      const safe = value === '_self' || value === '_blank' ? value : '_blank';
      el.setAttribute('target', safe);
      continue;
    }

    if (name === 'colspan' || name === 'rowspan' || name === 'span' || name === 'start') {
      const n = Number(value);
      if (Number.isInteger(n) && n > 0 && n <= 1000) el.setAttribute(name, String(n));
      else el.removeAttribute(name);
      continue;
    }

    if (name === 'width' || name === 'height') {
      if (/^\d{1,4}(?:px|%)?$/i.test(value.trim())) el.setAttribute(name, value.trim());
      else el.removeAttribute(name);
      continue;
    }
  }

  if (tag === 'a') {
    const href = el.getAttribute('href');
    if (!href) {
      el.removeAttribute('target');
      el.removeAttribute('rel');
    } else if (el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer');
    }
  }

  if (tag === 'iframe') {
    el.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    el.setAttribute('allowfullscreen', '');
    el.setAttribute('loading', 'lazy');
    el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  }

  if (tag === 'img') {
    if (!el.hasAttribute('alt')) el.setAttribute('alt', '');
    el.setAttribute('loading', 'lazy');
    el.setAttribute('decoding', 'async');
  }

  if (tag === 'video') {
    el.setAttribute('controls', '');
    el.setAttribute('preload', 'metadata');
  }
}

function sanitizeIframe(el: Element): boolean {
  const src = el.getAttribute('src') ?? '';
  const safe = sanitizeEmbedUrl(src);
  if (!safe) return false;
  el.setAttribute('src', safe);
  return true;
}

function unwrap(el: Element, opts: Options): void {
  const parent = el.parentNode;
  if (!parent) {
    el.remove();
    return;
  }

  for (const child of Array.from(el.childNodes)) {
    sanitizeNode(child, opts);
    parent.insertBefore(child, el);
  }
  el.remove();
}

function sanitizeNode(node: Node, opts: Options): void {
  if (node.nodeType === Node.TEXT_NODE) return;
  if (node.nodeType === Node.COMMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  if (DROP_CONTENT_TAGS.has(tag)) {
    el.remove();
    return;
  }

  if (tag === 'iframe') {
    if (!opts.allowEmbeds || !sanitizeIframe(el)) el.remove();
    else sanitizeAttributes(el, tag, opts);
    return;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    unwrap(el, opts);
    return;
  }

  sanitizeAttributes(el, tag, opts);

  if ((tag === 'img' || tag === 'video' || tag === 'source') && !el.hasAttribute('src')) {
    el.remove();
    return;
  }

  for (const child of Array.from(el.childNodes)) sanitizeNode(child, opts);
}

/**
 * Sanitiza um fragmento HTML e devolve o HTML seguro.
 *
 * @example
 * sanitizeHtml('<p onclick="x()">Oi<script>alert(1)</script></p>')
 * // => '<p>Oi</p>'
 */
/**
 * Sanitiza o HTML e devolve o `<body>` já filtrado, sem serializar.
 * Permite encadear a normalização no MESMO DOM (uma única parseada).
 */
export function sanitizeBody(html: string, options: SanitizeOptions = {}): HTMLElement | null {
  const opts: Options = { ...DEFAULTS, ...options };
  if (!html) return null;
  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') return null;

  const doc = new DOMParser().parseFromString(
    `<!doctype html><html><body>${html}</body></html>`,
    'text/html',
  );

  for (const child of Array.from(doc.body.childNodes)) sanitizeNode(child, opts);
  return doc.body;
}

export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  const body = sanitizeBody(html, options);
  return body ? body.innerHTML : '';
}

