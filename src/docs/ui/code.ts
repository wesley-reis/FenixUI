/**
 * Realce de sintaxe e blocos de código da documentação.
 *
 * Extraído de `app.ts` (Fase 0): o tokenizador é leve e usa as classes
 * `.tok-*` (colors em `styles/content.css`, derivadas de `--fx-*`), então
 * acompanha light/dark e o customizador de temas.
 */
import { esc } from '../shared';

/**
 * Tokenizador de sintaxe leve para HTML/TS — envolve tokens em <span class>
 * usando as CSS Variables do FenixUI (--fx-*), então as cores acompanham
 * light/dark automaticamente. O texto fora dos tokens passa por `esc`.
 */
export function highlightCode(code: string): string {
  // Ordem importa: comentários e tags primeiro; strings e keywords depois.
  // O padrão de TAG é linear (`[^<>]*`): expressões com aspas aninhadas
  // (ex.: `data='[{"a":1}]'`) causavam backtracking exponencial e travavam
  // páginas com muito JSON (fx-table).
  const RE =
    /<!--[\s\S]*?-->|<\/?[\w-]+[^<>]*>|\/\*[\s\S]*?\*\/|\/\/[^\n\r]*|`[^`]*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\b(?:import|from|const|let|var|export|function|return|new|if|else|await|async|type|interface)\b/g;
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
  const open = tag.match(/^<([\w-]+)/);
  if (!open) return esc(tag);
  const name = open[1]!;
  const inner = tag.slice(open[0].length);
  const close = inner.endsWith('/>') ? '/>' : '>';
  const rest = inner.slice(0, inner.length - close.length);

  let html = `<span class="tok-tag">&lt;</span><span class="tok-tagname">${esc(name)}</span>`;
  // Scanner LINEAR de atributos: aceita `name="v"`, `name='v'`, flags e
  // valores com aspas aninhadas (JSON), sem backtracking.
  let i = 0;
  while (i < rest.length) {
    let s = i;
    while (s < rest.length && /\s/.test(rest[s]!)) s++;
    if (s >= rest.length) {
      html += esc(rest.slice(i));
      break;
    }
    const space = rest.slice(i, s);
    let n = s;
    while (n < rest.length && !/[\s=]/.test(rest[n]!)) n++;
    const attrName = rest.slice(s, n);
    let eq = '';
    let val = '';
    if (rest[n] === '=') {
      eq = '=';
      const v = n + 1;
      const quote = rest[v];
      if (quote === '"' || quote === "'") {
        let e = v + 1;
        while (e < rest.length && rest[e] !== quote) e++;
        val = rest.slice(v, Math.min(e + 1, rest.length));
        i = Math.min(e + 1, rest.length);
      } else {
        let e = v;
        while (e < rest.length && !/\s/.test(rest[e]!)) e++;
        val = rest.slice(v, e);
        i = e;
      }
    } else {
      i = n;
    }
    html += `<span class="tok-attr">${esc(space)}${esc(attrName)}</span>`;
    if (eq) {
      html += `<span class="tok-attr-eq">=</span><span class="tok-attr-val">${esc(val)}</span>`;
    }
  }
  html += `<span class="tok-tag">${esc(close)}</span>`;
  return html;
}

/** Cache do realce (cards re-renderizam os mesmos trechos ao navegar). */
const HIGHLIGHT_CACHE = new Map<string, string>();
/** Acima disso o realce é dispensado (blocos gigantes de JSON): o texto é o mesmo. */
const MAX_HIGHLIGHT = 12000;

/** Realce com cache + teto de tamanho (mantém o texto idêntico). */
export function highlightCached(code: string): string {
  if (code.length > MAX_HIGHLIGHT) return esc(code);
  const hit = HIGHLIGHT_CACHE.get(code);
  if (hit !== undefined) return hit;
  const out = highlightCode(code);
  if (HIGHLIGHT_CACHE.size > 200) HIGHLIGHT_CACHE.clear();
  HIGHLIGHT_CACHE.set(code, out);
  return out;
}

/** Liga os botões "Copiar" de todos os blocos dentro de `root` (idempotente). */
export function wireCodeCopy(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach((btn) => {
    if (btn.dataset.copyWired === '1') return; // refs recriadas por refresh()
    btn.dataset.copyWired = '1';
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-block');
      const text = block?.querySelector('code')?.textContent ?? '';
      navigator.clipboard?.writeText(text).catch(() => { /* clipboard indisponível */ });
      btn.textContent = 'Copiado!';
      setTimeout(() => (btn.textContent = 'Copiar'), 1200);
    });
  });
}

/**
 * Bloco de código completo (contrato de DOM usado pelos testes):
 * `.code-block > .code-head > .copy-btn` + `pre > code`.
 */
export function codeBlock(code: string): string {
  return (
    `<div class="code-block">` +
    `<div class="code-head"><button class="copy-btn">Copiar</button></div>` +
    `<pre><code>${highlightCached(code)}</code></pre>` +
    `</div>`
  );
}
