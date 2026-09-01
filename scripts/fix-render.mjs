import { readFileSync, writeFileSync } from 'node:fs';

const p = 'src/docs/app.ts';
let t = readFileSync(p, 'utf8');

const OLD = 'function renderComponentPage(doc: ComponentDoc): void {';
if (!t.includes(OLD)) {
  console.log('NOT FOUND');
  process.exit(1);
}

const NEW = `/** Coleta todas as tags fx-* usadas no demoHtml e variantsHtml do doc. */
function collectDemoTags(doc: ComponentDoc): string[] {
  const html = doc.demoHtml('') + (doc.variantsHtml?.() ?? '');
  return [...new Set([...html.matchAll(/<fx-[a-z-]+/g)].map((m) => m[0].slice(1)))];
}

async function renderComponentPage(doc: ComponentDoc): Promise<void> {`;

t = t.replace(OLD, NEW);

const OLD_STAGE = `\tconst stage = main.querySelector<HTMLDivElement>("#stage")!;`;
const NEW_STAGE = `\t// Aguarda TODAS as tags customizadas serem definidas antes de manipular o stage.
\tawait Promise.all(collectDemoTags(doc).map((tag) => customElements.whenDefined(tag)));

\tconst stage = main.querySelector<HTMLDivElement>("#stage")!;`;
t = t.replace(OLD_STAGE, NEW_STAGE);

writeFileSync(p, t);
console.log('done');
