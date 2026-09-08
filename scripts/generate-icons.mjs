/**
 * Gera `src/icons/names.ts` a partir do arquivo de codepoints da fonte
 * Material Symbols Rounded (Apache 2.0), que alimenta a "Fenix Icons".
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

export type FenixIconName = (typeof FENIX_ICON_NAMES)[number];
`;

writeFileSync(`${here}/../src/icons/names.ts`, body);
console.log(`✔ ${names.length} nomes de ícones gerados em src/icons/names.ts`);
