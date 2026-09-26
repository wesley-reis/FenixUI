/**
 * Documentação interativa do FenixUI.
 *
 * SPA sem framework (hash routing) no
 *  - navegação lateral por componente;
 *  - playground por componente com controles ao vivo;
 *  - tabelas de API (atributos, slots, eventos);
 *  - seletor de tema (preset × modo claro/escuro) refletindo na hora,
 *    pois os componentes leem CSS Custom Properties (`--fx-*`).
 */

import { fenixComponentMap } from '../plugins/auto-import';
import { applyPreset, listPresets, defineCustomPreset, type FenixPreset } from '../core/presets';
import { FenixUI } from '../core/theme';
import type { DeepPartial, FenixTokens } from '../core/tokens';
import { componentDocs, componentLoaders } from './componentes';
import { FENIX_ICON_NAMES } from '../icons';
export { componentLoaders };
import { esc } from './shared';
import type { ApiRow, ComponentDoc } from './types';
import { defineFxTooltipDirective } from '../components/tooltip/directive';

/** Versão do pacote, injetada em build via `define` (vite.docs.config.ts / vite.config.ts). */
declare const __APP_VERSION__: string;

/* Metadados dos componentes vivem em ./componentes/*.doc.ts (registro lazy em
   ./componentes/index.ts) — um arquivo por componente. */

const components: ComponentDoc[] = componentDocs;

/* ------------------------------------------------------------------ */
/* Helpers de renderização                                             */
/* ------------------------------------------------------------------ */

/**
 * Re-inicializa componentes que precisam de parse de JSON via JavaScript.
 * Quando o innerHTML é definido, o connectedCallback é chamado, mas pode haver
 * race conditions com o parse de atributos JSON. Esta função força a re-inicialização.
 */
function initDataComponents(container: HTMLElement): void {
  // OrderList - re-inicializa com dados do atributo 'data'
  container.querySelectorAll('fx-orderlist').forEach((el) => {
    const dataAttr = el.getAttribute('data');
    if (dataAttr) {
      try {
        const data = JSON.parse(dataAttr);
        (el as any).data = data;
      } catch { /* ignora parse inválido */ }
    }
  });

  // Table - re-inicializa com dados do atributo 'data'
  container.querySelectorAll('fx-table').forEach((el) => {
    const dataAttr = el.getAttribute('data');
    if (dataAttr) {
      try {
        const data = JSON.parse(dataAttr);
        (el as any).data = data;
      } catch { /* ignora parse inválido */ }
    }
  });

  // PickList - re-inicializa com dados dos atributos 'source' e 'target'
  container.querySelectorAll('fx-picklist').forEach((el) => {
    const sourceAttr = el.getAttribute('source');
    const targetAttr = el.getAttribute('target');
    if (sourceAttr) {
      try {
        const source = JSON.parse(sourceAttr);
        (el as any).source = source;
      } catch { /* ignora parse inválido */ }
    }
    if (targetAttr) {
      try {
        const target = JSON.parse(targetAttr);
        (el as any).target = target;
      } catch { /* ignora parse inválido */ }
    }
  });
}

/**
 * Tokenizador de sintaxe leve para HTML/TS — envolve tokens em <span class>
 * usando as CSS Variables do FenixUI (--fx-*), então as cores acompanham
 * light/dark automaticamente. O texto fora dos tokens passa por `esc`.
 */
export function highlightCode(code: string): string {
  // Ordem importa: comentários e tags primeiro; strings e keywords depois.
  const RE =
    /<!--[\s\S]*?-->|<\/?[\w-]+(?:"[^"]*"|'[^']*'|[^>"'])*\/?>|\/\*[\s\S]*?\*\/|\/\/[^\n\r]*|`[^`]*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\b(?:import|from|const|let|var|export|function|return|new|if|else|await|async|type|interface)\b/g;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(code)) !== null) {
    if (m.index > last) parts.push(esc(code.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('<!--') || tok.startsWith('/*') || tok.startsWith('//')) {
      parts.push(`<span class="tok-comment">${esc(tok)}</span>`);
    } else if (tok.startsWith('<')) {
      parts.push(highlightTag(tok));
    } else if (tok.startsWith('`') || tok.startsWith("'") || tok.startsWith('"')) {
      parts.push(`<span class="tok-string">${esc(tok)}</span>`);
    } else {
      parts.push(`<span class="tok-keyword">${esc(tok)}</span>`);
    }
    last = RE.lastIndex;
  }
  if (last < code.length) parts.push(esc(code.slice(last)));
  return parts.join('');
}

/**
 * Destaca nome da tag, atributos e valores de uma tag HTML.
 *
 * O espaço entre o nome da tag e o primeiro atributo fica dentro do grupo
 * `rest` (e é reemitido) — sem isso o código exibido sairia "colado":
 * `<fx-inputfull icon="search">`.
 */
function highlightTag(tag: string): string {
  // Tag de fechamento: </tag>
  if (tag.startsWith('</')) {
    const m = tag.match(/^<\/\s*([\w-]+)/);
    return m
      ? `<span class="tok-tag">&lt;/</span><span class="tok-tagname">${esc(m[1])}</span><span class="tok-tag">&gt;</span>`
      : esc(tag);
  }
  // Tag de abertura / self-closing: <tag attr="v" flag />
  const m = tag.match(/^<([\w-]+)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?>)$/);
  if (!m) return esc(tag);
  const [, name, rest, close] = m;
  let html = `<span class="tok-tag">&lt;</span><span class="tok-tagname">${esc(name)}</span>`;
  // Atributos: mantém o espaço inicial, o `=`, o valor e flags booleanas.
  const RE_ATTR = /(\s+)([\w-]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g;
  let last = 0;
  let am: RegExpExecArray | null;
  while ((am = RE_ATTR.exec(rest)) !== null) {
    if (am.index > last) html += esc(rest.slice(last, am.index));
    html += `<span class="tok-attr">${esc(am[1])}${esc(am[2])}</span>`;
    if (am[3] !== undefined) {
      html += `<span class="tok-attr-eq">=</span><span class="tok-attr-val">${esc(am[3])}</span>`;
    }
    last = RE_ATTR.lastIndex;
  }
  if (last < rest.length) html += esc(rest.slice(last));
  html += `<span class="tok-tag">${esc(close)}</span>`;
  return html;
}

function codeBlock(code: string): string {
  return (
    `<div class="code-block">` +
    `<div class="code-head"><button class="copy-btn">Copiar</button></div>` +
    `<pre><code>${highlightCode(code)}</code></pre>` +
    `</div>`
  );
}

/** Formata HTML em múltiplas linhas com indentação para facilitar a leitura. */
const VOID_TAGS = /^(input|br|hr|img|meta|link)\b/i;
export function formatHtml(src: string): string {
  const tokens = src
    .trim()
    .replace(/>\s+</g, '><')
    .match(/<[^>]+>|[^<]+/g);
  if (!tokens) return src;
  const lines: string[] = [];
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    const pad = '  '.repeat(depth);
    if (tk.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      lines.push('  '.repeat(depth) + tk);
      continue;
    }
    if (!tk.startsWith('<')) {
      const text = tk.trim();
      if (text) lines.push(pad + text);
      continue;
    }
    // tag de abertura
    const name = (tk.match(/^<([a-zA-Z-]+)/)?.[1] ?? '').toLowerCase();
    const isVoid = VOID_TAGS.test(name) || tk.endsWith('/>');
    const next = tokens[i + 1];
    if (!isVoid && next === `</${name}>`) {
      // elemento com conteúdo simples abre e fecha na mesma linha
      lines.push(`${pad}${tk}${next}`);
      i++;
      continue;
    }
    lines.push(pad + tk);
    if (!isVoid) depth++;
  }
  return lines.join('\n');
}


/** Coluna de tabela de API: rótulo + célula derivada da linha. */
type ApiColumn = [label: string, cell: (row: ApiRow) => string];

const API_NAME = (r: ApiRow): string => `<td><code class="inline">${esc(r.name)}</code></td>`;
const API_TYPE = (r: ApiRow): string => (r.type ? `<td class="type">${esc(r.type)}</td>` : '<td>—</td>');
const API_DEFAULT = (r: ApiRow): string => (r.default ? `<td class="default">${esc(r.default)}</td>` : '<td>—</td>');
const API_DESC = (r: ApiRow): string => `<td>${r.desc}</td>`;

/**
 * Monta as colunas de uma tabela de API com rótulos adequados ao contexto.
 * Colunas opcionais omitidas (ex.: eventos não têm "Padrão") simplesmente não
 * são renderizadas — evita colunas sempre vazias ("—") na documentação.
 */
function columns(labels: {
  name: string;
  type?: string;
  default?: string;
  desc?: string;
}): ApiColumn[] {
  const cols: ApiColumn[] = [[labels.name, API_NAME]];
  if (labels.type) cols.push([labels.type, API_TYPE]);
  if (labels.default) cols.push([labels.default, API_DEFAULT]);
  cols.push([labels.desc ?? 'Descrição', API_DESC]);
  return cols;
}

/** Atributos/propriedades e variáveis CSS: Nome | Tipo | Padrão | Descrição. */
const COLS_ATTR = columns({ name: 'Nome', type: 'Tipo', default: 'Padrão' });
/** Eventos não têm valor padrão: Evento | Tipo | Descrição. */
const COLS_EVENT = columns({ name: 'Evento', type: 'Tipo' });
/** Slots só têm nome e descrição. */
const COLS_SLOT = columns({ name: 'Slot' });
/** Variáveis CSS: Variável | Tipo | Padrão | Descrição. */
const COLS_CSSVAR = columns({ name: 'Variável', type: 'Tipo', default: 'Padrão' });

