/**
 * Gera a lista de nomes de ícones a partir do arquivo de codepoints da fonte
 * Material Symbols Rounded (Apache 2.0), que alimenta a "Fenix Icons".
 *
 * Saídas:
 *  - src/icons/names.ts       → lista em tempo de execução (readonly string[])
 *  - src/icons/name-union.ts  → união literal (autocomplete do editor/TypeScript)
 *
 * Uso: npm run icons:generate
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const source = readFileSync(`${here}/../src/icons/material-symbols-rounded.codepoints`, 'utf8');

const names = source
  .split(/\r?\n/)
  .map((line) => line.trim().split(/\s+/)[0])
  .filter((name) => /^[a-z0-9_]+$/.test(name));

const body = `/**
 * GERADO AUTOMATICAMENTE por scripts/generate-icons.mjs — não editar manualmente.
 * Fonte dos nomes: Material Symbols Rounded (Apache 2.0).
 */

/**
 * Todos os nomes de ícones disponíveis na fonte Fenix Icons.
 * Uso: <i class="fx-icon fx-icon-${names[0]}"></i> ou <i class="fx-icon">${names[0]}</i>
 */
export const FENIX_ICON_NAMES: readonly string[] = [
${names.map((n) => `  '${n}',`).join('\n')}
];
`;

// União literal: é ela que dá AUTOCOMPLETE dos nomes no editor (Vue/React/TS).
// Vive em arquivo próprio (tipos não dependem de runtime) e é reexportada por
// src/icons/types.ts como FenixIconName.
const union = `/**
 * GERADO AUTOMATICAMENTE por scripts/generate-icons.mjs — não editar manualmente.
 * Fonte dos nomes: Material Symbols Rounded (Apache 2.0).
 *
 * União literal de TODOS os nomes de glifos: é o que alimenta o autocomplete
 * do atributo name do <fx-icon> (Volar/vue-tsc, React/TSX) — ${names.length} opções.
 * A lista em tempo de execução fica em ./names.ts.
 */

/** Nome de glifo conhecido da fonte Fenix Icons. */
export type FenixIconKnownName =
${names.map((n) => `  | '${n}'`).join('\n')};
`;

writeFileSync(`${here}/../src/icons/names.ts`, body);
writeFileSync(`${here}/../src/icons/name-union.ts`, union);
console.log(`✔ ${names.length} nomes de ícones gerados em src/icons/names.ts e src/icons/name-union.ts`);
