/**
 * CSS base da biblioteca de ícones — módulo LEVE (não importa a lista de nomes
 * nem dispara o carregamento da fonte). Usado dentro dos Shadow DOMs dos
 * componentes que suportam o atributo `icon`.
 *
 * O @font-face em si é injetado no <head> por `@wrrdev/fenix-ui/icons`
 * (ver ./index.ts) — @font-face registrado no documento também se aplica
 * dentro dos Shadow DOMs.
 */

import { esc } from '../core/sanitize';

/** Nome da família de fontes dos ícones (self-hosted, sem dependência externa). */
export const FENIX_ICON_FONT_FAMILY = 'Fenix Icons';

/** Família configurável via CSS custom property (fallback para o nome padrão). */
export const FENIX_ICON_FONT_VAR = `var(--fx-icon-font, ${FENIX_ICON_FONT_FAMILY})`;

/**
 * Regras da classe `.fx-icon` para uso DENTRO de Shadow DOM
 * (concatene às `static styles` do componente).
 */
export const FENIX_ICON_BASE_CSS = `
.fx-icon {
  font-family: ${FENIX_ICON_FONT_VAR};
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  user-select: none;
}
.fx-icon.fx-icon-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.fx-icon.fx-icon-bold { font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24; }
`;

/** Verifica se o valor parece um nome de ícone da Fenix Icons (e não emoji/texto livre). */
export function isFenixIconName(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(value.trim());
}

/**
 * HTML do ícone para uso DENTRO de Shadow DOM (concatenar ao template).
 *
 * - Nome válido da Fenix Icons (ex.: `home`) → glifo via LIGADURA: o nome
 *   vira o conteúdo de texto do elemento com a font-family de ícones.
 *   Isso é obrigatório dentro de Shadow DOM: as regras
 *   `.fx-icon-<nome>::before` são injetadas no <head> do documento e NÃO
 *   atravessam a fronteira do shadow root (apenas o @font-face vale
 *   dentro dele) — a classe vazia renderizaria um elemento sem glifo.
 * - Qualquer outro valor (emoji, texto) → texto puro escapado.
 *
 * A classe base `.fx-icon` é fornecida por `FENIX_ICON_BASE_CSS`
 * (concatenada às `static styles` do componente); o @font-face vem do
 * `@wrrdev/fenix-ui/icons` (injetado no <head>).
 */
export function fenixIconHtml(icon: string): string {
  const value = (icon ?? '').trim();
  if (!value) return '';
  if (isFenixIconName(value)) {
    return `<i class="fx-icon" aria-hidden="true">${value}</i>`;
  }
  return `<span aria-hidden="true">${esc(value)}</span>`;
}
