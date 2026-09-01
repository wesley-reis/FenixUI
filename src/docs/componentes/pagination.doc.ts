/**
 * Documentação do componente <fx-pagination>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const paginationDoc: ComponentDoc = {
	tag: "fx-pagination",
	title: "Pagination",
	group: "Navegação",
	lead: "Paginação standalone com seletor de itens por página e alinhamento configurável.",
	imports: ["import '@wrrdev/fenix-ui/pagination';"],
	demoHtml: (a) => `<fx-pagination ${a}></fx-pagination>`,
	variantsHtml: () =>
		`<h4>Alinhamentos</h4><fx-pagination total="120" rows="10" page="1" position="left"></fx-pagination><fx-pagination total="120" rows="10" page="3" position="center"></fx-pagination><fx-pagination total="120" rows="10" page="7" position="right"></fx-pagination>`,
	controls: [
		{ kind: "text", attr: "total", label: "Total de itens", value: "87" },
		{
			kind: "select",
			attr: "rows",
			label: "Por página",
			options: ["5", "10", "20"],
			value: "10",
		},
		{ kind: "text", attr: "page", label: "Página inicial", value: "2" },
		{
			kind: "select",
			attr: "position",
			label: "Alinhamento",
			options: ["left", "center", "right"],
		},
	],
	attributes: [
		{ name: "page", type: "number", default: "1", desc: "Página atual." },
		{
			name: "total",
			type: "number",
			default: "0",
			desc: "Total de itens.",
		},
		{
			name: "rows",
			type: "number",
			default: "10",
			desc: "Itens por página.",
		},
		{
			name: "rows-options",
			type: "string",
			default: "'5,10,20,50'",
			desc: "Opções do seletor.",
		},
		{
			name: "position",
			type: `'left' | 'center' | 'right'`,
			default: "'left'",
			desc: "Alinhamento.",
		},
	],
	events: [
		{
			name: "page-change",
			type: `CustomEvent<{ page: number; rows: number }>`,
			desc: "Ao mudar página ou rows.",
		},
	],
};
