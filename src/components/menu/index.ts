import { FxMenu, defineFxMenu } from './menu';

export { FxMenu };

defineFxMenu();

declare global {
  interface HTMLElementTagNameMap {
    'fx-menu': FxMenu;
  }
}