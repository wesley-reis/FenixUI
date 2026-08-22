import { defineFxBadge } from './badge';

// Reexporta a classe para uso programático (instanceof, herança).
export { FxBadge } from './badge';

// Auto-registro ao importar o subpath `@fenix-ui/fenix-ui/badge`.
defineFxBadge();