/** Testes do UI kit da doc (helpers de HTML puro — sem DOM). */
import { describe, it, expect } from 'vitest';
import {
	callout,
	chip,
	inlineCode,
	kbd,
	slugify,
	statCard,
} from './kit';

describe('ui/kit · slugify', () => {
	it('normaliza acentos, caixa e separadores', () => {
		expect(slugify('Tamanhos e variantes')).toBe('tamanhos-e-variantes');
		expect(slugify('Atributos (props) & eventos')).toBe(
			'atributos-props-eventos',
		);
		expect(slugify('  Vue 3 / Nuxt  ')).toBe('vue-3-nuxt');
		expect(slugify('Configuração Avançada')).toBe('configuracao-avancada');
		expect(slugify('---já---hifenizado---')).toBe('ja-hifenizado');
	});
});

describe('ui/kit · callout', () => {
	it('renderiza aside com role, ícone e variante', () => {
		const html = callout('warning', 'Atenção', 'Use com moderação.');
		expect(html).toContain('doc-callout doc-callout--warning');
		expect(html).toContain('role="note"');
		expect(html).toContain('doc-callout-title');
		expect(html).toContain('Use com moderação.');
		expect(html).toContain('⚠');
	});

	it('escapa o título (não injeta HTML)', () => {
		const html = callout('info', '<b>intro</b>', 'corpo <em>livre</em>');
		expect(html).not.toContain('<b>intro</b>');
		expect(html).toContain('&lt;b&gt;intro&lt;/b&gt;');
		// corpo é HTML por contrato (páginas passam markup próprio)
		expect(html).toContain('corpo <em>livre</em>');
	});
});

describe('ui/kit · chip', () => {
	it('renderiza span neutro por padrão e link quando pedido', () => {
		expect(chip('md')).toBe('<span class="doc-chip doc-chip--neutral">md</span>');
		const linked = chip('Ver docs', { tone: 'accent', href: '#/installation' });
		expect(linked).toContain('<a class="doc-chip doc-chip--accent"');
		expect(linked).toContain('href="#/installation"');
	});

	it('escapa o rótulo', () => {
		expect(chip('<script>')).not.toContain('<script>');
		expect(chip('<script>')).toContain('&lt;script&gt;');
	});
});

describe('ui/kit · kbd', () => {
	it('uma tecla por <kbd> com separador +', () => {
		expect(kbd('Ctrl', 'K')).toBe(
			'<kbd class="doc-kbd">Ctrl</kbd><span class="doc-kbd-sep">+</span><kbd class="doc-kbd">K</kbd>',
		);
		expect(kbd('Esc')).toBe('<kbd class="doc-kbd">Esc</kbd>');
	});
});

describe('ui/kit · statCard / inlineCode', () => {
	it('statCard escapa valor e rótulo', () => {
		const html = statCard('42', '<b>componentes</b>');
		expect(html).toContain('doc-stat-value');
		expect(html).toContain('>42<');
		expect(html).toContain('&lt;b&gt;componentes&lt;/b&gt;');
	});

	it('inlineCode usa a classe .inline já estilizada e escapa', () => {
		expect(inlineCode('<fx-button>')).toBe(
			'<code class="inline">&lt;fx-button&gt;</code>',
		);
	});
});
