import { defineFxPickList } from './picklist';

// Reexporta a classe para uso programático (ex.: instanceof, herança).
export { FxPickList } from './picklist';
export type { PickListItem } from './picklist';

// Auto-registro: basta importar o subpath `@wrrdev/fenix-ui/picklist`
// para que o componente seja definido no CustomElementRegistry.
defineFxPickList();

