/**
 * Snippets por framework (HTML/Vue/React/Angular/Svelte) + abas da documentação.
 *
 * Fonte única dos exemplos copiáveis: converte o HTML real do playground, dos
 * casos de uso e dos modelos de formulário para a sintaxe de cada stack —
 * sempre com os VALORES atuais e o two-way binding que CADA stack realmente
 * suporta em Web Components:
 *  - CustomEvents `composed` com `detail: { … }` (atravessam o Shadow DOM);
 *  - Vue: `v-model` (o compilador usa `value` + `input` quando a tag é custom
 *    element — exige `isCustomElement` no app);
 *  - React: `value` + `onInput` (o evento `input` é genérico no React e chega
 *    em custom elements; `onChange` não dispara no React 18);
 *  - Angular: `[value]` + `(valueChange)` lendo `$event.detail.value` —
 *    `[(value)]` NÃO funciona: o açúcar vira `x = $event` (o CustomEvent);
 *  - Svelte: `value={…}` + `on:input` — `bind:value` não compila em custom
 *    element (o compilador restringe a `input`/`textarea`/`select`).
 */
import { codeBlock, wireCodeCopy } from './ui/code';
import { VOID_TAGS } from './shared';

export type FrameworkId = 'html' | 'vue' | 'react' | 'angular' | 'svelte';

export const FRAMEWORKS: { id: FrameworkId; label: string }[] = [
  { id: 'html', label: 'HTML / CDN' },
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'angular', label: 'Angular' },
  { id: 'svelte', label: 'Svelte' },
];

export const FRAMEWORK_STORAGE_KEY = 'fenix:doc:framework-tab';

export interface ParsedAttr {
  name: string;
  /** `true` = booleano presente sem valor (`disabled`, `clearable`…). */
  value: string | true;
  /** Aspas originais — JSON com `"` precisa continuar em aspas simples. */
  quote?: '"' | "'";
}

/** Parse de atributos: aceita `name="x"`, `name='x'` e booleanos. */
export function parseAttrs(src: string): ParsedAttr[] {
  const out: ParsedAttr[] = [];
  const RE = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'))?/g;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(src)) !== null) {
    const name = m[1];
    if (!name) continue;
    if (m[2] !== undefined) out.push({ name, value: m[2], quote: '"' });
    else if (m[3] !== undefined) out.push({ name, value: m[3], quote: "'" });
    else out.push({ name, value: true });
  }
  return out;
}

/** Campos de formulário (emitem `value` no `change`). */
const FORM_FIELD_TAGS = new Set([
  'fx-input',
  'fx-textarea',
  'fx-select',
  'fx-multiselect',
  'fx-datepicker',
  'fx-autocomplete',
  'fx-slider',
  'fx-rating',
  'fx-knob',
  'fx-progress',
  'fx-pagination',
  'fx-toggle-button-group',
  'fx-switch',
  'fx-checkbox',
  'fx-radio',
]);

/** Componentes cujo estado é `checked` (o `value` é o valor do FormData). */
const SWITCH_TAGS = new Set(['fx-switch', 'fx-checkbox', 'fx-radio']);

/** Componentes com `value` numérico — o exemplo usa literal numérico. */
const NUMERIC_TAGS = new Set(['fx-progress', 'fx-slider', 'fx-knob', 'fx-rating', 'fx-pagination']);

/** Props internas da documentação — não fazem parte do código do usuário. */
const DOC_ONLY_ATTRS = new Set(['data-save', 'data-form-validate', 'data-native-form']);

/** Subcomponentes sem subpath próprio no pacote. */
const SUBPATH_ALIAS: Record<string, string> = {
  'fx-column': 'table',
  'fx-cell': 'table',
  'fx-toolbar': 'table',
  'fx-tab-panel': 'tabs',
  'fx-dropdown-item': 'dropdown',
  'fx-accordion-panel': 'accordion',
};

function attrValue(attrs: ParsedAttr[], name: string): string | undefined {
  const found = attrs.find((a) => a.name === name);
  if (!found || found.value === true) return undefined;
  return found.value;
}

function hasAttr(attrs: ParsedAttr[], ...names: string[]): boolean {
  return attrs.some((a) => names.includes(a.name));
}

