/**
 * Documentação do componente <fx-progress>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const progressDoc: ComponentDoc = {
	tag: "fx-progress",
	title: "Progress",
	group: "Feedback",
	lead: "Indicador de progresso determinado ou indeterminado, com variantes semânticas.",
	imports: ["import '@wrrdev/fenix-ui/progress';"],
	demoHtml: (a) => `<fx-progress ${a}></fx-progress>`,
	variantsHtml: () =>
		`<h4>Determinado</h4><fx-progress value="30"></fx-progress><fx-progress value="65"></fx-progress><h4>Com rótulo e variantes</h4><fx-progress value="80" label="Upload" variant="success"></fx-progress><fx-progress value="45" label="Processando" variant="warning"></fx-progress>`,
	controls: [
		{ kind: "text", attr: "value", label: "Valor (%)", value: "60" },
		{
			kind: "select",
			attr: "variant",
			label: "Variante",
			options: ["", "success", "warning", "danger"],
		},
		{ kind: "text", attr: "label", label: "Rótulo" },
		{ kind: "toggle", attr: "indeterminate", label: "Indeterminado" },
	],
	attributes: [
		{
			name: "value",
			type: "number",
			default: "0",
			desc: "Percentual concluído (0-100).",
		},
		{
			name: "variant",
			type: `'' | 'success' | 'warning' | 'danger'`,
			default: "''",
			desc: "Cor.",
		},
		{
			name: "label",
			type: "string",
			default: "''",
			desc: "Rótulo acima da barra.",
		},
		{
			name: "indeterminate",
			type: "boolean",
			default: "false",
			desc: "Animação sem valor definido.",
		},
	],
	events: [
		{
			name: "complete",
			type: "CustomEvent<void>",
			desc: "Quando chega a 100%.",
		},
	],
};
