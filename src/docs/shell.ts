/**
 * Shell da documentação (Fase 0): sidebar com grupos colapsáveis, topbar
 * (badge de versão, drawer mobile, skip-link), navegação ativa, título da
 * aba e TOC por página.
 *
 * Todos os acessos a elementos são tolerantes a ausência: o DOM de teste
 * monta apenas `#sidebar`/`#main`/controles de tema (ver app.test.ts).
 * Cores/estrutura visual vivem em `src/docs/styles/shell.css`.
 */
import { esc } from './shared';
import { slugify } from './ui/kit';
import { hrefFor } from './router';

export interface ShellNavItem {
	id: string;
	title: string;
}

export interface ShellNavGroup {
	name: string;
	items: ShellNavItem[];
}

/** Metadado mínimo que o shell precisa de cada documento. */
export interface ShellDocMeta {
	tag: string;
	title: string;
	group: string;
}

/** Itens do guia (acima dos grupos de componentes) — ordem importa. */
export const GUIDE_ITEMS: ShellNavItem[] = [
	{ id: 'home', title: 'Home' },
	{ id: 'installation', title: 'Instalação' },
	{ id: 'typings', title: 'Tipagens' },
	{ id: 'vue3', title: 'Vue 3 / Nuxt' },
	{ id: 'integrations', title: 'CDN / React / JSF' },
	{ id: 'auto-import', title: 'Auto Import' },
	{ id: 'icons', title: 'Ícones' },
	{ id: 'theming', title: 'Temas' },
	{ id: 'forms', title: 'Formulários' },
];

const COLLAPSED_KEY = 'fenix:doc:sidebar-collapsed';

/** Monta os grupos da sidebar: Guia primeiro, depois os grupos dos docs. */
export function buildSidebarGroups(
	docs: readonly ShellDocMeta[],
): ShellNavGroup[] {
	const groups = new Map<string, ShellNavItem[]>();
	groups.set('Guia', [...GUIDE_ITEMS]);
	for (const c of docs) {
		if (!groups.has(c.group)) groups.set(c.group, []);
		groups.get(c.group)!.push({ id: c.tag, title: c.title });
	}
	return [...groups.entries()].map(([name, items]) => ({ name, items }));
}

function readCollapsed(): Set<string> {
	try {
		const raw = localStorage.getItem(COLLAPSED_KEY);
		return new Set(JSON.parse(raw ?? '[]') as string[]);
	} catch {
		return new Set();
	}
}

function writeCollapsed(names: ReadonlySet<string>): void {
	try {
		localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...names]));
	} catch {
		/* storage indisponível (modo privado) — só não persiste */
	}
}

function persistOpenState(sidebar: HTMLElement): void {
	const collapsed = readCollapsed();
	sidebar
		.querySelectorAll<HTMLDetailsElement>('details.doc-group')
		.forEach((d) => {
			const name = d.dataset.group;
			if (!name) return;
			if (d.open) collapsed.delete(name);
			else collapsed.add(name);
		});
	writeCollapsed(collapsed);
}

/**
 * Renderiza a sidebar com `<details>` por grupo (colapsável nativamente:
 * teclado e leitor de tela funcionam de graça). Todos os links continuam
 * no DOM mesmo com o grupo fechado.
 */
export function renderSidebar(groups: readonly ShellNavGroup[]): void {
	const sidebar = document.getElementById('sidebar');
	if (!sidebar) return;
	sidebar.classList.add('doc-sidebar');
	const collapsed = readCollapsed();
	sidebar.innerHTML = groups
		.map((g) => {
			const open = collapsed.has(g.name) ? '' : ' open';
			const links = g.items
				.map(
					(i) =>
						`<a href="${hrefFor(i.id)}" data-id="${esc(i.id)}">${esc(i.title)}</a>`,
				)
				.join('');
			return (
				`<details class="doc-group" data-group="${esc(g.name)}"${open}>` +
				`<summary>${esc(g.name)}</summary>` +
				`<div class="doc-group-links">${links}</div></details>`
			);
		})
		.join('');

	sidebar
		.querySelectorAll<HTMLDetailsElement>('details.doc-group')
		.forEach((d) => {
			d.addEventListener('toggle', () => persistOpenState(sidebar));
		});
	// Fallback: se o ambiente não disparar `toggle` (ex.: clique em summary
	// sem disclosure behavior), o estado ainda é regravado após o click.
	sidebar.addEventListener('click', (e) => {
		if (!(e.target as HTMLElement).closest?.('summary')) return;
		setTimeout(() => persistOpenState(sidebar), 0);
	});
}

/**
 * Topbar: badge de versão (header + rodapé), drawer mobile e skip-link.
 * O toggle de modo/tema fica no app.ts, porque depende do estado do tema.
 */
export function mountTopbar(): void {
	const version =
		typeof __APP_VERSION__ !== 'undefined' ? `v${__APP_VERSION__}` : '';
	if (version) {
		const header = document.getElementById('version-badge');
		if (header) header.textContent = version;
		const footer = document.getElementById('doc-footer-version');
		if (footer) footer.textContent = version;
	}

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
		if ((e.target as HTMLElement).closest?.('a')) closeSidebar();
	});

	// Skip link: leva o foco ao conteúdo sem mudar a rota (hash routing).
	document
		.querySelector<HTMLAnchorElement>('.skip-link')
		?.addEventListener('click', (e) => {
			const main = document.getElementById('main');
			if (!main) return;
			e.preventDefault();
			main.focus();
			main.scrollIntoView?.({ block: 'start' });
		});
}

