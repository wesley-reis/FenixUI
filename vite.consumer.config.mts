import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

/**
 * Smoke test de NÃO-REGRESSÃO do caminho "instalado via bundler".
 *
 * Builda um consumidor real (Vite) que importa os mesmos arquivos que o
 * `exports` do pacote entrega para Vue/React — os módulos
 * `dist/components/<componente>/index.js` e `dist/icons/index.js` — ou seja, o
 * caminho do ESM, que NÃO usa o bundle UMD.
 *
 * O build precisa:
 *   1. concluir sem erro;
 *   2. copiar a fonte para `consumer-smoke-dist/assets/fenix-icons-<hash>.woff2`;
 *   3. deixar a URL da fonte resolvível no bundle final.
 *
 * Rode com: npm run test:consumer
 */
export default defineConfig({
  root: here + 'exemplos/consumer-smoke',
  base: './',
  build: {
    outDir: here + 'consumer-smoke-dist',
    emptyOutDir: true,
    minify: false,
    rollupOptions: { input: here + 'exemplos/consumer-smoke/index.html' },
  },
});
