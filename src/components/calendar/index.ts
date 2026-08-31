import { defineFxCalendar } from './calendar';

// Reexporta a classe para uso programático (instanceof, herança).
export { FxCalendar } from './calendar';

// Auto-registro ao importar o subpath `@wrrdev/fenix-ui/calendar`.
defineFxCalendar();
