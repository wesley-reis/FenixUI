/**
 * Normalizador de HTML do <fx-editor>.
 *
 * Ele garante um contrato estável para o dado salvo:
 *  - apenas blocos no nível raiz (texto/inline é embrulhado em <p>);
 *  - tags legadas convertidas (b→strong, i→em, strike→s);
 *  - mídia sempre em <figure> atômico;
 *  - tabelas com thead/tbody e colgroup;
 *  - grid como layout table com role=presentation;
 *  - sem spans/parágrafos vazios.
 */

export interface NormalizeOptions {
  /** Adiciona `contenteditable="false"` nas figuras de mídia (uso no editor). */
  forEditor?: boolean;
}

const BLOCK_TAGS = new Set<string>([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol',
  'li', 'table', 'figure', 'hr', 'div',
]);

const INLINE_TAGS = new Set<string>([
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup', 'code',
  'a', 'span', 'small', 'mark', 'br',
]);

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

function tagOf(node: Node): string {
  return isElement(node) ? node.tagName.toLowerCase() : '';
}

function hasBlockChild(el: Element): boolean {
  return Array.from(el.children).some((child) => BLOCK_TAGS.has(tagOf(child)) || tagOf(child) === 'figure');
}

function unwrap(el: Element): void {
  const parent = el.parentNode;
  if (!parent) {
    el.remove();
    return;
  }
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  el.remove();
}

function rename(el: Element, tag: string): Element {
  const doc = el.ownerDocument;
  const next = doc.createElement(tag);
  for (const attr of Array.from(el.attributes)) next.setAttribute(attr.name, attr.value);
  while (el.firstChild) next.appendChild(el.firstChild);
  el.replaceWith(next);
  return next;
}

function normalizeChildren(parent: Element, options: NormalizeOptions): void {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.remove();
      continue;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = (node.nodeValue ?? '').replace(/\u00a0/g, ' ');
      continue;
    }
    if (!isElement(node)) continue;

    let el = node as Element;
    let tag = tagOf(el);

    if (tag === 'b') el = rename(el, 'strong');
    else if (tag === 'i') el = rename(el, 'em');
    else if (tag === 'strike' || tag === 'del') el = rename(el, 's');
    tag = tagOf(el);

    if (tag === 'font') {
      const span = rename(el, 'span');
      const styles: string[] = [];
      const color = el.getAttribute('color');
      const face = el.getAttribute('face');
      if (color) styles.push(`color: ${color}`);
      if (face) styles.push(`font-family: ${face}`);
      if (styles.length) span.setAttribute('style', styles.join('; '));
      el = span;
      tag = 'span';
    }

    // div/section usados como container viram parágrafo (ou são desembrulhados).
    if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'header' || tag === 'footer' || tag === 'main' || tag === 'aside') {
      if (hasBlockChild(el)) {
        unwrap(el);
        continue;
      }
      el = rename(el, 'p');
      tag = 'p';
    }

    // <p> não pode conter blocos.
    if (tag === 'p' && hasBlockChild(el)) {
      unwrap(el);
      continue;
    }

    // Span vazio sem atributos é ruído de paste.
    if (tag === 'span' && !el.hasAttribute('style') && !el.hasAttribute('class')) {
      unwrap(el);
      continue;
    }

    if (!options.forEditor) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.removeAttribute('tabindex');
    }

    if (tag === 'a') {
      if (!el.getAttribute('href')) {
        el.removeAttribute('target');
        el.removeAttribute('rel');
      } else if (el.getAttribute('target') === '_blank') {
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }

    normalizeChildren(el, options);
  }
}

function wrapInlineChildren(cell: Element, doc: Document): void {
  if (Array.from(cell.children).some((child) => BLOCK_TAGS.has(tagOf(child)))) return;
  const p = doc.createElement('p');
  while (cell.firstChild) p.appendChild(cell.firstChild);
  if (!p.textContent?.trim() && !p.querySelector('img,video,iframe,br')) {
    p.innerHTML = '<br>';
  }
  cell.appendChild(p);
}

