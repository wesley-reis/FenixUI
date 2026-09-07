/**
 * Documentação do componente <fx-slider>.
 */
import type { ComponentDoc } from '../types';

export const sliderDoc: ComponentDoc = {
	tag: "fx-slider",
	title: "Slider",
	group: "Formulário",
	lead: "Controle deslizante para seleção de valor numérico em um intervalo, com suporte a arraste, teclado e tooltip de valor.",
	imports: ["import '@wrrdev/fenix-ui/slider';"],
	demoHtml: (attrs) =>
		`<fx-slider ${attrs} label="Volume" style="width:320px"></fx-slider>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:24px;max-width:420px"><fx-slider size="sm" label="Pequeno" value="30" show-value></fx-slider><fx-slider size="md" label="Médio" value="60" show-value></fx-slider><fx-slider size="lg" label="Grande" value="80" show-value></fx-slider><fx-slider min="0" max="1" step="0.1" value="0.5" label="Passo 0.1" show-value></fx-slider><fx-slider label="Desabilitado" value="40" disabled></fx-slider></div>`;
	},
	controls: [
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
		{ kind: "text", attr: "value", label: "Valor", hint: "50" },
		{ kind: "text", attr: "min", label: "Mínimo", hint: "0" },
		{ kind: "text", attr: "max", label: "Máximo", hint: "100" },
		{ kind: "text", attr: "step", label: "Passo", hint: "1" },
		{ kind: "toggle", attr: "show-value", label: "Mostrar valor", on: true },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{ name: "value", type: "number", default: "min", desc: "Valor selecionado." },
		{ name: "min", type: "number", default: "0", desc: "Valor mínimo." },
		{ name: "max", type: "number", default: "100", desc: "Valor máximo." },
		{ name: "step", type: "number", default: "1", desc: "Incremento a cada movimento." },
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "'md'", desc: "Tamanho do controle." },
		{ name: "label", type: "string", default: "''", desc: "Rótulo exibido acima do trilho." },
		{ name: "show-value", type: "boolean", default: "false", desc: "Exibe o valor atual (no rótulo e tooltip)." },
		{ name: "disabled", type: "boolean", default: "false", desc: "Desabilita o controle." },
	],
	events: [
		{ name: "input", type: "CustomEvent<{ value: number }>", desc: "Durante o arraste/teclado." },
		{ name: "change", type: "CustomEvent<{ value: number }>", desc: "Ao soltar/confirmar." },
	],
	cssVars: [
		{ name: "--fx-color-primary", desc: "Cor do preenchimento e do thumb." },
	],
};