function apiTable(title: string, rows: ApiRow[], cols: ApiColumn[]): string {
  const head = cols.map(([label]) => `<th>${label}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${cols.map(([, cell]) => cell(r)).join('')}</tr>`)
    .join('');
  return `<h3>${title}</h3><table class="api"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function buildControls(doc: ComponentDoc): string {
  return doc.controls
    .map((c) => {
      if (c.kind === 'select') {
        const opts = c.options!
          .map((o) => `<option value="${o}" ${o === c.value ? 'selected' : ''}>${o}</option>`)
          .join('');
        return `<label>${c.label}: <fx-select data-attr="${c.attr}" value="${c.value}">${opts}</fx-select></label>`;
      }
      if (c.kind === 'text') {
        return `<label>${c.label}: <fx-input data-attr="${c.attr}" placeholder="${c.hint ?? ''}"></fx-input></label>`;
      }
      return `<fx-switch data-attr="${c.attr}" size="sm" ${c.on ? 'checked' : ''}>${c.label}</fx-switch>`;
    })
    .join('');
}

function currentAttrs(doc: ComponentDoc): string {
  return doc.controls
    .map((c) => {
      if (c.kind === 'select') {
        const sel = document.querySelector(`fx-select[data-attr="${c.attr}"]`) as any;
        return `${c.attr}="${sel?.value ?? c.value}"`;
      }
      if (c.kind === 'text') {
        const inp = document.querySelector(`fx-input[data-attr="${c.attr}"]`) as any;
        const v = inp?.value ?? '';
        return v ? `${c.attr}="${v}"` : '';
      }
      const sw = document.querySelector(`fx-switch[data-attr="${c.attr}"]`) as any;
      return sw?.checked ? c.attr : '';
    })
    .filter(Boolean)
    .join(' ');
}

function wireCopyButtons(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      // O botão vive na barra (.code-head); o código está no mesmo .code-block.
      const block = btn.closest('.code-block');
      const text = block?.querySelector('code')?.textContent ?? '';
      navigator.clipboard?.writeText(text).catch(() => { /* clipboard indisponível */ });
      btn.textContent = 'Copiado!';
      setTimeout(() => (btn.textContent = 'Copiar'), 1200);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Página: Home (landing moderna)                                      */
/* ------------------------------------------------------------------ */

/** Componentes usados no showcase da home (carga lazy). */
const HOME_TAGS = [
  'fx-button', 'fx-badge', 'fx-input', 'fx-switch', 'fx-floatlabel',
  'fx-progress', 'fx-knob', 'fx-stepper',
];

async function renderHome(): Promise<void> {
  await Promise.all(HOME_TAGS.map((t) => componentLoaders[t]?.()));
  await Promise.all(HOME_TAGS.map((t) => customElements.whenDefined(t)));
  const main = document.getElementById('main')!;
  const version = typeof __APP_VERSION__ !== 'undefined' ? `v${__APP_VERSION__}` : '';
  main.innerHTML = `
    <section class="home-hero">
      <div class="hero-eyebrow">
        <fx-badge variant="warning" round>${version}</fx-badge>
        <span>Web Components nativos · Shadow DOM · Design Tokens</span>
      </div>
      <h1 class="hero-title">Componentes que <span class="hero-grad">renascem</span> em qualquer stack.</h1>
      <p class="hero-lead">FenixUI é um Design System de <strong>Web Components nativos</strong>: funciona com
      Vue, React, Nuxt, JSF ou HTML puro — sem lock-in. Cada componente é importável isoladamente,
      então o bundle do cliente contém apenas o que ele usa.</p>
      <div class="hero-cta">
        <fx-button id="hero-get-started" size="lg"><i slot="icon" class="fx-icon fx-icon-rocket_launch"></i>Get Started</fx-button>
        <a class="hero-link" href="#/fx-button">Ver componentes <span class="fx-icon fx-icon-arrow_outward"></span></a>
      </div>
    </section>

    <section class="home-section">
      <h3 class="home-section-title">Por que FenixUI?</h3>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon"><span class="fx-icon fx-icon-bolt"></span></div>
          <b>Web Components nativos</b>
          <p>Shadow DOM, zero dependências e compatível com qualquer framework — ou nenhum.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><span class="fx-icon fx-icon-layers"></span></div>
          <b>Tree-shaking por componente</b>
          <p>Cada componente tem seu próprio subpath: só entra no bundle o que a aplicação usa.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><span class="fx-icon fx-icon-palette"></span></div>
          <b>Design Tokens & temas</b>
          <p>Visual dirigido por <code class="inline">--fx-*</code>: troque de tema em runtime, inclusive dentro do Shadow DOM.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><span class="fx-icon fx-icon-dark_mode"></span></div>
          <b>Dark mode nativo</b>
          <p>Modo claro/escuro com uma linha: <code class="inline">FenixUI.theme('dark')</code>.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><span class="fx-icon fx-icon-auto_awesome"></span></div>
          <b>Ícones inclusos</b>
          <p>Biblioteca self-hosted com milhares de glifos — nada para instalar além do pacote.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><span class="fx-icon fx-icon-extension"></span></div>
          <b>Auto Import</b>
          <p>Escreva as tags <code class="inline">fx-*</code> e o plugin injeta os imports em tempo de build.</p>
        </div>
      </div>
    </section>

    <section class="home-section">
      <h3 class="home-section-title">Casos de uso</h3>
      <div class="usecase-grid">
        <div class="usecase-card">
          <div class="usecase-preview">
            <div class="uc-stat"><b>87%</b><span class="uc-label">Meta do mês</span><fx-progress value="87" variant="success"></fx-progress></div>
            <div class="uc-stat"><b>1.2k</b><span class="uc-label">Visitas hoje</span><fx-progress value="62" variant="success"></fx-progress></div>
            <fx-knob></fx-knob>
          </div>
          <b>Dashboards & painéis</b>
          <p>Tabelas, indicadores e métricas com visual consistente e temas em runtime.</p>
          <a href="#/fx-table">Ver fx-table <span class="fx-icon fx-icon-arrow_forward"></span></a>
        </div>
        <div class="usecase-card">
          <div class="usecase-preview">
            <div class="uc-form">
              <fx-floatlabel variant="in"><fx-input full icon="mail" type="email"></fx-input><label>E-mail</label></fx-floatlabel>
              <fx-floatlabel variant="in"><fx-input full icon="lock" type="password"></fx-input><label>Senha</label></fx-floatlabel>
              <fx-switch size="sm" checked>Lembrar-me</fx-switch>
              <fx-button size="sm" variant="primary">Entrar</fx-button>
            </div>
          </div>
          <b>Formulários completos</b>
          <p>FloatLabel, validação, upload e autocomplete prontos para qualquer cadastro.</p>
          <a href="#/forms">Ver Formulários <span class="fx-icon fx-icon-arrow_forward"></span></a>
        </div>
        <div class="usecase-card">
          <div class="usecase-preview">
            <div class="uc-wizard">
              <fx-stepper active="1" style="width:100%">
                <div slot="step-0" step-title="Conta"><p>Crie sua conta.</p></div>
                <div slot="step-1" step-title="Pagamento"><p>Escolha a forma de pagamento.</p></div>
                <div slot="step-2" step-title="Confirmação"><p>Revise e confirme.</p></div>
              </fx-stepper>
            </div>
          </div>
          <b>Wizards & fluxos multi-etapa</b>
          <p>Stepper com navegação integrada para checkout e onboarding, pronto para usar.</p>
          <a href="#/fx-stepper">Ver fx-stepper <span class="fx-icon fx-icon-arrow_forward"></span></a>
        </div>
      </div>
    </section>

    <section class="home-cta">
      <h3>Pronto para renascer?</h3>
      <p>Instale em segundos e use em qualquer stack — comece agora.</p>
      <fx-button id="home-cta-button" size="lg" variant="secondary"><i slot="icon" class="fx-icon fx-icon-rocket_launch"></i>Get Started</fx-button>
    </section>
  `;
  const goInstall = (): void => {
    window.location.hash = '#/installation';
  };
  document.getElementById('hero-get-started')?.addEventListener('click', goInstall);
  document.getElementById('home-cta-button')?.addEventListener('click', goInstall);
}

/* ------------------------------------------------------------------ */
/* Página: Instalação (cards por stack)                                */
/* ------------------------------------------------------------------ */

/** Logos em SVG inline das stacks com marca própria (Vue, React, Nuxt). */
const INSTALL_SVGS: Record<string, string> = {
  vue: '<svg viewBox="0 0 256 221" width="30" height="26" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z"/><path fill="#41B883" d="m0 0 128 220.8L256 0h-51.2L128 132.48 50.56 0H0Z"/><path fill="#35495E" d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z"/></svg>',
  react: '<svg viewBox="-11.5 -10.23174 23 20.46348" width="30" height="27" xmlns="http://www.w3.org/2000/svg"><circle r="2.05" fill="#61dafb"/><g stroke="#61dafb" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>',
  nuxt: '<svg viewBox="0 0 221 121" width="32" height="26" xmlns="http://www.w3.org/2000/svg"><path fill="#00DC82" d="M130.7 121h79.1c2.5 0 4.9-.6 7-1.9a13.9 13.9 0 0 0 5.1-19.1l-44.8-77.4a13.9 13.9 0 0 0-24.1 0l-11.4 19.8-22.3-38.5a13.9 13.9 0 0 0-24.2 0L.9 100a13.9 13.9 0 0 0 5.1 19.1c2.2 1.3 4.6 1.9 7.1 1.9h49.6c19.7 0 34.3-8.6 44.3-25.4l24.3-41.8 13-22.3 39 41.9h-56.5L130.7 121ZM63.4 103.5H22.1l62.7-107.3 31.2 53.7-20.9 34.9c-6.7 10.7-14.1 18.7-31.7 18.7Z"/></svg>',
};

/** Ícone Fenix + cor de destaque para stacks sem logo SVG. */
const INSTALL_FX_ICONS: Record<string, { icon: string; color: string }> = {
  npm: { icon: 'package', color: '#cb3837' },
  cdn: { icon: 'cloud', color: '#f59e0b' },
  jsf: { icon: 'globe', color: '#0ea5e9' },
  dotnet: { icon: 'code', color: '#8b5cf6' },
};

/** Card de instalação: ícone + nome + descrição, clicável, leva à página da stack. */
function installCard(href: string, key: string, name: string, desc: string): string {
  const svg = INSTALL_SVGS[key];
  const fx = INSTALL_FX_ICONS[key];
  const icon = svg
    ? `<div class="install-icon">${svg}</div>`
    : `<div class="install-icon" style="color:${fx.color}"><span class="fx-icon fx-icon-${fx.icon}"></span></div>`;
  return (
    `<a class="install-card" href="${href}">` +
    icon +
    `<div class="install-body"><div class="install-name">${esc(name)}</div><div class="install-desc">${esc(desc)}</div></div>` +
    `<span class="install-arrow fx-icon fx-icon-arrow_forward"></span>` +
    `</a>`
  );
}

/** Página Instalação — comando universal inline + cards que levam a cada stack. */
async function renderInstallation(): Promise<void> {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>Instalação</h2>
    <p class="lead">Um único pacote em qualquer projeto. O comando abaixo é o ponto de partida —
    depois, escolha sua stack nos cards para o passo a passo completo com o setup específico:</p>
    ${codeBlock('npm install @wrrdev/fenix-ui')}
    <div class="note"><strong>Uso básico</strong> — importe o componente, aplique os tokens e pronto:</div>
    ${codeBlock("import '@wrrdev/fenix-ui/button';\nimport { FenixUI } from '@wrrdev/fenix-ui';\n\nFenixUI.theme('dark');")}
    <h3>Escolha sua stack</h3>
    <div class="install-grid">
      ${installCard('#/vue3', 'vue', 'Vue 3', 'Plugin isCustomElement + tipos Volar e reatividade plena.')}
      ${installCard('#/vue3', 'nuxt', 'Nuxt', 'compilerOptions no nuxt.config + plugin .client.ts para SSR.')}
      ${installCard('#/integrations', 'react', 'React / Next.js', 'React 19+ nativo; <19 com ref + addEventListener.')}
      ${installCard('#/integrations', 'cdn', 'CDN / HTML puro', 'Bundle UMD único via jsDelivr/unpkg — sem build.')}
      ${installCard('#/integrations', 'jsf', 'JSF (Jakarta Faces)', 'XHTML bem-formado + h:outputScript no template.')}
      ${installCard('#/integrations', 'dotnet', 'JSP / .NET', 'Razor, WebForms e MVC: HTML normal nas views.')}
    </div>
    <div class="note"><strong>Gerenciadores alternativos:</strong> <code class="inline">pnpm add @wrrdev/fenix-ui</code> ·
    <code class="inline">yarn add @wrrdev/fenix-ui</code> — o pacote é o mesmo.</div>
    <h3>Componentes</h3>
    <p>Consulte cada componente no menu lateral para exemplos interativos, playground ao vivo e API completa.</p>
  `;
  wireCopyButtons(main);
}

