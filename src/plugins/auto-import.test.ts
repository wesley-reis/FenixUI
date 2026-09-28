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
      [...dirs, 'fx-tab-panel', 'fx-accordion-panel', 'fx-dropdown-item', 'fx-column', 'fx-cell', 'fx-toolbar'].sort(),
    );
  });

  it('injeta imports para as tags usadas', () => {
    const code = `import { something } from './x';\nexport const tpl = '<fx-button>Ok</fx-button><fx-select></fx-select>';`;
    const out = transformSource(code);
    expect(out).toContain("import '@wrrdev/fenix-ui/button';");
    expect(out).toContain("import '@wrrdev/fenix-ui/select';");
    // InjeÃ§Ã£o apÃ³s o Ãºltimo import existente.
    expect(out.indexOf("import '@wrrdev/fenix-ui/button';")).toBeGreaterThan(
      code.indexOf("'./x'"),
    );
  });

  it('nÃ£o duplica import jÃ¡ existente', () => {
    const code = `import '@wrrdev/fenix-ui/button';\nconst t = '<fx-button>Ok</fx-button>';`;
    expect(transformSource(code)).toBe(code);
  });

  it('ignora tags desconhecidas', () => {
    const code = `<fx-unknown></fx-unknown>`;
    expect(transformSource(code)).toBe(code);
  });

  it('sem import prÃ©vio: injeta no topo', () => {
    const out = transformSource(`const a = 1;\nconst b = '<fx-badge>x</fx-badge>';`);
    expect(out.startsWith("import '@wrrdev/fenix-ui/badge';\n")).toBe(true);
  });

  it('.vue: injeta dentro do bloco script', () => {
    const out = transformSource(
      `<template><fx-spinner /></template>\n<script setup lang="ts">\nconst a = 1;\n</script>`,
    );
    expect(out.indexOf("import '@wrrdev/fenix-ui/spinner';")).toBeGreaterThan(
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

/* ------------------------------------------------------------------ */
/* Arquivos com markup: SFC (Vue/Svelte) e HTML                        */
/* ------------------------------------------------------------------ */

describe('auto-import (SFC Vue/Svelte e HTML)', () => {
  /** SFC típico de projeto Windows (CRLF) — o cenário que o plugin perdia. */
  const vueCrlf = [
    '<template>',
    '  <fx-icon name="home" />',
    '</template>',
    '',
    '<script setup lang="ts">',
    'import { ref } from "vue";',
    'const a = ref(0);',
    '</script>',
    '',
  ].join('\r\n');

  it('.vue com CRLF: injeta DENTRO do <script setup> e preserva o CRLF', () => {
    const out = transformSource(vueCrlf, {}, 'D:/app/src/App.vue');
    const at = out.indexOf("import '@wrrdev/fenix-ui/icon';");
    expect(at).toBeGreaterThan(out.indexOf('<script setup'));
    expect(at).toBeLessThan(out.indexOf('const a'));
    // Nada fora do <script>: o compilador de SFC descartaria o import.
    expect(at).toBeLessThan(out.indexOf('</script>'));
    expect(out.slice(0, out.indexOf('<template>'))).not.toContain('import ');
  });

  it('.vue só com <template>: cria o bloco <script> para o import não ser descartado', () => {
    const code = ['<template>', '  <fx-button variant="primary">Ok</fx-button>', '</template>', ''].join('\n');
    const out = transformSource(code, {}, '/app/src/Card.vue');
    expect(out.startsWith('<script>')).toBe(true);
    expect(out).toContain("import '@wrrdev/fenix-ui/button';");
    expect(out.indexOf("import '@wrrdev/fenix-ui/button';")).toBeLessThan(out.indexOf('<template>'));
    expect(out.trimEnd().endsWith('</template>')).toBe(true);
  });

  it('.vue: injeta a augmentação de tipos do Vue (autocomplete/validação no Volar)', () => {
    const out = transformSource('<template>\n  <fx-badge>x</fx-badge>\n</template>\n', {}, '/app/src/Card.vue');
    expect(out).toContain("import '@wrrdev/fenix-ui/vue';");
  });

  it('vueTypes: false desliga a injeção dos tipos do Vue', () => {
    const out = transformSource(
      '<template>\n  <fx-badge>x</fx-badge>\n</template>\n',
      { vueTypes: false },
      '/app/src/Card.vue',
    );
    expect(out).not.toContain('/vue');
  });

  it('vueTypes respeita o packageName customizado', () => {
    const out = transformSource(
      '<template>\n  <fx-badge>x</fx-badge>\n</template>\n',
      { packageName: '@acme/ui' },
      '/app/src/Card.vue',
    );
    expect(out).toContain("import '@acme/ui/badge';");
    expect(out).toContain("import '@acme/ui/vue';");
  });

  it('não injeta tipos do Vue em arquivos que não são .vue', () => {
    const out = transformSource(`const t = '<fx-badge>x</fx-badge>';`, {}, '/app/src/badge.ts');
    expect(out).not.toContain('/vue');
  });

  it('.svelte: injeta dentro do <script lang="ts">', () => {
    const out = transformSource(
      '<script lang="ts">\n  let a = 1;\n</script>\n\n<fx-spinner />\n',
      {},
      '/app/src/App.svelte',
    );
    const at = out.indexOf("import '@wrrdev/fenix-ui/spinner';");
    expect(at).toBeGreaterThan(out.indexOf('<script'));
    expect(at).toBeLessThan(out.indexOf('let a'));
  });

  it('HTML: usa o <script> inline existente e ignora blocos com src=', () => {
    const code =
      '<body>\n<fx-alert>x</fx-alert>\n' +
      '<script type="module" src="/src/main.ts"></script>\n' +
      '<script>\nconsole.log(1);\n</script>\n</body>\n';
    const out = transformSource(code, {}, '/app/index.html');
    const at = out.indexOf("import '@wrrdev/fenix-ui/alert';");
    expect(at).toBeGreaterThan(out.indexOf('<script>'));
    expect(at).toBeLessThan(out.indexOf('console.log(1)'));
    expect(out).not.toContain('main.ts"></script>\nimport');
  });

  it('HTML sem <script>: cria <script type="module"> antes do </body>', () => {
    const out = transformSource('<body>\n<fx-button>Ok</fx-button>\n</body>\n', {}, '/app/index.html');
    expect(out).toContain('<script type="module">');
    expect(out.indexOf('<script type="module">')).toBeLessThan(out.indexOf('</body>'));
  });

  it('<fx-icon> (componente) NÃO puxa o CSS completo dos ícones', () => {
    const out = transformSource(`const t = '<fx-icon name="home" />';`, {}, '/app/src/icon.ts');
    expect(out).toContain("import '@wrrdev/fenix-ui/icon';");
    expect(out).not.toContain('fenix-ui/icons');
  });

  it('classes fx-icon-* continuam puxando o CSS completo dos ícones', () => {
    const out = transformSource(`const t = '<i class="fx-icon fx-icon-home"></i>';`, {}, '/app/src/icon.ts');
    expect(out).toContain("import '@wrrdev/fenix-ui/icons';");
  });

  it('não confunde nomes compostos (meu-fx-icon) com a biblioteca de ícones', () => {
    const out = transformSource(`const t = '<i class="meu-fx-icon"></i>';`, {}, '/app/src/icon.ts');
    expect(out).not.toContain('fenix-ui/icons');
  });
});
