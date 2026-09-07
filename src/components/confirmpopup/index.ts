import { FxConfirmPopup, defineFxConfirmPopup } from './confirmpopup';

export { FxConfirmPopup };

defineFxConfirmPopup();

declare global {
  interface HTMLElementTagNameMap {
    'fx-confirmpopup': FxConfirmPopup;
  }
}
