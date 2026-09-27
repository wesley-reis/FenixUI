/**
 * UI kit da documentação: helpers de HTML puro (strings) usados pelas
 * páginas. Sem estado e sem acesso a DOM — fáceis de testar e reutilizar.
 *
 * A camada visual vive em `src/docs/styles/shell.css` (seção "UI kit").
 */
import { esc } from '../shared';

/** Slug estável para ids de âncora: minúsculas, sem acento, hífens. */
export const slugify = (text: string): string =>
	text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export type CalloutType = 'info' | 'success' | 'warning' | 'danger';

const CALLOUT_ICON: Record<CalloutType, string> = {
	info: 'ℹ',
	success: '✓',
	warning: '⚠',
	danger: '✕',
};

/** Caixa de destaque (nota, dica, aviso) com semântica de <aside>. */
export function callout(type: CalloutType, title: string, body: string): string {
	return (
		`<aside class="doc-callout doc-callout--${type}" role="note">` +
		`<span class="doc-callout-icon" aria-hidden="true">${CALLOUT_ICON[type]}</span>` +
		`<div class="doc-callout-content">` +
		`<strong class="doc-callout-title">${esc(title)}</strong>` +
		`<div class="doc-callout-body">${body}</div>` +
		`</div></aside>`
	);
}

export type ChipTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

/** Chip compacto para tags, variantes e metadados (opcionalmente linkado). */
export function chip(
	label: string,
	opts: { tone?: ChipTone; href?: string } = {},
): string {
	const cls = `doc-chip doc-chip--${opts.tone ?? 'neutral'}`;
	const inner = esc(label);
	return opts.href
		? `<a class="${cls}" href="${opts.href}">${inner}</a>`
		: `<span class="${cls}">${inner}</span>`;
}

/** Atalho de teclado: `kbd('Ctrl', 'K')` → `Ctrl+K`, uma tecla por <kbd>. */
export function kbd(...keys: string[]): string {
	return keys
		.map((k) => `<kbd class="doc-kbd">${esc(k)}</kbd>`)
		.join('<span class="doc-kbd-sep">+</span>');
}

/** Número/estatística em card — usado no hero das páginas-guia. */
export function statCard(value: string, label: string): string {
	return (
		`<div class="doc-stat">` +
		`<span class="doc-stat-value">${esc(value)}</span>` +
		`<span class="doc-stat-label">${esc(label)}</span>` +
		`</div>`
	);
}

/** Code inline escapado, reaproveitando o estilo `code.inline` existente. */
export const inlineCode = (code: string): string =>
	`<code class="inline">${esc(code)}</code>`;
