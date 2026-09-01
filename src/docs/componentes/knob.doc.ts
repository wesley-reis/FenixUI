/**
 * Documentação do componente <fx-knob>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const knobDoc: ComponentDoc = {
	tag: "fx-knob",
	title: "Knob",
	group: "Formulário",
	lead: "Controle giratório circular para ajuste de valor. Similar ao Knob do PrimeVue, permite arrastar com o mouse ou usar as setas do teclado. Exibe arco de progresso com valor central configurável via valueTemplate.",
	imports: ["import '@wrrdev/fenix-ui/knob';"],
	demoHtml: (a) => `<fx-knob ${a}></fx-knob>`,
	variantsHtml: () =>
		`<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
			<fx-knob value="25" size="sm"></fx-knob>
			<fx-knob value="50"></fx-knob>
			<fx-knob value="75" size="lg"></fx-knob>
		</div>
		<h4>Cores personalizadas</h4>
		<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
			<fx-knob value="60" value-color="#10b981" range-color="#d1fae5"></fx-knob>
			<fx-knob value="45" value-color="#f59e0b" range-color="#fef3c7"></fx-knob>
			<fx-knob value="80" value-color="#f43f5e" range-color="#ffe4e6"></fx-knob>
		</div>
		<h4>Templates</h4>
		<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
			<fx-knob value="70" value-template="{value}%"></fx-knob>
			<fx-knob value="3" value-template="{value}/10" min="0" max="10"></fx-knob>
			<fx-knob value="1250" value-template="R$ {value}" min="0" max="5000" step="50"></fx-knob>
		</div>`,
	controls: [
		{ kind: "text", attr: "value", label: "Valor", value: "50" },
		{ kind: "text", attr: "min", label: "Mínimo", value: "0" },
		{ kind: "text", attr: "max", label: "Máximo", value: "100" },
		{ kind: "text", attr: "step", label: "Step", value: "1" },
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: ["sm", "md", "lg"],
			value: "md",
		},
		{
			kind: "text",
			attr: "stroke-width",
			label: "Largura do traço",
			value: "8",
		},
		{
			kind: "text",
			attr: "value-color",
			label: "Cor do valor",
			hint: "ex.: #10b981",
		},
		{
			kind: "text",
			attr: "range-color",
			label: "Cor do range",
			hint: "ex.: #e2e8f0",
		},
		{
			kind: "text",
			attr: "value-template",
			label: "Template",
			value: "{value}",
		},
		{ kind: "toggle", attr: "readonly", label: "Somente leitura" },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{
			name: "value",
			type: "number",
			default: "0",
			desc: "Valor atual do knob.",
		},
		{
			name: "min",
			type: "number",
			default: "0",
			desc: "Valor mínimo permitido.",
		},
		{
			name: "max",
			type: "number",
			default: "100",
			desc: "Valor máximo permitido.",
		},
		{
			name: "step",
			type: "number",
			default: "1",
			desc: "Incremento/decremento do valor.",
		},
		{
			name: "size",
			type: "'sm' | 'md' | 'lg'",
			default: "'md'",
			desc: "Tamanho do knob (60px | 100px | 140px).",
		},
		{
			name: "stroke-width",
			type: "number",
			default: "8",
			desc: "Largura do traço do arco circular.",
		},
		{
			name: "value-color",
			type: "string",
			default: "var(--fx-color-primary)",
			desc: "Cor do arco de valor (CSS color).",
		},
		{
			name: "range-color",
			type: "string",
			default: "var(--fx-border-default)",
			desc: "Cor do arco de fundo/range (CSS color).",
		},
		{
			name: "value-template",
			type: "string",
			default: "'{value}'",
			desc: "Template de exibição do valor. Use {value} como placeholder.",
		},
		{
			name: "readonly",
			type: "boolean",
			default: "false",
			desc: "Impede alteração do valor, mas mantém foco.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			desc: "Desabilita completamente o controle.",
		},
	],
	events: [
		{
			name: "change",
			type: `CustomEvent<{ value: number }>`,
			desc: "Emitido quando o valor é alterado (arrastar, teclado ou programação).",
		},
	],
	cssVars: [
		{
			name: "--_size",
			default: "100px (md) | 60px (sm) | 140px (lg)",
			desc: "Dimensão total do knob.",
		},
		{
			name: "--_stroke-width",
			default: "8px",
			desc: "Largura do traço (sobrescrita por stroke-width).",
		},
		{
			name: "--_value-color",
			default: "var(--fx-color-primary)",
			desc: "Cor do arco de valor.",
		},
		{
			name: "--_range-color",
			default: "var(--fx-border-default)",
			desc: "Cor do arco de fundo.",
		},
	],
};