declare const __APP_VERSION__: string;

/** Chave do item da nav primária da topbar para uma rota. */
function navKeyFor(route: string, docs: readonly ShellDocMeta[]): string {
	if (route === 'home') return 'home';
	if (route === 'icons') return 'icons';
	if (route === 'theming') return 'theming';
	if (docs.some((d) => d.tag === route)) return 'components';
	return 'guides';
}

/**
 * Sincroniza o "estado ativo" da rota: link da sidebar, item da nav da
 * topbar e `document.title`.
 */
export function syncRoute(
	route: string,
	docs: readonly ShellDocMeta[] = [],
): void {
	document.querySelectorAll<HTMLAnchorElement>('#sidebar a').forEach((a) => {
		const active = a.dataset.id === route;
		a.classList.toggle('active', active);
		if (active) a.setAttribute('aria-current', 'page');
		else a.removeAttribute('aria-current');
	});

	const navKey = navKeyFor(route, docs);
	document.querySelectorAll<HTMLAnchorElement>('.doc-nav a').forEach((a) => {
		const active = a.dataset.nav === navKey;
		a.classList.toggle('active', active);
		if (active) a.setAttribute('aria-current', 'page');
		else a.removeAttribute('aria-current');
	});

	const doc = docs.find((d) => d.tag === route);
	const guide = GUIDE_ITEMS.find((i) => i.id === route);
	const title = doc?.title ?? guide?.title;
	document.title =
		title && route !== 'home'
			? `${title} — FenixUI`
			: 'FenixUI — Documentação';
}

/** Limpa o TOC (chamado junto com a limpeza do `#main` em cada rota). */
export function clearToc(): void {
	const toc = document.getElementById('doc-toc');
	if (toc) toc.innerHTML = '';
}

let wiredToc: HTMLElement | null = null;
let tocObserver: IntersectionObserver | null = null;

function wireTocClicks(toc: HTMLElement): void {
	if (wiredToc === toc) return;
	wiredToc = toc;
	toc.addEventListener('click', (e) => {
		const a = (e.target as HTMLElement).closest?.('a');
		if (!a) return;
		const href = a.getAttribute('href');
		if (!href?.startsWith('#')) return;
		const target = document.getElementById(href.slice(1));
		if (!target) return;
		// Âncora in-page não pode trocar o hash: o roteador lê o hash.
		e.preventDefault();
		target.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
	});
}

function observeToc(toc: HTMLElement): void {
	tocObserver?.disconnect();
	tocObserver = null;
	if (typeof IntersectionObserver === 'undefined') return;
	const links = [...toc.querySelectorAll<HTMLAnchorElement>('a')];
	const byId = new Map(links.map((l) => [l.getAttribute('href')!.slice(1), l]));
	tocObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				links.forEach((l) => l.classList.remove('active'));
				byId.get(entry.target.id)?.classList.add('active');
			}
		},
		{ rootMargin: '-96px 0px -60% 0px' },
	);
	links.forEach((l) => {
		const el = document.getElementById(l.getAttribute('href')!.slice(1));
		if (el) tocObserver!.observe(el);
	});
}

/**
 * Monta o TOC a partir dos `h2`/`h3` da página atual (adiciona ids com
 * `slugify`). Páginas com menos de 2 headings não geram TOC — a coluna
 * some via `:has(.doc-toc:empty)` no CSS.
 */
export function buildToc(): void {
	const toc = document.getElementById('doc-toc');
	const main = document.getElementById('main');
	if (!toc || !main) return;
	clearToc();

	const entries: { id: string; text: string; level: number }[] = [];
	const used = new Set<string>();
	main.querySelectorAll<HTMLElement>('h2, h3').forEach((h) => {
		const text = h.textContent?.trim();
		if (!text) return;
		let id = h.id;
		if (!id) {
			id = slugify(text);
			const base = id;
			let n = 2;
			while (used.has(id)) id = `${base}-${n++}`;
			h.id = id;
		}
		used.add(id);
		entries.push({ id, text, level: Number(h.tagName[1]) });
	});
	if (entries.length < 2) return;

	toc.innerHTML =
		`<span class="doc-toc-title">Nesta página</span>` +
		entries.map((e) => `<a href="#${e.id}" data-level="${e.level}">${esc(e.text)}</a>`).join('');
	wireTocClicks(toc);
	observeToc(toc);
}

/**
 * `color-scheme` do navegador acompanha o modo do tema: sem isso, os
 * detalhes internos do UA (caret, seleção, autofill, scrollbars) ficam
 * sempre claros e "furam" o dark mode — o campo de busca do header era
 * o sintoma visível. O listener é registrado no import (antes do boot do
 * app) para capturar também o primeiro `applyPreset()`.
 */
function syncColorScheme(theme: string): void {
	if (theme !== 'light' && theme !== 'dark') return;
	document.documentElement.style.setProperty('color-scheme', theme);
}

if (typeof window !== 'undefined') {
	window.addEventListener('fenix:theme', (e) => {
		syncColorScheme(
			(e as CustomEvent<{ theme?: string }>).detail?.theme ?? '',
		);
	});
}
