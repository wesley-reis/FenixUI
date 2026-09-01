/**
 * Documentação interativa do FenixUI.
 *
 * SPA sem framework (hash routing) no
 *  - navegação lateral por componente;
 *  - playground por componente com controles ao vivo;
 *  - tabelas de API (atributos, slots, eventos);
 *  - seletor de tema (preset × modo claro/escuro) refletindo na hora,
 *    pois os componentes leem CSS Custom Properties (`--fx-*`).
 */
import { componentLoaders } from './componentes';
export { componentLoaders };
export declare function formatHtml(src: string): string;
export declare const currentRouteReady: () => Promise<void>;
//# sourceMappingURL=app.d.ts.map