async function renderTheming(): Promise<void> {
  // Componentes usados nos previews desta página (carga lazy).
  const tags = ['fx-button', 'fx-badge', 'fx-spinner', 'fx-input', 'fx-select', 'fx-switch'];
  await Promise.all(tags.map((t) => componentLoaders[t]?.()));
  await Promise.all(tags.map((t) => customElements.whenDefined(t)));
  const main = document.getElementById('main')!;
  const presetsList = listPresets()
    .map((p) => `<option value="${p.name}" ${p.name === currentPreset ? 'selected' : ''}>${p.label}</option>`)
    .join('');
  main.innerHTML = `
    <h2>Temas</h2>
    <p class="lead">Todo o visual é dirigido por Design Tokens expostos como CSS Custom Properties
    (<code class="inline">--fx-*</code>) no <code class="inline">:root</code>. Trocar de tema em runtime
    atualiza todos os componentes instantaneamente — inclusive dentro do Shadow DOM.</p>
    <h3>Presets prontos (Cavaleiros do Zodíaco)</h3>
    <p>Escolha um preset e o modo no topo da página — a mudança reflete em toda a documentação imediatamente.
    Qualquer preset pode ser usado diretamente na sua aplicação:</p>
    <div class="demo"><div class="demo-controls" style="border:none">
      <label>Preset: <fx-select id="th-preset">${presetsList}</fx-select></label>
      <label>Modo: <fx-select id="th-mode"><option value="light" ${currentMode === 'light' ? 'selected' : ''}>light</option><option value="dark" ${currentMode === 'dark' ? 'selected' : ''}>dark</option></fx-select></label>
    </div></div>
    ${codeBlock(`import { applyPreset } from '@wrrdev/fenix-ui';

// Presets disponíveis:
applyPreset('fenix',  'light'); // padrão (indigo)
applyPreset('seiya',  'light'); // rose/coral
applyPreset('shiryu', 'dark');  // teal/esmeralda
applyPreset('hyoga',  'light'); // azul-gelo
applyPreset('shun',   'dark');  // magenta, cantos em pílula
applyPreset('ikki',   'light'); // laranja fogo, cantos retos
applyPreset('aiolia', 'dark');  // âmbar/dourado`)}

    <h4>Usar um tema como base e mudar só o que quiser</h4>
    <p>O preset define o ponto de partida; depois, sobrescreva apenas os tokens desejados
    (merge profundo — nada do que não for informado é alterado):</p>
    ${codeBlock(`import { applyPreset, FenixUI } from '@wrrdev/fenix-ui';

// Base Shiryu (teal)…
applyPreset('shiryu', 'dark');
// …mas com a cor primária e o raio da sua marca:
FenixUI.setTokens({
  color: { primary: '#8b5cf6' },
  radius: { md: '16px' },
});`)}
    <h3>Preview dos componentes neste tema</h3>
    <p>Troque o preset acima e veja botões, campos e seletores repintarem na hora.</p>
    <div class="demo"><div class="demo-stage" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
      <fx-button variant="primary">Primário</fx-button>
      <fx-button variant="secondary">Secundário</fx-button>
      <fx-button variant="danger">Perigo</fx-button>
      <fx-button variant="outline">Outline</fx-button>
      <fx-badge variant="success">Ativo</fx-badge>
      <fx-spinner></fx-spinner>
      <fx-input placeholder="Nome completo"></fx-input>
      <fx-input type="number" placeholder="Idade"></fx-input>
      <fx-select><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option></fx-select>
      <fx-switch>Notificações</fx-switch>
    </div></div>
    <h3>Tudo que pode ser personalizado</h3>
    <p>Cada grupo abaixo é um conjunto de CSS Custom Properties (<code class="inline">--fx-*</code>) que
    os componentes consomem. No preset, sobrescreva <strong>apenas o que quiser</strong> — o restante
    herda do tema base (claro ou escuro) automaticamente.</p>
    ${apiTable(
      'Grupos de tokens',
      [
        { name: 'color', type: 'primary, secondary, success, warning, danger, info', default: 'paleta indigo', desc: 'Cores semânticas usadas por todos os componentes.' },
        { name: 'surface', type: 'background, surface, surface-hover', default: 'branco / cinza-50', desc: 'Fundos de página, campos e estados hover.' },
        { name: 'text', type: 'default, muted, disabled', default: 'slate-900/500/400', desc: 'Cores de texto e placeholders.' },
        { name: 'border', type: 'default, hover', default: 'cinza-200/300', desc: 'Bordas de campos, cards e divisores.' },
        { name: 'font', type: 'family, size, weight, line-height', default: 'Inter 14px 500', desc: 'Tipografia global.' },
        { name: 'space', type: 'xs…xl', default: '4–24px', desc: 'Espaçamentos internos.' },
        { name: 'radius', type: 'none, sm, md, lg, full', default: '0–9999px', desc: 'Arredondamento (botões, campos, badges…).' },
        { name: 'size', type: 'sm, md, lg', default: '32 / 40 / 48px', desc: 'Altura EXATA dos controles (button, input, select, multiselect, datepicker…) — mesmo valor para todos os campos no mesmo size; personalize a escala no preset.' },
        { name: 'shadow', type: 'sm, md, lg', default: 'elevações suaves', desc: 'Sombras de elevação.' },
        { name: 'motion', type: 'duration-fast, duration-normal, easing', default: '120/240ms', desc: 'Velocidade e curva das transições.' },
        { name: 'effect', type: `ripple ('1'/'0'), focus-ring, error-ring, success-ring`, default: 'ligados', desc: 'Ripple do botão, anel de foco e brilhos de validação. error-ring/success-ring acompanham focus-ring: desligado ⇒ validação apenas com a borda vermelha/verde (sem brilho).' },
        { name: 'z', type: 'base, dropdown, modal, toast', default: '1000–1200', desc: 'Camadas de sobreposição.' },
      ],
      columns({ name: 'Grupo', type: 'Chaves', default: 'Padrão' }),
    )}
    ${codeBlock("// O preset só precisa do que for diferente do tema base:\nFenixUI.setTokens({\n  color: { primary: '#0d9488' },   // só a cor primária muda\n  effect: { 'focus-ring': 'none' }, // campos sem anel de foco\n  size: { lg: '52px' },             // só o tamanho lg fica maior\n});")}
    <h3>API de tema</h3>
    ${apiTable('Métodos', [
      { name: 'FenixUI.theme(name)', type: `name: 'light' | 'dark'`, desc: 'Troca o modo de cor em runtime.' },
      { name: 'FenixUI.setTokens(tokens)', type: 'DeepPartial<FenixTokens>', desc: 'Override parcial profundo (ex.: só color.primary).' },
      { name: 'FenixUI.configure(options)', type: 'ConfigureOptions', desc: 'Configuração combinada; retorna o estado ativo.' },
      { name: 'FenixUI.resetTheme()', type: '', desc: 'Volta ao tema claro padrão, sem overrides.' },
      { name: 'applyPreset(preset, mode)', type: `preset: string, mode: 'light' | 'dark'`, desc: 'Aplica um preset nomeado + modo.' },
    ], columns({ name: 'Método', type: 'Tipo' }))}
    <h3>Tokens ativos agora</h3>
    <div class="swatches" id="swatches"></div>
    ${codeBlock("// Override customizado\nFenixUI.setTokens({\n  color: { primary: '#0d9488' },\n  radius: { md: '16px' },\n});")}
    <h3>Crie seu próprio tema</h3>
    <p>Personalize as cores, veja o preview ao vivo nos componentes abaixo e <strong>baixe o preset</strong>
    com o nome que escolher. O arquivo <code class="inline">.fenix-preset.json</code> pode ser carregado na
    aplicação via <code class="inline">defineCustomPreset()</code>.</p>
    <div class="demo">
      <div class="demo-controls" style="border:none">
        <label>Nome do tema: <fx-input id="cp-name" value="meu-tema"></fx-input></label>
        <label>Rótulo: <fx-input id="cp-label" value="✨ Meu Tema"></fx-input></label>
      </div>
      <div class="demo-controls">
        ${['primary', 'secondary', 'success', 'warning', 'danger', 'info']
          .map((c) => `<label>${c}: <input type="color" data-cp-color="${c}" style="width:2.2rem;height:1.6rem;padding:0;border:none;background:none;cursor:pointer" /></label>`)
          .join('')}
        <label>Arredondamento:
          <fx-select id="cp-radius" value="8px">
            <option value="0">Nenhum (retas)</option>
            <option value="4px">Pequeno</option>
            <option value="8px">Médio</option>
            <option value="16px">Grande</option>
            <option value="9999px">Pílula</option>
          </fx-select>
        </label>
        <label>Tamanho sm:
          <fx-select id="cp-size-sm" value="32px">
            <option value="28px">Compacto (28px)</option>
            <option value="32px">Padrão (32px)</option>
            <option value="36px">Confortável (36px)</option>
          </fx-select>
        </label>
        <label>Tamanho md:
          <fx-select id="cp-size-md" value="40px">
            <option value="34px">Compacto (34px)</option>
            <option value="40px">Padrão (40px)</option>
            <option value="44px">Confortável (44px)</option>
          </fx-select>
        </label>
        <label>Tamanho lg:
          <fx-select id="cp-size-lg" value="48px">
            <option value="42px">Compacto (42px)</option>
            <option value="48px">Padrão (48px)</option>
            <option value="56px">Confortável (56px)</option>
          </fx-select>
        </label>
        <label><fx-switch id="cp-focus-ring" checked>Anel de foco nos campos</fx-switch></label>
        <label><fx-switch id="cp-ripple" checked>Efeito ripple no botão</fx-switch></label>
      </div>
      <div class="demo-stage" id="cp-preview"></div>
      <div class="demo-controls" style="border-top:1px dashed var(--fx-border-default)">
        <fx-button id="cp-download" variant="primary">⬇️ Baixar preset (.json)</fx-button>
        <span id="cp-status" style="color:var(--fx-text-muted);font-size:.82rem"></span>
      </div>
    </div>
    ${codeBlock(
      "// Usando o preset baixado na sua aplicação:\nimport { defineCustomPreset, applyPreset } from '@wrrdev/fenix-ui';\nimport meuTema from './meu-tema.fenix-preset.json';\n\ndefineCustomPreset(meuTema.name, meuTema.label, meuTema.tokens);\napplyPreset('meu-tema', 'dark');",
    )}
  `;
  const paint = (): void => {
    const cs = getComputedStyle(document.documentElement);
    const names = ['--fx-color-primary', '--fx-color-secondary', '--fx-color-success', '--fx-color-warning', '--fx-color-danger', '--fx-color-info', '--fx-surface-surface', '--fx-surface-background', '--fx-text-default', '--fx-border-default'];
    document.getElementById('swatches')!.innerHTML = names
      .map((n) => {
        const v = cs.getPropertyValue(n).trim();
        return `<div class="swatch"><div class="chip" style="background:${v}"></div><div class="meta"><b>${n.replace('--fx-', '')}</b>${v}</div></div>`;
      })
      .join('');
  };
  // Referência guardada para repintar os swatches quando o modo mudar pelo
  // toggle do header (ele não dispara 'change' nos selects desta página).
  themingPaint = paint;
  const sync = (): void => {
    const p = (document.getElementById('th-preset') as HTMLSelectElement).value;
    const m = (document.getElementById('th-mode') as HTMLSelectElement).value as 'light' | 'dark';
    applyPreset(p, m);
    syncHeaderControls(p, m);
    paint();
  };
  document.getElementById('th-preset')!.addEventListener('change', sync);
  document.getElementById('th-mode')!.addEventListener('change', sync);
  // Inicializa os selects com os valores padrão (Fenix + light)
  const thPreset = document.getElementById('th-preset') as HTMLSelectElement | null;
  const thMode = document.getElementById('th-mode') as HTMLSelectElement | null;
  if (thPreset) thPreset.value = currentPreset;
  if (thMode) thMode.value = currentMode;
  paint();
  setupCustomBuilder();
  wireCopyButtons(main);
}

/* ------------------------------------------------------------------ */
/* Construtor de preset personalizado (preview + download .json)       */
/* ------------------------------------------------------------------ */

const DEFAULT_CUSTOM_COLORS: Record<string, string> = {
  primary: '#7c3aed',
  secondary: '#f43f5e',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  info: '#0ea5e9',
};

function slugify(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'meu-tema'
  );
}

function readCustomTokens(): DeepPartial<FenixTokens> {
  const colors: Record<string, string> = {};
  document.querySelectorAll<HTMLInputElement>('input[data-cp-color]').forEach((input) => {
    colors[input.dataset.cpColor!] = input.value;
  });
  const radius = (document.getElementById('cp-radius') as any)?.value ?? '8px';
  const readSize = (id: string, fallback: string): string =>
    (document.getElementById(id) as any)?.value || fallback;
  const focusRing = document.querySelector('fx-switch#cp-focus-ring') as any;
  const ripple = document.querySelector('fx-switch#cp-ripple') as any;
  return {
    color: colors,
    radius: { sm: radius === '9999px' ? '9999px' : `calc(${radius} / 2)`, md: radius, lg: `calc(${radius} * 1.5)` },
    // Escala de alturas dos controles — só entra no preset se diferente do padrão.
    ...(radius !== undefined
      ? {
          size: {
            sm: readSize('cp-size-sm', '32px'),
            md: readSize('cp-size-md', '40px'),
            lg: readSize('cp-size-lg', '48px'),
          },
        }
      : {}),
    effect: {
      // O cliente decide se o tema usa anel de foco/ripple — basta desmarcar.
      'focus-ring': focusRing && !focusRing.checked
        ? 'none'
        : '0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)',
      ripple: ripple && !ripple.checked ? '0' : '1',
    },
  };
}

/** Renderiza o preview. Só aplica tokens se `apply` — nunca no paint inicial,
 * para não sobrescrever o tema/preset ativo escolhido pelo usuário. */
function paintCustomPreview(apply = false): void {
  if (apply) FenixUI.setTokens(readCustomTokens());
  const preview = document.getElementById('cp-preview');
  if (preview) {
    preview.innerHTML = `
      <fx-button variant="primary">Primário</fx-button>
      <fx-button variant="success">Sucesso</fx-button>
      <fx-button variant="outline">Outline</fx-button>
      <fx-badge variant="danger">7</fx-badge>
      <fx-spinner></fx-spinner>
      <fx-input placeholder="Digite algo…"></fx-input>
      <fx-select><option value="a">Opção A</option><option value="b">Opção B</option></fx-select>
    `;
  }
}

function downloadPreset(preset: FenixPreset): void {
  const blob = new Blob([JSON.stringify({ $schema: 'fenix-preset/v1', ...preset }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${slugify(preset.name)}.fenix-preset.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function setupCustomBuilder(): void {
  // valores iniciais dos color pickers
  document.querySelectorAll<HTMLInputElement>('input[data-cp-color]').forEach((input) => {
    input.value = DEFAULT_CUSTOM_COLORS[input.dataset.cpColor!];
    input.addEventListener('input', () => {
      paintCustomPreview(true);
      const sw = document.getElementById('swatches');
      if (sw) renderThemingSwatchesOnly(sw);
    });
  });
  (document.getElementById('cp-radius') as any).addEventListener('change', () => {
    paintCustomPreview(true);
  });
  for (const id of ['cp-size-sm', 'cp-size-md', 'cp-size-lg']) {
    (document.getElementById(id) as any)?.addEventListener('change', () => {
      paintCustomPreview(true);
    });
  }
  for (const id of ['cp-focus-ring', 'cp-ripple']) {
    document.getElementById(id)?.addEventListener('change', () => {
      paintCustomPreview(true);
    });
  }

  document.getElementById('cp-download')!.addEventListener('click', () => {
    const nameInput = document.getElementById('cp-name') as HTMLInputElement;
    const labelInput = document.getElementById('cp-label') as HTMLInputElement;
    const name = slugify(nameInput.value || 'meu-tema');
    const preset = defineCustomPreset(name, labelInput.value || name, readCustomTokens());
    downloadPreset(preset);

    // aparece no seletor global imediatamente
    currentPreset = name;
    syncHeaderControls(name, currentMode);
    const thPreset = document.getElementById('th-preset') as HTMLSelectElement | null;
    if (thPreset) thPreset.value = name;

    const status = document.getElementById('cp-status')!;
    status.textContent = `✅ "${labelInput.value}" registrado e baixado como ${name}.fenix-preset.json`;
  });

  paintCustomPreview();
}

/** Repinta apenas os swatches sem reconstruir a página (usado durante o preview). */
function renderThemingSwatchesOnly(container: HTMLElement): void {
  const cs = getComputedStyle(document.documentElement);
  const names = ['--fx-color-primary', '--fx-color-secondary', '--fx-color-success', '--fx-color-warning', '--fx-color-danger', '--fx-color-info', '--fx-surface-surface', '--fx-surface-background', '--fx-text-default', '--fx-border-default'];
  container.innerHTML = names
    .map((n) => {
      const v = cs.getPropertyValue(n).trim();
      return `<div class="swatch"><div class="chip" style="background:${v}"></div><div class="meta"><b>${n.replace('--fx-', '')}</b>${v}</div></div>`;
    })
    .join('');
}

/* ------------------------------------------------------------------ */
/* Header: preset + modo (global, reflete em todas as páginas)         */
/* ------------------------------------------------------------------ */

let currentPreset = 'fenix';
let currentMode: 'light' | 'dark' = 'light';
/**
 * Referência ao `paint()` da página de Temas. Permite repintar os swatches
 * quando o modo é trocado pelo toggle do header (fora daquela página).
 */
let themingPaint: (() => void) | null = null;

function syncHeaderControls(preset: string, mode: 'light' | 'dark'): void {
  currentPreset = preset;
  currentMode = mode;
  // Alterna ícones SVG: lua (modo escuro) / sol (modo claro)
  const moonIcon = document.getElementById('icon-moon') as SVGElement | null;
  const sunIcon = document.getElementById('icon-sun') as SVGElement | null;
  if (moonIcon && sunIcon) {
    moonIcon.style.display = mode === 'dark' ? 'none' : 'block';
    sunIcon.style.display = mode === 'dark' ? 'block' : 'none';
  }
  const thMode = document.getElementById('th-mode') as HTMLSelectElement | null;
  if (thMode) thMode.value = mode;
  const thPreset = document.getElementById('th-preset') as HTMLSelectElement | null;
  if (thPreset) thPreset.value = preset;
}

/* ------------------------------------------------------------------ */
/* Search com Autocomplete                                            */
/* ------------------------------------------------------------------ */

function setupSearch(): void {
  const searchBox = document.getElementById('search-box') as HTMLElement;
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-results') as HTMLElement;

  if (!searchBox || !searchInput || !searchResults) return;

  // Mapeia componentes para busca: { tag, title, group }
  const searchableItems = components.map((c) => ({
    tag: c.tag,
    title: c.title,
    group: c.group,
  }));

  let activeIndex = -1;

  function renderResults(query: string): void {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      activeIndex = -1;
      return;
    }

    const matches = searchableItems.filter(
      (item) =>
        item.tag.toLowerCase().includes(normalizedQuery) ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.group.toLowerCase().includes(normalizedQuery),
    );

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="no-results">Nenhum componente encontrado</div>';
      searchResults.classList.add('active');
      activeIndex = -1;
      return;
    }

    searchResults.innerHTML = matches
      .map(
        (item, idx) => `
        <div class="search-result-item" data-tag="${item.tag}" data-index="${idx}">
          <span class="tag-name">&lt;${item.tag}&gt;</span>
          <span class="component-title">${item.title}</span>
        </div>
      `,
      )
      .join('');
    searchResults.classList.add('active');
    activeIndex = -1;
  }

  function navigateTo(tag: string): void {
    searchInput.value = '';
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
    window.location.hash = `#/${tag}`;
  }

  // Input event
  searchInput.addEventListener('input', () => {
    renderResults(searchInput.value);
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = searchResults.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const activeItem = items[activeIndex] as HTMLElement;
      const tag = activeItem.dataset.tag;
      if (tag) navigateTo(tag);
    } else if (e.key === 'Escape') {
      searchResults.classList.remove('active');
      searchInput.blur();
    }
  });

  // Click on result
  searchResults.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('.search-result-item') as HTMLElement;
    if (target?.dataset.tag) {
      navigateTo(target.dataset.tag);
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target as Node)) {
      searchResults.classList.remove('active');
    }
  });

  // Focus: show all if has value
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
      renderResults(searchInput.value);
    }
  });
}

function setupHeader(): void {
  // Versão dinâmica lida do package.json em build (injetada via `define`).
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge && typeof __APP_VERSION__ !== 'undefined') {
    versionBadge.textContent = `v${__APP_VERSION__}`;
  }

  // Menu lateral no mobile: hamburger abre, overlay/link fecha.
  const toggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  const closeSidebar = (): void => {
    document.body.classList.remove('sidebar-open');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  toggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('sidebar-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  overlay?.addEventListener('click', closeSidebar);
  document.getElementById('sidebar')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) closeSidebar();
  });

  document.getElementById('mode-toggle')!.addEventListener('click', () => {
    currentMode = currentMode === 'dark' ? 'light' : 'dark';
    applyPreset(currentPreset, currentMode);
    syncHeaderControls(currentPreset, currentMode);
    // Na página de Temas, repinta os swatches: o toggle do header não passa
    // pelos selects da página (que são quem normalmente chama paint()).
    if (themingPaint) themingPaint();
  });
}

