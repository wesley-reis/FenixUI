import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

/**
 * Build de produção da página de documentação.
 *
 * Separado do `vite.config.ts` (que gera a lib em `dist/`) para não
 * sobrescrever o pacote npm. O resultado vai para `docs-dist/`.
 *
 * O `base` usa o subpath do GitHub Pages, pois o repo é hospedado em
 * https://wesley-reis.github.io/FenixUI/ — sem isso os assets quebram.
 */
export default defineConfig({
  base: '/FenixUI/',
  build: {
    outDir: 'docs-dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020',
  },
});
