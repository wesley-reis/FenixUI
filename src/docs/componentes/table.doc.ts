/**
 * Documentação do componente <fx-table>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const tableDoc: ComponentDoc = {
	tag: "fx-table",
	title: "Table",
	group: "Exibição",
	lead: "Tabela estilo DataTable com ordenação, filtro no header, paginação e clique na linha. Colunas declaradas como <fx-column> dentro do componente, com suporte a templates de célula personalizados (formatação de moeda, data, ícones e condicionais).",
	imports: ["import '@wrrdev/fenix-ui/table';"],
	initNote:
		"Cada coluna pode ter um template de célula próprio: dentro do <fx-column>, use <code>&lt;template&gt;</code> (ou o próprio conteúdo) com expressões <code>{{ }}</code>. Pipes disponíveis: <code>currency</code>, <code>date</code>, <code>dateTime</code>, <code>number</code>; além de ternários (<code>{{ value &gt; 1000 ? 'alto' : 'baixo' }}</code>) e acesso a campos da linha via <code>{{ row.campo }}</code>.",
	demoHtml: (a) => {
		const data = [
			{
				id: 1,
				nome: "Ana Souza",
				cargo: "Analista",
				departamento: "Financeiro",
				salario: 5200,
				ativo: "Sim",
			},
			{
				id: 2,
				nome: "Bruno Lima",
				cargo: "Desenvolvedor",
				departamento: "TI",
				salario: 7800,
				ativo: "Sim",
			},
			{
				id: 3,
				nome: "Carla Dias",
				cargo: "Designer",
				departamento: "Marketing",
				salario: 6100,
				ativo: "Não",
			},
			{
				id: 4,
				nome: "Diego Alves",
				cargo: "Gerente",
				departamento: "Vendas",
				salario: 9500,
				ativo: "Sim",
			},
			{
				id: 5,
				nome: "Elaine Costa",
				cargo: "Analista",
				departamento: "RH",
				salario: 4900,
				ativo: "Sim",
			},
			{
				id: 6,
				nome: "Fábio Rocha",
				cargo: "DevOps",
				departamento: "TI",
				salario: 8900,
				ativo: "Não",
			},
			{
				id: 7,
				nome: "Gisele Martins",
				cargo: "Contadora",
				departamento: "Financeiro",
				salario: 6700,
				ativo: "Sim",
			},
			{
				id: 8,
				nome: "Hugo Pereira",
				cargo: "Vendedor",
				departamento: "Vendas",
				salario: 3800,
				ativo: "Sim",
			},
			{
				id: 9,
				nome: "Ivana Ferreira",
				cargo: "Designer",
				departamento: "Marketing",
				salario: 5600,
				ativo: "Sim",
			},
			{
				id: 10,
				nome: "João Cardoso",
				cargo: "Desenvolvedor",
				departamento: "TI",
				salario: 8200,
				ativo: "Não",
			},
			{
				id: 11,
				nome: "Karina Ribeiro",
				cargo: "Recrutadora",
				departamento: "RH",
				salario: 4500,
				ativo: "Sim",
			},
			{
				id: 12,
				nome: "Lucas Moraes",
				cargo: "Suporte",
				departamento: "TI",
				salario: 3600,
				ativo: "Sim",
			},
		];
		const json = JSON.stringify(data).replace(/"/g, "&quot;");
		return `<fx-table ${a} data="${json}"><template slot="toolbar"><input data-search-fields="nome,cargo,departamento" placeholder="Buscar por nome, cargo ou departamento…" style="padding:6px 10px;border:1px solid var(--fx-border-default);border-radius:var(--fx-radius-sm);font-family:inherit;font-size:inherit;min-width:220px"><button type="button" style="padding:6px 12px;font-family:inherit;font-size:inherit;border:1px solid var(--fx-border-default);border-radius:var(--fx-radius-sm);background:var(--fx-surface-background);cursor:pointer">Exportar</button></template><fx-column field="nome" header="Nome" sortable filterable></fx-column><fx-column field="cargo" header="Cargo" sortable filterable></fx-column><fx-column field="departamento" header="Departamento" filterable></fx-column><fx-column field="salario" header="Salário" sortable><template>R$ {{ value | number }}</template></fx-column><fx-column field="ativo" header="Ativo"></fx-column></fx-table>`;
	},
	variantsHtml: () => {
		const small = JSON.stringify([
			{ nome: "Ana Souza", cargo: "Analista", salario: 5200 },
			{ nome: "Bruno Lima", cargo: "Desenvolvedor", salario: 7800 },
			{ nome: "Carla Dias", cargo: "Designer", salario: 6100 },
			{ nome: "Diego Alves", cargo: "Gerente", salario: 9500 },
			{ nome: "Elaine Costa", cargo: "Analista", salario: 4900 },
			{ nome: "Fábio Rocha", cargo: "DevOps", salario: 8900 },
			{ nome: "Gisele Martins", cargo: "Contadora", salario: 6700 },
		]).replace(/"/g, "&quot;");
		const cols =
			'<fx-column field="nome" header="Nome"></fx-column><fx-column field="cargo" header="Cargo"></fx-column><fx-column field="salario" header="Salário"></fx-column>';
		return [
			`<h4>Básica</h4><fx-table data="${small}">${cols}</fx-table>`,
			`<h4>Ordenação + Filtro no header</h4><fx-table data="${small}" sort-field="nome" sort-order="asc"><fx-column field="nome" header="Nome" sortable filterable></fx-column><fx-column field="cargo" header="Cargo" sortable filterable></fx-column><fx-column field="salario" header="Salário" sortable></fx-column></fx-table>`,
			`<h4>Paginação centralizada</h4><fx-table data="${small}" pagination rows="3" pagination-position="center">${cols}</fx-table>`,
			`<h4>Listrada + hover + paginação à direita</h4><fx-table data="${small}" striped hover pagination rows="3" pagination-position="right">${cols}</fx-table>`,
			`<h4>Vazia com mensagem customizada</h4><fx-table data='[]' empty-message="Nenhum funcionário encontrado">${cols}</fx-table>`,
			`<h4>Templates de célula (moeda, data, ícone dinâmico)</h4><fx-table data="${small}"><fx-column field="nome" header="Nome"></fx-column><fx-column field="cargo" header="Cargo"></fx-column><fx-column field="salario" header="Salário (formatado)"><template>R$ {{ value | number }}</template></fx-column><fx-column field="salario" header="Faixa"><template>{{ value >= 6000 ? 'Sênior' : 'Júnior' }}</template></fx-column></fx-table>`,
			`<h4>Toolbar acima do header (busca global + ação)</h4><fx-table data="${small}"><template slot="toolbar"><input data-search-fields="nome,cargo" placeholder="Buscar por nome ou cargo…" style="padding:6px 10px;border:1px solid var(--fx-border-default);border-radius:var(--fx-radius-sm);font-family:inherit;font-size:inherit"><button type="button" style="padding:6px 12px;font-family:inherit;font-size:inherit;border:1px solid var(--fx-border-default);border-radius:var(--fx-radius-sm);background:var(--fx-surface-background);cursor:pointer">Exportar</button></template><fx-column field="nome" header="Nome" sortable></fx-column><fx-column field="cargo" header="Cargo" sortable></fx-column><fx-column field="salario" header="Salário" sortable><template>R$ {{ value | number }}</template></fx-column></fx-table>`,
			`<h4>Carregando (atributo loading — para buscas sob demanda)</h4><fx-table data="${small}" loading>${cols}</fx-table>`,
		].join("");
	},
	controls: [
		{ kind: "toggle", attr: "pagination", label: "Paginação", on: true },
		{ kind: "toggle", attr: "striped", label: "Listrada", on: true },
		{ kind: "toggle", attr: "hover", label: "Hover" },
		{
			kind: "select",
			attr: "rows",
			label: "Por página",
			options: ["3", "5", "10"],
			value: "5",
		},
		{
			kind: "select",
			attr: "pagination-position",
			label: "Posição paginação",
			options: ["left", "center", "right"],
			value: "left",
		},
	],
	attributes: [
		{
			name: "data",
			type: "array",
			default: "[]",
			desc: "Dados exibidos (JSON no atributo ou propriedade).",
		},
		{
			name: "pagination",
			type: "boolean",
			default: "false",
			desc: "Exibe paginação no footer.",
		},
		{
			name: "rows-options",
			type: "string",
			default: "'5,10,20,50'",
			desc: "Opções do seletor de itens por página.",
		},
		{
			name: "pagination-position",
			type: `'left' | 'center' | 'right'`,
			default: "'left'",
			desc: "Alinhamento do pager.",
		},
		{
			name: "empty-message",
			type: "string",
			default: "'Nenhum registro'",
			desc: "Mensagem quando não há dados.",
		},
		{
			name: "rows",
			type: "number",
			default: "10",
			desc: "Itens por página.",
		},
		{
			name: "striped",
			type: "boolean",
			default: "false",
			desc: "Linhas listradas.",
		},
		{
			name: "hover",
			type: "boolean",
			default: "false",
			desc: "Hover nas linhas.",
		},
		{
			name: "sort-field",
			type: "string",
			default: "''",
			desc: "Ordenação inicial.",
		},
		{
			name: "sort-order",
			type: `'asc' | 'desc' | ''`,
			default: "''",
			desc: "Direção inicial.",
		},
		{
			name: "lazy",
			type: "boolean",
			default: "false",
			desc: "Modo sob demanda: data é a página já carregada do servidor. A tabela não filtra/ordena/pagina localmente — re-busque ao ouvir page-change / sort-change / filter-change.",
		},
		{
			name: "total",
			type: "number",
			default: "''",
			desc: "Total de registros no servidor (usado pelo pager em modo lazy).",
		},
		{
			name: "loading",
			type: "boolean",
			default: "false",
			desc: "Exibe overlay com spinner sobre a tabela (use durante a busca sob demanda).",
		},
	],
	events: [
		{
			name: "sort-change",
			type: `CustomEvent<{ field: string; direction: 'asc' | 'desc'; lazy: boolean }>`,
			desc: "Ao ordenar.",
		},
		{
			name: "filter-change",
			type: `CustomEvent<{ field: string; value: string; lazy: boolean }>`,
			desc: "Ao filtrar uma coluna.",
		},
		{
			name: "page-change",
			type: `CustomEvent<{ page: number; pages: number; rowsPerPage: number; total: number; lazy: boolean }>`,
			desc: "Ao trocar de página. Em lazy, re-busque a página no servidor.",
		},
		{
			name: "row-click",
			type: `CustomEvent<{ row: any; index: number }>`,
			desc: "Clique na linha.",
		},
	],
	slots: [
		{
			name: "fx-column > <template>",
			desc: "Template HTML da célula da coluna. Aceita expressões {{ }} com pipes (currency, date, dateTime, number), condicionais ternários e acesso a row.campo. Ex.: <template>R$ {{ value | currency }}</template>",
		},
		{
			name: "fx-column > conteúdo",
			desc: "Se não houver <template>, o conteúdo direto do <fx-column> é usado como template. Ex.: <fx-column field=\"status\"><i class=\"pi pi-{{ row.ativo ? 'check' : 'times' }}\"></i> {{ value }}</fx-column>",
		},
		{
			name: "template[slot='toolbar']",
			desc: 'Toolbar opcional renderizada acima do header. Inputs com data-search-fields="campo1,campo2…" viram busca global (filtrando por esses campos; sem o atributo, busca em todas as colunas). Demais elementos (botões etc.) aparecem como estão.',
		},
	],
};
