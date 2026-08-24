import { FxDrawer, defineFxDrawer } from './drawer';

export { FxDrawer };

defineFxDrawer();

declare global {
  interface HTMLElementTagNameMap {
    'fx-drawer': FxDrawer;
  }
}