/* ------------------------------------------------------------------ */
/* Roteamento (hash) + sidebar                                         */
/* ------------------------------------------------------------------ */

function buildSidebar(): void {
	const groups = new Map<string, { id: string; title: string }[]>();
	groups.set("Guia", [
		{ id: "home", title: "Home" },
		{ id: "installation", title: "Instalação" },
		{ id: "typings", title: "Tipagens" },
		{ id: "vue3", title: "Vue 3 / Nuxt" },
		{ id: "integrations", title: "CDN / React / JSF" },
		{ id: "auto-import", title: "Auto Import" },
		{ id: "icons", title: "Ícones" },
		{ id: "theming", title: "Temas" },
		{ id: "forms", title: "Formulários" },
	]);
	for (const c of components) {
		if (!groups.has(c.group)) groups.set(c.group, []);
		groups.get(c.group)!.push({ id: c.tag, title: c.title });
	}
	document.getElementById("sidebar")!.innerHTML = [...groups.entries()]
		.map(
			([group, items]) =>
				`<div class="group">${group}</div>` +
				items
					.map(
						(i) => `<a href="#/${i.id}" data-id="${i.id}">${i.title}</a>`,
					)
					.join(""),
		)
		.join("");
}

/**
 * Converte o HTML de variantes em cards "modelo + código": cada elemento
 * de topo vira um card com preview em cima e o código correspondente abaixo.
 * Títulos <h4> viram rótulos do card; wrappers <div> sem texto são "abertos"
 * para que cada exemplo interno tenha seu próprio par preview/código.
 */
function renderVariantCards(doc: ComponentDoc): string {
	const parsed = new DOMParser().parseFromString(
		doc.variantsHtml!(),
		"text/html",
	);
	const cards: string[] = [];

	const pushCard = (el: Element, title: string): void => {
		const html = el.outerHTML;
		cards.push(
			`<div class="example-card">` +
				(title ? `<div class="example-title">${esc(title)}</div>` : "") +
				`<div class="example-stage">${html}</div>` +
				`<div class="code-block example-code"><div class="code-head"><button class="copy-btn">Copiar</button></div><pre><code>${highlightCode(formatHtml(html))}</code></pre></div>` +
				`</div>`,
		);
	};

	const walk = (parent: ParentNode, inheritedTitle: string): void => {
		for (const node of [...parent.childNodes]) {
			if (node.nodeType === Node.TEXT_NODE) continue;
			if (!(node instanceof Element)) continue;
			if (/^H[1-4]$/.test(node.tagName)) continue; // já capturado abaixo
			// Wrapper genérico: div sem texto próprio e com mais de 1 filho elemento → abre.
			const isGenericWrapper =
				node.tagName === "DIV" &&
				!node.textContent?.trim() &&
				[...node.children].length > 1;
			if (isGenericWrapper) {
				walk(node, inheritedTitle);
				continue;
			}
			const title =
				node.previousElementSibling &&
				/^H[1-4]$/.test(node.previousElementSibling.tagName)
					? node.previousElementSibling.textContent!.trim()
					: inheritedTitle;
			pushCard(node, title);
		}
	};
	walk(parsed.body, "");

	if (!cards.length) return "";
	return `<div class="examples">${cards.join("")}</div>`;
}

/** Snippet de tipagem TypeScript gerado a partir da tabela de atributos. */
function renderTyping(doc: ComponentDoc): string {
	const pascal = doc.tag
		.split("-")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join("");
	const iface = doc.attributes
		.filter((a) => /^[a-z][a-z0-9-]*$/i.test(a.name))
		.map(
			(a) =>
				`  /** ${a.desc.replace(/<[^>]+>/g, "")} */\n  '${a.name}'?: ${a.type};`,
		)
		.join("\n");
	if (!iface) return "";
	return [
		"<h3>Tipagem TypeScript</h3>",
		`<p>Todas as variantes e propriedades têm tipos prontos — importe de <code class="inline">@wrrdev/fenix-ui/vue</code>`,
		`(Vue/Volar), <code class="inline">@wrrdev/fenix-ui/react</code> (React com <code class="inline">"jsx": "react-jsx"</code>)`,
		`ou <code class="inline">@wrrdev/fenix-ui/jsx</code> (React clássico/Preact/Vue JSX) e o editor autocompleta cada atributo:</p>`,
		codeBlock(
			`import type { Fx${pascal}Props } from '@wrrdev/fenix-ui/vue';\n\nconst props: Fx${pascal}Props = {\n${iface.split("\n").slice(0, 14).join("\n")}\n};`,
		),
	].join(" ");
}

/** Coleta todas as tags fx-* usadas no demoHtml e variantsHtml do doc. */
function collectDemoTags(doc: ComponentDoc): string[] {
	const html = doc.demoHtml("") + (doc.variantsHtml?.() ?? "");
	const all = [
		...new Set([...html.matchAll(/<fx-[a-z-]+/g)].map((m) => m[0].slice(1))),
	];
	// Só aguarda tags que são custom elements registrados (fx-tab é slot, não CE).
	return all.filter((t) => t in componentLoaders);
}

/** Componentes usados pelos controles do playground (buildControls). */
const CONTROL_TAGS = ["fx-select", "fx-switch", "fx-input"];

/** Componentes usados pelo drawer de customização de tema no header. */
const THEME_DRAWER_TAGS = [
	"fx-drawer",
	"fx-tabs",
	"fx-tab-panel",
	"fx-button",
	"fx-badge",
	"fx-spinner",
	"fx-input",
	"fx-select",
	"fx-switch",
];

async function renderComponentPage(doc: ComponentDoc): Promise<void> {
	// Garante que todos os fx-* usados no demo, variantes E nos controles do
	// playground sejam importados ANTES de inserir o innerHTML — caso contrário
	// os controles ficam como unknown elements vazios até outra página carregá-los.
	const tags = [
		...new Set([
			...collectDemoTags(doc),
			...CONTROL_TAGS.filter((t) => t in componentLoaders),
		]),
	];
	await Promise.all(tags.map((t) => componentLoaders[t]?.()));

	const main = document.getElementById("main")!;
	main.innerHTML = `
    <h2>&lt;${doc.tag}&gt;</h2>
    <p class="lead">${doc.lead}</p>
    <h3>Importação (tree-shakeable)</h3>
    ${codeBlock(doc.imports.join("\n"))}
    ${doc.initNote ? `<div class="note"><strong>Nota:</strong> ${doc.initNote}</div>` : ""}
    <h3>Playground</h3>
    <div class="demo">
      <div class="demo-stage" id="stage"></div>
      <div class="demo-controls">${buildControls(doc)}</div>
    </div>
    ${codeBlock(`<${doc.tag}>…</${doc.tag}>`)}
    <h3>Variantes e usos (modelo + código)</h3>
    ${doc.variantsHtml ? renderVariantCards(doc) : ""}
    ${apiTable("Atributos / Propriedades", doc.attributes, COLS_ATTR)}
    ${doc.events?.length ? apiTable("Eventos", doc.events, COLS_EVENT) : ""}
    ${doc.slots?.length ? apiTable("Slots", doc.slots, COLS_SLOT) : ""}
    ${doc.cssVars?.length ? apiTable("Variáveis CSS", doc.cssVars, COLS_CSSVAR) : ""}
    ${renderTyping(doc)}
  `;

	// Aguarda TODAS as tags customizadas serem definidas antes de manipular o stage.
	await Promise.all(tags.map((tag) => customElements.whenDefined(tag)));

	const stage = main.querySelector<HTMLDivElement>("#stage")!;
	const codeEl = main
		.querySelectorAll(".code-block")[1]
		?.querySelector("code");
	const refresh = (): void => {
		stage.innerHTML = doc.demoHtml(currentAttrs(doc));
		// Re-inicializa componentes que precisam de parse de JSON via JS
		initDataComponents(stage);
		if (codeEl) {
			// Atributos booleanos não têm valor: `disabled=""` vira apenas `disabled`.
			const clean = stage.innerHTML.replace(
				/(\s(?:disabled|loading|checked|readonly|full|round))=""/g,
				"$1",
			);
			codeEl.innerHTML = highlightCode(formatHtml(clean));
		}
	};
	main
		.querySelectorAll("fx-select[data-attr], fx-switch[data-attr]")
		.forEach((el) => el.addEventListener("change", refresh));
	main
		.querySelectorAll("fx-input[data-attr]")
		.forEach((el) => el.addEventListener("input", refresh));
	refresh();
	initDataComponents(main);
	wireCopyButtons(main);
}

/* ------------------------------------------------------------------ */
/* Página: Formulários (modelos prontos de cadastro)                   */
/* ------------------------------------------------------------------ */

const FORMS_TAGS = [
	"fx-input",
	"fx-select",
	"fx-multiselect",
	"fx-datepicker",
	"fx-textarea",
	"fx-floatlabel",
	"fx-button",
	"fx-alert",
	"fx-fileupload",
	"fx-autocomplete",
];

/** Card "modelo + código" de um formulário pronto. */
function formModelCard(title: string, desc: string, html: string): string {
	return (
		`<div class="example-card">` +
		`<div class="example-title">${esc(title)}</div>` +
		`<p style="margin:0 0 12px;font-size:13px;color:var(--fx-text-muted)">${esc(desc)}</p>` +
		`<div class="example-stage">${html}</div>` +
		`<div class="code-block example-code"><div class="code-head"><button class="copy-btn">Copiar</button></div><pre><code>${highlightCode(formatHtml(html))}</code></pre></div>` +
		`</div>`
	);
}

/**
 * Validação dos modelos: ao clicar em [data-save], campos vazios recebem
 * error (+ error-text quando dentro de fx-floatlabel, que propaga a borda
 * vermelha para o controle interno). Digitar/trocar valor limpa o erro.
 */
function wireFormValidation(root: HTMLElement): void {
	root
		.querySelectorAll<HTMLElement>("[data-form-validate]")
		.forEach((form) => {
			const fields = form.querySelectorAll<HTMLElement>(
				"fx-input, fx-select, fx-multiselect, fx-datepicker, fx-textarea, fx-floatlabel",
			);
			const alertEl = form.querySelector("fx-alert");
			const save = form.querySelector<HTMLElement>("[data-save]");

			const clearError = (f: HTMLElement): void => {
				f.removeAttribute("error");
				f.removeAttribute("error-text");
			};
			fields.forEach((f) => {
				f.addEventListener("input", () => clearError(f));
				f.addEventListener("change", () => clearError(f));
			});

			save?.addEventListener("click", () => {
				let invalid = false;
				fields.forEach((f) => {
					const isFloat = f.tagName.toLowerCase() === "fx-floatlabel";
					const ctrl = (isFloat ? f.firstElementChild : f) as unknown as {
						value?: unknown;
						values?: unknown;
						getAttribute?: (name: string) => string | null;
					} | null;
					let value = "";
					if (ctrl) {
						value = Array.isArray(ctrl.values)
							? (ctrl.values as string[]).join(",")
							: String(ctrl.value ?? ctrl.getAttribute?.("value") ?? "");
					}
					if (!value.trim()) {
						invalid = true;
						f.setAttribute("error", "");
						if (isFloat)
							f.setAttribute("error-text", "Campo obrigatório");
					} else {
						clearError(f);
					}
				});
				if (alertEl) alertEl.hidden = !invalid;
			});
		});
}

const FORM_MODEL_1 = `
<div data-form-validate style="display:flex;flex-direction:column;gap:16px;max-width:520px">
  <fx-alert variant="danger" title="Verifique o formulário" hidden>Preencha os campos destacados em vermelho.</fx-alert>
  <fx-input full icon="person" placeholder="Nome completo"></fx-input>
  <fx-input full icon="mail" type="email" placeholder="E-mail"></fx-input>
  <fx-input full icon="lock" type="password" placeholder="Senha"></fx-input>
  <fx-input full icon="call" placeholder="Telefone"></fx-input>
  <fx-textarea full rows="3" placeholder="Observações"></fx-textarea>
  <div style="display:flex;gap:12px;justify-content:flex-end">
    <fx-button variant="ghost">Cancelar</fx-button>
    <fx-button data-save><i slot="icon" class="fx-icon fx-icon-save"></i>Salvar</fx-button>
  </div>
</div>`;

const FORM_MODEL_2 = `
<div data-form-validate style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:760px">
  <fx-alert variant="danger" title="Verifique o formulário" hidden style="grid-column:1/-1">Preencha os campos destacados em vermelho.</fx-alert>
  <fx-input full icon="person" placeholder="Nome"></fx-input>
  <fx-input full placeholder="Sobrenome"></fx-input>
  <fx-input full icon="mail" type="email" placeholder="E-mail"></fx-input>
  <fx-input full icon="call" placeholder="Telefone"></fx-input>
  <fx-input full icon="badge" placeholder="CPF"></fx-input>
  <fx-datepicker full placeholder="Data de nascimento"></fx-datepicker>
  <fx-input full icon="location_city" placeholder="Cidade"></fx-input>
  <fx-select full placeholder="UF"><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option><option value="mg">Minas Gerais</option></fx-select>
  <div style="grid-column:1/-1;display:flex;gap:12px;justify-content:flex-end">
    <fx-button variant="outline">Cancelar</fx-button>
    <fx-button data-save>Salvar cadastro</fx-button>
  </div>
</div>`;

const FORM_MODEL_3 = `
<div data-form-validate style="display:flex;flex-direction:column;gap:16px;max-width:820px">
  <fx-alert variant="danger" title="Verifique o formulário" hidden>Preencha os campos destacados em vermelho.</fx-alert>
  <h4 style="margin:0;font-size:13px;color:var(--fx-text-muted)">Endereço</h4>
  <div style="display:grid;grid-template-columns:2fr 1fr 2fr;gap:12px">
    <fx-input full icon="location_on" placeholder="CEP"></fx-input>
    <fx-input full placeholder="Número"></fx-input>
    <fx-input full placeholder="Complemento"></fx-input>
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px">
    <fx-input full placeholder="Logradouro"></fx-input>
    <fx-select full placeholder="Estado"><option value="sp">SP</option><option value="rj">RJ</option><option value="mg">MG</option></fx-select>
    <fx-select full placeholder="Perfil"><option value="admin">Administrador</option><option value="user">Usuário</option></fx-select>
  </div>
  <h4 style="margin:0;font-size:13px;color:var(--fx-text-muted)">Preferências</h4>
  <fx-multiselect full searchable placeholder="Interesses"><option value="tech">Tecnologia</option><option value="esporte">Esporte</option><option value="arte">Arte</option><option value="gastronomia">Gastronomia</option></fx-multiselect>
  <fx-autocomplete full icon="work" placeholder="Cargo" source='["Desenvolvedor","Designer","Analista","Gerente"]'></fx-autocomplete>
  <fx-fileupload full icon="upload_file" label="Foto do documento" accept=".pdf,.png,.jpg"></fx-fileupload>
  <div style="display:flex;gap:12px;justify-content:flex-end">
    <fx-button variant="ghost">Cancelar</fx-button>
    <fx-button data-save variant="success">Concluir cadastro</fx-button>
  </div>
</div>`;

