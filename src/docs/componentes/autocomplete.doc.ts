/**
 * Documentação do componente <fx-autocomplete>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const autocompleteDoc: ComponentDoc = {
	tag: "fx-autocomplete",
	title: "Autocomplete",
	group: "Formulário",
	lead: "Campo de busca com sugestões filtradas conforme digitação (source local).",
	imports: ["import '@wrrdev/fenix-ui/autocomplete';"],
	demoHtml: (a) =>
		`<fx-autocomplete ${a} source='["Brasil","Argentina","Chile","Colômbia","Peru","Uruguai"]' placeholder="Digite um país..."></fx-autocomplete>`,
	variantsHtml: () =>
		`<fx-autocomplete source='["Ana Souza","Bruno Lima","Carla Dias"]' placeholder="Funcionários..." min-chars="1"></fx-autocomplete>`,
	controls: [
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: ["sm", "md", "lg"],
		},
		{
			kind: "text",
			attr: "placeholder",
			label: "Placeholder",
			value: "Buscar...",
		},
		{
			kind: "text",
			attr: "min-chars",
			label: "Mín. caracteres",
			value: "2",
		},
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{
			name: "value",
			type: "string",
			default: "''",
			desc: "Valor selecionado.",
		},
		{
			name: "source",
			type: "string[] (JSON)",
			default: "[]",
			desc: "Opções filtráveis.",
		},
		{
			name: "min-chars",
			type: "number",
			default: "2",
			desc: "Mínimo para sugerir.",
		},
	],
	events: [
		{
			name: "select",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao escolher uma sugestão.",
		},
	],
};
