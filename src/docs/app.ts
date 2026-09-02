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

function codeBlock(code: string): string {
  return `<div class="code-block"><pre><code>${esc(code)}</code></pre><button class="copy-btn">Copiar</button></div>`;
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


function apiTable(title: string, rows: ApiRow[], cols: string[]): string {
  const head = cols.map((c) => `<th>${c}</th>`).join('');
  const body = rows
    .map((r) => {
      const cells = [
        `<td><code class="inline">${esc(r.name)}</code></td>`,
        r.type ? `<td class="type">${esc(r.type)}</td>` : '<td>—</td>',
        r.default ? `<td class="default">${esc(r.default)}</td>` : '<td>—</td>',
        `<td>${r.desc}</td>`,
      ];
      return `<tr>${cells.filter((_, i) => cols[i]).join('')}</tr>`;
    })
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
      navigator.clipboard.writeText(btn.parentElement!.querySelector('code')!.textContent ?? '');
      btn.textContent = 'Copiado!';
      setTimeout(() => (btn.textContent = 'Copiar'), 1200);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Páginas: Introdução e Theming                                       */
/* ------------------------------------------------------------------ */

async function renderIntro(): Promise<void> {
  // Componentes usados no exemplo desta página (carga lazy).
  const tags = ['fx-button', 'fx-badge', 'fx-spinner'];
  await Promise.all(tags.map((t) => componentLoaders[t]?.()));
  await Promise.all(tags.map((t) => customElements.whenDefined(t)));
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>Introdução</h2>
    <p class="lead">FenixUI é um Design System de <strong>Web Components nativos</strong> — funciona com
    qualquer framework (ou sem nenhum). Cada componente é importável isoladamente, então o bundle do
    cliente contém apenas o que ele usa.</p>
    <h3>Instalação</h3>
    ${codeBlock('npm install @wrrdev/fenix-ui')}
    <h3>Uso básico</h3>
    ${codeBlock("import '@wrrdev/fenix-ui/button';\nimport { FenixUI } from '@wrrdev/fenix-ui';\n\nFenixUI.theme('dark');")}
    <h3>Componentes</h3>
    <div class="demo"><div class="demo-stage">
      <fx-button variant="primary">Button</fx-button>
      <fx-badge variant="success">Badge</fx-badge>
      <fx-spinner></fx-spinner>
    </div></div>
    <p>Consulte cada componente no menu lateral para exemplos interativos e API completa.</p>
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
        { name: 'size', type: 'sm, md, lg', default: '32 / 40 / 48px', desc: 'Altura dos controles (button, input, select, multiselect) — personalize a escala de tamanhos no preset.' },
        { name: 'shadow', type: 'sm, md, lg', default: 'elevações suaves', desc: 'Sombras de elevação.' },
        { name: 'motion', type: 'duration-fast, duration-normal, easing', default: '120/240ms', desc: 'Velocidade e curva das transições.' },
        { name: 'effect', type: `ripple ('1'/'0'), focus-ring`, default: 'ligados', desc: 'Ripple do botão e anel de foco dos campos — desative para visual sem sobra.' },
        { name: 'z', type: 'base, dropdown, modal, toast', default: '1000–1200', desc: 'Camadas de sobreposição.' },
      ],
      ['Grupo', 'Chaves', 'Padrão', 'Descrição'],
    )}
    ${codeBlock("// O preset só precisa do que for diferente do tema base:\nFenixUI.setTokens({\n  color: { primary: '#0d9488' },   // só a cor primária muda\n  effect: { 'focus-ring': 'none' }, // campos sem anel de foco\n  size: { lg: '52px' },             // só o tamanho lg fica maior\n});")}
    <h3>API de tema</h3>
    ${apiTable('Métodos', [
      { name: 'FenixUI.theme(name)', type: `name: 'light' | 'dark'`, desc: 'Troca o modo de cor em runtime.' },
      { name: 'FenixUI.setTokens(tokens)', type: 'DeepPartial<FenixTokens>', desc: 'Override parcial profundo (ex.: só color.primary).' },
      { name: 'FenixUI.configure(options)', type: 'ConfigureOptions', desc: 'Configuração combinada; retorna o estado ativo.' },
      { name: 'FenixUI.resetTheme()', type: '', desc: 'Volta ao tema claro padrão, sem overrides.' },
      { name: 'applyPreset(preset, mode)', type: `preset: string, mode: 'light' | 'dark'`, desc: 'Aplica um preset nomeado + modo.' },
    ], ['Método', 'Tipo', 'Padrão', 'Descrição'])}
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
  });
}

