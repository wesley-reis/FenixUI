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

/**
 * Bloco de código completo (contrato de DOM usado pelos testes):
 * `.code-block > .code-head > .copy-btn` + `pre > code`.
 */
export function codeBlock(code: string): string {
  return (
    `<div class="code-block">` +
    `<div class="code-head"><button class="copy-btn">Copiar</button></div>` +
    `<pre><code>${highlightCode(code)}</code></pre>` +
    `</div>`
  );
}
