import { describe, it, expect } from 'vitest';
import {
  transformSource,
  shouldTransform,
  fenixComponentMap,
} from './auto-import';

describe('auto-import (plugin)', () => {
  it('mapa cobre todos os componentes', () => {
    expect(Object.keys(fenixComponentMap)).toEqual([
      'fx-button',
      'fx-badge',
      'fx-spinner',
      'fx-select',
      'fx-multiselect',
      'fx-input',
      'fx-switch',
    ]);
  });

  it('injeta imports para as tags usadas', () => {
    const code = `import { something } from './x';\nexport const tpl = '<fx-button>Ok</fx-button><fx-select></fx-select>';`;
    const out = transformSource(code);
    expect(out).toContain("import '@fenix-ui/fenix-ui/button';");
    expect(out).toContain("import '@fenix-ui/fenix-ui/select';");
    // Injeção após o último import existente.
    expect(out.indexOf("import '@fenix-ui/fenix-ui/button';")).toBeGreaterThan(
      code.indexOf("'./x'"),
    );
  });

  it('não duplica import já existente', () => {
    const code = `import '@fenix-ui/fenix-ui/button';\nconst t = '<fx-button>Ok</fx-button>';`;
    expect(transformSource(code)).toBe(code);
  });

  it('ignora tags desconhecidas', () => {
    const code = `<fx-unknown></fx-unknown>`;
    expect(transformSource(code)).toBe(code);
  });

  it('sem import prévio: injeta no topo', () => {
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
