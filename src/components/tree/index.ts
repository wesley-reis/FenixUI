import { FxTree, defineFxTree } from './tree';

export { FxTree };

defineFxTree();

declare global {
  interface HTMLElementTagNameMap {
    'fx-tree': FxTree;
  }
}