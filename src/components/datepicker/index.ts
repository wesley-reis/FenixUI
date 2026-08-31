import { defineFxDatepicker } from './datepicker';
import '../calendar';

// Reexporta a classe para uso programático (instanceof, herança).
export { FxDatepicker } from './datepicker';

// Auto-registro ao importar o subpath `@wrrdev/fenix-ui/datepicker`.
defineFxDatepicker();
