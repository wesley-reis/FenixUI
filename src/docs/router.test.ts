/** Testes do roteador por hash da doc. */
import { describe, it, expect } from 'vitest';
import { DEFAULT_ROUTE, hrefFor, routeFromHash, startRouter } from './router';

describe('router · routeFromHash', () => {
	it('extrai a rota com #/ e cai no padrão sem hash', () => {
		expect(routeFromHash('#/fx-button')).toBe('fx-button');
		expect(routeFromHash('#/installation')).toBe('installation');
		expect(routeFromHash('')).toBe(DEFAULT_ROUTE);
		expect(routeFromHash('#/')).toBe(DEFAULT_ROUTE);
	});
});

describe('router · hrefFor', () => {
	it('gera o href canônico da rota', () => {
		expect(hrefFor('theming')).toBe('#/theming');
	});
});

describe('router · startRouter', () => {
	it('despacha a rota atual e a de cada hashchange; teardown remove', () => {
		const seen: string[] = [];
		location.hash = '#/home';
		const stop = startRouter((r) => seen.push(r));
		expect(seen).toEqual(['home']);

		location.hash = '#/icons';
		window.dispatchEvent(new Event('hashchange'));
		expect(seen).toEqual(['home', 'icons']);

		stop();
		location.hash = '#/theming';
		window.dispatchEvent(new Event('hashchange'));
		expect(seen).toEqual(['home', 'icons']);
	});
});