const FORM_MODEL_4 = `
<div data-form-validate style="display:grid;grid-template-columns:1fr 1fr;gap:20px 16px;max-width:760px">
  <fx-alert variant="danger" title="Verifique o formulário" hidden style="grid-column:1/-1">Preencha os campos destacados em vermelho.</fx-alert>
  <fx-floatlabel full><fx-input full></fx-input><label>Nome completo</label></fx-floatlabel>
  <fx-floatlabel full><fx-input full icon="mail" type="email"></fx-input><label>E-mail</label></fx-floatlabel>
  <fx-floatlabel full variant="in"><fx-input full icon="lock" type="password"></fx-input><label>Senha</label></fx-floatlabel>
  <fx-floatlabel full variant="in"><fx-input full icon="lock" type="password"></fx-input><label>Confirmar senha</label></fx-floatlabel>
  <fx-floatlabel full><fx-select full placeholder="Selecione"><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option><option value="mg">Minas Gerais</option></fx-select><label>Estado</label></fx-floatlabel>
  <fx-floatlabel full><fx-datepicker full></fx-datepicker><label>Nascimento</label></fx-floatlabel>
  <div style="grid-column:1/-1;display:flex;gap:12px;justify-content:flex-end">
    <fx-button variant="ghost">Limpar</fx-button>
    <fx-button data-save>Criar conta</fx-button>
  </div>
</div>`;

async function renderForms(): Promise<void> {
	const main = document.getElementById("main")!;
	await Promise.all(FORMS_TAGS.map((t) => componentLoaders[t]?.()));
	await Promise.all(FORMS_TAGS.map((t) => customElements.whenDefined(t)));
	main.innerHTML = `
    <h2>Formulários</h2>
    <p class="lead">Modelos prontos de cadastro combinando os componentes do FenixUI: use <code>full</code> para os campos acompanharem o container, CSS grid para múltiplos campos por linha e <code>error</code>/<code>error-text</code> para a validação. Clique em <strong>Salvar</strong> com campos vazios para ver a validação em ação. A borda e o brilho de <code>error</code>/<code>success</code> seguem o token <code>effect.focus-ring</code>: com o anel desligado os campos validados exibem apenas a borda vermelha/verde (sem sobra), e com o anel ligado o brilho é somado.</p>
    <style>
      /* hidden precisa vencer o display do host do alert */
      .example-stage fx-alert[hidden] { display: none !important; }
      /* O palco é display:flex/flex-wrap (index.html): sem isso os modelos
         colapsam para a largura do conteúdo e o full não estica. */
      .example-stage [data-form-validate] { flex: 1 1 100%; }
      /* Os forms são cards opacos centralizados (não transparentes): o palco
         tem fundo xadrez vazado para mostrar transparência — o form cobre com
         a cor de superfície, tem largura legível e fica centrado. */
      .example-stage [data-form-validate] {
        background: var(--fx-surface-background, #fff);
        border: 1px solid var(--fx-border-default);
        border-radius: var(--fx-radius-md);
        padding: 1.5rem;
        margin-inline: auto;
        width: 100%;
      }
    </style>
    <div class="note"><strong>Nota:</strong> com <code>full</code> o campo ocupa a linha inteira (host vira block). Para manter um botão na mesma linha do campo, use o container com <code>display:flex</code> — o campo estica e o botão mantém o tamanho. No <code>fx-floatlabel</code>, o <code>full</code> é propagado automaticamente para o controle interno.</div>
    ${formModelCard("Modelo 1 — Cadastro em uma coluna (full)", "Campos full empilhados: cada um ocupa a linha toda do container.", FORM_MODEL_1)}
    ${formModelCard("Modelo 2 — Grid de duas colunas", "Dois campos por linha via CSS grid (grid-template-columns: 1fr 1fr) com full nos campos.", FORM_MODEL_2)}
    ${formModelCard("Modelo 3 — Misto (múltiplos campos por linha)", "Grids com 2-3 campos por linha, selects, multiselect, autocomplete e fileupload full.", FORM_MODEL_3)}
    ${formModelCard("Modelo 4 — FloatLabel com validação", "fx-floatlabel full (propagado para o controle) + error/error-text ao salvar com campos vazios.", FORM_MODEL_4)}
  `;
	wireFormValidation(main);
	wireCopyButtons(main);
}

async function renderRoute(): Promise<void> {
	const route = location.hash.replace(/^#\//, "") || "home";
	document
		.querySelectorAll("#sidebar a")
		.forEach((a) =>
			a.classList.toggle(
				"active",
				(a as HTMLAnchorElement).dataset.id === route,
			),
		);
	const main = document.getElementById("main")!;
	// Limpa o conteúdo já: evita conteúdo obsoleto durante o carregamento
	// assíncrono e mantém sidebar e conteúdo sincronizados.
	main.innerHTML = `<div class="loading-state">Carregando…</div>`;
	// Reseta callbacks de páginas inativas (ex.: swatches da página de Temas).
	if (route !== "theming") themingPaint = null;
	const doc = components.find((c) => c.tag === route);
	if (doc) {
		// Import lazy + aguarda o render completo antes de resolver a rota.
		await componentLoaders[route]?.();
		await renderComponentPage(doc);
	} else if (route === "home") await renderHome();
	else if (route === "installation") await renderInstallation();
	else if (route === "typings") renderTypings();
	else if (route === "theming") await renderTheming();
	else if (route === "auto-import") renderAutoImport();
	else if (route === "icons") renderIcons();
	else if (route === "forms") await renderForms();
	else if (route === "vue3") renderVue3();
	else if (route === "integrations") renderIntegrations();
	else await renderHome();
}

async function renderVue3(): Promise<void> {
  const main = document.getElementById('main')!;
  await Promise.all(['fx-button', 'fx-tooltip', 'fx-badge'].map((t) => componentLoaders[t]?.()));
  await Promise.all(['fx-button', 'fx-tooltip', 'fx-badge'].map((t) => customElements.whenDefined(t)));
  main.innerHTML = `
    <h2>Vue 3 / Nuxt</h2>
    <p class="lead">FenixUI são <strong>Web Components nativos</strong>. No Vue 3, basta dizer ao
    compilador que tags <code>fx-*</code> são custom elements — e você tem autocomplete, validação
    de atributos e reactive bindings funcionando como em componentes Vue.</p>

    <h3>1. Instale</h3>
    ${codeBlock('npm install @wrrdev/fenix-ui')}

    <h3>2. Configure o Vue (main.ts)</h3>
    <p>Dois passos no <code>main.ts</code> — o plugin <code>isCustomElement</code> e o import de tipos:</p>
    ${codeBlock(`import { createApp } from 'vue';
import App from './App.vue';
import '@wrrdev/fenix-ui';            // registra todos os componentes
import { applyPreset } from '@wrrdev/fenix-ui'; // aplica tokens CSS (--fx-*) ao :root

// habilita autocomplete + validação (Volar / vue-tsc)
import '@wrrdev/fenix-ui/vue';

// diretiva de tooltip (usa em qualquer elemento)
import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';
defineFxTooltipDirective();

const app = createApp(App);

// *** essencial ***: Vue precisa saber que fx-* são Web Components
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('fx-');

app.mount('#app');`)}

    <h3>3. Use no template</h3>
    <p>Tags sempre em <strong>kebab-case</strong>. Propriedades reativas funcionam normalmente:</p>
     <p><strong>Anote:</strong> sem <code>applyPreset()</code> os tokens CSS ficam <em>undefined</em> — cores de fallback, bordas podem sumir.</p>
    ${codeBlock(`<template>
  <div class="p-4">
    <!-- componente wrapper -->
    <fx-tooltip content="Dica">
      <fx-button variant="primary">Hover</fx-button>
    </fx-tooltip>

    <!-- diretiva em elementos HTML -->
    <div fx-tooltip="Texto da dica">Div com tooltip</div>

    <!-- vue reactivity com orderlist -->
    <fx-orderlist
      selection-mode="multiple"
      :data="orderList"
      data-key="id"
    ></fx-orderlist>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const orderList = ref([
  { id: 1, label: 'Item A' },
  { id: 2, label: 'Item B' },
]);
</script>`)}

    <div class="note">
      <strong>Sem <code>isCustomElement</code></strong>, o Vue tenta resolver <code>fx-button</code> como um
      componente Vue e falha. Sem <code>@wrrdev/fenix-ui/vue</code>, o Volar não autocompleta atributos de
      <code>fx-*</code>.
    </div>

    <h3>Nuxt</h3>
    <p><code>isCustomElement</code> é uma opção de <strong>compilação</strong> — em Nuxt ela vai no
    <code>nuxt.config.ts</code> (não em plugin de runtime, que roda depois do build):</p>
    ${codeBlock(`// nuxt.config.ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('fx-'),
    },
  },
});`)}
    <p>O plugin (client) fica responsável apenas pelos efeitos colaterais — registrar os componentes,
    aplicar o tema e os tipos Volar:</p>
    ${codeBlock(`// plugins/fenix-ui.client.ts
import { defineNuxtPlugin } from '#app';
import '@wrrdev/fenix-ui';
import { applyPreset } from '@wrrdev/fenix-ui';
import '@wrrdev/fenix-ui/vue';

export default defineNuxtPlugin(() => {
  applyPreset('fenix', 'light');
});`)}
    <div class="note">
      <strong>SSR:</strong> os componentes são Web Components (client-side). Use
      <code>.client.ts</code> para o registro — os templates com tags <code>fx-*</code> são
      renderizados no cliente após a hidratação. Para outras stacks (CDN, React, JSF, .NET, JSP),
      veja a página <a href="#/integrations">CDN / React / JSF</a>.
    </div>
  `;
  wireCopyButtons(main);
}

