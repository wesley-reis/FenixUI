/**
 * Documentação do componente <fx-orderlist>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const orderlistDoc: ComponentDoc = {
	tag: "fx-orderlist",
	title: "OrderList",
	group: "Dados",
	lead: "Lista ordenável com controles para mover itens, filtro, seleção, drag-and-drop e templates customizados.",
	imports: [
		'import { defineFxOrderList } from "@wrrdev/fenix-ui/orderlist";',
		"defineFxOrderList();",
	],
	demoHtml: (a) =>
		`<fx-orderlist ${a} data='[{"id":1,"label":"Item A"},{"id":2,"label":"Item B"},{"id":3,"label":"Item C"},{"id":4,"label":"Item D"}]' data-key="id"></fx-orderlist>`,
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:24px;max-width:400px">
			<div><strong>Básico</strong><fx-orderlist data='[{"label":"Home"},{"label":"Sobre"},{"label":"Contato"}]'></fx-orderlist></div>
			<div><strong>Com filtro</strong><fx-orderlist filter data='[{"label":"Apple"},{"label":"Banana"},{"label":"Cherry"},{"label":"Date"}]'></fx-orderlist></div>
			<div><strong>Com seleção</strong><fx-orderlist selection-mode="multiple" data='[{"label":"Tarefa 1"},{"label":"Tarefa 2"},{"label":"Tarefa 3"}]'></fx-orderlist></div>
			<div><strong>Com seleção</strong><fx-orderlist selection-mode="multiple" show-select-all=true data='[{"label":"Tarefa 1"},{"label":"Tarefa 2"},{"label":"Tarefa 3"}]'></fx-orderlist></div>
			<div><strong>Drag-and-drop</strong><fx-orderlist dragdrop data='[{"label":"Opção 1"},{"label":"Opção 2"},{"label":"Opção 3"}]'></fx-orderlist></div>
			<div><strong>Striped</strong><fx-orderlist striped data='[{"label":"Linha 1"},{"label":"Linha 2"},{"label":"Linha 3"}]'></fx-orderlist></div>
		</div>`,
	controls: [
		{ kind: "toggle", attr: "filter", label: "Filtro", on: false },
		{ kind: "toggle", attr: "dragdrop", label: "Drag & Drop", on: false },
		{ kind: "toggle", attr: "striped", label: "Striped", on: false },
		{
			kind: "select",
			attr: "selection-mode",
			label: "Seleção",
			options: ["", "single", "multiple"],
			value: "",
		},
		{
			kind: "toggle",
			attr: "show-select-all",
			label: "Selecionar Todos",
			on: false,
		},
		{
			kind: "text",
			attr: "filter-placeholder",
			label: "Placeholder",
			hint: "Buscar...",
		},
	],
	attributes: [
		{
			name: "data",
			type: "string",
			default: "[]",
			desc: "JSON array de itens.",
		},
		{
			name: "data-key",
			type: "string",
			default: "''",
			desc: "Chave única dos itens.",
		},
		{
			name: "filter",
			type: "boolean",
			default: "false",
			desc: "Exibe campo de filtro.",
		},
		{
			name: "filter-by",
			type: "string",
			default: "'label'",
			desc: "Campos para filtrar (separados por vírgula).",
		},
		{
			name: "filter-placeholder",
			type: "string",
			default: "'Buscar...'",
			desc: "Placeholder do filtro.",
		},
		{
			name: "dragdrop",
			type: "boolean",
			default: "false",
			desc: "Permite arrastar para reordenar.",
		},
		{
			name: "striped",
			type: "boolean",
			default: "false",
			desc: "Linhas alternadas.",
		},
		{
			name: "selection-mode",
			type: "'single' | 'multiple'",
			default: "''",
			desc: "Modo de seleção.",
		},
		{
			name: "show-select-all",
			type: "boolean",
			default: "false",
			desc: "Exibe botão para selecionar todos (apenas com selection-mode=multiple).",
		},
	],
	events: [
		{
			name: "reorder",
			type: "CustomEvent<{ items: OrderListItem[] }>",
			desc: "Ao reordenar itens.",
		},
		{
			name: "selection-change",
			type: "CustomEvent<{ selection: OrderListItem[] }>",
			desc: "Ao mudar seleção.",
		},
	],
};