/* ------------------------------------------------------------------ */
/* Roteamento (hash) + sidebar                                         */
/* ------------------------------------------------------------------ */

function buildSidebar(): void {
  const groups = new Map<string, { id: string; title: string }[]>();
    groups.set('Guia', [
    { id: 'introduction', title: 'Introdução' },
    { id: 'vue3', title: 'Vue 3 / Nuxt' },
    { id: 'auto-import', title: 'Auto Import' },
    { id: 'theming', title: 'Temas' },
  ]);
  for (const c of components) {
    if (!groups.has(c.group)) groups.set(c.group, []);
    groups.get(c.group)!.push({ id: c.tag, title: c.title });
  }
  document.getElementById('sidebar')!.innerHTML = [...groups.entries()]
    .map(
      ([group, items]) =>
        `<div class="group">${group}</div>` +
        items.map((i) => `<a href="#/${i.id}" data-id="${i.id}">${i.title}</a>`).join(''),
    )
    .join('');
}

/**
 * Converte o HTML de variantes em cards "modelo + código": cada elemento
 * de topo vira um card com preview em cima e o código correspondente abaixo.
 * Títulos <h4> viram rótulos do card; wrappers <div> sem texto são "abertos"
 * para que cada exemplo interno tenha seu próprio par preview/código.
 */
function renderVariantCards(doc: ComponentDoc): string {
  const parsed = new DOMParser().parseFromString(doc.variantsHtml!(), 'text/html');
  const cards: string[] = [];

  const pushCard = (el: Element, title: string): void => {
    const html = el.outerHTML;
    cards.push(
      `<div class="example-card">` +
        (title ? `<div class="example-title">${esc(title)}</div>` : '') +
        `<div class="example-stage">${html}</div>` +
        `<div class="code-block example-code"><pre><code>${esc(formatHtml(html))}</code></pre><button class="copy-btn">Copiar</button></div>` +
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
        node.tagName === 'DIV' &&
        !node.textContent?.trim() &&
        [...node.children].length > 1;
      if (isGenericWrapper) {
        walk(node, inheritedTitle);
        continue;
      }
      const title =
        node.previousElementSibling && /^H[1-4]$/.test(node.previousElementSibling.tagName)
          ? node.previousElementSibling.textContent!.trim()
          : inheritedTitle;
      pushCard(node, title);
    }
  };
  walk(parsed.body, '');

  if (!cards.length) return '';
  return `<div class="examples">${cards.join('')}</div>`;
}

/** Snippet de tipagem TypeScript gerado a partir da tabela de atributos. */
function renderTyping(doc: ComponentDoc): string {
  const pascal = doc.tag
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
  const iface = doc.attributes
    .filter((a) => /^[a-z][a-z0-9-]*$/i.test(a.name))
    .map((a) => `  /** ${a.desc.replace(/<[^>]+>/g, '')} */\n  '${a.name}'?: ${a.type};`)
    .join('\n');
  if (!iface) return '';
  return [
    '<h3>Tipagem TypeScript</h3>',
    `<p>Todas as variantes e propriedades têm tipos prontos — importe de <code class="inline">@wrrdev/fenix-ui/vue</code>`,
    `(Vue/Volar) ou <code class="inline">@wrrdev/fenix-ui/jsx</code> (React/TSX) e o editor autocompleta cada atributo:</p>`,
    codeBlock(`import type { Fx${pascal}Props } from '@wrrdev/fenix-ui/vue';\n\nconst props: Fx${pascal}Props = {\n${iface.split('\n').slice(0, 14).join('\n')}\n};`),
  ].join(' ');
}

