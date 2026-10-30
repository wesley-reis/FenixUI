/**
 * Referência de tema da documentação.
 *
 * Fonte única dos textos da página **Tokens de tema** e do índice de
 * **Variáveis de componente**. Os valores (claro/escuro) NÃO são escritos
 * aqui: vêm de `defaultTokens`/`darkTokens` via `tokenCssVars()` — token novo
 * aparece sozinho na tabela. O único conteúdo manual é `TOKEN_DESCRIPTIONS`
 * (uma frase por token), coberto por `theme-reference.test.ts`.
 */
import { darkTokens, defaultTokens } from '../core/tokens';
import { tokenCssVars } from '../core/theme';
import { hrefFor } from './router';
import { esc } from './shared';
import type { ComponentDoc } from './types';
import { codeBlock } from './ui/code';

export interface TokenGroupInfo {
  /** Rótulo amigável do grupo. */
  label: string;
  /** O que o grupo controla. */
  desc: string;
}

/** Metadados de exibição por grupo de token (na ordem de `FenixTokens`). */
export const TOKEN_GROUPS: Record<string, TokenGroupInfo> = {
	color: {
		label: 'Cor',
		desc: 'Paleta semântica usada por botões, links, foco e estados de validação.',
	},
	surface: {
		label: 'Superfícies',
		desc: 'Fundos de página, campos, tabelas e estados de hover.',
	},
	text: {
		label: 'Texto',
		desc: 'Texto principal, secundário e desabilitado de todo o app.',
	},
	border: {
		label: 'Bordas',
		desc: 'Contornos de campos, cards, divisores e da moldura da tabela.',
	},
	font: {
		label: 'Tipografia',
		desc: 'Família, tamanho, peso e altura de linha do texto.',
	},
	space: {
		label: 'Espaçamento',
		desc: 'Escala de espaçamentos internos (paddings e gaps).',
	},
	radius: {
		label: 'Arredondamento',
		desc: 'Raios de canto de campos, botões, cards e painéis.',
	},
	size: {
		label: 'Altura de controles',
		desc: 'Altura exata de inputs, selects, botões e datepickers.',
	},
	shadow: {
		label: 'Sombras',
		desc: 'Elevação de cards, dropdowns, diálogos e drawers.',
	},
	motion: {
		label: 'Movimento',
		desc: 'Duração e curva das transições e animações.',
	},
	effect: {
		label: 'Efeitos',
		desc: 'Ripple dos botões, anel de foco e brilhos de validação.',
	},
	table: {
		label: 'Tabela (fx-table)',
		desc: 'Texto do corpo e do cabeçalho das tabelas.',
	},
	z: {
		label: 'Camadas (z-index)',
		desc: 'Ordem de sobreposição de painéis, modais e notificações.',
	},
};


/**
 * Descrição por `grupo.chave`. Obrigatória para TODO token — o teste
 * `theme-reference.test.ts` falha se um token novo ficar sem descrição.
 */
