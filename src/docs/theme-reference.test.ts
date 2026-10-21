/**
 * Gates da referência de tema: garantem que a documentação não fique
 * desatualizada quando um token/componente novo entra na lib.
 */
import { describe, expect, it } from 'vitest';
import { darkTokens, defaultTokens } from '../core/tokens';
import { tokenCssVars } from '../core/theme';
import { componentDocs } from './componentes';
import {
	buildTokenReference,
	renderComponentVarsHtml,
	renderLiveTokensTableBody,
	renderTokenGroupsHtml,
	renderTokenReferenceHtml,
	TOKEN_DESCRIPTIONS,
	TOKEN_GROUPS,
} from './theme-reference';

/** Todas as chaves `grupo.chave` dos dois temas. */
function tokenKeys(tokens: typeof defaultTokens): string[] {
	return Object.entries(tokens).flatMap(([group, values]) =>
		Object.keys(values).map((key) => `${group}.${key}`),
	);
}

describe('referência de tokens', () => {
	it('todo token (claro e escuro) tem descrição', () => {
		const keys = new Set([...tokenKeys(defaultTokens), ...tokenKeys(darkTokens)]);
		const missing = [...keys].filter((k) => !TOKEN_DESCRIPTIONS[k]);
		expect(missing, `tokens sem descrição: ${missing.join(', ')}`).toEqual([]);
	});

	it('claro e escuro expõem exatamente as mesmas chaves', () => {
		expect(tokenKeys(darkTokens).sort()).toEqual(tokenKeys(defaultTokens).sort());
	});

	it('todo grupo tem label e descrição', () => {
		for (const group of Object.keys(defaultTokens)) {
			expect(TOKEN_GROUPS[group]?.label.length ?? 0).toBeGreaterThan(1);
			expect(TOKEN_GROUPS[group]?.desc.length ?? 0).toBeGreaterThan(10);
		}
	});

	it('as linhas batem com tokenCssVars e com os valores de cada tema', () => {
		const light = tokenCssVars(defaultTokens);
		const dark = tokenCssVars(darkTokens);
		for (const { group, rows } of buildTokenReference()) {
			for (const row of rows) {
				expect(row.cssVar).toBe(`--fx-${group}-${row.key.split('.')[1]}`);
				expect(row.light).toBe(light[row.cssVar]);
				expect(row.dark).toBe(dark[row.cssVar]);
				expect(row.desc.length).toBeGreaterThan(5);
			}
		}
	});

	it('HTML da referência traz token, valores e exemplo por grupo', () => {
		const html = renderTokenReferenceHtml();
		expect(html).toContain('--fx-color-primary');
		expect(html).toContain('--fx-table-text');
		expect(html).toContain('FenixUI.setTokens({');
		// Um <h4> por grupo de token.
		expect((html.match(/<h4 /g) ?? []).length).toBe(Object.keys(defaultTokens).length);
		// Tabela-resumo gerada.
		const summary = renderTokenGroupsHtml();
		expect(summary).toContain('O que muda');
		expect(summary).toContain('<code class="inline">color</code>');
		expect(summary).toContain('<code class="inline">table</code>');
	});

	it('valores ativos caem no padrão claro quando não há tema aplicado', () => {
		const body = renderLiveTokensTableBody();
		expect(body).toContain('--fx-color-primary');
		expect(body).toContain(defaultTokens.color.primary);
	});

	it('índice de variáveis de componente inclui tabela e input', () => {
		const html = renderComponentVarsHtml(componentDocs);
		expect(html).toContain('--fx-table-text-weight');
		expect(html).toContain('--fx-input-width');
		expect(html).toContain('#/fx-table');
	});
});
