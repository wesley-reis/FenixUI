/**
 * Sanitização de strings para injeção segura em HTML.
 *
 * Previne XSS ao escapar caracteres especiais antes de usar innerHTML.
 * Use SEMPRE que dados externos (API, usuário) forem injetados no DOM.
 */

/** Caracteres que devem ser escapados para prevenir XSS. */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/** Regex que captura todos os caracteres perigosos. */
const SANITIZE_REGEX = /[&<>"'`=/]/g;

/**
 * Escapa caracteres especiais de HTML para prevenir XSS.
 *
 * @param value - Valor a ser escapado (convertido para string)
 * @returns String segura para innerHTML
 *
 * @example
 * // Seguro contra XSS
 * const userInput = '<img src=x onerror=alert(1)>';
 * element.innerHTML = `<div>${esc(userInput)}</div>`;
 * // Resultado: &lt;img src=x onerror=alert(1)&gt;
 */
export function esc(value: unknown): string {
  if (value == null) return '';
  return String(value).replace(SANITIZE_REGEX, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove todas as tags HTML da string (strip tags).
 * Use quando quiser apenas texto puro, sem nenhuma marcação.
 *
 * @param html - String potencialmente contendo HTML
 * @returns String sem tags HTML
 */
export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitiza um objeto de dados recursivamente.
 * Útil para sanitizar arrays de registros antes de renderizar.
 *
 * @param data - Objeto ou array a ser sanitizado
 * @returns Cópia sanitizada do objeto
 */
export function sanitizeData<T>(data: T): T {
  if (data == null) return data;
  if (typeof data === 'string') return esc(data) as unknown as T;
  if (Array.isArray(data)) return data.map(sanitizeData) as unknown as T;
  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = sanitizeData(value);
    }
    return result as T;
  }
  return data;
}
