/**
 * Camada de comandos do <fx-editor>.
 *
 * `document.execCommand` é deprecated, mas ainda é o único caminho que
 * preserva o undo nativo sem um modelo de documento. Ele fica isolado aqui;
 * quando não existe (jsdom, navegador futuro), caímos para Selection/Range.
 */

import { getBlock, getRange, getSelectedBlocks, placeCaretAtEnd } from './selection';

type ExecDocument = Document & {
  execCommand?: (commandId: string, showUI?: boolean, value?: string) => boolean;
};

function setSelection(range: Range): void {
  const selection = document.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

export function nativeExec(command: string, value?: string): boolean {
  const exec = (document as ExecDocument).execCommand;
  if (typeof exec !== 'function') return false;
  try {
    return exec.call(document, command, false, value);
  } catch {
    return false;
  }
}

export function queryState(command: string): boolean | null {
  try {
    return typeof document.queryCommandState === 'function'
      ? document.queryCommandState(command)
      : null;
  } catch {
    return null;
  }
}

/** Insere HTML na seleção. Usa `insertHTML` nativo quando disponível. */
export function insertHtml(editor: HTMLElement, html: string): boolean {
  if (nativeExec('insertHTML', html)) return true;

  const range = getRange(editor);
  if (!range) {
    editor.insertAdjacentHTML('beforeend', html);
    placeCaretAtEnd(editor);
    return true;
  }

  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  const last = fragment.lastChild;
  range.insertNode(fragment);

  if (last) {
    const next = document.createRange();
    next.setStartAfter(last);
    next.collapse(true);
    setSelection(next);
  }
  return true;
}

function unwrap(el: Element): void {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  el.remove();
}

function wrapSelection(editor: HTMLElement, tag: string): boolean {
  const range = getRange(editor);
  if (!range) return false;

  const el = document.createElement(tag);
  if (range.collapsed) {
    el.appendChild(document.createTextNode('\u200B'));
    range.insertNode(el);
    const caret = document.createRange();
    caret.setStart(el.firstChild ?? el, 1);
    caret.collapse(true);
    setSelection(caret);
    return true;
  }

  try {
    range.surroundContents(el);
  } catch {
    el.appendChild(range.extractContents());
    range.insertNode(el);
  }
  return true;
}

/** Alterna uma marca inline (strong/em/u/s/code/sub/sup/mark). */
export function toggleInline(editor: HTMLElement, tag: string): boolean {
  const nativeMap: Record<string, string> = {
    strong: 'bold',
    b: 'bold',
    em: 'italic',
    i: 'italic',
    u: 'underline',
    s: 'strikeThrough',
    strike: 'strikeThrough',
  };

  const nativeCommand = nativeMap[tag];
  if (nativeCommand && nativeExec(nativeCommand)) return true;

  const range = getRange(editor);
  if (!range) return false;

  const current = (range.startContainer.nodeType === Node.ELEMENT_NODE
    ? (range.startContainer as Element)
    : range.startContainer.parentElement
  )?.closest(tag);

  if (current && editor.contains(current)) {
    unwrap(current);
    return true;
  }

  return wrapSelection(editor, tag);
}

/** Formata o bloco atual/selecionado para p, h1..h6, blockquote ou pre. */
export function formatBlock(editor: HTMLElement, tag: string): boolean {
  const normalized = tag.toLowerCase().replace(/[<>]/g, '');
  if (nativeExec('formatBlock', normalized)) return true;

  const blocks = getSelectedBlocks(editor);
  if (!blocks.length) {
    const block = getBlock(editor);
    if (block) blocks.push(block);
  }

  for (const block of blocks) {
    if (!editor.contains(block)) continue;
    const next = document.createElement(normalized);
    for (const attr of Array.from(block.attributes)) next.setAttribute(attr.name, attr.value);
    while (block.firstChild) next.appendChild(block.firstChild);
    block.replaceWith(next);
  }
  return blocks.length > 0;
}

/** Alinhamento de bloco. */
export function align(editor: HTMLElement, value: 'left' | 'center' | 'right' | 'justify'): boolean {
  const nativeMap = {
    left: 'justifyLeft',
    center: 'justifyCenter',
    right: 'justifyRight',
    justify: 'justifyFull',
  } as const;

  if (nativeExec(nativeMap[value])) return true;

  const blocks = getSelectedBlocks(editor);
  for (const block of blocks) block.style.textAlign = value;
  return blocks.length > 0;
}

/** Lista com/sem ordem. */
export function toggleList(editor: HTMLElement, ordered: boolean): boolean {
  if (nativeExec(ordered ? 'insertOrderedList' : 'insertUnorderedList')) return true;

  const blocks = getSelectedBlocks(editor);
  if (!blocks.length) return false;

  const list = document.createElement(ordered ? 'ol' : 'ul');
  const first = blocks[0];
  first.parentNode?.insertBefore(list, first);

  for (const block of blocks) {
    const li = document.createElement('li');
    while (block.firstChild) li.appendChild(block.firstChild);
    list.appendChild(li);
    block.remove();
  }

  const range = document.createRange();
  range.selectNodeContents(list.lastElementChild ?? list);
  range.collapse(false);
  setSelection(range);
  return true;
}

/** Limpa formatação inline mantendo o texto. */
export function removeFormat(editor: HTMLElement): boolean {
  if (nativeExec('removeFormat')) return true;

  const range = getRange(editor);
  if (!range) return false;
  const root = range.commonAncestorContainer;
  const container = root.nodeType === Node.ELEMENT_NODE ? (root as Element) : root.parentElement;
  if (!container) return false;

  const tags = ['strong', 'b', 'em', 'i', 'u', 's', 'strike', 'span', 'mark', 'code', 'sub', 'sup'];
  for (const el of Array.from(container.querySelectorAll(tags.join(',')))) {
    if (range.intersectsNode(el)) unwrap(el);
  }
  return true;
}

/** Cria/edita link na seleção. */
const linkHtml = (href: string, label: string, target: string): string =>
  `<a href="${escapeAttr(href)}" target="${target}" rel="noopener noreferrer">${escapeText(label)}</a>`;

export function applyLink(editor: HTMLElement, href: string, text?: string, target = '_blank'): boolean {
  const label = text?.trim() || href;
  const range = getRange(editor);
  if (!range) return insertHtml(editor, linkHtml(href, label, target));

  const anchor = (range.startContainer.nodeType === Node.ELEMENT_NODE
    ? (range.startContainer as Element)
    : range.startContainer.parentElement
  )?.closest('a');

  if (anchor && editor.contains(anchor)) {
    anchor.setAttribute('href', href);
    anchor.setAttribute('target', target);
    anchor.setAttribute('rel', 'noopener noreferrer');
    if (text && text !== anchor.textContent) anchor.textContent = text;
    return true;
  }

  if (!range.collapsed) {
    if (nativeExec('createLink', href)) {
      const created = (range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as Element)
        : range.startContainer.parentElement
      )?.closest('a');
      created?.setAttribute('target', target);
      created?.setAttribute('rel', 'noopener noreferrer');
      return true;
    }

    const el = document.createElement('a');
    el.setAttribute('href', href);
    el.setAttribute('target', target);
    el.setAttribute('rel', 'noopener noreferrer');
    try {
      range.surroundContents(el);
    } catch {
      el.appendChild(range.extractContents());
      range.insertNode(el);
    }
    return true;
  }

  return insertHtml(editor, linkHtml(href, label, target));
}

export function unlink(editor: HTMLElement): boolean {
  if (nativeExec('unlink')) return true;
  const range = getRange(editor);
  if (!range) return false;
  const anchor = (range.startContainer.nodeType === Node.ELEMENT_NODE
    ? (range.startContainer as Element)
    : range.startContainer.parentElement
  )?.closest('a');
  if (anchor && editor.contains(anchor)) {
    unwrap(anchor);
    return true;
  }
  return false;
}

export function indent(editor: HTMLElement, delta: number): boolean {
  if (delta > 0 && nativeExec('indent')) return true;
  if (delta < 0 && nativeExec('outdent')) return true;

  const blocks = getSelectedBlocks(editor);
  for (const block of blocks) {
    const current = Number.parseInt(block.style.marginLeft || '0', 10) || 0;
    const next = Math.max(0, current + delta);
    block.style.marginLeft = next ? `${next}px` : '';
  }
  return blocks.length > 0;
}

export function escapeAttr(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

export function escapeText(value: string): string {
  return value.replace(/[&<>]/g, (ch) => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : '&gt;'));
}

