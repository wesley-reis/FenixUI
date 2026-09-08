import { FxBreadcrumb, defineFxBreadcrumb } from './breadcrumb';

export { FxBreadcrumb };

defineFxBreadcrumb();

declare global {
  interface HTMLElementTagNameMap {
    'fx-breadcrumb': FxBreadcrumb;
  }
}
