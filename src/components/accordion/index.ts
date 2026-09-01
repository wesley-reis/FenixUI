import { defineFxAccordion, defineFxAccordionPanel } from './accordion';

// Reexporta as classes para uso programático (ex.: instanceof, herança).
export { FxAccordion, FxAccordionPanel } from './accordion';

// Auto-registro: basta importar o subpath `@wrrdev/fenix-ui/accordion`
// para que os componentes sejam definidos no CustomElementRegistry.
defineFxAccordion();
defineFxAccordionPanel();
