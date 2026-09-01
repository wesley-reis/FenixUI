/**
 * Documentação do componente <fx-input>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { sizes } from '../shared';

export const inputDoc: ComponentDoc = {
	tag: "fx-input",
	title: "Input",
	group: "Formulário",
	lead: "Campo de texto (text, number, email, password, search…) estilizado com os tokens do tema. O anel de foco é controlado pelo token effect.focus-ring do preset.",
	imports: ["import '@wrrdev/fenix-ui/input';"],
	demoHtml: (a) => `<fx-input ${a}></fx-input>`,
	variantsHtml: () =>
		["text", "number", "email", "password", "search"]
			.map((t) => `<fx-input type="${t}" placeholder="${t}"></fx-input>`)
			.join(""),
	controls: [
		{
			kind: "select",
			attr: "type",
			label: "Tipo",
			options: [
				"text",
				"number",
				"email",
				"password",
				"search",
				"tel",
				"url",
			],
			value: "text",
		},
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: sizes,
			value: "md",
		},
		{
			kind: "text",
			attr: "placeholder",
			label: "Placeholder",
			hint: "Texto de apoio",
		},
		{ kind: "text", attr: "value", label: "Value", hint: "Valor inicial" },
		{ kind: "text", attr: "min", label: "Min (number)", hint: "ex.: 0" },
		{ kind: "text", attr: "max", label: "Max (number)", hint: "ex.: 100" },
		{ kind: "text", attr: "step", label: "Step (number)", hint: "ex.: 5" },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		{ kind: "toggle", attr: "readonly", label: "Somente leitura" },
	],
	attributes: [
		{
			name: "type",
			type: `'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url'`,
			default: `'text'`,
			desc: "Tipo do campo nativo.",
		},
		{
			name: "value",
			type: "string",
			default: "''",
			desc: "Valor do campo; reflete para o atributo ao digitar.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: `'md'`,
			desc: "Tamanho do campo.",
		},
		{
			name: "placeholder",
			type: "string",
			default: "''",
			desc: "Texto de apoio.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			desc: "Desabilita o campo.",
		},
		{
			name: "readonly",
			type: "boolean",
			default: "false",
			desc: "Somente leitura.",
		},
		{
			name: "min / max / step",
			type: "string",
			default: "—",
			desc: 'Restrições para type="number".',
		},
	],
	events: [
		{
			name: "input",
			type: `CustomEvent<{ value: string }>`,
			desc: "Emitido a cada tecla (composed).",
		},
		{
			name: "change",
			type: `CustomEvent<{ value: string }>`,
			desc: "Emitido ao confirmar o valor (composed).",
		},
	],
};
