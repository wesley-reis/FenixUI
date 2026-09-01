/**
 * Split da documentação: extrai cada entrada do array `components` de
 * src/docs/app.ts e gera src/docs/componentes/<nome>.doc.ts + index.ts.
 * Uso: node scripts/split-docs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = readFileSync('src/docs/app.ts', 'utf8');
const lines = src.split('\n');

const start = lines.findIndex((l) => l.startsWith('const components: ComponentDoc[] = ['));
const end = lines.findIndex((l, i) => i > start && l === '];');
if (start < 0 || end < 0) throw new Error('array components não encontrado');

const entries = [];
let current = null;
for (let i = start + 1; i < end; i++) {
  const l = lines[i];
  if (l === '\t{') { current = [l]; continue; }
  if (current && (l === '\t},' || l === '\t}')) { current.push('\t}'); entries.push(current); current = null; continue; }
  if (current) current.push(l);
}
console.log(`encontradas ${entries.length} entradas`);

mkdirSync('src/docs/componentes', { recursive: true });

const registry = [];
for (const entry of entryEncode(entries)) {
  registry.push(entry);
}

function entryEncode(entryLines) {
  const out = [];
  for (const linesArr of entryLines) {
    const tagMatch = linesArr.join('\n').match(/tag:\s*"(fx-[a-z]+)"/);
    if (!tagMatch) throw new Error('tag não encontrada em: ' + linesArr.slice(0, 3).join(' '));
    const tag = tagMatch[1];
    const name = tag.replace('fx-', '');
    // remove um nível de indentação (tab) de cada linha
    const body = linesArr
      .map((l) => (l.startsWith('\t') ? l.slice(1) : l))
      .join('\n')
      .trimEnd();
    const uses = [];
    for (const id of ['buttonVariants', 'badgeVariants', 'sizes', 'esc', 'formatHtml', 'codeBlock']) {
      if (new RegExp(`\\b${id}\\b`).test(body)) uses.push(id);
    }
    const imports = [
      "import type { ComponentDoc } from '../types';",
      uses.length ? `import { ${uses.join(', ')} } from '../shared';` : '',
    ].filter(Boolean).join('\n');
    const file = `/**\n * Documentação do componente <${tag}>.\n *\n * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.\n */\n${imports}\n\nexport const ${name}Doc: ComponentDoc = ${body};\n`;
    writeFileSync(`src/docs/componentes/${name}.doc.ts`, file);
    out.push({ tag, name });
  }
  return out;
}

const registryCode = `/**
 * Registro lazy dos componentes da documentação.
 *
 * Os metadados (sidebar) carregam no boot; o componente web em si só é
 * importado quando a rota é acessada (\`componentLoaders[tag]()\`).
 */
import type { ComponentDoc } from '../types';

${registry.map(({ name }) => `import { ${name}Doc } from './${name}.doc';`).join('\n')}

export const componentDocs: ComponentDoc[] = [
${registry.map(({ name }) => `\t${name}Doc,`).join('\n')}
];

export const componentLoaders: Record<string, () => Promise<unknown>> = {
${registry.map(({ tag, name }) => `\t'${tag}': () => import('../../components/${name}'),`).join('\n')}
};
`;
writeFileSync('src/docs/componentes/index.ts', registryCode);
console.log('registry escrito: src/docs/componentes/index.ts');
