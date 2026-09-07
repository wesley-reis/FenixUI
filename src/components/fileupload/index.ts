import { FxFileUpload, defineFxFileUpload } from './fileupload';

export { FxFileUpload };

defineFxFileUpload();

declare global {
  interface HTMLElementTagNameMap {
    'fx-fileupload': FxFileUpload;
  }
}