/** Coleta todas as tags fx-* usadas no demoHtml e variantsHtml do doc. */
function collectDemoTags(doc: ComponentDoc): string[] {
  const html = doc.demoHtml('') + (doc.variantsHtml?.() ?? '');
  const all = [...new Set([...html.matchAll(/<fx-[a-z-]+/g)].map((m) => m[0].slice(1)))];
  // Só aguarda tags que são custom elements registrados (fx-tab é slot, não CE).
  return all.filter((t) => t in componentLoaders);
}

async function renderComponentPage(doc: ComponentDoc): Promise<void> {
	// Garante que todos os fx-* usados no demo e variantes sejam importados primeiro.
	const tags = collectDemoTags(doc);
	await Promise.all(tags.map((t) => componentLoaders[t]?.()));

	const main = document.getElementById("main")!;
	main.innerHTML = `
    <h2>&lt;${doc.tag}&gt;</h2>
    <p class="lead">${doc.lead}</p>
    <h3>Importação (tree-shakeable)</h3>
    ${codeBlock(doc.imports.join("\n"))}
    ${doc.initNote ? `<div class="note"><strong>Nota:</strong> ${doc.initNote}</div>` : ''}
    <h3>Playground</h3>
    <div class="demo">
      <div class="demo-stage" id="stage"></div>
      <div class="demo-controls">${buildControls(doc)}</div>
    </div>
    ${codeBlock(`<${doc.tag}>…</${doc.tag}>`)}
    <h3>Variantes e usos (modelo + código)</h3>
    ${doc.variantsHtml ? renderVariantCards(doc) : ''}
    ${apiTable("Atributos / Propriedades", doc.attributes, ["Nome", "Tipo", "Padrão", "Descrição"])}
    ${doc.events ? apiTable("Eventos", doc.events, ["Evento", "Tipo", "Padrão", "Descrição"]) : ""}
    ${doc.slots ? apiTable("Slots", doc.slots, ["Slot", "Tipo", "Padrão", "Descrição"]) : ""}
    ${doc.cssVars ? apiTable("Variáveis CSS", doc.cssVars, ["Variável", "Tipo", "Padrão", "Descrição"]) : ""}
    ${renderTyping(doc)}
  `;

	// Aguarda TODAS as tags customizadas serem definidas antes de manipular o stage.
	await Promise.all(collectDemoTags(doc).map((tag) => customElements.whenDefined(tag)));

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
			codeEl.textContent = formatHtml(clean);
		}
	};;
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

async function renderRoute(): Promise<void> {
  const route = location.hash.replace(/^#\//, '') || 'introduction';
  document.querySelectorAll('#sidebar a').forEach((a) =>
    a.classList.toggle('active', (a as HTMLAnchorElement).dataset.id === route),
  );
  const doc = components.find((c) => c.tag === route);
  if (doc) {
    // Import lazy + aguarda o render completo antes de resolver a rota.
    await componentLoaders[route]?.();
    await renderComponentPage(doc);
    }
  else if (route === 'theming') await renderTheming();
  else if (route === 'auto-import') renderAutoImport();
  else if (route === 'vue3') renderVue3();
  else await renderIntro();
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

    <h3> Nuxt ( Nitro ) </h3>
    <p>Nuxt já detecta <code>.client.ts</code> / <code>plugin.ts</code>. Crie
    <code>plugins/fenix-ui.client.ts</code>:</p>
    ${codeBlock(`import { defineNuxtPlugin } from '#app';
import '@wrrdev/fenix-ui';
import { applyPreset } from '@wrrdev/fenix-ui';
applyPreset('fenix', 'light');
import '@wrrdev/fenix-ui/vue';
import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';
defineFxTooltipDirective();

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('fx-');
});`)}
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
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

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



