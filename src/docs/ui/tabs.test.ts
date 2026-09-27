/** Testes das tabs da doc: markup ARIA, interação e estado na URL. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	activeTabFromUrl,
	mountTabs,
	renderTabs,
	setTabUrlParam,
	type DocTab,
} from './tabs';

const TABS: DocTab[] = [
	{ id: 'vue', label: 'Vue', content: '<p>conteúdo vue</p>' },
	{ id: 'react', label: 'React', content: '<p>conteúdo react</p>' },
	{ id: 'jsf', label: 'JSF', content: '<p>conteúdo jsf</p>' },
];

const resetUrl = (): void =>
	history.replaceState(null, '', location.pathname);

beforeEach(() => {
	resetUrl();
	document.body.innerHTML = renderTabs(TABS, 'vue');
});

afterEach(() => {
	resetUrl();
});

describe('ui/tabs · renderTabs', () => {
	it('gera tablist/tab/tabpanel com ARIA e foco correto', () => {
		const wrap = document.querySelector('.doc-tabs')!;
		const tabs = [
			...wrap.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
		];
		expect(wrap.querySelector('[role="tablist"]')).toBeTruthy();
		expect(tabs.map((t) => t.textContent)).toEqual(['Vue', 'React', 'JSF']);
		expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual([
			'true',
			'false',
			'false',
		]);
		expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);

		const panels = [...wrap.querySelectorAll('[role="tabpanel"]')];
		expect(panels.map((p) => p.hasAttribute('hidden'))).toEqual([
			false,
			true,
			true,
		]);
		expect(wrap.querySelector('[role="tabpanel"]')!.textContent).toContain(
			'conteúdo vue',
		);
	});

	it('id inválido cai na primeira aba', () => {
		const html = renderTabs(TABS, 'nao-existe');
		expect(html).toMatch(/data-tab="vue"[^>]*aria-selected="true"/);
		expect(html).toMatch(/data-tab="react"[^>]*aria-selected="false"/);
	});
});

describe('ui/tabs · mountTabs', () => {
	it('clique seleciona a aba, sincroniza ?tab= e emite tabchange', () => {
		const changes: string[] = [];
		const [wrap] = mountTabs(document, (id) => changes.push(id));
		expect(wrap).toBeTruthy();

		wrap
			.querySelector<HTMLButtonElement>('[data-tab="react"]')!
			.click();
		expect(changes).toEqual(['react']);
		expect(new URLSearchParams(location.search).get('tab')).toBe('react');
		expect(
			wrap.querySelector('[data-tab="react"]')!.getAttribute('aria-selected'),
		).toBe('true');
		expect(
			wrap.querySelector('[data-tab-panel="vue"]')!.hasAttribute('hidden'),
		).toBe(true);
		expect(
			wrap.querySelector('[data-tab-panel="react"]')!.hasAttribute('hidden'),
		).toBe(false);
		// painéis escondidos continuam no DOM (sem innerHTML fantasma)
		expect(wrap.querySelectorAll('[role="tabpanel"]').length).toBe(3);
	});

	it('seta é idempotente por wrapper', () => {
		expect(mountTabs(document).length).toBe(1);
		expect(mountTabs(document).length).toBe(0);
	});

	it('teclado navega com ← → Home End e move o foco', () => {
		const [wrap] = mountTabs(document);
		const tablist = wrap.querySelector<HTMLElement>('[role="tablist"]')!;
		const key = (k: string): void => {
			tablist.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
		};

		key('ArrowRight');
		expect(
			wrap.querySelector('[data-tab="react"]')!.getAttribute('aria-selected'),
		).toBe('true');
		expect(document.activeElement).toBe(
			wrap.querySelector('[data-tab="react"]'),
		);

		key('End');
		expect(
			wrap.querySelector('[data-tab="jsf"]')!.getAttribute('aria-selected'),
		).toBe('true');
		key('Home');
		expect(
			wrap.querySelector('[data-tab="vue"]')!.getAttribute('aria-selected'),
		).toBe('true');
		key('ArrowLeft');
		expect(
			wrap.querySelector('[data-tab="jsf"]')!.getAttribute('aria-selected'),
		).toBe('true');
	});
});

describe('ui/tabs · estado na URL', () => {
	it('activeTabFromUrl usa ?tab= válido e ignora inválido', () => {
		expect(activeTabFromUrl(TABS)).toBe('vue');
		history.replaceState(null, '', `${location.pathname}?tab=react`);
		expect(activeTabFromUrl(TABS)).toBe('react');
		history.replaceState(null, '', `${location.pathname}?tab=zzz`);
		expect(activeTabFromUrl(TABS)).toBe('vue');
	});

	it('setTabUrlParam preserva o hash do roteador', () => {
		history.replaceState(null, '', `${location.pathname}#/fx-button`);
		setTabUrlParam('react');
		expect(new URLSearchParams(location.search).get('tab')).toBe('react');
		expect(location.hash).toBe('#/fx-button');
		setTabUrlParam('');
		expect(new URLSearchParams(location.search).get('tab')).toBeNull();
		expect(location.hash).toBe('#/fx-button');
	});
});
