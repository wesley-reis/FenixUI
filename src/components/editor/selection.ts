/**
 * Utilitários de seleção/Range para o <fx-editor>.
 *
 * O contenteditable vive dentro de um Shadow DOM aberto. Em navegadores
 * modernos `Selection.getComposedRanges()` devolve os nós reais; sem ele,
 * caímos para `document.getSelection()` (light DOM/jsdom).
 */

export interface ComposedSelection extends Selection {
  // Tipagem de compatibilidade para navegadores que ainda não declaram
  // getComposedRanges no lib.dom. Em TS 5.6+ o método já existe em Selection.
}

export const BLOCK_SELECTOR =
  'p,h1,h2,h3,h4,h5,h6,li,blockquote,pre,td,th,figcaption,div';

function rootOf(editor: HTMLElement): ShadowRoot | Document {
  const root = editor.getRootNode();
  return typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot ? root : document;
}

export function isRangeInside(editor: HTMLElement, range: Range | null): boolean {
  if (!range) return false;
  const start = range.startContainer;
  const end = range.endContainer;
  return editor.contains(start) && editor.contains(end);
}

export function readSelectionRange(root: ShadowRoot | Document): Range | null {
  const selection = document.getSelection() as ComposedSelection | null;
  if (!selection) return null;

  if (root instanceof ShadowRoot && selection.getComposedRanges) {
    try {
      const ranges = selection.getComposedRanges({ shadowRoots: [root] });
      const first = ranges[0];
      if (first) {
        const range = document.createRange();
        range.setStart(first.startContainer, first.startOffset);
        range.setEnd(first.endContainer, first.endOffset);
        return range;
      }
    } catch {
      /* fallback abaixo */
    }
  }

  return selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
}

export function getRange(editor: HTMLElement, fallback?: Range | null): Range | null {
  const range = readSelectionRange(rootOf(editor));
  if (isRangeInside(editor, range)) return range;
  if (isRangeInside(editor, fallback ?? null)) return fallback ?? null;
  return null;
}

export function saveRange(editor: HTMLElement): Range | null {
  const range = getRange(editor);
  return range ? range.cloneRange() : null;
}

export function restoreRange(editor: HTMLElement, range: Range | null): void {
  if (!range || !isRangeInside(editor, range)) return;
  editor.focus({ preventScroll: true });
  const selection = document.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

export function placeCaretAtEnd(editor: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  const selection = document.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

export function getBlock(editor: HTMLElement, range?: Range | null): HTMLElement | null {
  const active = range ?? getRange(editor);
  if (!active) return null;
  const node = active.startContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  const block = el?.closest<HTMLElement>(BLOCK_SELECTOR) ?? null;
  return block && editor.contains(block) ? block : null;
}

export function getSelectedBlocks(editor: HTMLElement, range?: Range | null): HTMLElement[] {
  const active = range ?? getRange(editor);
  if (!active) return [];
  if (active.collapsed) {
    const block = getBlock(editor, active);
    return block ? [block] : [];
  }

  return Array.from(editor.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)).filter((block) => {
    try {
      return active.intersectsNode(block);
    } catch {
      return false;
    }
  });
}

export function closestInEditor<T extends Element>(
  editor: HTMLElement,
  node: Node | null,
  selector: string,
): T | null {
  const el = node && (node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement);
  const match = el?.closest<T>(selector) ?? null;
  return match && editor.contains(match) ? match : null;
}

export function selectElement(el: Element): void {
  const range = document.createRange();
  range.selectNode(el);
  const selection = document.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

export function isSelectionCollapsed(editor: HTMLElement): boolean {
  const range = getRange(editor);
  return !range || range.collapsed;
}
