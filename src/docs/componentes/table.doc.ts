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
	lead: "Tabela estilo DataTable com ordenação, filtro no header, paginação e clique na linha. Colunas declaradas como <fx-column> dentro do componente.",
	imports: ["import '@wrrdev/fenix-ui/table';"],
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
		return `<fx-table ${a} data="${json}"><fx-column field="nome" header="Nome" sortable filterable></fx-column><fx-column field="cargo" header="Cargo" sortable filterable></fx-column><fx-column field="departamento" header="Departamento" filterable></fx-column><fx-column field="salario" header="Salário (R$)" sortable></fx-column><fx-column field="ativo" header="Ativo"></fx-column></fx-table>`;
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
	],
	events: [
		{
			name: "sort-change",
			type: `CustomEvent<{ field: string; direction: 'asc' | 'desc' }>`,
			desc: "Ao ordenar.",
		},
		{
			name: "filter-change",
			type: `CustomEvent<{ field: string; value: string }>`,
			desc: "Ao filtrar uma coluna.",
		},
		{
			name: "page-change",
			type: `CustomEvent<{ page: number; rows: number }>`,
			desc: "Ao trocar de página.",
		},
		{
			name: "row-click",
			type: `CustomEvent<{ row: any; index: number }>`,
			desc: "Clique na linha.",
		},
	],
	slots: [
		{
			name: "header[slot]",
			desc: "Slot de header customizado por coluna (via <fx-column>).",
		},
		{ name: "body[slot]", desc: "Slot de célula customizado." },
	],
};
