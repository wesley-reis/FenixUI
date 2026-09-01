/**
 * Documentação do componente <fx-tooltip>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const tooltipDoc: ComponentDoc = {
	tag: "fx-tooltip",
	title: "Tooltip",
	group: "Feedback",
	lead: "Dica contextual que aparece ao passar o mouse ou focar no elemento filho.",
	imports: ["import '@wrrdev/fenix-ui/tooltip';"],
	demoHtml: (a) =>
		`<fx-tooltip ${a}><fx-button size="sm">Passe o mouse</fx-button></fx-tooltip>`,
	variantsHtml: () =>
		`<div style="display:flex;gap:24px;flex-wrap:wrap;padding:20px 10px 40px"><fx-tooltip content="Acima" position="top"><fx-badge>top</fx-badge></fx-tooltip><fx-tooltip content="Abaixo" position="bottom"><fx-badge>bottom</fx-badge></fx-tooltip><fx-tooltip content="Esquerda" position="left"><fx-badge>left</fx-badge></fx-tooltip><fx-tooltip content="Direita" position="right"><fx-badge>right</fx-badge></fx-tooltip></div>`,
	controls: [
		{
			kind: "text",
			attr: "content",
			label: "Conteúdo",
			value: "Texto da dica",
		},
		{
			kind: "select",
			attr: "position",
			label: "Posição",
			options: ["top", "bottom", "left", "right"],
			value: "top",
		},
	],
	attributes: [
		{
			name: "content",
			type: "string",
			default: "''",
			desc: "Texto exibido.",
		},
		{
			name: "position",
			type: `'top' | 'bottom' | 'left' | 'right'`,
			default: "'top'",
			desc: "Posição relativa ao alvo.",
		},
	],
};