const q = (v: string): string => JSON.stringify(v);
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** `user-name` / `user_name` → `userName` (nome válido de variável). */
function camel(s: string): string {
  return s
    .replace(/[-_.]+([a-zA-Z0-9])/g, (_m, c: string) => c.toUpperCase())
    .replace(/[^\w$]/g, '');
}

/** Extrai tag raiz + inner do 1º `<fx-*>` do HTML. */
export function splitTag(html: string): { tag: string; attrs: ParsedAttr[]; inner: string } | null {
  const m = html.match(/<(fx-[a-z-]+)\s*((?:"[^"]*"|'[^']*'|[^>"'])*?)>([\s\S]*?)<\/\1\s*>/);
  if (m) {
    return { tag: m[1]!, attrs: parseAttrs((m[2] ?? '').trim()), inner: (m[3] ?? '').trim() };
  }
  const self = html.match(/<(fx-[a-z-]+)\s*((?:"[^"]*"|'[^']*'|[^>"'])*?)\/?>/);
  if (self) {
    return { tag: self[1]!, attrs: parseAttrs((self[2] ?? '').trim()), inner: '' };
  }
  return null;
}


/* ------------------------------------------------------------------ */
/* Motor: fragmento HTML → markup de cada framework                    */
/* ------------------------------------------------------------------ */

interface Bind {
  name: string;
  init: string;
  tag: string;
}

interface Ctx {
  fw: FrameworkId;
  used: Map<string, number>;
  binds: Bind[];
  hasClick: boolean;
  /** Só o playground mostra handler de clique (nos cards seria ruído). */
  withClick: boolean;
}

function bindKind(tag: string, attrs: ParsedAttr[]): 'checked' | 'value' | null {
  if (SWITCH_TAGS.has(tag)) return 'checked';
  if (attrValue(attrs, 'value') !== undefined) return 'value';
  if (FORM_FIELD_TAGS.has(tag)) return 'value';
  return null;
}

function bindInit(kind: 'checked' | 'value', attrs: ParsedAttr[], tag: string): string {
  if (kind === 'checked') return hasAttr(attrs, 'checked') ? 'true' : 'false';
  const raw = attrValue(attrs, 'value');
  if (raw === undefined) return q('');
  // value numérico (progress/slider/knob/rating/pagination) sai como número.
  if (NUMERIC_TAGS.has(tag) && /^-?\d+(\.\d+)?$/.test(raw)) return raw;
  return q(raw);
}

/** Nome único e legível (usa `name` quando existe: email, uf, termos…). */
function uniqueName(attrs: ParsedAttr[], kind: 'checked' | 'value', used: Map<string, number>): string {
  const named = attrValue(attrs, 'name');
  const base = (named && camel(named)) || kind;
  const n = (used.get(base) ?? 0) + 1;
  used.set(base, n);
  return n === 1 ? base : `${base}${n}`;
}

/** Botão que dispara clique (submit/reset são tratados pelo <form>). */
function isClickButton(tag: string, attrs: ParsedAttr[]): boolean {
  if (tag !== 'fx-button') return false;
  const type = attrValue(attrs, 'type');
  return type === undefined || type === 'button';
}

/** Props que recebem JSON (arrays/objetos) — viram binding por framework. */
const JSON_PROPS = new Set(['data', 'source', 'target', 'columns', 'items']);

function jsonLiteral(v: string): string | null {
  try {
    return JSON.stringify(JSON.parse(v));
  } catch {
    return null; // não é JSON: mantém como string
  }
}

/** Converte `<fx-input value="x" disabled>` na sintaxe de UM framework. */
function openTag(tag: string, attrsSrc: string, selfClose: string, ctx: Ctx): string {
  const attrs = parseAttrs(attrsSrc.trim());
  const isFx = tag.startsWith('fx-');
  const kind = isFx ? bindKind(tag, attrs) : null;
  const state = kind ? uniqueName(attrs, kind, ctx.used) : null;
  if (kind && state) ctx.binds.push({ name: state, init: bindInit(kind, attrs, tag), tag });

  const parts: string[] = [];
  for (const a of attrs) {
    if (DOC_ONLY_ATTRS.has(a.name)) continue;
    // O binding substitui o valor estático (exceto no HTML, que é o exemplo cru).
    if (ctx.fw !== 'html' && kind === 'value' && a.name === 'value') continue;
    if (ctx.fw !== 'html' && kind === 'checked' && a.name === 'checked') continue;
    const name = ctx.fw === 'react' && a.name === 'class' ? 'className' : a.name;
    if (a.value === true) {
      parts.push(name);
      continue;
    }
    // Props JSON (`data='[{…}]'`, `source='["a"]'`): binding com literal JS.
    const lit = JSON_PROPS.has(a.name) ? jsonLiteral(a.value) : null;
    if (lit) {
      if (ctx.fw === 'vue') parts.push(`:${name}='${lit}'`);
      else if (ctx.fw === 'react') parts.push(`${name}={${lit}}`);
      else if (ctx.fw === 'angular') parts.push(`[${name}]='${lit}'`);
      else if (ctx.fw === 'svelte') parts.push(`${name}={${lit}}`);
      else parts.push(`${name}='${a.value}'`);
      continue;
    }
    const quote = a.quote ?? '"';
    parts.push(`${name}=${quote}${a.value}${quote}`);
  }

  if (ctx.fw !== 'html' && kind && state) {
    const checked = kind === 'checked';
    if (ctx.fw === 'vue') {
      // v-model = `:value` + `@input` para custom elements (isCustomElement).
      // `checked` não entra no v-model de elemento: use `:checked` + `@change`.
      parts.push(checked ? `:checked="${state}"` : `v-model="${state}"`);
      if (checked) parts.push(`@change="${state} = $event.detail.checked"`);
    }
    if (ctx.fw === 'react') {
      // `onInput` é genérico no React (chega em custom elements); o payload é
      // lido da propriedade do host, que o componente já reflete.
      parts.push(checked ? `checked={${state}}` : `value={${state}}`);
      parts.push(
        checked
          ? `onChange={(e) => set${cap(state)}(e.detail.checked)}`
          : `onInput={(e) => set${cap(state)}(e.currentTarget.value)}`,
      );
    }
    if (ctx.fw === 'angular') {
      // `[(value)]` NÃO funciona em Web Components: o açúcar vira `x = $event`
      // (o CustomEvent). O par correto é `[value]` + `(valueChange)`.
      parts.push(checked ? `[checked]="${state}"` : `[value]="${state}"`);
      parts.push(
        checked
          ? `(checkedChange)="${state} = $event.detail.checked"`
          : `(valueChange)="${state} = $event.detail.value"`,
      );
    }
    if (ctx.fw === 'svelte') {
      // `bind:value` não compila em custom element (valid_elements do Svelte).
      parts.push(checked ? `checked={${state}}` : `value={${state}}`);
      parts.push(
        checked
          ? `on:change={(e) => ${state} = e.detail.checked}`
          : `on:input={(e) => ${state} = e.detail.value}`,
      );
    }
  } else if (isFx && ctx.withClick && isClickButton(tag, attrs)) {
    ctx.hasClick = true;
    if (ctx.fw === 'vue') parts.push(`@click="onClick"`);
    if (ctx.fw === 'react') parts.push(`onClick={() => console.log('clicou!')}`);
    if (ctx.fw === 'angular') parts.push(`(click)="onClick()"`);
    if (ctx.fw === 'svelte') parts.push(`on:click={() => console.log('clicou!')}`);
  }

  const attrText = parts.length ? ' ' + parts.join(' ') : '';
  // JSX exige auto-fechamento para elementos vazios nativos (<br />, <input />).
  const close = selfClose || (ctx.fw === 'react' && VOID_TAGS.test(tag) ? ' /' : '');
  return `<${tag}${attrText}${close}>`;
}

export interface TagToken {
  tag: string;
  attrs: string;
  selfClose: boolean;
  close: boolean;
  /** Índice do `<` no HTML original. */
  start: number;
  /** Índice logo após o `>`. */
  end: number;
}

/**
 * Scanner linear de tags (sem regex com backtracking).
 *
 * Atributos com JSON (`data='[{"a":1}]'`) quebravam o regex por causa das
 * aspas aninhadas — o custo explodia e a página travava.
 */
export function scanTags(html: string): TagToken[] {
  const out: TagToken[] = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) break;
    const close = html[lt + 1] === '/';
    const nameStart = lt + (close ? 2 : 1);
    if (!/[a-zA-Z]/.test(html[nameStart] ?? '')) {
      i = lt + 1; // comentário, doctype, texto com '<'
      continue;
    }
    let j = nameStart;
    while (j < html.length && /[\w-]/.test(html[j]!)) j++;
    const tag = html.slice(nameStart, j).toLowerCase();
    let q: string | null = null;
    let k = j;
    for (; k < html.length; k++) {
      const ch = html[k]!;
      if (q) {
        if (ch === q) q = null;
        continue;
      }
      if (ch === '"' || ch === "'") q = ch;
      else if (ch === '>') break;
    }
    if (k >= html.length) break; // tag malformada: ignora o resto
    const rawAttrs = html.slice(j, k);
    const selfClose = !close && /\/\s*$/.test(rawAttrs);
    out.push({
      tag,
      attrs: selfClose ? rawAttrs.replace(/\/\s*$/, '') : rawAttrs,
      selfClose,
      close,
      start: lt,
      end: k + 1,
    });
    i = k + 1;
  }
  return out;
}

/** Converte todos os elementos do fragmento preservando texto e comentários. */
function convertMarkup(html: string, ctx: Ctx): string {
  let out = '';
  let last = 0;
  for (const t of scanTags(html)) {
    out += html.slice(last, t.start);
    out += t.close ? `</${t.tag}>` : openTag(t.tag, t.attrs, t.selfClose ? '/' : '', ctx);
    last = t.end;
  }
  return out + html.slice(last);
}

/** Quantos elementos de topo existem (o React precisa de um único retorno). */
function countRoots(html: string): number {
  let depth = 0;
  let roots = 0;
  for (const t of scanTags(html)) {
    if (t.close) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) roots++;
    if (!t.selfClose && !VOID_TAGS.test(t.tag)) depth++;
  }
  return roots;
}

function indent(block: string, pad: string): string {
  return block
    .split('\n')
    .map((l) => (l.trim() ? pad + l : l))
    .join('\n');
}

/** Imports dos subpaths dos componentes presentes no fragmento. */
export function importsForHtml(html: string, imports?: string[]): string[] {
  if (imports?.length) return imports;
  const tags = [...new Set([...html.matchAll(/<(fx-[a-z-]+)/g)].map((m) => m[1]!))];
  const lines = tags.map(
    (t) => `import '@wrrdev/fenix-ui/${SUBPATH_ALIAS[t] ?? t.replace(/^fx-/, '')}';`,
  );
  if (/\sicon="/.test(html)) lines.push(`import '@wrrdev/fenix-ui/icons';`);
  return lines;
}

/* ------------------------------------------------------------------ */
/* Saída por framework                                                 */
/* ------------------------------------------------------------------ */

function htmlCode(markup: string, header: string[], ctx: Ctx): string {
  const out = [header.join('\n'), '', markup];
  const first = ctx.binds[0];
  if (first) {
    out.push(
      '',
      '<script>',
      `  const el = document.querySelector('${first.tag}');`,
      `  el?.addEventListener('change', (e) => {`,
      `    console.log('novo valor:', e.detail.value); // CustomEvent composed`,
      `  });`,
      '</script>',
    );
  } else if (ctx.hasClick) {
    out.push(
      '',
      '<script>',
      `  document.querySelector('fx-button')?.addEventListener('click', () => {`,
      `    console.log('clicou!');`,
      `  });`,
      '</script>',
    );
  }
  return out.join('\n');
}

function vueCode(markup: string, header: string[], ctx: Ctx): string {
  const script = ['<script setup>'];
  if (ctx.binds.length) script.push(`import { ref } from 'vue';`);
  script.push(...header, `import '@wrrdev/fenix-ui/vue'; // tipos Volar (opcional)`);
  if (ctx.binds.length) {
    script.push('');
    for (const b of ctx.binds) script.push(`const ${b.name} = ref(${b.init});`);
  }
  if (ctx.hasClick) script.push('', 'function onClick() {', `  console.log('clicou!');`, '}');
  script.push('</script>');
  return (
    `${script.join('\n')}\n\n<template>\n${indent(markup, '  ')}\n</template>` +
    `\n\n<!-- vite.config/nuxt.config: isCustomElement = (tag) => tag.startsWith('fx-') -->`
  );
}

function reactCode(markup: string, header: string[], ctx: Ctx, roots: number): string {
  const states = ctx.binds.map(
    (b) => `  const [${b.name}, set${cap(b.name)}] = useState(${b.init});`,
  );
  const lines = [
    `import { useState } from 'react';`,
    ...header,
    `import '@wrrdev/fenix-ui/react'; // tipos TSX (opcional)`,
    '',
    `// O evento 'input' chega em custom elements em qualquer React (18/19): onInput + a`,
    `// propriedade value do host (o React 18 nao dispara onChange em custom element).`,
    `export function Exemplo() {`,
    ...states,
  ];
  if (states.length) lines.push('');
  const body =
    roots > 1
      ? `    <>\n${indent(markup, '      ')}\n    </>`
      : indent(markup, '    ');
  lines.push('  return (', body, '  );', '}');
  return lines.join('\n');
}

function angularCode(markup: string, header: string[], ctx: Ctx): string {
  const decls = ctx.binds.map((b) => `  ${b.name} = ${b.init}; // valor inicial`);
  const lines = [
    `// ngModel NAO funciona em Web Components e [(value)] NAO funciona (o $event e o`,
    `// CustomEvent): use [value] + (valueChange)="x = $event.detail.value".`,
    `import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';`,
    ...header,
    '',
    `@Component({`,
    `  selector: 'app-exemplo',`,
    `  standalone: true,`,
    `  schemas: [CUSTOM_ELEMENTS_SCHEMA],`,
    '  template: `',
    indent(markup, '    '),
    '  `,',
    `})`,
    `export class ExemploComponent {`,
    ...decls,
  ];
  if (decls.length) lines.push('');
  lines.push('  onClick() {', `    console.log('clicou!');`, '  }', '}');
  return lines.join('\n');
}

function svelteCode(markup: string, header: string[], ctx: Ctx): string {
  const script = ['<script>', ...header.map((l) => '  ' + l)];
  if (ctx.binds.length) {
    script.push('');
    // bind:value não compila em custom element (o Svelte só aceita
    // input/textarea/select) — use value + on:input com o detail do CustomEvent.
    for (const b of ctx.binds) script.push(`  let ${b.name} = ${b.init}; // bind: nao compila em WC`);
  }
  script.push('</script>');
  return `${script.join('\n')}\n\n${markup}`;
}

/* ------------------------------------------------------------------ */
/* API pública                                                         */
/* ------------------------------------------------------------------ */

/**
 * Gera as 5 versões de um FRAGMENTO HTML (um ou vários componentes) — é o
 * caminho usado pelos modelos de formulário e pelos casos de uso da Home.
 */
export function buildFragmentSnippets(opts: {
  html: string;
  imports?: string[];
  /** Inclui handler de clique nos `fx-button` (playground). */
  withClick?: boolean;
}): Record<FrameworkId, string> {
  const source = opts.html.trim();
  const header = importsForHtml(source, opts.imports);
  const withClick = opts.withClick === true;
  const render = (fw: FrameworkId): { markup: string; ctx: Ctx } => {
    const ctx: Ctx = { fw, used: new Map(), binds: [], hasClick: false, withClick };
    return { markup: convertMarkup(source, ctx), ctx };
  };
  const h = render('html');
  const v = render('vue');
  const r = render('react');
  const a = render('angular');
  const s = render('svelte');
  const roots = countRoots(source);
  return {
    html: htmlCode(h.markup, header, h.ctx),
    vue: vueCode(v.markup, header, v.ctx),
    react: reactCode(r.markup, header, r.ctx, roots),
    angular: angularCode(a.markup, header, a.ctx),
    svelte: svelteCode(s.markup, header, s.ctx),
  };
}

/** Compat: playground (um componente, já formatado). */
export function buildSnippets(opts: {
  tag: string;
  imports: string[];
  prettyHtml: string;
  rawHtml: string;
  events?: { name: string }[];
}): Record<FrameworkId, string> {
  return buildFragmentSnippets({ html: opts.prettyHtml, imports: opts.imports, withClick: true });
}

/** Compat: cards de caso de uso. */
export function buildSnippetsForHtml(opts: {
  tag: string;
  imports: string[];
  html: string;
  events?: { name: string }[];
}): Record<FrameworkId, string> {
  return buildFragmentSnippets({ html: opts.html, imports: opts.imports });
}

/** Snippets pendentes por grupo de abas (as abas inativas são preenchidas ao clicar). */
const PENDING = new Map<string, Record<FrameworkId, string>>();
let tabsSeq = 0;

/** Bloco de abas (contrato: `.fw-tabs > button[data-fw]` + `.fw-pane[data-pane]`). */
export function frameworkTabsHtml(snippets: Record<FrameworkId, string>, active: FrameworkId = 'html'): string {
  // Só a aba ativa nasce renderizada: 5x menos DOM por card (páginas pesadas
  // como fx-table geram muitos exemplos).
  const id = `fw${++tabsSeq}`;
  if (PENDING.size > 400) PENDING.clear(); // teto de memória (navegação longa)
  PENDING.set(id, snippets);
  const buttons = FRAMEWORKS.map(
    (f) =>
      `<button type="button" class="fw-tab${f.id === active ? ' active' : ''}" data-fw="${f.id}" role="tab" aria-selected="${f.id === active ? 'true' : 'false'}">${f.label}</button>`,
  ).join('');
  const panes = FRAMEWORKS.map((f) => {
    const on = f.id === active;
    return (
      `<div class="fw-pane" data-pane="${f.id}" data-fw-group="${id}" data-fw-filled="${on ? '1' : '0'}"${on ? '' : ' hidden'}>` +
      `${on ? codeBlock(snippets[f.id] ?? '') : ''}</div>`
    );
  }).join('');
  return (
    `<div class="fw-tabs" role="tablist" data-fw-group="${id}" aria-label="Exemplo por framework">${buttons}</div>` +
    `<div class="fw-panes">${panes}</div>`
  );
}

export function readSavedFramework(): FrameworkId {
  try {
    const raw = localStorage.getItem(FRAMEWORK_STORAGE_KEY) as FrameworkId | null;
    if (raw && FRAMEWORKS.some((f) => f.id === raw)) return raw;
  } catch {
    /* storage indisponível */
  }
  return 'html';
}

/** Troca de abas + persistência em localStorage (mesmo padrão da sidebar). */
export function wireFrameworkTabs(root: ParentNode): void {
  const scope = root as HTMLElement;
  const bars = [...(scope.querySelectorAll?.('.fw-tabs') ?? [])] as HTMLElement[];
  for (const bar of bars) {
    if (bar.dataset.fwWired === '1') continue; // idempotente: refresh() recria os botões
    bar.dataset.fwWired = '1';
    const group = bar.dataset.fwGroup ?? '';
    const btns = [...bar.querySelectorAll<HTMLButtonElement>('.fw-tab')];
    const container = bar.parentElement ?? scope;
    // Escopado ao grupo: evita pegar painéis de OUTRO card no mesmo container.
    const panes = [
      ...container.querySelectorAll<HTMLElement>(`.fw-pane[data-fw-group="${group}"]`),
    ];
    const snippets = PENDING.get(group);
    const activate = (id: FrameworkId): void => {
      btns.forEach((b) => {
        const on = b.dataset.fw === id;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panes.forEach((p) => {
        const on = p.dataset.pane === id;
        if (on) {
          p.removeAttribute('hidden');
          // Preenche o painel na 1ª visualização (lazy).
          if (p.dataset.fwFilled !== '1') {
            p.innerHTML = codeBlock(snippets?.[id] ?? '');
            p.dataset.fwFilled = '1';
            wireCodeCopy(p);
          }
        } else {
          p.setAttribute('hidden', '');
        }
      });
      if (panes.every((p) => p.dataset.fwFilled === '1')) PENDING.delete(group);
      try {
        localStorage.setItem(FRAMEWORK_STORAGE_KEY, id);
      } catch {
        /* ignora */
      }
    };
    const saved = readSavedFramework();
    if (saved !== 'html') activate(saved);
    btns.forEach((b) =>
      b.addEventListener('click', () => activate((b.dataset.fw as FrameworkId) ?? 'html')),
    );
  }
}

