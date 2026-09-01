/** Corrige a chave de abertura dos arquivos gerados pelo split (CRLF). */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

for (const f of readdirSync('src/docs/componentes')) {
  if (!f.endsWith('.doc.ts')) continue;
  const p = 'src/docs/componentes/' + f;
  const t = readFileSync(p, 'utf8');
  const fixed = t.replace(/: ComponentDoc = \r?\n/, ': ComponentDoc = {\n');
  if (fixed !== t) {
    writeFileSync(p, fixed);
    console.log('fix', f);
  }
}
