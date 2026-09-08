/**
 * Documentação do componente <fx-rating>.
 */
import type { ComponentDoc } from '../types';

export const ratingDoc: ComponentDoc = {
	tag: "fx-rating",
	title: "Rating",
	group: "Formulario",
	lead: "Avaliação por estrelas com suporte a readonly, disabled e diferentes tamanhos. Emite change com o valor selecionado.",
	imports: ["import '@wrrdev/fenix-ui/rating';"],
	demoHtml: (attrs) =>
		`<fx-rating ${attrs} value="3" max="5"></fx-rating>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:20px"><fx-rating size="sm" value="2" max="5" allow-half></fx-rating><fx-rating value="4" max="5"></fx-rating><fx-rating size="lg" value="5" max="5"></fx-rating><fx-rating value="3" max="5" readonly></fx-rating><fx-rating value="4" max="5" disabled></fx-rating></div>`;
	},
	controls: [
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
		{ kind: "select", attr: "max", label: "Estrelas", options: ["3", "5", "7", "10"], value: "5" },
		{ kind: "text", attr: "value", label: "Valor", hint: "0" },
		{ kind: "toggle", attr: "readonly", label: "Somente leitura" },
		{ kind: "toggle", attr: "disabled", label: "Deshabilitado" },
	],
	attributes: [
		{ name: "value", type: "number", default: "0", desc: "Valor selecionado (0 a max)." },
		{ name: "max", type: "number", default: "5", desc: "Número de estrelas (1-10)." },
		{ name: "readonly", type: "boolean", default: "false", desc: "Não permite alterar o valor." },
		{ name: "disabled", type: "boolean", default: "false", desc: "Desabilita o controle." },
		{ name: "allow-half", type: "boolean", default: "false", desc: "Permite meias estrelas." },
		{ name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", desc: "Tamanho das estrelas." },
	],
	events: [
		{ name: "change", type: "CustomEvent<{ value: number }>", desc: "Ao selecionar uma estrela." },
	],
};