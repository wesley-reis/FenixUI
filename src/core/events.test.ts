/**
 * Teste-guarda dos nomes de evento.
 *
 * Garante que NUNCA volte a existir "competição" entre eventos:
 *  1. nenhum nome eventspaced (fx-*) é emitido por mais de um componente;
 *  2. eventos de valor (input/change/valueChange/…) só em componentes
 *     form-associated;
 *  3. todo evento eventspaced segue o padrão `fx-<componente>-<ação>`;
 *  4. nenhum componente volta a disparar um `CustomEvent` com nome genérico
 *     "cru" (o que reintroduziria o conflito).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FX_COMPONENT_EVENTS, FX_EVENT, FX_FORM_COMPONENTS, FX_VALUE_EVENTS } from './events';

const root = resolve(process.cwd());
const valueEvents = new Set<string>(FX_VALUE_EVENTS);

/** Todos os nomes eventspaced declarados no registro. */
const namespaced = Object.entries(FX_EVENT)
  .filter(([key]) => !valueEvents.has(FX_EVENT[key as keyof typeof FX_EVENT]))
  .map(([, name]) => name);

describe('eventos: unicidade e formato', () => {
  it('todo evento eventspaced segue fx-<componente>-<ação>', () => {
    for (const name of namespaced) {
      expect(name, `nome fora do padrão: ${name}`).toMatch(/^fx-[a-z0-9]+(-[a-z0-9]+)+$/);
    }
  });

  it('nenhum evento eventspaced é emitido por mais de um componente', () => {
    const owners = new Map<string, string[]>();
    for (const [tag, events] of Object.entries(FX_COMPONENT_EVENTS)) {
      for (const e of events) {
        if (valueEvents.has(e)) continue;
        owners.set(e, [...(owners.get(e) ?? []), tag]);
      }
    }
    const collisions = [...owners.entries()].filter(([, tags]) => tags.length > 1);
    expect(collisions, `eventos compartilhados: ${JSON.stringify(collisions)}`).toEqual([]);
  });

  it('eventos de valor só aparecem em componentes form-associated', () => {
    const form = new Set<string>(FX_FORM_COMPONENTS);
    for (const [tag, events] of Object.entries(FX_COMPONENT_EVENTS)) {
      const usesValue = events.some((e) => valueEvents.has(e));
      if (usesValue) {
        expect(form.has(tag), `${tag} emite evento de valor mas não é form-associated`).toBe(true);
      }
    }
  });
});

describe('eventos: código não reintroduz nomes genéricos', () => {
  it('nenhum componente dispara CustomEvent com nome genérico cru', () => {
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const ent of readdirSync(resolve(root, dir), { withFileTypes: true })) {
        const p = `${dir}/${ent.name}`;
        if (ent.isDirectory()) walk(p);
        else if (ent.name.endsWith('.ts') && !ent.name.endsWith('.test.ts')) files.push(p);
      }
    };
    walk('src/components');

    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(resolve(root, f), 'utf8');
      for (const m of src.matchAll(/new CustomEvent\(\s*['"`]([^'"`]+)['"`]/g)) {
        const name = m[1]!;
        // Permitido: eventos de valor (form) e nomes eventspaced via FX_EVENT.
        if (valueEvents.has(name) || name.startsWith('fx-')) continue;
        offenders.push(`${f}: ${name}`);
      }
    }
    expect(offenders, `nomes genéricos reintroduzidos: ${offenders.join(', ')}`).toEqual([]);
  });
});
