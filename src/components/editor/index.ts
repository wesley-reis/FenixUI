import { FxEditor, defineFxEditor } from './editor';

// Reexporta a classe e os tipos públicos.
export { FxEditor };
export type {
  FxEditorChangeDetail,
  FxEditorUploadResult,
} from './editor';
export { FX_EDITOR_CONTENT_CSS } from './styles';
export { sanitizeHtml, sanitizeEmbedUrl, sanitizeLinkUrl, sanitizeMediaUrl } from './sanitize-html';
export { normalizeHtml, normalizeForEditor, normalizeForStorage } from './normalize-html';

// Auto-registro: importar `@wrrdev/fenix-ui/editor` define <fx-editor>.
defineFxEditor();

declare global {
  interface HTMLElementTagNameMap {
    'fx-editor': FxEditor;
  }
}