export const TOKEN_DESCRIPTIONS: Record<string, string> = {
	'color.primary': 'Cor de marca: botões primários, foco dos campos, seleção e links.',
	'color.secondary': 'Cor de apoio para botões secundários e realces complementares.',
	'color.success': 'Estados positivos: validação <code>success</code>/<code>valid</code> e badges.',
	'color.warning': 'Avisos: badges, alertas e estados de atenção.',
	'color.danger': 'Erros e ações destrutivas: validação <code>error</code>/<code>invalid</code>.',
	'color.info': 'Informação neutra: badges e destaques informativos.',

	'surface.background': 'Fundo de página, campos, tabela e superfícies elevadas.',
	'surface.surface': 'Superfície sutil: header da tabela, faixas e fundos de cards.',
	'surface.surface-hover': 'Fundo de hover de linhas, itens de menu e botões ghost.',

	'text.default': 'Texto principal do app. Também é a base de <code>--fx-table-text</code>.',
	'text.muted': 'Texto secundário: legendas, placeholders e contadores de paginação.',
	'text.disabled': 'Texto de elementos desabilitados.',

	'border.default': 'Bordas de campos, cards, divisores e contorno da tabela.',
	'border.hover': 'Borda em hover de campos e controles.',

	'font.family': 'Família tipográfica global (carregue a fonte no app para o resultado esperado).',
	'font.size': 'Tamanho base do texto (campos, tabelas e botões).',
	'font.weight': 'Peso base do texto e dos botões.',
	'font.line-height': 'Altura de linha dos campos e do texto.',

	'space.xs': 'Espaçamento mínimo: gaps internos e paddings curtos.',
	'space.sm': 'Espaçamento pequeno: paddings de células e botões.',
	'space.md': 'Espaçamento médio: paddings padrão de campos e células.',
	'space.lg': 'Espaçamento grande: seções e containers.',
	'space.xl': 'Espaçamento extra: separação entre blocos.',

	'radius.none': 'Sem arredondamento (usado por <code>rounded="none"</code>).',
	'radius.sm': 'Cantos leves: botões pequenos, inputs e badges.',
	'radius.md': 'Raio padrão: campos, cards e diálogos.',
	'radius.lg': 'Cantos amplos: painéis e drawers.',
	'radius.full': 'Pílula: switches, avatares e badges circulares.',

	'size.sm': 'Altura dos controles no tamanho <code>sm</code>.',
	'size.md': 'Altura padrão dos controles.',
	'size.lg': 'Altura dos controles no tamanho <code>lg</code>.',

	'shadow.sm': 'Elevação discreta: cards e campos elevados.',
	'shadow.md': 'Elevação média: dropdowns e popovers.',
	'shadow.lg': 'Elevação alta: diálogos e drawers.',

	'motion.duration-fast': 'Duração de transições curtas (hover e foco).',
	'motion.duration-normal': 'Duração de transições amplas (abrir/fechar painéis).',
	'motion.easing': 'Curva de aceleração usada nas animações.',

	'effect.ripple': '<code>1</code> liga o ripple dos botões; <code>0</code> desliga.',
	'effect.focus-ring': 'Anel de foco dos campos. <code>none</code> remove; os anéis de validação acompanham.',
	'effect.error-ring': 'Brilho do estado de erro. Derivado de <code>focus-ring</code> quando não definido.',
	'effect.success-ring': 'Brilho do estado de sucesso. Derivado de <code>focus-ring</code> quando não definido.',

	'table.text': 'Cor do texto do corpo do <code>fx-table</code> (acompanha <code>text.default</code>).',
	'table.header-text': 'Cor do texto do cabeçalho do <code>fx-table</code> (acompanha <code>table.text</code>).',
	'table.header-weight': 'Peso do cabeçalho do <code>fx-table</code> (padrão: <b>bold</b> do navegador).',

	'z.base': 'Camada base do conteúdo.',
	'z.overlay': 'Overlay desfocado dos drawers — abaixo dos painéis modais.',
	'z.dropdown': 'Painéis de select/autocomplete e popovers.',
	'z.modal': 'Painéis de diálogos e drawers (acima do overlay).',
	'z.toast': 'Notificações de toast — acima de modais e overlays.',
};

export interface TokenRow {
	/** Nome da CSS Custom Property (`--fx-color-primary`). */
	cssVar: string;
	/** Caminho no preset (`color.primary`). */
	key: string;
	/** Valor no tema claro. */
	light: string;
	/** Valor no tema escuro. */
	dark: string;
	/** O que o token controla (HTML permitido). */
	desc: string;
}

export interface TokenGroupRef {
	group: string;
	info: TokenGroupInfo;
	rows: TokenRow[];
}

/** Achata os tokens reais em grupos/linhas prontos para a documentação. */
export function buildTokenReference(): TokenGroupRef[] {
	const lightVars = tokenCssVars(defaultTokens);
	const darkVars = tokenCssVars(darkTokens);
	return Object.entries(defaultTokens).map(([group, values]) => ({
		group,
		info: TOKEN_GROUPS[group] ?? { label: group, desc: '—' },
		rows: Object.keys(values).map((key) => {
			const cssVar = `--fx-${group}-${key}`;
			return {
				cssVar,
				key: `${group}.${key}`,
				light: lightVars[cssVar] ?? '',
				dark: darkVars[cssVar] ?? '',
				desc: TOKEN_DESCRIPTIONS[`${group}.${key}`] ?? '',
			};
		}),
	}));
}

/** Caminho curto do token dentro do grupo (`color.primary` → `primary`). */
const shortKey = (key: string): string => key.slice(key.indexOf('.') + 1);

