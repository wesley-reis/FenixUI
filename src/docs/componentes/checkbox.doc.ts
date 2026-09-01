/**
 * Documentação do componente <fx-checkbox>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const checkboxDoc: ComponentDoc = {
	tag: "fx-checkbox",
	title: "Checkbox",
	group: "Formulário",
	lead: "Caixa de seleção com estado indeterminado. Clique ou use Espaço/Enter; emite change composto.",
	imports: ["import '@wrrdev/fenix-ui/checkbox';"],
	demoHtml: (a) => `<fx-checkbox ${a}>Aceito os termos</fx-checkbox>`,
	variantsHtml: () =>
		["sm", "md", "lg"]
			.map((s) => `<fx-checkbox size="${s}">Size ${s}</fx-checkbox>`)
			.join(""),
	controls: [
		{ kind: "toggle", attr: "checked", label: "Checked" },
		{ kind: "toggle", attr: "indeterminate", label: "Indeterminado" },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{
			name: "checked",
			type: "boolean",
			default: "false",
			desc: "Marcado (é refletido no host ao clicar).",
		},
		{
			name: "indeterminate",
			type: "boolean",
			default: "false",
			desc: "Estado misto; clicar resolve para checked.",
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
			desc: "Émisso composto ao alternar.",
		},
	],
	slots: [{ name: "(padrão)", desc: "Rótulo ao lado da caixa." }],
};
