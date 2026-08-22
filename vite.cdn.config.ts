import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

/**
 * Build de DISTRIBUIÇÃO via CDN/script tag.
 *
 * Gera um bundle único (UMD) com TODOS os componentes já registrados,
 * expondo o namespace global `FenixUI`. Ideal para HTML puro, JSP, .NET,
 * Thymeleaf e demais stacks sem bundler.
 */
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
    emptyOutDir: false,
    lib: {
      entry: here + 'src/cdn.ts',
      name: 'FenixUI',
      formats: ['umd'],
      fileName: () => 'fenix-ui.umd.min.js',
    },
  },
});