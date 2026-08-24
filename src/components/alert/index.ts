import { FxAlert, defineFxAlert } from './alert';

export { FxAlert };


defineFxAlert();

declare global {
  interface HTMLElementTagNameMap {
    'fx-alert': FxAlert;
  }
}

