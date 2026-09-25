/**
 * Teste de cobertura de tipagens entre frameworks.
 *
 * Garante que TODO componente registrado (src/docs/componentes) possui:
 *  1. interface de props + entrada em JSX.IntrinsicElements (React/TSX) — src/core/jsx.ts;
 *  2. entrada em GlobalComponents e IntrinsicElementAttributes (Vue 3) — src/core/vue.ts;
 *  3. subpath exportado no package.json.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(process.cwd());
const read = (p: string): string => readFileSync(resolve(root, p), 'utf8');

const jsxSource = read('src/core/jsx.ts');
const vueSource = read('src/core/vue.ts');
const pkg = JSON.parse(read('package.json')) as { exports: Record<string, unknown> };

/** Exceções de nominação PascalCase (classe ≠ Pascal direto do dir). */
const pascalExceptions: Record<string, string> = { confirmpopup: 'ConfirmPopup', fileupload: 'FileUpload', orderlist: 'OrderList', picklist: 'PickList' };
const pascal = (tag: string): string => {
  const bare = tag.replace(/^fx-/, '');
  if (pascalExceptions[bare]) return pascalExceptions[bare];
  return bare
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
};

/** Todos os diretórios de componentes = fonte da verdade. */
const componentDirs = readdirSync(resolve(root, 'src/components'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

/** Subtags extras registradas manualmente (auto-import.ts) fora dos diretórios. */
const extraTags = ['fx-accordion-panel', 'fx-column'];

/** Tags que não recebem props/JSX próprios (internos/slot-only). */
const excludedFromJsx: string[] = ['fx-column'];

const tagsFromDirs = componentDirs.map((dir) => {
  // convenção: diretório toggle-button-group => tag fx-toggle-button-group
  return `fx-${dir}`;
});
const allTags = [...tagsFromDirs, ...extraTags];
const jsxTags = allTags.filter((t) => !excludedFromJsx.includes(t));

describe('cobertura de tipagens (TS / React / Vue / Angular)', () => {
  it('cada componente tem interface de props declarada no jsx.ts', () => {
    for (const tag of jsxTags) {
      const pascalName = pascal(tag);
      expect(jsxSource.includes(`export interface Fx${pascalName}Props`), `jsx.ts: Fx${pascalName}Props ausente (${tag})`).toBe(true);
    }
  });

  it('cada componente está registrado em JSX.IntrinsicElements (React/TSX)', () => {
    expect(jsxSource.includes('interface IntrinsicElements extends FxJsxIntrinsicElements')).toBe(true);
  });

  it('cada componente está em GlobalComponents e IntrinsicElementAttributes (Vue 3)', () => {
    const globalBlock = vueSource.match(/interface GlobalComponents \{([\s\S]*?)\n  \}/);
    const intrinsicBlock = vueSource.match(/interface IntrinsicElementAttributes \{([\s\S]*?)\n  \}/);
    expect(globalBlock).toBeTruthy();
    expect(intrinsicBlock).toBeTruthy();
    for (const tag of jsxTags) {
      expect(globalBlock![1].includes(`'${tag}':`), `vue.ts GlobalComponents sem '${tag}'`).toBe(true);
      expect(intrinsicBlock![1].includes(`'${tag}':`), `vue.ts IntrinsicElementAttributes sem '${tag}'`).toBe(true);
    }
  });

  it('cada componente está em FxJsxIntrinsicElements (React react-jsx via @wrrdev/fenix-ui/react)', () => {
    const reactSource = read('src/core/react.ts');
    expect(reactSource.includes("declare module 'react'")).toBe(true);
    expect(reactSource.includes('extends FxJsxIntrinsicElements')).toBe(true);
    const sharedBlock = jsxSource.match(/export interface FxJsxIntrinsicElements \{([\s\S]*?)\n\}/);
    expect(sharedBlock).toBeTruthy();
    for (const tag of jsxTags) {
      expect(sharedBlock![1].includes(`'${tag}':`), `FxJsxIntrinsicElements sem '${tag}'`).toBe(true);
    }
  });

  it('cada componente tem subpath exportado no package.json', () => {
    for (const dir of componentDirs) {
      expect(pkg.exports[`./${dir}`], `package.json sem export "./${dir}"`).toBeDefined();
    }
  });

  it('auto-import: fenixComponentMap cobre todos os componentes e subtags', async () => {
    const { fenixComponentMap } = await import('./../plugins/auto-import');
    for (const tag of allTags) {
      expect(fenixComponentMap[tag], `fenixComponentMap sem '${tag}'`).toBeDefined();
    }
  });

  it('nenhum export aponta para componente inexistente', () => {
    const broken = Object.keys(pkg.exports)
      .filter((k) => k.startsWith('./') && !k.includes('*'))
      .filter((k) => {
        const name = k.slice(2);
        return componentDirs.includes(name) && !readdirSync(resolve(root, 'src/components', name)).length;
      });
    expect(broken).toEqual([]);
  });
});
