/**
 * Plugin de AUTO-IMPORT para Vite/Rollup.
 *
 * O usuário escreve apenas `<fx-button>`, `<fx-select>` etc. no template/código;
 * este plugin detecta as tags em tempo de build e injeta os imports dos
 * subpaths correspondentes — mantendo o tree-shaking (só entra no bundle
 * o que é usado).
 *
 * Também cuida dos arquivos com markup: em SFC (`.vue`/`.svelte`) e HTML o import é inserido
 * DENTRO do bloco `<script>` (criado quando o SFC só tem `<template>`), e nos arquivos `.vue`
 * injeta junto `import '@wrrdev/fenix-ui/vue'` (augmentação de tipos do Volar/vue-tsc).
 * Desligue os tipos do Vue com `FenixAutoImport({ vueTypes: false })`.
 *
 * Uso no projeto do cliente (vite.config.ts):
 *   import { FenixAutoImport } from '@wrrdev/fenix-ui/auto-import';
 *   export default { plugins: [FenixAutoImport()] };
 */
import {
  transformSource,
  shouldTransform,
  type AutoImportOptions,
} from './auto-import';

export interface FenixPlugin {
  name: string;
  enforce: 'pre';
  transform: (
    code: string,
    id: string,
  ) => { code: string; map: null } | undefined;
}

export function FenixAutoImport(options: AutoImportOptions = {}): FenixPlugin {
  return {
    name: 'fenix-ui-auto-import',
    enforce: 'pre',
    transform(code, id) {
      if (!shouldTransform(id)) return undefined;
      // `id` permite os tratamentos de arquivo com markup (SFC Vue/Svelte/HTML).
      const result = transformSource(code, options, id);
      if (result === code) return undefined;
      return { code: result, map: null };
    },
  };
}

export { transformSource, shouldTransform, fenixComponentMap } from './auto-import';
export type { AutoImportOptions } from './auto-import';