function normalizeFigures(body: Element, options: NormalizeOptions): void {
  const doc = body.ownerDocument;

  for (const media of Array.from(body.querySelectorAll('img, video, iframe'))) {
    if (media.closest('figure')) continue;

    const anchor = media.closest('a');
    const wrapper: Element = anchor && anchor.querySelectorAll('*').length === 1 ? anchor : media;
    const figure = doc.createElement('figure');
    const kind = tagOf(media);
    figure.className = kind === 'img' ? 'fx-image' : kind === 'video' ? 'fx-video' : 'fx-embed';
    if (kind === 'img') figure.setAttribute('data-align', 'center');

    const p = wrapper.closest('p');
    if (p) p.after(figure);
    else wrapper.parentNode?.insertBefore(figure, wrapper);
    figure.appendChild(wrapper);

    if (options.forEditor) figure.setAttribute('contenteditable', 'false');
  }

  for (const figure of Array.from(body.querySelectorAll('figure'))) {
    // Tabela de conteúdo/grid: o wrapper é estrutural, não uma figura de mídia.
    if (figure.classList.contains('fx-table') || figure.querySelector('table')) {
      figure.classList.add('fx-table');
      figure.removeAttribute('contenteditable');
      continue;
    }

    const hasImg = Boolean(figure.querySelector('img'));
    const hasVideo = Boolean(figure.querySelector('video'));
    const hasIframe = Boolean(figure.querySelector('iframe'));

    if (!hasImg && !hasVideo && !hasIframe) {
      figure.remove();
      continue;
    }

    const classes = new Set((figure.getAttribute('class') ?? '').split(/\s+/).filter(Boolean));
    if (hasImg) classes.add('fx-image');
    if (hasVideo) classes.add('fx-video');
    if (hasIframe) classes.add('fx-embed');
    figure.setAttribute('class', Array.from(classes).join(' '));

    if (!figure.hasAttribute('data-align')) figure.setAttribute('data-align', 'center');
    if (options.forEditor) figure.setAttribute('contenteditable', 'false');
    else figure.removeAttribute('contenteditable');
  }
}

function normalizeTables(body: Element): void {
  const doc = body.ownerDocument;

  for (const table of Array.from(body.querySelectorAll('table'))) {
    const isGrid =
      table.classList.contains('fx-grid') ||
      table.getAttribute('role') === 'presentation';

    if (isGrid) {
      table.classList.add('fx-grid');
      table.setAttribute('role', 'presentation');
      const firstRow = table.querySelector('tr');
      const cols = firstRow ? firstRow.children.length : 0;
      if (cols) table.setAttribute('data-cols', String(cols));
    } else {
      table.removeAttribute('role');
      const parentFigure = table.closest('figure');
      if (!parentFigure || !parentFigure.classList.contains('fx-table')) {
        const figure = doc.createElement('figure');
        figure.className = 'fx-table';
        table.parentNode?.insertBefore(figure, table);
        figure.appendChild(table);
      }
    }

    let tbody = Array.from(table.children).find((child) => tagOf(child) === 'tbody') as Element | undefined;
    const looseRows = Array.from(table.children).filter((child) => tagOf(child) === 'tr');
    if (looseRows.length) {
      if (!tbody) {
        tbody = doc.createElement('tbody');
        table.appendChild(tbody);
      }
      for (const row of looseRows) tbody.appendChild(row);
    }

    if (!Array.from(table.children).some((child) => tagOf(child) === 'colgroup')) {
      const firstRow = table.querySelector('tr');
      const count = firstRow ? Array.from(firstRow.children).filter((c) => tagOf(c) === 'td' || tagOf(c) === 'th').length : 0;
      if (count > 0) {
        const colgroup = doc.createElement('colgroup');
        for (let i = 0; i < count; i++) {
          const col = doc.createElement('col');
          col.style.width = `${(100 / count).toFixed(4).replace(/\.?0+$/, '')}%`;
          colgroup.appendChild(col);
        }
        table.insertBefore(colgroup, table.firstChild);
      }
    }

    for (const th of Array.from(table.querySelectorAll('th'))) {
      if (!th.getAttribute('scope')) th.setAttribute('scope', 'col');
    }

    for (const cell of Array.from(table.querySelectorAll('th, td'))) {
      wrapInlineChildren(cell, doc);
    }
  }
}

