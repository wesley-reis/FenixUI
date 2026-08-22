import { defineFxDatepicker } from './datepicker';
import '../calendar';

// Reexporta a classe para uso programático (instanceof, herança).
export { FxDatepicker } from './datepicker';

// Auto-registro ao importar o subpath `@fenix-ui/fenix-ui/datepicker`.
defineFxDatepicker();