/** Página Integrações — CDN/HTML puro, JSP/.NET, JSF e React/Next. */
async function renderIntegrations(): Promise<void> {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>CDN / React / JSF e outras stacks</h2>
    <p class="lead">FenixUI são <strong>Web Components nativos</strong>: funcionam em qualquer stack
    que renderize HTML — sem build, sem transpilação, sem framework específico. Basta registrar os
    custom elements uma vez e usar as tags <code>fx-*</code> direto no markup.</p>

    <h3>1. CDN / HTML puro / Thymeleaf</h3>
    <p>Carregue o bundle <strong>UMD</strong> único — ele registra todos os componentes
    <em>e a biblioteca de ícones</em>, expondo os globals <code>FenixUI</code> (tema/tokens) e
    <code>FenixToast</code>:</p>
    ${codeBlock(`<!-- jsDelivr (fixe a versão em produção, ex.: @1.1.1) -->
<script src="https://cdn.jsdelivr.net/npm/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js"></script>

<script>
  // tema claro/escuro em runtime (reflete em todos os componentes, incl. Shadow DOM)
  FenixUI.theme('dark');

  // toasts imperativo via global
  FenixToast.success('Salvo!', 'Registro atualizado.');
</script>

<!-- pronto: estas tags já funcionam -->
<fx-button variant="danger" size="sm">Excluir</fx-button>
<fx-badge variant="success">Aprovado</fx-badge>
<fx-toast></fx-toast>

<!-- ícones também funcionam no CDN (fonte copiada junto do UMD) -->
<i class="fx-icon fx-icon-home"></i>`)}
    <div class="note">
      Alternativa ao jsDelivr: <code>https://unpkg.com/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js</code>.
      Em produção, prefira fixar a versão (<code>@1.1.1</code>) em vez de <code>@latest</code>.
    </div>

    <h3>2. JSP / .NET (MVC, WebForms, Razor)</h3>
    <p>É HTML normal no markup — nada muda no servidor. Inclua o script no layout mestre e use as
    tags nas views:</p>
    ${codeBlock(`<!-- _Layout.cshtml / master.jsp / template Thymeleaf -->
<script src="https://cdn.jsdelivr.net/npm/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js"></script>

<!-- Razor (ASP.NET): binding de valores do servidor nos atributos -->
<fx-button variant="primary">Editar</fx-button>
<fx-badge variant="@Model.Status">@Model.StatusLabel</fx-badge>

<!-- JSP -->
<fx-alert variant="info">Bem-vindo, <b><%= user.getName() %></b></fx-alert>`)}
    <div class="note">
      <strong>PostBack/POST:</strong> componentes com estado interno (input, select, checkbox…)
      mantêm o valor no atributo <code>value</code> — sincronize com campos
      <code>&lt;input type="hidden"&gt;</code> quando precisar enviar ao servidor.
    </div>

    <h3>3. JSF (Jakarta Faces)</h3>
    <p>As tags <code>fx-*</code> são XHTML/facelets bem-formado e passam direto pelo Facelets.
    Carregue o UMD via <code>h:outputScript</code> ou script direto no template:</p>
    ${codeBlock(`<h:head>
  <h:outputScript library="js" name="fenix-ui.umd.min.js" />
  <!-- ou: <script src="https://cdn.jsdelivr.net/npm/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js" /> -->
</h:head>

<h:body>
  <fx-button variant="primary">Salvar</fx-button>
  <fx-badge variant="success">#{bean.status}</fx-badge>

  <!-- AJAX/re-render: os custom elements são globais — o re-render NÃO precisa re-registrar -->
  <h:panelGroup id="painel">
    <fx-alert variant="info">#{bean.mensagem}</fx-alert>
  </h:panelGroup>
</h:body>`)}
    <div class="note">
      No re-render AJAX do JSF, os nós <code>fx-*</code> são substituídos no DOM e recriados — como
      as definições de custom element são globais no <code>window</code>, eles se re-hidratam
      sozinhos, sem código extra.
    </div>

    <h3>4. React / Next.js</h3>
    <p><strong>React 19+</strong> suporta custom elements nativamente: atributos, propriedades e
    eventos CustomEvent funcionam direto no JSX:</p>
    ${codeBlock(`// Next.js App Router (componente client)
'use client';

import '@wrrdev/fenix-ui/button';
import '@wrrdev/fenix-ui/badge';

export function SalvarButton() {
  return (
    <>
      <fx-button variant="primary" onClick={(e) => console.log('fx-click', e)}>
        Salvar
      </fx-button>
      <fx-badge variant="success">OK</fx-badge>
    </>
  );
}`)}
    <p><strong>React &lt; 19:</strong> props desconhecidas viram atributos string (funciona), mas
    objetos/arrays (ex.: <code>data</code> do <code>fx-table</code>) e eventos precisam de
    <code>ref</code> + <code>addEventListener</code>:</p>
    ${codeBlock(`import { useEffect, useRef } from 'react';

export function Tabela({ dados }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.data = dados;                          // propriedade complexa direto no elemento
    const onChange = (e) => console.log(e.detail);
    el.addEventListener('selection-change', onChange);
    return () => el.removeEventListener('selection-change', onChange);
  }, [dados]);

  return <fx-table ref={ref} />;
}`)}
    <div class="note">
      <strong>Tipagem TSX:</strong> importe <code>import '@wrrdev/fenix-ui/jsx';</code> uma vez para o
      editor autocompletar todos os atributos <code>fx-*</code> no JSX/TSX. Se o seu projeto React usa
      <code>"jsx": "react-jsx"</code> no tsconfig, prefira <code>import '@wrrdev/fenix-ui/react';</code>.
      Com o plugin
      <code>FenixAutoImport</code>, os imports dos subpaths são injetados automaticamente (Vite,
      Rollup e Webpack) — veja a página <a href="#/auto-import">Auto Import</a>.
    </div>
  `;
  wireCopyButtons(main);
}

/** Página Tipagens — guia de autocomplete/validação por framework. */
function renderTypings(): void {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>Tipagens TypeScript por framework</h2>
    <p class="lead">Todos os componentes <code>fx-*</code> têm tipos prontos: props com autocomplete
    e validação, uniões (<code>FxSize</code>, <code>FxButtonVariant</code>, …) e tipagem imperativa via
    <code>HTMLElementTagNameMap</code>. O subpath que você importa depende do framework —
    escolha o seu abaixo.</p>

    <table class="api" style="width:100%">
      <thead><tr><th>Framework</th><th>Import (uma única vez)</th><th>O que habilita</th></tr></thead>
      <tbody>
        <tr><td><b>Vue 3 / Nuxt</b></td><td><code>@wrrdev/fenix-ui/vue</code></td><td>Autocomplete + validação nos templates SFC (Volar / vue-tsc)</td></tr>
        <tr><td><b>React</b> (<code>"jsx": "react-jsx"</code>)</td><td><code>@wrrdev/fenix-ui/react</code></td><td>Autocomplete + validação em TSX via <code>React.JSX</code></td></tr>
        <tr><td><b>React clássico / Preact / Vue JSX</b></td><td><code>@wrrdev/fenix-ui/jsx</code></td><td>Autocomplete + validação em TSX via <code>JSX</code> global</td></tr>
        <tr><td><b>Angular</b></td><td><code>@wrrdev/fenix-ui/&lt;componente&gt;</code></td><td>Tipagem imperativa (<code>createElement</code>, classes, eventos); templates exigem <code>CUSTOM_ELEMENTS_SCHEMA</code></td></tr>
        <tr><td><b>TS puro / HTML / JSF</b></td><td><code>@wrrdev/fenix-ui/&lt;componente&gt;</code></td><td>Tipagem imperativa via <code>HTMLElementTagNameMap</code> + tipos nomeados</td></tr>
      </tbody>
    </table>

    <h3>Requisito: moduleResolution</h3>
    <p>Para o TypeScript resolver os <code>exports</code> do pacote, garanta no <code>tsconfig.json</code>:</p>
    ${codeBlock(`{
  "compilerOptions": {
    "moduleResolution": "bundler" // ou "node16" / "nodenext"
  }
}`)}

    <h3>Vue 3 / Nuxt</h3>
    <p>Importe <code>./vue</code> uma única vez e informe ao compilador que <code>fx-*</code> são Web Components:</p>
    ${codeBlock(`import { createApp } from 'vue';
import '@wrrdev/fenix-ui/vue';    // tipos + autocomplete nos templates SFC

const app = createApp(App);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('fx-');
app.mount('#app');`)}
    <p>Tipos nomeados ficam disponíveis no mesmo subpath:</p>
    ${codeBlock(`import type { FxButtonProps } from '@wrrdev/fenix-ui/vue';

const props: FxButtonProps = { variant: 'primary', size: 'lg', loading: false };`)}

    <h3>React com <code>"jsx": "react-jsx"</code> (padrão no Vite, CRA e Next)</h3>
    <p>Nesse modo o TypeScript resolve o namespace <code>React.JSX</code> — que <strong>não</strong> herda
    a augmentação global de <code>JSX</code>. Importe o subpath <code>./react</code>:</p>
    ${codeBlock(`import '@wrrdev/fenix-ui/react';

export function Demo() {
  return <fx-button variant="primary" size="lg" icon="rocket_launch">Enviar</fx-button>;
}`)}
    <div class="note"><strong>Requisito:</strong> <code>@types/react</code> instalado no projeto —
    a augmentação é aplicada ao módulo <code>react</code>.</div>

    <h3>React clássico / Preact / Vue JSX</h3>
    <p>Com <code>"jsx": "react"</code> (classic) ou runtimes que usam o namespace global <code>JSX</code>:</p>
    ${codeBlock(`import '@wrrdev/fenix-ui/jsx';

<fx-chip variant="success" removable>Filtro ativo</fx-chip>`)}

    <h3>Angular (standalone)</h3>
    <p>Importe os subpaths dos componentes que usa (direto ou via
    <a href="#/auto-import">Auto Import</a>) e adicione <code>CUSTOM_ELEMENTS_SCHEMA</code>:</p>
    ${codeBlock(`import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@wrrdev/fenix-ui/stepper';
import '@wrrdev/fenix-ui/button';

@Component({
  selector: 'app-demo',
  template: \`
    <fx-stepper active="0" show-numbers>
      <div slot="step-0" step-title="Dados">Conteúdo do passo.</div>
      <div slot="step-1" step-title="Confirmação">Revise e confirme.</div>
    </fx-stepper>
    <fx-button variant="primary">Confirmar</fx-button>
  \`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // permite tags fx-* no template
})
export class DemoComponent {}`)}
    <p>No código imperativo (TS), <code>createElement</code> e os elementos são tipados
    pelo <code>HTMLElementTagNameMap</code>:</p>
    ${codeBlock(`const stepper = document.createElement('fx-stepper');
stepper.setAttribute('active', '0');
stepper.addEventListener('change', (e) => console.log((e as CustomEvent).detail));`)}

    <h3>Tipos nomeados e uniões</h3>
    <p>Todos os subpaths de tipagem reexportam os mesmos tipos, então você pode importar
    de <code>/vue</code>, <code>/react</code>, <code>/jsx</code> ou da entrada principal:</p>
    ${codeBlock(`import type {
  FxButtonProps, FxButtonVariant, FxSize, FxStepperProps, FxTableProps,
} from '@wrrdev/fenix-ui';

const variant: FxButtonVariant = 'primary';
const size: FxSize = 'lg';
const table: FxTableProps = { pagination: true, rows: 10 };`)}
    <div class="note"><strong>Dica:</strong> com o plugin <code>FenixAutoImport</code>
    (<a href="#/auto-import">Auto Import</a>) você escreve apenas as tags <code>fx-*</code> e os
    imports dos subpaths (runtime) são injetados no build — os imports de tipagem acima continuam
    sendo manuais e pontuais (um por projeto).</div>
  `;
  wireCopyButtons(main);
}

/** Página Auto Import — uso do plugin no projeto do cliente. */
function renderAutoImport(): void {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>Auto Import</h2>
    <p class="lead">Cansado de importar componente por componente? Com o plugin
    <code>FenixAutoImport</code>, você escreve apenas as tags <code>fx-*</code> no código e o
    import de cada componente é injetado automaticamente em tempo de build — mantendo o
    tree-shaking: só entra no bundle o que é usado.</p>

    <h3>1. Instale o pacote</h3>
    <pre><code>npm i @wrrdev/fenix-ui</code></pre>

    <h3>2. Adicione o plugin no build</h3>
    <p>Vite (<code>vite.config.ts</code>):</p>
    <pre><code>import { defineConfig } from 'vite';
import { FenixAutoImport } from '@wrrdev/fenix-ui/auto-import';

export default defineConfig({
  plugins: [FenixAutoImport()],
});</code></pre>

    <h3>3. Use sem importar</h3>
    <pre><code>&lt;!-- Em qualquer template/componente --&gt;
&lt;fx-button variant="primary"&gt;Salvar&lt;/fx-button&gt;
&lt;fx-select clearable&gt;
  &lt;option value="sp"&gt;São Paulo&lt;/option&gt;
&lt;/fx-select&gt;

// O plugin gera automaticamente:
// import '@wrrdev/fenix-ui/button';
// import '@wrrdev/fenix-ui/select';</code></pre>

    <div class="note">
      <strong>Como funciona:</strong> o plugin percorre seus arquivos (.ts, .js, .tsx, .jsx,
      .vue, .html, .svelte) procurando tags <code>fx-*</code> conhecidas e injeta
      <code>import '@wrrdev/fenix-ui/&lt;componente&gt;'</code> após os imports existentes.
      Se você já importou um subpath manualmente, ele não duplica. Arquivos em
      <code>node_modules</code>, <code>.d.ts</code> e CSS são ignorados.
    </div>

    <h3>Componentes suportados</h3>
    <table>
      <thead><tr><th>Tag</th><th>Subpath injetado</th></tr></thead>
      <tbody id="ai-map"></tbody>
    </table>

    <h3>Compatibilidade com frameworks</h3>
    <table>
      <thead><tr><th>Framework</th><th>Suporte</th></tr></thead>
      <tbody>
        <tr><td>Vue 3 / Nuxt</td><td>✅ via Vite/Rollup (inclusive SFC)</td></tr>
        <tr><td>React / Next</td><td>✅ via Vite/Rollup/Webpack (transform genérico)</td></tr>
        <tr><td>HTML puro / JSP / .NET</td><td>✅ use o bundle CDN (<code>fenix-ui.umd.min.js</code>) que já registra tudo</td></tr>
      </tbody>
    </table>
  `;

  const tbody = document.getElementById('ai-map');
  if (tbody) {
    for (const [tag, sub] of Object.entries(fenixComponentMap)) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><code>&lt;${tag}&gt;</code></td><td><code>${sub}</code></td>`;
      tbody.appendChild(tr);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Página Ícones — biblioteca Fenix Icons                              */
/* ------------------------------------------------------------------ */

/** Quantidade padrão de ícones por página no grid. */
const ICON_PAGE_SIZE = 96;

/** Regras de categorização por palavra-chave no nome do glifo (primeira que casa vence). */
const ICON_CATEGORY_RULES: Array<{ label: string; test: RegExp }> = [
  { label: 'Setas & Navegação', test: /arrow|chevron|navigation|compass|first_page|last_page|keyboard_(tab|backspace|return)|expand_more|expand_less|unfold|double_arrow/ },
  { label: 'Ações', test: /edit|add|remove|delete|close|done|check|save|copy|cut|paste|undo|redo|search|filter|sort|refresh|sync|drag|share|download|upload|send|print|zoom|swipe|touch|click|back_hand|pan_tool|clear|cleaning/ },
  { label: 'Alertas & Feedback', test: /alert|warning|error|info|notification|priority|report|feedback|campaign/ },
  { label: 'Áudio & Vídeo', test: /mic|volume|play|pause|stop_|skip|video|movie|camera|music|playlist|equalizer|headphones|speaker|radio|cast|subtitle|album|audio|podcast|videocam|flash_on|flash_off|bright/ },
  { label: 'Comunicação', test: /call|phone|chat|message|mail|sms|forum|comment|contact|voicemail|dialpad|rss|alternate_email/ },
  { label: 'Arquivos & Pastas', test: /file|folder|description|attach|drive|note|document|draft|article|snippet|task|topic|inventory_2|archive|inbox/ },
  { label: 'Dispositivos & Hardware', test: /computer|laptop|device|monitor|keyboard|mouse|printer|scanner|usb|battery|power|memory|chip|watch|tablet|tv|router|sim|hard_drive|screenshot|developer/ },
  { label: 'Imagem & Design', test: /image|photo|picture|palette|brush|contrast|crop|filter_b_and_w|blur_on|blur_off|gradient|opacity|style|colorize|design|\d+mp|\d+k(_plus)?$|3d|fps|aspect_ratio|animation/ },
  { label: 'Mapas & Viagem', test: /map|location|pin|gps|directions|route|traffic|place|travel|flight|train|car|vehicle|bike|bus|ferry|taxi|two_wheeler|local_|near_me|navigation/ },
  { label: 'Casa', test: /home|bed|chair|kitchen|sofa|light|shower|bath|garage|door|window|appliance|blender|coffee|countertops|roofing|house/ },
  { label: 'Pessoas & Social', test: /person|people|face|emoji|sentiment|favorite|heart|group|account|user|child|mood|handshake|diversity|volunteer/ },
  { label: 'Comércio & Finanças', test: /shopping|cart|store|sell|paid|payment|credit_card|money|price|wallet|receipt|loyalty|discount|currency|finance|payments|savings/ },
  { label: 'Gráficos & Dados', test: /chart|graph|analytics|dashboard|pie|bar_|trending|data|statistics|query_stats|insights|timeline|table_chart/ },
  { label: 'Segurança', test: /lock|security|shield|key|password|vpn|verified|block|gpp_|privacy|policy/ },
  { label: 'Configurações', test: /settings|tune|build|wrench|tools|config|manage|automation|app_shortcut|extension/ },
  { label: 'Saúde', test: /health|medical|medication|hospital|medicine|doctor|vaccine|blood|nurse|emergency|ecg|stethoscope/ },
  { label: 'Clima & Natureza', test: /cloud|sun|moon|rain|snow|weather|tree|park|plant|water_drop|air|pets|forest|wave|nature|landscape|nightlight/ },
  { label: 'Texto & Editor', test: /format_|text|font|title|paragraph|match_case|spellcheck|translate|abc|letter|type|caret|cursor|subject|notes|comment_bank/ },
  { label: 'Data & Tempo', test: /calendar|schedule|timer|time|clock|date|hourglass|event|history|today|alarm|update|sunrise|sunset|schedule_send/ },
  { label: 'Menus & Layout', test: /menu|apps|grid|view|list|layout|tabs|panel|sidebar|space|web|dock|split|drag_indicator|select_all|reorder|wrap_text|align_|vertical|horizontal/ },
  { label: 'Desenvolvimento', test: /code|terminal|bug|debug|api|database|branch|merge|commit|deploy|integration|variables|function|calculate|math|json|folder_zip|cloud_sync|cloud_upload|cloud_download|data_object/ },
  { label: 'Educação & Trabalho', test: /school|book|workspace|domain|corporate|business|work|office|badge|meeting|team|science|labs|quiz|assignment|history_edu|engineering/ },
  { label: 'Esportes & Lazer', test: /sports|game|toys|celebration|party|fitness|gym|medal|trophy|star|award|premium|rank|stadium|music_note|nightlife|attractions|festival/ },
  { label: 'Indústria & Ferramentas', test: /construction|hammer|factory|machine|agriculture|plumbing|carpenter|architecture|handyman|hardware|precision|rocket|sprint|deployment/ },
  { label: 'IoT & Sensores', test: /sensor|smart|eco|robot|automation|signal|network|wifi|bluetooth|connected|antenna|router|ssid|hub/ },
  { label: 'Diversos', test: /flag|label|bookmark|tag|push_pin|attachment|link|star_rate|grade|circle|square|change_|toggle|switch|radio_button|more_|expand|_block|_off$|_on$/ },
];

/** Calcula as categorias presentes na lista de ícones (uma categoria por glifo). */
function buildIconCategories(): Array<{ label: string; icons: string[] }> {
  const byLabel = new Map<string, string[]>(ICON_CATEGORY_RULES.map((r) => [r.label, []]));
  const other: string[] = [];
  for (const name of FENIX_ICON_NAMES) {
    const rule = ICON_CATEGORY_RULES.find((r) => r.test.test(name));
    if (rule) byLabel.get(rule.label)!.push(name);
    else other.push(name);
  }
  const cats = ICON_CATEGORY_RULES
    .map((r) => ({ label: r.label, icons: byLabel.get(r.label)! }))
    .filter((c) => c.icons.length > 0);
  if (other.length > 0) cats.push({ label: 'Outros', icons: other });
  return cats;
}

/** Página Ícones — uso da biblioteca padrão + grid pesquisável/paginado de todos os glifos. */
async function renderIcons(): Promise<void> {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>Ícones</h2>
    <p class="lead">O FenixUI traz uma biblioteca de ícones padrão com <b>${FENIX_ICON_NAMES.length} glifos</b>,
    já <b>self-hosted</b> no pacote — nenhuma dependência externa, nenhum CDN, nada para instalar além do
    próprio <code>@wrrdev/fenix-ui</code>. Para usar, basta aplicar a classe na tag:</p>

    <h3>1. Uso geral (qualquer lugar da aplicação)</h3>
    <pre><code>&lt;!-- Importe UMA vez no projeto (o auto-import faz isso por você) --&gt;
import '@wrrdev/fenix-ui/icons';

&lt;!-- Por classe (recomendado) --&gt;
&lt;i class="fx-icon fx-icon-home"&gt;&lt;/i&gt;
&lt;span class="fx-icon fx-icon-settings"&gt;&lt;/span&gt;

&lt;!-- Ou com o nome do ícone como conteúdo --&gt;
&lt;i class="fx-icon"&gt;home&lt;/i&gt;</code></pre>

    <div class="note">
      <strong>Auto Import:</strong> com o plugin <code>FenixAutoImport</code>, qualquer uso de
      <code>class="fx-icon…"</code> no seu código injeta automaticamente
      <code>import '@wrrdev/fenix-ui/icons'</code> — você só escreve a classe e usa.
    </div>

    <h3>2. Modificadores</h3>
    <table>
      <thead><tr><th>Classe</th><th>Efeito</th></tr></thead>
      <tbody>
        <tr><td><code>fx-icon</code></td><td>Classe base — obrigatória quando o nome vem como conteúdo</td></tr>
        <tr><td><code>fx-icon-fill</code></td><td>Versão preenchida (filled) do glifo</td></tr>
        <tr><td><code>fx-icon-bold</code></td><td>Traço mais pesado (peso 600)</td></tr>
      </tbody>
    </table>

    <h3>3. Nos componentes</h3>
    <p>Componentes com <code>slot="icon"</code> (button, avatar, empty-state, dropdown-item…) aceitam diretamente:</p>
    <pre><code>&lt;fx-button&gt;
  &lt;i class="fx-icon fx-icon-save" slot="icon"&gt;&lt;/i&gt;
  Salvar
&lt;/fx-button&gt;</code></pre>
    <p>Componentes com atributo <code>icon</code> também aceitam o nome do glifo — se o valor for um nome
    de ícone válido, ele é renderizado com a fonte (senão, emoji/texto livre continua funcionando):</p>
    <table>
      <thead><tr><th>Componente</th><th>Exemplo</th></tr></thead>
      <tbody>
        <tr><td><code>fx-alert</code></td><td><code>&lt;fx-alert icon="notification" variant="info"&gt;…&lt;/fx-alert&gt;</code></td></tr>
        <tr><td><code>fx-toast</code></td><td><code>&lt;fx-toast kind="success" icon="check_circle" title="OK"&gt;&lt;/fx-toast&gt;</code></td></tr>
        <tr><td><code>fx-confirmpopup</code></td><td><code>&lt;fx-confirmpopup icon="help" …&gt;</code></td></tr>
      </tbody>
    </table>

    <h3>4. Autocomplete no editor (<code>&lt;fx-icon&gt;</code>)</h3>
    <p>As classes acima são CSS puro: nenhum editor consegue adivinhar o nome do glifo enquanto você digita.
    Para isso existe o elemento <code>&lt;fx-icon&gt;</code>, com o atributo <code>name</code>
    <strong>tipado</strong> — o editor (Volar/vue-tsc, React/TSX) lista os <b>${FENIX_ICON_NAMES.length}</b> nomes
    válidos da fonte e o <code>FenixAutoImport</code> injeta o import sozinho.</p>
    <pre><code>&lt;!-- Vue 3 (SFC): digite name=" e o editor completa com os glifos --&gt;
&lt;fx-icon name="home" /&gt;
&lt;fx-icon name="settings" size="lg" label="Configurações" /&gt;

&lt;!-- React / TSX --&gt;
&lt;fx-icon name="delete" label="Excluir" /&gt;</code></pre>
    <p>Habilite as tipagens uma única vez no projeto:</p>
    <pre><code>// main.ts (Vue 3)
import '@wrrdev/fenix-ui/vue';   // autocomplete dos elementos fx-* (inclusive fx-icon)
import '@wrrdev/fenix-ui/icon';  // o elemento em si — o auto-import já injeta</code></pre>
    <div class="note">
      <strong>Hover:</strong> passe o mouse sobre o nome sugerido e o editor mostra a assinatura do atributo.
      <strong>Dica de ouro:</strong> instale a fonte do pacote
      (<code>node_modules/@wrrdev/fenix-ui/dist/icons/fenix-icons.woff2</code>) no sistema e ative
      <em>ligaduras de fonte</em> no editor — as sugestões passam a aparecer <strong>desenhadas como o próprio
      ícone</strong>, e o texto <code>home</code> escrito no código também vira o glifo.
    </div>

    <h3>5. Todos os ícones</h3>
    <p>Busque, passe o mouse para pré-visualizar e clique no ícone para abrir as opções de cópia — nome do glifo, classe ou tag pronta.
    <b>Atenção:</b> a classe <code>fx-icon-&lt;nome&gt;</code> sozinha não renderiza — ela precisa da classe
    base <code>fx-icon</code> (que aplica a fonte). Na modal, prefira a opção <i>Classe completa</i>.</p>
    <span id="icon-count" class="icon-count"></span>
    <div class="icon-layout">
      <div class="icon-main">
        <input id="icon-search" type="search" class="icon-search" placeholder="Buscar ícone… (ex.: home, delete, settings)" />
        <div id="icon-grid" class="icon-grid"></div>
        <fx-pagination id="icon-pager" position="center" rows="96" rows-options="48,96,192,288" hidden></fx-pagination>
      </div>
      <aside class="icon-aside">
        <ul id="icon-cats" class="icon-cats"></ul>
      </aside>
    </div>
    <div id="icon-preview" class="icon-preview" hidden aria-hidden="true"></div>
    <style>
      .icon-layout {
        display: grid; grid-template-columns: minmax(0, 1fr) 190px;
        gap: 20px; align-items: start;
        /* Largura DEFINIDA (independente do conteúdo): no main (flex column)
           os filhos recebem margin-inline:auto, o que os torna fit-content —
           sem este width:100% a página e o input de busca encolhiam toda vez
           que a busca devolvia poucos ícones (ou o pager era ocultado). */
        width: 100%;
      }
      .icon-aside {
        position: sticky; top: 16px;
        max-height: calc(100vh - 96px); overflow-y: auto;
        border: 1px solid var(--fx-border-default); border-radius: var(--fx-radius-md);
        background: var(--fx-surface-background); padding: 6px;
      }
      .icon-cats { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
      .icon-cat {
        width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 6px;
        padding: 7px 10px; font: inherit; font-size: 12px; cursor: pointer; text-align: left;
        border: 1px solid transparent; border-radius: var(--fx-radius-sm);
        background: transparent; color: var(--fx-text-default);
      }
      .icon-cat:hover { background: var(--fx-surface-surface-hover, rgba(0,0,0,.04)); color: var(--fx-color-primary); }
      .icon-cat.active { background: var(--fx-color-primary); color: var(--fx-color-primary-contrast, #fff); font-weight: 600; }
      .icon-cat small { opacity: .7; font-size: 11px; font-weight: 400; }
      .icon-search {
        width: 100%; max-width: 420px; padding: 10px 14px; margin-bottom: 16px;
        border: 1px solid var(--fx-border-default); border-radius: var(--fx-radius-md);
        background: var(--fx-surface-background); color: var(--fx-text-default);
        font: inherit; outline: none;
      }
      .icon-search:focus { border-color: var(--fx-color-primary); }
      .icon-count { color: var(--fx-text-muted); font-size: 13px; }
      .icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 6px; margin-bottom: 16px; }
      .icon-cell {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        padding: 12px 4px 8px; border: 1px solid transparent; border-radius: var(--fx-radius-md);
        background: transparent; cursor: pointer; color: var(--fx-text-default); font: inherit;
      }
      .icon-cell:hover { background: var(--fx-surface-surface-hover, rgba(0,0,0,.04)); border-color: var(--fx-border-default); }
      .icon-cell .fx-icon { font-size: 26px; color: var(--fx-text-default); }
      .icon-cell span { font-size: 10px; color: var(--fx-text-muted); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .icon-cell.copied { border-color: var(--fx-color-success); }
      /* Preview no hover: passar o mouse num ícone mostra o glifo + a classe. */
      .icon-preview {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        z-index: var(--fx-z-toast, 1200);
        display: flex; align-items: center; gap: 10px;
        padding: 10px 16px; border-radius: var(--fx-radius-md);
        background: var(--fx-surface-background); border: 1px solid var(--fx-border-default);
        box-shadow: var(--fx-shadow-lg); font-size: 13px; pointer-events: none;
      }
      .icon-preview[hidden] { display: none; }
      .icon-preview .fx-icon { font-size: 30px; }
      .icon-preview code { color: var(--fx-text-muted); }
      #icon-pager { margin-top: 4px; }
      @media (max-width: 900px) {
        .icon-layout { grid-template-columns: 1fr; }
        .icon-aside { position: static; max-height: 180px; }
      }
    </style>
  `;

  const input = document.getElementById('icon-search') as HTMLInputElement;
  const grid = document.getElementById('icon-grid')!;
  const count = document.getElementById('icon-count')!;
  const catsMenu = document.getElementById('icon-cats')!;
  const pager = document.getElementById('icon-pager') as any;

  // Garante o registro do fx-pagination (loader lazy da doc).
  try { await componentLoaders['fx-pagination'](); } catch { /* já registrado ou indisponível */ }

  const categories = buildIconCategories();
  let activeCategory = 'Todos';
  let page = 1;
  let rows = Number(pager.getAttribute('rows')) || ICON_PAGE_SIZE;

  /* Menu vertical de categorias (lado direito, com scroll próprio) */
  catsMenu.innerHTML = [`Todos|${FENIX_ICON_NAMES.length}`, ...categories.map((c) => `${c.label}|${c.icons.length}`)]
    .map((entry) => {
      const [label, total] = entry.split('|');
      return `<li><button type="button" class="icon-cat${label === 'Todos' ? ' active' : ''}" data-cat="${esc(label)}"><span>${esc(label)}</span><small>${total}</small></button></li>`;
    })
    .join('');
  catsMenu.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.icon-cat');
    if (!btn?.dataset.cat) return;
    activeCategory = btn.dataset.cat;
    catsMenu.querySelectorAll('.icon-cat').forEach((b) => b.classList.toggle('active', b === btn));
    page = 1;
    pager.setAttribute('page', '1');
    renderGrid();
  });

  const renderGrid = (): void => {
    const q = input.value.trim().toLowerCase();
    const pool = activeCategory === 'Todos'
      ? FENIX_ICON_NAMES
      : (categories.find((c) => c.label === activeCategory)?.icons ?? FENIX_ICON_NAMES);
    const matches = pool.filter((n) => !q || n.includes(q));
    const start = (page - 1) * rows;
    const shown = matches.slice(start, start + rows);
    grid.innerHTML = shown
      .map((n) => `<button type="button" class="icon-cell" data-icon="${n}" title="Copiar fx-icon-${n}"><i class="fx-icon fx-icon-${n}"></i><span>${n}</span></button>`)
      .join('');
    count.textContent = `${matches.length} ícone(s) em "${activeCategory}"`;
    pager.setAttribute('total', String(matches.length));
    pager.setAttribute('rows', String(rows));
    // `hidden` não basta: o :host do fx-pagination define display:flex, então controlamos via style.
    pager.style.display = matches.length <= rows ? 'none' : '';
  };

  pager.addEventListener('page-change', (e: CustomEvent) => {
    const detail = e.detail ?? {};
    page = detail.page ?? 1;
    if (detail.rows && detail.rows !== rows) { rows = detail.rows; page = 1; }
    renderGrid();
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  input.addEventListener('input', renderGrid);
  grid.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.icon-cell');
    if (!cell?.dataset.icon) return;
    void openIconCopyModal(cell.dataset.icon);
  });
  // Preview no hover: mostra o glifo em tamanho grande + a classe exata.
  const preview = document.getElementById('icon-preview')!;
  grid.addEventListener('mouseover', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.icon-cell');
    if (!cell?.dataset.icon) return;
    preview.innerHTML = `<i class="fx-icon fx-icon-${esc(cell.dataset.icon)}"></i><code>.fx-icon-${esc(cell.dataset.icon)}</code>`;
    preview.hidden = false;
  });
  grid.addEventListener('mouseleave', () => {
    preview.hidden = true;
  });
  renderGrid();
}

