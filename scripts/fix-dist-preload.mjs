/**
 * Pós-build do ESM: renomeia os helpers de preload que o Vite injeta no dist.
 *
 * O Vite 5 sempre envolve `import()` dinâmicos com `__vitePreload` (mesmo com
 * `build.modulePreload: false`). O problema: no Vite 8 (rolldown) do projeto
 * consumidor, `__vitePreload` é um identificador que o próprio build injeta,
 * causando "Identifier '__vitePreload' has already been declared".
 *
 * Este script renomeia os identificadores (código e sourcemaps) para nomes
 * exclusivos da lib, evitando a colisão no consumidor.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

const REPLACEMENTS = [
  ['__vitePreload', '__fenixPreload'],
  ['__vite__mapDeps', '__fenixMapDeps'],
];

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(js|mjs|cjs|map)$/.test(name)) out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(DIST)) {
  let content = readFileSync(file, 'utf8');
  let fileChanged = false;
  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      fileChanged = true;
    }
  }
  if (fileChanged) {
    writeFileSync(file, content);
    changed++;
    console.log(`fix-dist-preload: rewrote ${file}`);
  }
}
console.log(`fix-dist-preload: ${changed} file(s) updated`);
