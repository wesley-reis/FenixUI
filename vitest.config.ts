import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    // As páginas da documentação montam dezenas de Web Components no jsdom
    // (fx-table, formulários com 5 modelos…). 5s é apertado em máquinas
    // lentas/CI; o limite maior evita falhas intermitentes de tempo.
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