/** Abre a modal (fx-dialog) com todas as variações de código para copiar o ícone. */
async function openIconCopyModal(icon: string): Promise<void> {
  // Garante que o componente fx-dialog esteja registrado (registro lazy).
  try { await componentLoaders['fx-dialog'](); } catch { /* já registrado ou indisponível */ }

  let dlg = document.getElementById('icon-copy-dialog') as (HTMLElement & { open?: boolean }) | null;
  if (!dlg) {
    dlg = document.createElement('fx-dialog');
    dlg.id = 'icon-copy-dialog';
    dlg.setAttribute('size', 'sm');
    // 50% maior que o tamanho sm (400px) para o botão não cobrir o código copiável.
    dlg.style.setProperty('--fx-dialog-width', '600px');
    document.body.appendChild(dlg);
  }
  dlg.setAttribute('heading', `Copiar ícone — ${icon}`);

  const name = esc(icon);

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Nome do glifo', value: icon },
    { label: 'Classe completa (recomendado)', value: `fx-icon fx-icon-${icon}` },
    { label: 'Classe do glifo (sozinha)', value: `fx-icon-${icon}` },
    { label: 'Tag <i> pronta', value: `<i class="fx-icon fx-icon-${icon}"></i>` },
    { label: 'Tag <span> pronta (nome como conteúdo)', value: `<span class="fx-icon">${icon}</span>` },
    { label: 'Versão preenchida (fill)', value: `<i class="fx-icon fx-icon-fill fx-icon-${icon}"></i>` },
  ];

  dlg.innerHTML = `
    <div class="icon-copy-preview">
      <span class="fx-icon fx-icon-${name}"></span>
      <code>${name}</code>
    </div>
    <div class="icon-copy-list">
      ${rows.map((r) => `
        <div class="icon-copy-row">
          <div class="icon-copy-meta">
            <span class="icon-copy-label">${r.label}</span>
            <code class="icon-copy-value">${esc(r.value)}</code>
          </div>
          <button type="button" class="icon-copy-btn" data-value="${esc(r.value)}">Copiar</button>
        </div>`).join('')}
    </div>
    <style>
      .icon-copy-preview {
        display: flex; align-items: center; gap: 14px;
        padding: 12px 16px; margin-bottom: 16px;
        border: 1px solid var(--fx-border-default); border-radius: var(--fx-radius-md);
        background: var(--fx-surface-background);
      }
      .icon-copy-preview .fx-icon { font-size: 40px; color: var(--fx-color-primary); }
      .icon-copy-preview code { font-size: 15px; color: var(--fx-text-default); }
      .icon-copy-list { display: flex; flex-direction: column; gap: 10px; }
      .icon-copy-row {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 10px 12px; border: 1px solid var(--fx-border-default);
        border-radius: var(--fx-radius-md);
      }
      .icon-copy-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
      .icon-copy-label { font-size: 13px; font-weight: 600; color: var(--fx-text-default); }
      .icon-copy-value {
        font-size: 12px; color: var(--fx-text-muted);
        max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .icon-copy-btn {
        flex-shrink: 0; align-self: flex-start; margin-top: 1px;
        padding: 3px 9px; font: inherit; font-size: 11px; line-height: 1.3; cursor: pointer;
        border: 1px solid var(--fx-border-default); border-radius: var(--fx-radius-sm);
        background: var(--fx-surface-background); color: var(--fx-text-default);
      }
      .icon-copy-btn:hover { border-color: var(--fx-color-primary); color: var(--fx-color-primary); }
      .icon-copy-btn.copied { border-color: var(--fx-color-success); color: var(--fx-color-success); }
    </style>
  `;

  dlg.querySelectorAll<HTMLButtonElement>('.icon-copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(btn.dataset.value ?? '').catch(() => { /* clipboard indisponível */ });
      btn.textContent = 'Copiado!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 1200);
    });
  });

  dlg.setAttribute('open', '');
}

