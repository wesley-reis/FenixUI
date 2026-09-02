/** Helpers e listas compartilhados pelos arquivos *.doc.ts da documentação. */

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const buttonVariants = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outline', 'ghost'];
export const badgeVariants = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];
export const sizes = ['sm', 'md', 'lg'];

/** Formata HTML em múltiplas linhas com indentação para facilitar a leitura. */
export const VOID_TAGS = /^(input|br|hr|img|meta|link)\b/i;
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
