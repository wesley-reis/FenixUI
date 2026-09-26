import { FxIcon, defineFxIcon } from './icon';

export { FxIcon };

defineFxIcon();

declare global {
  interface HTMLElementTagNameMap {
    'fx-icon': FxIcon;
  }
}
