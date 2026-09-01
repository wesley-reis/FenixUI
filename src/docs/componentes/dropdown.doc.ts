/**
 * Documentação do componente <fx-dropdown>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const dropdownDoc: ComponentDoc = {
	tag: "fx-dropdown",
	title: "Dropdown",
	group: "Navegação",
	lead: 'Menu de ações disparado por botão. Itens como <fx-dropdown-item value="...">.',
	imports: ["import '@wrrdev/fenix-ui/dropdown';"],
	demoHtml: (a) =>
		`<fx-dropdown ${a}><fx-dropdown-item value="edit">Editar</fx-dropdown-item><fx-dropdown-item value="dup">Duplicar</fx-dropdown-item><fx-dropdown-item value="del">Excluir</fx-dropdown-item></fx-dropdown>`,
	variantsHtml: () =>
		`<div style="display:flex;gap:32px;padding-bottom:70px"><fx-dropdown label="Esquerda" position="left"><fx-dropdown-item value="a">Opção A</fx-dropdown-item><fx-dropdown-item value="b">Opção B</fx-dropdown-item></fx-dropdown><fx-dropdown label="Centro" position="center"><fx-dropdown-item value="a">Opção A</fx-dropdown-item><fx-dropdown-item value="b">Opção B</fx-dropdown-item></fx-dropdown><fx-dropdown label="Direita" position="right"><fx-dropdown-item value="a">Opção A</fx-dropdown-item><fx-dropdown-item value="b">Opção B</fx-dropdown-item></fx-dropdown></div>`,
	controls: [
		{
			kind: "text",
			attr: "label",
			label: "Rótulo do botão",
			value: "Ações",
		},
		{
			kind: "select",
			attr: "position",
			label: "Alinhamento",
			options: ["left", "center", "right"],
			value: "left",
		},
	],
	attributes: [
		{
			name: "label",
			type: "string",
			default: "''",
			desc: "Texto do botão gatilho.",
		},
		{
			name: "position",
			type: `'left' | 'center' | 'right'`,
			default: "'left'",
			desc: "Alinhamento do menu.",
		},
		{
			name: "open",
			type: "boolean",
			default: "false",
			desc: "Menu aberto (refletido).",
		},
	],
	events: [
		{
			name: "select",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao escolher um item.",
		},
	],
};
