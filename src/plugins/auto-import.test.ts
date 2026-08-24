import { describe, it, expect } from 'vitest';
import {
  transformSource,
  shouldTransform,
  fenixComponentMap,
} from './auto-import';

describe('auto-import (plugin)', () => {
  it('mapa cobre todos os componentes', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dirs = fs
      .readdirSync(path.resolve(__dirname, '../components'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => 'fx-' + d.name)
      .sort();
    expect(Object.keys(fenixComponentMap).sort()).toEqual(
      [...dirs, 'fx-tab-panel', 'fx-dropdown-item'].sort(),
    );
  });

  it('injeta imports para as tags usadas', () => {
    const code = `import { something } from './x';\nexport const tpl = '<fx-button>Ok</fx-button><fx-select></fx-select>';`;
    const out = transformSource(code);
    expect(out).toContain("import '@fenix-ui/fenix-ui/button';");
    expect(out).toContain("import '@fenix-ui/fenix-ui/select';");
    // InjeÃ§Ã£o apÃ³s o Ãºltimo import existente.
    expect(out.indexOf("import '@fenix-ui/fenix-ui/button';")).toBeGreaterThan(
      code.indexOf("'./x'"),
    );
  });

  it('nÃ£o duplica import jÃ¡ existente', () => {
    const code = `import '@fenix-ui/fenix-ui/button';\nconst t = '<fx-button>Ok</fx-button>';`;
    expect(transformSource(code)).toBe(code);
  });

  it('ignora tags desconhecidas', () => {
    const code = `<fx-unknown></fx-unknown>`;
    expect(transformSource(code)).toBe(code);
  });

  it('sem import prÃ©vio: injeta no topo', () => {
    const out = transformSource(`const a = 1;\nconst b = '<fx-badge>x</fx-badge>';`);
    expect(out.startsWith("import '@fenix-ui/fenix-ui/badge';\n")).toBe(true);
  });

  it('.vue: injeta dentro do bloco script', () => {
    const out = transformSource(
      `<template><fx-spinner /></template>\n<script setup lang="ts">\nconst a = 1;\n</script>`,
    );
    expect(out.indexOf("import '@fenix-ui/fenix-ui/spinner';")).toBeGreaterThan(
      out.indexOf('<script'),
    );
    expect(out.indexOf("import '@fenix-ui")).toBeLessThan(out.indexOf('const a'));
  });

  it('shouldTransform filtra node_modules, d.ts e css', () => {
    expect(shouldTransform('/app/src/Main.vue')).toBe(true);
    expect(shouldTransform('/app/src/app.ts')).toBe(true);
    expect(shouldTransform('/app/node_modules/vue/index.js')).toBe(false);
    expect(shouldTransform('/app/dist/types.d.ts')).toBe(false);
    expect(shouldTransform('/app/src/style.css')).toBe(false);
  });
});
