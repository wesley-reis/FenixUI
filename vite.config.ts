import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

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
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    target: 'es2020',
    emptyOutDir: true,
    rollupOptions: {
      input: [here + 'src/index.ts', here + 'src/plugins/index.ts'],
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