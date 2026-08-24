import { FxPagination, defineFxPagination } from './pagination';

export { FxPagination };


defineFxPagination();

declare global {
  interface HTMLElementTagNameMap {
    'fx-pagination': FxPagination;
  }
}

