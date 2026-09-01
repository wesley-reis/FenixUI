/**
 * Documentação do componente <fx-picklist>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const picklistDoc: ComponentDoc = {
	tag: "fx-picklist",
	title: "PickList",
	group: "Dados",
	lead: "Duas listas para transferir itens entre origem e destino com filtro, seleção múltipla e templates customizados.",
	imports: [
		'import { defineFxPickList } from "@wrrdev/fenix-ui/picklist";',
		"defineFxPickList();",
	],
	demoHtml: (a) =>
		`<style>.picklist-demo{width:100%}</style><fx-picklist class="picklist-demo" ${a} source-label="Disponíveis" target-label="Selecionados" source='[{"id":1,"label":"Apple"},{"id":2,"label":"Banana"},{"id":3,"label":"Cherry"},{"id":4,"label":"Date"}]' target='[]' source-key="id"></fx-picklist>`,
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:24px">
			<div><strong>Básico</strong><fx-picklist source-label="Origem" target-label="Destino" source='[{"label":"A"},{"label":"B"},{"label":"C"}]' target='[]'></fx-picklist></div>
			<div><strong>Com filtro</strong><fx-picklist filter source-label="Disponíveis" target-label="Selecionados" source='[{"label":"Apple"},{"label":"Banana"},{"label":"Cherry"}]' target='[]'></fx-picklist></div>
			<div><strong>Com seleção</strong><fx-picklist selection-mode="multiple" source-label="Origem" target-label="Destino" source='[{"label":"Item 1"},{"label":"Item 2"}]' target='[]'></fx-picklist></div>
			<div><strong>Com seleção</strong><fx-picklist selection-mode="multiple" show-select-all=true source-label="Origem" target-label="Destino" source='[{"label":"Item 1"},{"label":"Item 2"}]' target='[]'></fx-picklist></div>

			</div>`,
	controls: [
		{ kind: "toggle", attr: "filter", label: "Filtro", on: false },
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
			attr: "source-label",
			label: "Label Origem",
			hint: "Disponíveis",
		},
		{
			kind: "text",
			attr: "target-label",
			label: "Label Destino",
			hint: "Selecionados",
		},
	],
	attributes: [
		{
			name: "source",
			type: "string",
			default: "[]",
			desc: "JSON array de itens da origem.",
		},
		{
			name: "target",
			type: "string",
			default: "[]",
			desc: "JSON array de itens do destino.",
		},
		{
			name: "source-key",
			type: "string",
			default: "''",
			desc: "Chave única dos itens da origem.",
		},
		{
			name: "target-key",
			type: "string",
			default: "''",
			desc: "Chave única dos itens do destino.",
		},
		{
			name: "filter",
			type: "boolean",
			default: "false",
			desc: "Exibe campo de filtro em ambas as listas.",
		},
		{
			name: "filter-by",
			type: "string",
			default: "'label'",
			desc: "Campos para filtrar (separados por vírgula).",
		},
		{
			name: "source-label",
			type: "string",
			default: "'Source'",
			desc: "Título da lista de origem.",
		},
		{
			name: "target-label",
			type: "string",
			default: "'Target'",
			desc: "Título da lista de destino.",
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
			desc: "Exibe barra 'Selecionar Todos' em ambas as listas (requer selection-mode=\"multiple\").",
		},
		{
			name: "striped",
			type: "boolean",
			default: "false",
			desc: "Linhas alternadas.",
		},
	],
	events: [
		{
			name: "move-to-target",
			type: "CustomEvent<{ items: PickListItem[] }>",
			desc: "Ao mover itens para destino.",
		},
		{
			name: "move-to-source",
			type: "CustomEvent<{ items: PickListItem[] }>",
			desc: "Ao mover itens para origem.",
		},
		{
			name: "selection-change-source",
			type: "CustomEvent<{ selection: PickListItem[] }>",
			desc: "Ao mudar seleção na origem.",
		},
		{
			name: "selection-change-target",
			type: "CustomEvent<{ selection: PickListItem[] }>",
			desc: "Ao mudar seleção no destino.",
		},
	],
};
