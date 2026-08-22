/** Utilitários CSS compartilhados. */

/** Tagged template que apenas concatena — mantém nomes de classes e tokens legíveis. */
export function css(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, part, i) => acc + part + (i < values.length ? String(values[i]) : ''), '');
}

/** Converte `duration-fast` em `durationFast`. */
export function kebabToCamel(value: string): string {
  return value.replace(/-+([a-z])/g, (_, c: string) => c.toUpperCase());
}