/**
 * Documentação do componente <fx-radio>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const radioDoc: ComponentDoc = {
	tag: "fx-radio",
	title: "Radio",
	group: "Formulário",
	lead: "Botão de opção. Radios com o mesmo `name` formam um grupo de seleção exclusiva.",
	imports: ["import '@wrrdev/fenix-ui/radio';"],
	demoHtml: (a) =>
		`<fx-radio ${a} name="gender">Masculino</fx-radio><fx-radio ${a} name="gender">Feminino</fx-radio>`,
	variantsHtml: () =>
		["sm", "md", "lg"]
			.map((s) => `<fx-radio size="${s}">S ${s}</fx-radio>`)
			.join(""),
	controls: [
		{ kind: "toggle", attr: "checked", label: "Checked" },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{
			name: "checked",
			type: "boolean",
			default: "false",
			desc: "Marcado (reflete no host).",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			desc: "Desabilita.",
		},
		{
			name: "value",
			type: "string",
			default: "''",
			desc: "Valor associado (via detail de change).",
		},
		{
			name: "name",
			type: "string",
			default: "''",
			desc: "Grupo: radios com o mesmo name alternam exclusivamente.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: `'md'`,
			desc: "Tamanho do controle.",
		},
	],
	events: [
		{
			name: "change",
			type: `CustomEvent<{ checked: boolean; value: string }>`,
			desc: "Emitido quando este radio passa a ser o do grupo.",
		},
	],
	slots: [{ name: "(padrão)", desc: "Rótulo ao lado do círculo." }],
};
