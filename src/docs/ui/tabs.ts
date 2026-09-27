/**
 * Tabs acessíveis para as páginas da documentação (não confundir com o
 * componente `fx-tabs` — este é markup próprio da doc, sem dependência de
 * web component, para funcionar já na Fase 1 das páginas).
 *
 * Contratos: roles ARIA (tablist/tab/tabpanel), rolagem do teclado
 * (← → Home End), foco gerenciado e estado na URL via `?tab=<id>`
 * (history.replaceState, sem disparar hashchange do roteador).
 */
import { esc } from '../shared';

export interface DocTab {
	id: string;
	label: string;
	content: string;
}

export interface DocTabsOptions {
	/** Nome do parâmetro na URL (padrão: `tab`). */
	name?: string;
	/** Sincroniza a aba ativa com `?tab=` (padrão: true). */
	syncUrl?: boolean;
}

const tabParam = (name: string): string | null => {
	try {
		return new URLSearchParams(location.search).get(name);
	} catch {
		return null;
	}
};

/** Id da aba ativa vinda da URL, com fallback para a primeira aba. */
export function activeTabFromUrl(tabs: readonly DocTab[], name = 'tab'): string {
	const fromUrl = tabParam(name);
	if (fromUrl && tabs.some((t) => t.id === fromUrl)) return fromUrl;
	return tabs[0]?.id ?? '';
}

/** Grava/limpa `?tab=` na URL sem tocar no hash do roteador. */
export function setTabUrlParam(id: string, name = 'tab'): void {
	try {
		const url = new URL(location.href);
		if (id) url.searchParams.set(name, id);
		else url.searchParams.delete(name);
		history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
	} catch {
		/* ambiente sem history (raro) — estado segue no DOM */
	}
}

/** HTML completo das tabs: tablist + painéis (painel inativo fica `hidden`). */
export function renderTabs(
	tabs: readonly DocTab[],
	activeId: string,
	opts: DocTabsOptions = {},
): string {
	if (!tabs.length) return '';
	const name = opts.name ?? 'tab';
	const active = tabs.some((t) => t.id === activeId) ? activeId : tabs[0].id;
	const list = tabs
		.map(
			(t) =>
				`<button type="button" role="tab" id="${name}-tab-${t.id}"` +
				` data-tab="${esc(t.id)}" aria-controls="${name}-panel-${t.id}"` +
				` aria-selected="${t.id === active}" tabindex="${t.id === active ? 0 : -1}">` +
				`${esc(t.label)}</button>`,
		)
		.join('');
	const panels = tabs
		.map(
			(t) =>
				`<div role="tabpanel" id="${name}-panel-${t.id}" data-tab-panel="${esc(t.id)}"` +
				` aria-labelledby="${name}-tab-${t.id}" tabindex="0"` +
				`${t.id === active ? '' : ' hidden'}>${t.content}</div>`,
		)
		.join('');
	return (
		`<div class="doc-tabs" data-tab-name="${esc(name)}">` +
		`<div class="doc-tablist" role="tablist">${list}</div>` +
		`<div class="doc-tabpanels">${panels}</div></div>`
	);
}

/** Seleciona a aba visível dentro de um wrapper (DOM + ARIA). */
function applySelection(
	wrap: HTMLElement,
	id: string,
	focus: boolean,
): void {
	let selected: HTMLButtonElement | null = null;
	wrap.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach((btn) => {
		const on = btn.dataset.tab === id;
		btn.setAttribute('aria-selected', String(on));
		btn.tabIndex = on ? 0 : -1;
		if (on) selected = btn;
		if (on && focus) btn.focus();
	});
	wrap.querySelectorAll<HTMLElement>('[data-tab-panel]').forEach((panel) => {
		panel.hidden = panel.dataset.tabPanel !== id;
	});
	if (selected) {
		const event = new CustomEvent('tabchange', {
			bubbles: true,
			detail: { id },
		});
		wrap.dispatchEvent(event);
	}
}

/**
 * Liga o comportamento das tabs montadas em `root` (idempotente por
 * wrapper). Retorna os wrappers montados.
 */
export function mountTabs(
	root: ParentNode = document,
	onChange?: (id: string) => void,
	opts: DocTabsOptions = {},
): HTMLElement[] {
	const mounted: HTMLElement[] = [];
	root.querySelectorAll<HTMLElement>('.doc-tabs').forEach((wrap) => {
		if (wrap.dataset.tabMounted === 'true') return;
		wrap.dataset.tabMounted = 'true';
		mounted.push(wrap);

		const name = opts.name ?? wrap.dataset.tabName ?? 'tab';
		const syncUrl = opts.syncUrl !== false;
		const initial =
			[...wrap.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
				(b) => b.getAttribute('aria-selected') === 'true',
			)?.dataset.tab ?? '';
		if (syncUrl && initial) setTabUrlParam(initial, name);

		wrap.addEventListener('click', (e) => {
			const btn = (e.target as HTMLElement).closest?.(
				'[role="tab"]',
			) as HTMLButtonElement | null;
			if (!btn?.dataset.tab) return;
			applySelection(wrap, btn.dataset.tab, false);
			if (syncUrl) setTabUrlParam(btn.dataset.tab, name);
			onChange?.(btn.dataset.tab);
		});

		wrap.addEventListener('keydown', (e) => {
			const event = e as KeyboardEvent;
			const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
			if (!keys.includes(event.key)) return;
			const tabs = [
				...wrap.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
			];
			const current = tabs.findIndex(
				(t) => t.getAttribute('aria-selected') === 'true',
			);
			if (current < 0) return;
			event.preventDefault();
			let next: number;
			if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
			else if (event.key === 'ArrowLeft')
				next = (current - 1 + tabs.length) % tabs.length;
			else if (event.key === 'Home') next = 0;
			else next = tabs.length - 1;
			const id = tabs[next].dataset.tab!;
			applySelection(wrap, id, true);
			if (syncUrl) setTabUrlParam(id, name);
			onChange?.(id);
		});
	});
	return mounted;
}