/** Gera o exemplo de `setTokens` com TODAS as chaves do grupo e seus valores atuais. */
function groupExample(group: string, rows: TokenRow[]): string {
	const entries = rows
		.map((r) => {
			const k = shortKey(r.key);
			const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
			return `    ${key}: ${JSON.stringify(r.light)},`;
		})
		.join('\n');
	const css = rows.map((r) => `  ${r.cssVar}: ${r.light};`).join('\n');
	return `// Grupo ${group}: valores atuais do tema claro — troque pelos da sua marca
// (remova as chaves que não quiser alterar).
FenixUI.setTokens({
  ${group}: {
${entries}
  },
});

/* Equivalente em CSS puro:
:root {
${css}
} */`;
}

function tokenTable(head: string[], rows: string[][], cls = ''): string {
	const thead = head.map((h) => `<th>${h}</th>`).join('');
	const tbody = rows
		.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
		.join('');
	return `<table class="api${cls ? ` ${cls}` : ''}"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
}

/** Tabela-resumo: grupo, chaves disponíveis e o que o grupo controla. */
export function renderTokenGroupsHtml(): string {
	const rows = buildTokenReference().map(({ group, info, rows: items }) => [
		`<code class="inline">${esc(group)}</code>`,
		items.map((r) => `<code class="inline">${esc(shortKey(r.key))}</code>`).join(' '),
		info.desc,
	]);
	return tokenTable(['Grupo', 'Chaves', 'O que muda'], rows);
}

/**
 * Referência completa: um bloco por grupo com a tabela de TODOS os tokens
 * (token, caminho no preset, valor claro/escuro) e o exemplo de `setTokens`.
 */
export function renderTokenReferenceHtml(): string {
	return buildTokenReference()
		.map(
			({ group, info, rows }) => `
	<h4 id="tokens-${esc(group)}">${esc(info.label)} <code class="inline">${esc(group)}</code></h4>
	<p>${info.desc} <span class="counter">${rows.length} ${rows.length === 1 ? 'token' : 'tokens'}</span></p>
	${tokenTable(
		['Token', 'Chave no preset', 'Claro', 'Escuro', 'O que muda'],
		rows.map((r) => [
			`<code class="inline">${esc(r.cssVar)}</code>`,
			`<code class="inline">${esc(r.key)}</code>`,
			`<code class="inline">${esc(r.light || '—')}</code>`,
			`<code class="inline">${esc(r.dark || '—')}</code>`,
			r.desc,
		]),
		'token-ref',
	)}
	${codeBlock(groupExample(group, rows))}`,
		)
		.join('\n');
}

/**
 * `<tbody>` da tabela “Valores ativos”: lê o valor computado de cada token no
 * `:root` (repintada quando o tema muda). Sem DOM/tema aplicado, cai no padrão
 * claro do próprio token.
 */
export function renderLiveTokensTableBody(): string {
	const read = (cssVar: string): string => {
		try {
			return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
		} catch {
			return '';
		}
	};
	return buildTokenReference()
		.flatMap(({ group, rows }) =>
			rows.map((r) => {
				const value = read(r.cssVar) || r.light;
				return `<tr><td><code class="inline">${esc(group)}</code></td><td><code class="inline">${esc(r.cssVar)}</code></td><td><code class="inline">${esc(value || '—')}</code></td></tr>`;
			}),
		)
		.join('');
}

/**
 * Índice de variáveis CSS por componente, gerado de `ComponentDoc.cssVars`
 * (fonte já validada por `docs-quality.test.ts`). Só entram componentes que
 * declaram variáveis.
 */
export function renderComponentVarsHtml(docs: readonly ComponentDoc[]): string {
	const rows = [...docs]
		.filter((d) => (d.cssVars?.length ?? 0) > 0)
		.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
		.flatMap((d) =>
			d.cssVars!.map((v) => [
				`<a href="${hrefFor(d.tag)}">${esc(d.tag)}</a>`,
				`<code class="inline">${esc(v.name)}</code>`,
				esc(v.type ?? '—'),
				`<code class="inline">${esc(v.default ?? '—')}</code>`,
				v.desc,
			]),
		);
	return tokenTable(
		['Componente', 'Variável', 'Tipo', 'Padrão', 'Descrição'],
		rows,
		'component-vars',
	);
}
