import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));

/** Copia a fonte de ícones para a saída (dist/icons e dist), sem hash e sem reescrita de URL. */
function copyIconFontPlugin() {
  const fontSrc = join(here, 'src', 'icons', 'fenix-icons.woff2');
  const targets = ['dist', join('dist', 'icons')];
  return {
    name: 'fenix-copy-icon-font',
    apply: 'build' as const,
    closeBundle(): void {
      for (const t of targets) {
        mkdirSync(join(here, t), { recursive: true });
        copyFileSync(fontSrc, join(here, t, 'fenix-icons.woff2'));
      }
    },
  };
}


/**
 * Build ESM focado em TREE-SHAKING.
 *
 * Ao usar `preserveModules`, o `dist/` espelha a estrutura de `src/`, gerando um
 * arquivo por módulo. Assim o bundler do cliente puxa APENAS o(s) componente(s)
 * importado(s) + o core compartilhado — nunca a biblioteca inteira.
 *
 * Também emitimos um bundle ESM único (`fenix-ui.esm.js`) para quem prefere um
 * único arquivo no consumo por bundler simples.
 */
export default defineConfig({
  plugins: [copyIconFontPlugin()],
  /** Versão lida do package.json — usada pelo badge do header da doc em dev. */
  define: {
    __APP_VERSION__: JSON.stringify(
      JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version,
    ),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    target: 'es2020',
    emptyOutDir: true,
    rollupOptions: {
      input: [
        here + 'src/index.ts',
        here + 'src/plugins/index.ts',
        here + 'src/core/vue.ts',
        here + 'src/icons/index.ts',
      ],
      // O Vite define `false` por padrão; com preserveModules isso é inválido.
      preserveEntrySignatures: 'strict',
      output: [
        {
          format: 'es',
          dir: here + 'dist',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        {
          format: 'es',
          dir: here + 'dist',
          entryFileNames: 'fenix-ui.esm.js',
          preserveModules: false,
        },
      ],
    },
  },
});