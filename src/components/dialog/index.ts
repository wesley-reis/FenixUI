import { FxDialog, defineFxDialog } from './dialog';

export { FxDialog };


defineFxDialog();

declare global {
  interface HTMLElementTagNameMap {
    'fx-dialog': FxDialog;
  }
}


