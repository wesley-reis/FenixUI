/**
 * Sanitização de strings para injeção segura em HTML.
 *
 * Previne XSS ao escapar caracteres especiais antes de usar innerHTML.
 * Use SEMPRE que dados externos (API, usuário) forem injetados no DOM.
 */
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
export declare function esc(value: unknown): string;
/**
 * Remove todas as tags HTML da string (strip tags).
 * Use quando quiser apenas texto puro, sem nenhuma marcação.
 *
 * @param html - String potencialmente contendo HTML
 * @returns String sem tags HTML
 */
export declare function stripTags(html: string): string;
/**
 * Sanitiza um objeto de dados recursivamente.
 * Útil para sanitizar arrays de registros antes de renderizar.
 *
 * @param data - Objeto ou array a ser sanitizado
 * @returns Cópia sanitizada do objeto
 */
export declare function sanitizeData<T>(data: T): T;
//# sourceMappingURL=sanitize.d.ts.map