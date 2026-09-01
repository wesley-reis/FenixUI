import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const here = fileURLToPath(new URL('.', import.meta.url));

/** Versão lida do package.json — injetada em `__APP_VERSION__` (badge do header). */
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

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
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'docs-dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020',
  },
});
