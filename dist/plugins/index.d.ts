/**
 * Plugin de AUTO-IMPORT para Vite/Rollup.
 *
 * O usuário escreve apenas `<fx-button>`, `<fx-select>` etc. no template/código;
 * este plugin detecta as tags em tempo de build e injeta os imports dos
 * subpaths correspondentes — mantendo o tree-shaking (só entra no bundle
 * o que é usado).
 *
 * Uso no projeto do cliente (vite.config.ts):
 *   import { FenixAutoImport } from '@fenix-ui/fenix-ui/auto-import';
 *   export default { plugins: [FenixAutoImport()] };
 */
import { type AutoImportOptions } from './auto-import';
export interface FenixPlugin {
    name: string;
    enforce: 'pre';
    transform: (code: string, id: string) => {
        code: string;
        map: null;
    } | undefined;
}
export declare function FenixAutoImport(options?: AutoImportOptions): FenixPlugin;
export { transformSource, shouldTransform, fenixComponentMap } from './auto-import';
export type { AutoImportOptions } from './auto-import';
//# sourceMappingURL=index.d.ts.map