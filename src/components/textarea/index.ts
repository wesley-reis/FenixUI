import { FxTextarea, defineFxTextarea } from './textarea';

// Reexporta a classe para uso programÃ¡tico (ex.: instanceof, heranÃ§a).
export { FxTextarea };


// Auto-registro: basta importar o subpath `@fenix-ui/fenix-ui/textarea`
// para que o componente seja definido no CustomElementRegistry.
defineFxTextarea();

declare global {
  interface HTMLElementTagNameMap {
    'fx-textarea': FxTextarea;
  }
}


