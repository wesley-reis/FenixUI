import { FxToast, FenixToast, defineFxToast } from './toast';

export { FxToast, FenixToast };


defineFxToast();

declare global {
  interface HTMLElementTagNameMap {
    'fx-toast': FxToast;
  }
}


