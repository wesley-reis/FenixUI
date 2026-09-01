import { defineFxOrderList } from './orderlist';

// Reexporta a classe para uso programático (ex.: instanceof, herança).
export { FxOrderList } from './orderlist';
export type { OrderListItem } from './orderlist';

// Auto-registro: basta importar o subpath `@wrrdev/fenix-ui/orderlist`
// para que o componente seja definido no CustomElementRegistry.
defineFxOrderList();

