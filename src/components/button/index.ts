import { defineFxButton } from './button';

// Reexporta a classe para uso programático (ex.: instanceof, herança).
export { FxButton } from './button';

// Auto-registro: basta importar o subpath `@wrrdev/fenix-ui/button`
// para que o componente seja definido no CustomElementRegistry.
defineFxButton();