function normalizeRoot(body: Element, options: NormalizeOptions): void {
  const doc = body.ownerDocument;
  let buffer: Node[] = [];

  const flush = (before: Node | null): void => {
    if (!buffer.length) return;
    const p = doc.createElement('p');
    body.insertBefore(p, before);
    for (const node of buffer) p.appendChild(node);
    buffer = [];
    if (!p.textContent?.trim() && !p.querySelector('img,video,iframe,br')) p.innerHTML = '<br>';
  };

  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.nodeValue ?? '').trim()) buffer.push(node);
      else node.remove();
      continue;
    }

    if (!isElement(node)) {
      node.remove();
      continue;
    }

    const tag = tagOf(node);
    if (BLOCK_TAGS.has(tag) || tag === 'figure') {
      flush(node);
      continue;
    }

    if (INLINE_TAGS.has(tag) || tag === 'img' || tag === 'video' || tag === 'iframe') {
      buffer.push(node);
      continue;
    }

    // Elemento desconhecido no nível raiz: preserva os filhos como inline.
    while (node.firstChild) buffer.push(node.firstChild), body.insertBefore(node.firstChild, node);
    node.remove();
  }

  flush(null);
  if (options.forEditor && !body.querySelector('p,h1,h2,h3,h4,h5,h6,ul,ol,blockquote,pre,table,figure,hr')) {
    body.innerHTML = '<p><br></p>';
  }
}

function stripEmpty(body: Element, forEditor: boolean): void {
  for (const span of Array.from(body.querySelectorAll('span'))) {
    if (!span.textContent?.trim() && !span.querySelector('img,video,iframe,br') && !span.hasAttribute('style')) {
      span.remove();
    }
  }

  for (const p of Array.from(body.querySelectorAll('p'))) {
    if (p.querySelector('img,video,iframe,br,table,figure')) continue;
    if (p.textContent?.trim()) continue;
    if (forEditor && p === body.lastElementChild) continue;
    p.remove();
  }

  for (const heading of Array.from(body.querySelectorAll('h1,h2,h3,h4,h5,h6,blockquote'))) {
    if (!heading.textContent?.trim() && !heading.querySelector('img,video,iframe,br')) heading.remove();
  }

  for (const figure of Array.from(body.querySelectorAll('figure'))) {
    if (!figure.querySelector('img,video,iframe,table')) figure.remove();
  }

  for (const table of Array.from(body.querySelectorAll('table'))) {
    if (!table.querySelector('td,th')) table.remove();
  }

  if (forEditor && !body.querySelector('p,h1,h2,h3,h4,h5,h6,ul,ol,blockquote,pre,table,figure,hr')) {
    body.innerHTML = '<p><br></p>';
  }
}

/**
 * Normaliza um `<body>` já parseado/sanitizado e devolve o HTML final.
 * Evita uma segunda parseada quando o chamador já tem o DOM em mãos.
 */
export function normalizeElement(body: Element, options: NormalizeOptions = {}): string {
  normalizeChildren(body, options);
  normalizeFigures(body, options);
  normalizeTables(body);
  normalizeChildren(body, options);
  normalizeRoot(body, options);
  stripEmpty(body, Boolean(options.forEditor));

  const result = body.innerHTML.trim();
  if (!result) return options.forEditor ? '<p><br></p>' : '';
  return result;
}

/**
 * Canonicaliza o HTML do editor.
 *
 * @example
 * normalizeHtml('<div>Oi <b>mundo</b></div>')
 * // => '<p>Oi <strong>mundo</strong></p>'
 */
export function normalizeHtml(html: string, options: NormalizeOptions = {}): string {
  if (!html) return options.forEditor ? '<p><br></p>' : '';
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(
    `<!doctype html><html><body>${html}</body></html>`,
    'text/html',
  );

  return normalizeElement(doc.body, options);
}

/** Remove atributos exclusivos do editor que não devem ir para o dado salvo. */
export function normalizeForStorage(html: string): string {
  return normalizeHtml(html, { forEditor: false });
}

/** Prepara o HTML para entrar no contenteditable (figuras atômicas). */
export function normalizeForEditor(html: string): string {
  return normalizeHtml(html, { forEditor: true });
}


