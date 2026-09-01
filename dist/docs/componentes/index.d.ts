/**
 * Registro lazy dos componentes da documentação.
 *
 * Os metadados (sidebar) carregam no boot; o componente web em si só é
 * importado quando a rota é acessada (`componentLoaders[tag]()`).
 */
import type { ComponentDoc } from '../types';
export declare const componentDocs: ComponentDoc[];
export declare const componentLoaders: Record<string, () => Promise<unknown>>;
//# sourceMappingURL=index.d.ts.map