import { FxEmptyState, defineFxEmptyState } from './empty-state';

export { FxEmptyState };

defineFxEmptyState();

declare global {
  interface HTMLElementTagNameMap {
    'fx-empty-state': FxEmptyState;
  }
}