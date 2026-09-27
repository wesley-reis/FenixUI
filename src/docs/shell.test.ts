/**
 * Testes do shell da doc: sidebar colapsável, navegação ativa, título,
 * TOC e topbar (drawer mobile + skip-link). DOM próprio — não depende do
 * app.ts, então roda rápido e isola o contrato do shell.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	GUIDE_ITEMS,
	buildSidebarGroups,
	buildToc,
	clearToc,
	mountTopbar,
	renderSidebar,
	syncRoute,
} from './shell';

const sidebar = (): HTMLElement => document.getElementById('sidebar')!;
const toc = (): HTMLElement => document.getElementById('doc-toc')!;

beforeEach(() => {
	localStorage.clear();
	document.title = 'FenixUI — Documentação';
	document.body.innerHTML = `
		<a class="skip-link" href="#main">Pular para o conteúdo</a>
		<header class="doc-topbar">
			<button id="sidebar-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
			<nav class="doc-nav" aria-label="Navegação principal">
				<a href="#/home" data-nav="home">Início</a>
				<a href="#/fx-button" data-nav="components">Componentes</a>
				<a href="#/installation" data-nav="guides">Guias</a>
				<a href="#/icons" data-nav="icons">Ícones</a>
				<a href="#/theming" data-nav="theming">Temas</a>
			</nav>
		</header>
		<div class="sidebar-overlay" id="sidebar-overlay"></div>
		<aside id="sidebar"></aside>
		<div class="doc-body">
			<main id="main" tabindex="-1"></main>
			<nav class="doc-toc" id="doc-toc" aria-label="Nesta página"></nav>
		</div>
	`;
});

afterEach(() => {
	localStorage.clear();
});

describe('shell · sidebar', () => {
	it('agrupa Guia primeiro e depois os grupos dos componentes', () => {
		const groups = buildSidebarGroups([
			{ tag: 'fx-button', title: 'Button', group: 'Ações' },
			{ tag: 'fx-input', title: 'Input', group: 'Formulário' },
			{ tag: 'fx-select', title: 'Select', group: 'Formulário' },
		]);
		expect(groups[0].name).toBe('Guia');
		expect(groups[0].items.map((i) => i.id)).toEqual(
			GUIDE_ITEMS.map((i) => i.id),
		);
		expect(groups.map((g) => g.name)).toEqual(['Guia', 'Ações', 'Formulário']);
		expect(groups[2].items.map((i) => i.id)).toEqual(['fx-input', 'fx-select']);
	});

	it('renderiza grupos em <details> abertos com todos os links no DOM', () => {
		renderSidebar(
			buildSidebarGroups([{ tag: 'fx-button', title: 'Button', group: 'Ações' }]),
		);
		expect(sidebar().classList.contains('doc-sidebar')).toBe(true);
		const groups = [
			...sidebar().querySelectorAll<HTMLDetailsElement>('details.doc-group'),
		];
		expect(groups.length).toBeGreaterThan(1);
		expect(groups.every((d) => d.open)).toBe(true);
		expect(sidebar().querySelector('summary')?.textContent).toBe('Guia');

		const hrefs = [...sidebar().querySelectorAll('a')].map((a) =>
			a.getAttribute('href'),
		);
		expect(hrefs).toContain('#/home');
		expect(hrefs).toContain('#/installation');
		expect(hrefs).toContain('#/theming');
		expect(hrefs).toContain('#/fx-button');
		expect(sidebar().querySelector('a[data-id="fx-button"]')?.textContent).toBe(
			'Button',
		);
	});

	it('persiste grupos colapsados (toggle → localStorage → re-render)', () => {
		renderSidebar(buildSidebarGroups([]));
		const guia = sidebar().querySelector<HTMLDetailsElement>(
			'details.doc-group',
		)!;
		expect(guia.open).toBe(true);

		guia.open = false;
		guia.dispatchEvent(new Event('toggle'));
		expect(
			JSON.parse(localStorage.getItem('fenix:doc:sidebar-collapsed')!),
		).toEqual(['Guia']);

		renderSidebar(buildSidebarGroups([]));
		expect(
			sidebar().querySelector<HTMLDetailsElement>('details.doc-group')!.open,
		).toBe(false);
	});

	it('tolera sidebar ausente (DOM mínimo dos testes de integração)', () => {
		document.body.innerHTML = '';
		expect(() => renderSidebar(buildSidebarGroups([]))).not.toThrow();
	});
});

describe('shell · rota ativa', () => {
	it('marca sidebar + nav da topbar e atualiza o título', () => {
		const docs = [{ tag: 'fx-button', title: 'Button', group: 'Ações' }];
		renderSidebar(buildSidebarGroups(docs));

		syncRoute('fx-button', docs);
		const link = sidebar().querySelector('a[data-id="fx-button"]')!;
		expect(link.classList.contains('active')).toBe(true);
		expect(link.getAttribute('aria-current')).toBe('page');
		const nav = document.querySelector('.doc-nav a[data-nav="components"]')!;
		expect(nav.classList.contains('active')).toBe(true);
		expect(document.title).toBe('Button — FenixUI');

		syncRoute('theming', docs);
		expect(link.classList.contains('active')).toBe(false);
		expect(link.hasAttribute('aria-current')).toBe(false);
		expect(
			document
				.querySelector('.doc-nav a[data-nav="theming"]')!
				.classList.contains('active'),
		).toBe(true);
		expect(document.title).toBe('Temas — FenixUI');

		syncRoute('installation', docs);
		expect(
			document
				.querySelector('.doc-nav a[data-nav="guides"]')!
				.classList.contains('active'),
		).toBe(true);
	});

	it('home mantém o título padrão da documentação', () => {
		syncRoute('home', []);
		expect(document.title).toBe('FenixUI — Documentação');
	});
});

describe('shell · TOC', () => {
	it('gera ids slugificados a partir de h2/h3 e monta os links', () => {
		document.getElementById('main')!.innerHTML = `
			<h2>Button</h2>
			<h3>Tamanhos e variantes</h3>
			<h3>Eventos</h3>
		`;
		buildToc();
		const links = [...toc().querySelectorAll('a')];
		expect(toc().querySelector('.doc-toc-title')?.textContent).toBe(
			'Nesta página',
		);
		expect(links.map((a) => a.getAttribute('href'))).toEqual([
			'#button',
			'#tamanhos-e-variantes',
			'#eventos',
		]);
		expect(links.map((a) => a.dataset.level)).toEqual(['2', '3', '3']);
		expect(document.getElementById('tamanhos-e-variantes')).toBeTruthy();
	});

	it('clique no TOC não troca a rota (hash é do roteador)', () => {
		document.getElementById('main')!.innerHTML =
			'<h2>Button</h2><h3>Eventos</h3><h3>Slots</h3>';
		buildToc();
		const before = location.hash;
		toc().querySelector<HTMLAnchorElement>('a[href="#eventos"]')!.click();
		expect(location.hash).toBe(before);
	});

	it('página curta (<2 headings) não gera TOC', () => {
		document.getElementById('main')!.innerHTML = '<h2>Só um título</h2>';
		buildToc();
		expect(toc().innerHTML).toBe('');
	});

	it('clearToc zera o conteúdo', () => {
		document.getElementById('main')!.innerHTML =
			'<h2>A</h2><h3>B</h3><h3>C</h3>';
		buildToc();
		expect(toc().querySelectorAll('a').length).toBeGreaterThan(0);
		clearToc();
		expect(toc().innerHTML).toBe('');
	});
});

describe('shell · topbar', () => {
	it('drawer mobile abre/fecha pelo hamburger e overlay/link fecha', () => {
		mountTopbar();
		const toggle = document.getElementById('sidebar-toggle')!;
		expect(document.body.classList.contains('sidebar-open')).toBe(false);

		toggle.click();
		expect(document.body.classList.contains('sidebar-open')).toBe(true);
		expect(toggle.getAttribute('aria-expanded')).toBe('true');

		toggle.click();
		expect(document.body.classList.contains('sidebar-open')).toBe(false);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');

		toggle.click();
		document.getElementById('sidebar-overlay')!.click();
		expect(document.body.classList.contains('sidebar-open')).toBe(false);

		toggle.click();
		sidebar().innerHTML = '<a href="#/fx-button">Button</a>';
		sidebar().querySelector('a')!.click();
		expect(document.body.classList.contains('sidebar-open')).toBe(false);
	});

	it('skip-link foca o conteúdo sem mudar o hash', () => {
		mountTopbar();
		const before = location.hash;
		document.querySelector<HTMLAnchorElement>('.skip-link')!.click();
		expect(location.hash).toBe(before);
		expect(document.activeElement).toBe(document.getElementById('main'));
	});

	it('escreve a versão do app no badge do header e do rodapé', () => {
		document.body.insertAdjacentHTML(
			'beforeend',
			'<fx-badge id="version-badge"></fx-badge><fx-badge id="doc-footer-version"></fx-badge>',
		);
		(globalThis as Record<string, unknown>).__APP_VERSION__ = '9.9.9';
		try {
			mountTopbar();
			expect(document.getElementById('version-badge')!.textContent).toBe(
				'v9.9.9',
			);
			expect(document.getElementById('doc-footer-version')!.textContent).toBe(
				'v9.9.9',
			);
		} finally {
			delete (globalThis as Record<string, unknown>).__APP_VERSION__;
		}
	});

	it('color-scheme do documento acompanha o modo do tema (fenix:theme)', () => {
		const set = vi.spyOn(document.documentElement.style, 'setProperty');
		try {
			window.dispatchEvent(
				new CustomEvent('fenix:theme', { detail: { theme: 'dark' } }),
			);
			expect(set).toHaveBeenCalledWith('color-scheme', 'dark');

			window.dispatchEvent(
				new CustomEvent('fenix:theme', { detail: { theme: 'light' } }),
			);
			expect(set).toHaveBeenCalledWith('color-scheme', 'light');

			// Modos desconhecidos são ignorados (não polui o estilo raiz).
			set.mockClear();
			window.dispatchEvent(
				new CustomEvent('fenix:theme', { detail: { theme: 'auto' } }),
			);
			expect(set).not.toHaveBeenCalled();
		} finally {
			set.mockRestore();
		}
	});
});
