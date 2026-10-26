/**
 * Smoke test do caminho CDN (bundle UMD) — roda em jsdom + servidor local.
 *
 * O que ele prova, carregando o UMD numa página em SUBPASTA (`/app/home.jsp`,
 * o cenário exato do bug):
 *   1. a URL do `@font-face` injetado resolve para a pasta do BUNDLE, e não
 *      para a página (senão a fonte dá 404 e os ícones viram texto);
 *   2. o global `FenixUI` existe com a API documentada
 *      (`theme`, `setTokens`, `applyPreset`, `setFenixIconsFontUrl`, …).
 *
 * Uso:
 *   node scripts/cdn-smoke.mjs
 *     → bundle LOCAL (dist/fenix-ui.umd.min.js) + fonte servida pelo mesmo
 *       diretório. Precisa PASSAR (exit 0).
 *
 *   node scripts/cdn-smoke.mjs <caminho-ou-url-do-umd>
 *     → testa outro bundle (ex.: o publicado, que era o bug). Falha esperada
 *       nos bundles anteriores à correção.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const arg = (process.argv[2] ?? '').trim();
const remoto = /^https?:/i.test(arg);
const DIST = join(process.cwd(), 'dist');

let server;
let bundleUrl = arg;

if (!remoto) {
  const MIME = { '.js': 'text/javascript', '.woff2': 'font/woff2', '.html': 'text/html' };
  server = createServer((req, res) => {
    const path = join(DIST, decodeURIComponent(req.url.split('?')[0]));
    if (!existsSync(path)) {
      res.statusCode = 404;
      res.end('404');
      console.log('  [servidor] 404 ->', req.url);
      return;
    }
    res.setHeader('content-type', MIME[extname(path)] ?? 'application/octet-stream');
    res.end(readFileSync(path));
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  bundleUrl = base + (arg || '/fenix-ui.umd.min.js');
}

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => console.log('  [jsdom]', e.message));

// Página numa SUBPASTA: é o caso que quebrava com a URL relativa.
const dom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body><fx-button icon="search">Buscar</fx-button></body></html>',
  { url: 'https://app.exemplo.com/app/home.jsp', runScripts: 'dangerously', resources: 'usable', virtualConsole },
);
const { window } = dom;

await new Promise((resolve, reject) => {
  const tag = window.document.createElement('script');
  tag.src = bundleUrl;
  tag.onload = resolve;
  tag.onerror = () => reject(new Error(`falha ao carregar ${bundleUrl}`));
  window.document.head.appendChild(tag);
});
await new Promise((r) => setTimeout(r, 300));

const doc = window.document;
const style = doc.getElementById('fenix-icons') ?? doc.getElementById('fenix-icons-font');
const match = /src:url\('([^']+)'\)/.exec(style?.textContent ?? '');
const raw = match ? match[1] : '(sem @font-face)';
const abs = match ? new URL(raw, doc.baseURI).href : '(n/a)';
const esperado = new URL('./fenix-icons.woff2', bundleUrl).href;
const ok = abs === esperado;

console.log('página (subpasta)            :', window.location.href);
console.log('bundle                       :', bundleUrl);
console.log('@font-face src               :', raw);
console.log('URL que o navegador usaria   :', abs);
console.log('esperado (pasta do bundle)   :', esperado);
console.log('global FenixUI               :', typeof window.FenixUI);
console.log('FenixUI.theme                :', typeof window.FenixUI?.theme);
console.log('FenixUI.setTokens            :', typeof window.FenixUI?.setTokens);
console.log('FenixUI.applyPreset          :', typeof window.FenixUI?.applyPreset);
console.log('FenixUI.setFenixIconsFontUrl :', typeof window.FenixUI?.setFenixIconsFontUrl);
console.log('VEREDITO                     :', ok ? 'OK — a fonte resolve na pasta do bundle' : 'FALHOU — a fonte cai na página (ícones viram texto)');

server?.close();
process.exitCode = ok ? 0 : 1;