/* ------------------------------------------------------------------ */
/* Drawer de customização de tema (header)                             */
/* ------------------------------------------------------------------ */

/** Lê os tokens customizados a partir dos controles do drawer. */
function readDrawerCustomTokens(): DeepPartial<FenixTokens> {
  const colorInputs = document.querySelectorAll<HTMLInputElement>('input[data-drawer-color]');
  const colors: Record<string, string> = {};
  colorInputs.forEach((input) => {
    colors[input.dataset.drawerColor!] = input.value;
  });
  const radius = (document.getElementById('drawer-radius') as any)?.value ?? '8px';
  const readSize = (id: string, fallback: string): string =>
    (document.getElementById(id) as any)?.value || fallback;
  const focusRing = document.querySelector('fx-switch#drawer-focus-ring') as any;
  const ripple = document.querySelector('fx-switch#drawer-ripple') as any;
  return {
    color: colors,
    radius: { sm: radius === '9999px' ? '9999px' : `calc(${radius} / 2)`, md: radius, lg: `calc(${radius} * 1.5)` },
    size: {
      sm: readSize('drawer-size-sm', '32px'),
      md: readSize('drawer-size-md', '40px'),
      lg: readSize('drawer-size-lg', '48px'),
    },
    effect: {
      'focus-ring': focusRing && !focusRing.checked
        ? 'none'
        : '0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)',
      ripple: ripple && !ripple.checked ? '0' : '1',
    },
  };
}

/** Gera o JSON formatado do preset atual para exibição na aba "Preset". */
function buildPresetJson(): string {
  const tokens = readDrawerCustomTokens();
  const nameInput = document.getElementById('drawer-name') as HTMLInputElement;
  const labelInput = document.getElementById('drawer-label') as HTMLInputElement;
  const name = slugify(nameInput?.value || 'meu-tema');
  const label = labelInput?.value || name;
  const preset = defineCustomPreset(name, label, tokens);
  return JSON.stringify({ $schema: 'fenix-preset/v1', ...preset }, null, 2);
}

/** Atualiza o preview ao vivo no drawer. */
function refreshDrawerPreview(): void {
  const preview = document.getElementById('drawer-preview-stage');
  if (!preview) return;
  FenixUI.setTokens(readDrawerCustomTokens());
  preview.innerHTML = `
    <fx-button variant="primary">Primário</fx-button>
    <fx-button variant="success">Sucesso</fx-button>
    <fx-button variant="outline">Outline</fx-button>
    <fx-badge variant="danger">7</fx-badge>
    <fx-spinner></fx-spinner>
    <fx-input placeholder="Digite algo…"></fx-input>
    <fx-select><option value="a">Opção A</option><option value="b">Opção B</option></fx-select>
  `;
}

/** Atualiza o bloco de JSON do preset na aba "Preset". */
function updateDrawerPresetJson(): void {
  const pre = document.getElementById('drawer-preset-json');
  if (pre) pre.textContent = buildPresetJson();
}

/** Monta o HTML do drawer de customização. */
function buildThemeDrawerHtml(): string {
  const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info']
    .map((c) => `<div class="control-item"><label>${c}<input type="color" data-drawer-color="${c}" id="dc-${c}"></label></div>`)
    .join('');

  return `
    <div class="theme-drawer-body">
      <fx-tabs value="custom">
        <fx-tab tab="custom">Personalizar</fx-tab>
        <fx-tab tab="preset">Preset</fx-tab>
      </fx-tabs>
      <fx-tab-panel tab="custom">
        <div class="tab-content">
          <div class="controls-grid">
            ${colors}
            <div class="control-item">
              <label>Arredondamento</label>
              <fx-select id="drawer-radius" value="8px">
                <option value="0">Nenhum (retas)</option>
                <option value="4px">Pequeno</option>
                <option value="8px">Médio</option>
                <option value="16px">Grande</option>
                <option value="9999px">Pílula</option>
              </fx-select>
            </div>
            <div class="control-item">
              <label>Tamanho sm</label>
              <fx-select id="drawer-size-sm" value="32px">
                <option value="28px">Compacto (28px)</option>
                <option value="32px">Padrão (32px)</option>
                <option value="36px">Confortável (36px)</option>
              </fx-select>
            </div>
            <div class="control-item">
              <label>Tamanho md</label>
              <fx-select id="drawer-size-md" value="40px">
                <option value="34px">Compacto (34px)</option>
                <option value="40px">Padrão (40px)</option>
                <option value="44px">Confortável (44px)</option>
              </fx-select>
            </div>
            <div class="control-item">
              <label>Tamanho lg</label>
              <fx-select id="drawer-size-lg" value="48px">
                <option value="42px">Compacto (42px)</option>
                <option value="48px">Padrão (48px)</option>
                <option value="56px">Confortável (56px)</option>
              </fx-select>
            </div>
            <div class="control-item">
              <label><fx-switch id="drawer-focus-ring" checked>Anel de foco</fx-switch></label>
            </div>
            <div class="control-item">
              <label><fx-switch id="drawer-ripple" checked>Efeito ripple</fx-switch></label>
            </div>
          </div>
          <div class="preview-section">
            <h4>Preview ao vivo</h4>
            <div class="preview-stage" id="drawer-preview-stage">
              <fx-button variant="primary">Primário</fx-button>
              <fx-button variant="success">Sucesso</fx-button>
              <fx-button variant="outline">Outline</fx-button>
              <fx-badge variant="danger">7</fx-badge>
              <fx-spinner></fx-spinner>
              <fx-input placeholder="Digite algo…"></fx-input>
              <fx-select><option value="a">Opção A</option><option value="b">Opção B</option></fx-select>
            </div>
          </div>
        </div>
      </fx-tab-panel>
      <fx-tab-panel tab="preset">
        <div class="tab-content">
          <div class="control-item" style="margin-bottom:12px">
            <label>Nome do tema</label>
            <fx-input id="drawer-name" value="meu-tema"></fx-input>
          </div>
          <div class="control-item" style="margin-bottom:12px">
            <label>Rótulo</label>
            <fx-input id="drawer-label" value="✨ Meu Tema"></fx-input>
          </div>
          <h4 style="margin:16px 0 8px;font-size:.85rem;color:var(--fx-text-muted)">Preset gerado</h4>
          <pre class="preset-json" id="drawer-preset-json">${esc(buildPresetJson())}</pre>
          <div class="drawer-footer" style="border-top:none;padding-top:0;margin-top:12px">
            <fx-button id="drawer-download" variant="primary">⬇️ Baixar preset</fx-button>
            <div class="spacer"></div>
            <span class="status" id="drawer-status"></span>
          </div>
        </div>
      </fx-tab-panel>
    </div>
  `;
}

/** Inicializa controles do drawer e liga eventos. */
function initDrawerControls(): void {
  document.querySelectorAll<HTMLInputElement>('input[data-drawer-color]').forEach((input) => {
    input.value = DEFAULT_CUSTOM_COLORS[input.dataset.drawerColor!];
    input.addEventListener('input', () => {
      refreshDrawerPreview();
      updateDrawerPresetJson();
    });
  });
  for (const id of ['drawer-radius', 'drawer-size-sm', 'drawer-size-md', 'drawer-size-lg']) {
    document.getElementById(id)?.addEventListener('change', () => {
      refreshDrawerPreview();
      updateDrawerPresetJson();
    });
  }
  for (const id of ['drawer-focus-ring', 'drawer-ripple']) {
    document.getElementById(id)?.addEventListener('change', () => {
      refreshDrawerPreview();
      updateDrawerPresetJson();
    });
  }
  for (const id of ['drawer-name', 'drawer-label']) {
    document.getElementById(id)?.addEventListener('input', updateDrawerPresetJson);
  }
  document.getElementById('drawer-download')?.addEventListener('click', () => {
    const nameInput = document.getElementById('drawer-name') as HTMLInputElement;
    const labelInput = document.getElementById('drawer-label') as HTMLInputElement;
    const name = slugify(nameInput?.value || 'meu-tema');
    const preset = defineCustomPreset(name, labelInput?.value || name, readDrawerCustomTokens());
    downloadPreset(preset);
    currentPreset = name;
    syncHeaderControls(name, currentMode);
    const status = document.getElementById('drawer-status');
    if (status) status.textContent = `✅ Baixado como ${name}.fenix-preset.json`;
  });
  updateDrawerPresetJson();
}

/** Configura o drawer de customização no header. */
async function setupThemeDrawer(): Promise<void> {
  await Promise.all(THEME_DRAWER_TAGS.map((t) => componentLoaders[t]?.()));
  await Promise.all(THEME_DRAWER_TAGS.map((t) => customElements.whenDefined(t)));
  const toggle = document.getElementById('theme-customize-toggle');
  const drawer = document.getElementById('theme-customize-drawer') as any;
  if (!toggle || !drawer) return;
  let initialized = false;
  toggle.addEventListener('click', () => {
    if (!initialized) {
      drawer.innerHTML = buildThemeDrawerHtml();
      initialized = true;
    }
    drawer.open = true;
    setTimeout(() => initDrawerControls(), 60);
  });
  drawer.addEventListener('close', () => { drawer.open = false; });
}

/** Eventos de ação globais da doc (funciona dentro de shadow DOM e no jsdom). */
document.addEventListener('click', (e: MouseEvent) => {
  const path = 'composedPath' in e ? e.composedPath() as Element[] : [];
  const opener = (path.find((n) => n instanceof Element && n.hasAttribute?.('data-fx-open')) ??
    (e.target as Element)?.closest?.('[data-fx-open')) as HTMLElement | undefined;
  if (opener) {
    const id = opener.getAttribute('data-fx-open')!;
    const drawer = document.getElementById(id);
    if (drawer) drawer.setAttribute('open', '');
  }
});

applyPreset('fenix', 'light');
setupHeader();
setupSearch();
setupThemeDrawer();
buildSidebar();
defineFxTooltipDirective();

/** Promise resolvida quando o render da rota atual finaliza — útil para testes. */
let routeResolve: (() => void) | null = null;
let _routeReady: Promise<void> = Promise.resolve();
export const currentRouteReady = (): Promise<void> => _routeReady;

/** Único listener de hashchange: controla a promise de render e despacha a rota. */
window.addEventListener('hashchange', () => {
  _routeReady = new Promise<void>((r) => (routeResolve = r));
  renderRoute().then(() => routeResolve?.()).catch(() => routeResolve?.());
});

/** Disparo inicial na primeira carga. */
_routeReady = new Promise<void>((r) => (routeResolve = r));
renderRoute().then(() => routeResolve?.()).catch(() => routeResolve?.());



