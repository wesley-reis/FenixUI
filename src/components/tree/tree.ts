import { FxElement } from '../../core/base';
import { css } from '../../core/css';
import { defineElement } from '../../core/define';
import { esc } from '../../core/sanitize';

/**
 * <fx-tree> — Árvore hierárquica com expandir/recolher e seleção.
 *
 * Dados via atributo `data` (JSON):
 *   [{ label: 'Item', icon: '📁', children: [{ label: 'Filho' }] }]
 *
 * Atributos: data (JSON), expand-all (expande tudo), size (sm|md|lg).
 * Eventos (composed): `select` (detail: { node }).
 */
interface TreeNode {
  label: string;
  icon?: string;
  children?: TreeNode[];
}

export class FxTree extends FxElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    ul { list-style: none; margin: 0; padding: 0; }
    ul ul { padding-left: var(--fx-space-xl); }
    li { margin: 2px 0; }
    .row {
      display: inline-flex;
      align-items: center;
      gap: var(--fx-space-xs);
      padding: var(--fx-space-xs) var(--fx-space-sm);
      border-radius: var(--fx-radius-sm);
      color: var(--fx-text-default);
      cursor: pointer;
      user-select: none;
      width: 100%;
      box-sizing: border-box;
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .row:hover { background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.05)); }
    .row.selected { background: color-mix(in srgb, var(--fx-color-primary) 12%, transparent); color: var(--fx-color-primary); font-weight: 600; }
    .caret {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      min-width: 16px;
      font-size: calc(var(--fx-font-size) - 2px);
      color: var(--fx-text-muted);
      cursor: pointer;
      transition: transform var(--fx-motion-duration-fast) var(--fx-motion-easing);
      user-select: none;
    }
    .caret.open { transform: rotate(90deg); }
    .caret.leaf { visibility: hidden; }
    .icon { line-height: 1; }
    .children[hidden] { display: none; }
    :host([size='sm']) .row { padding: 2px var(--fx-space-xs); font-size: calc(var(--fx-font-size) - 2px); }
    :host([size='lg']) .row { padding: var(--fx-space-sm) var(--fx-space-md); font-size: calc(var(--fx-font-size) + 1px); }
  `;

  static override get observedAttributes(): string[] {
    return ['data', 'expand-all', 'size'];
  }

  private _expanded = new Set<string>();
  private _selected: string | null = null;

  protected override render(): void {
    this.setTemplate(`<ul part="tree">${this._renderNodes(this.data, '')}</ul>`);
    this._bind();
  }

  private _path(i: number, parent: string): string {
    return parent ? `${parent}.${i}` : `${i}`;
  }

  private _renderNodes(nodes: TreeNode[], parent: string): string {
    const expandAll = this.hasAttr('expand-all');
    return nodes
      .map((node, i) => {
        const path = this._path(i, parent);
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const isOpen = expandAll || this._expanded.has(path);
        const selected = this._selected === path ? ' selected' : '';
        const children = hasChildren
          ? `<ul class="children" ${isOpen ? '' : 'hidden'}>${this._renderNodes(node.children!, path)}</ul>`
          : '';
        return `<li><span class="row${selected}" data-path="${path}" role="treeitem" tabindex="0"><span class="caret ${hasChildren ? (isOpen ? 'open' : '') : 'leaf'}" data-toggle="${hasChildren ? path : ''}">▸</span>${node.icon ? `<span class="icon">${esc(node.icon)}</span>` : ''}<span class="label">${esc(node.label)}</span></span>${children}</li>`;
      })
      .join('');
  }


  get data(): TreeNode[] {
    try {
      const parsed = JSON.parse(this.getAttr('data', '[]'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  set data(v: TreeNode[]) { this.setAttribute('data', JSON.stringify(v)); }

  private _bind(): void {
    this.root.querySelectorAll<HTMLElement>('.caret[data-toggle]').forEach((caret) => {
      const path = caret.dataset.toggle;
      if (!path) return;
      caret.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggle(path, caret);
      });
    });
    this.root.querySelectorAll<HTMLElement>('.row').forEach((row) => {
      const path = row.dataset.path ?? '';
      row.addEventListener('click', () => {
        this._selected = path;
        this.root.querySelectorAll<HTMLElement>('.row').forEach((r) =>
          r.classList.toggle('selected', r === row),
        );
        this.dispatchEvent(new CustomEvent('select', {
          bubbles: true, composed: true, detail: { node: this._findNode(path) },
        }));
      });
      row.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') row.click();
      });
    });
  }

  private _toggle(path: string, caret: HTMLElement): void {
    if (this._expanded.has(path)) this._expanded.delete(path);
    else this._expanded.add(path);
    const isOpen = this._expanded.has(path);
    caret.classList.toggle('open', isOpen);
    const li = caret.closest('li');
    li?.querySelector<HTMLElement>(':scope > ul.children')?.toggleAttribute('hidden', !isOpen);
  }

  private _findNode(path: string): TreeNode | undefined {
    let nodes = this.data;
    let node: TreeNode | undefined;
    for (const part of path.split('.')) {
      node = nodes[Number(part)];
      if (!node) return undefined;
      nodes = node.children ?? [];
    }
    return node;
  }

  /** Expande ou recolhe todos os nós. */
  setAllExpanded(open: boolean): void {
    if (open) this.setAttribute('expand-all', '');
    else { this.removeAttribute('expand-all'); this._expanded.clear(); }
    this.render();
  }
}

export function defineFxTree(): typeof FxTree {
  return defineElement('fx-tree', FxTree);
}
