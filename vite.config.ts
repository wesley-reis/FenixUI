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
  // Base relativa: o Vite emite a URL da fonte de ícones como caminho RELATIVO
  // (ex.: '../assets/fenix-icons-HASH.woff2'). Com caminho absoluto ('/assets/...')
  // o bundler do projeto consumidor não encontra o arquivo dentro de node_modules
  // e a fonte 404 em produção. Com o relativo, Vite/webpack resolvem e copiam o asset.
  base: './',
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
    // Impede o Vite de injetar `__vitePreload`/`__vite__mapDeps` no dist da lib.
    // Esses identificadores colidem com os helpers que o Vite 8 (rolldown) injeta
    // no projeto consumidor, causando "Identifier '__vitePreload' has already
    // been declared". Com `modulePreload: false`, os imports dinâmicos ficam puros.
    modulePreload: false,
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