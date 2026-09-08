import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));

/** Copia a fonte de ícones para a raiz do dist (ao lado do UMD). */
function copyIconFontPlugin() {
  return {
    name: 'fenix-copy-icon-font-cdn',
    apply: 'build' as const,
    closeBundle(): void {
      const dest = join(here, 'dist', 'fenix-icons.woff2');
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(join(here, 'src', 'icons', 'fenix-icons.woff2'), dest);
    },
  };
}

/**
 * Build de DISTRIBUIÇÃO via CDN/script tag.
 *
 * Gera um bundle único (UMD) com TODOS os componentes já registrados,
 * expondo o namespace global `FenixUI`. Ideal para HTML puro, JSP, .NET,
 * Thymeleaf e demais stacks sem bundler.
 */
export default defineConfig({
  plugins: [copyIconFontPlugin()],
  /** A fonte de ícones deve ficar na mesma pasta do UMD (URL relativa './fenix-icons.woff2'). */
  define: {
    __FENIX_ICONS_FONT_URL__: JSON.stringify('./fenix-icons.woff2'),
  },
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