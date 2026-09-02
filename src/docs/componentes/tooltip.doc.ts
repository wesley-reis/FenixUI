/**
 * Documentação do componente <fx-tooltip> e diretiva fx-tooltip.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 *
 * ## Uso como Componente (Wrapper)
 * O componente <fx-tooltip> envolve um elemento filho e exibe o tooltip ao passar o mouse.
 *
 * ## Uso como Diretiva (Atributo)
 * A diretiva permite aplicar tooltip em qualquer elemento HTML usando atributos:
 *   - fx-tooltip="texto" - Define o conteúdo do tooltip
 *   - fx-tooltip-position="top|bottom|left|right" - Define a posição
 *   - fx-tooltip-html - Se presente, trata o conteúdo como HTML
 *
 * Para usar a diretiva, importe e inicialize:
 *   import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';
 *   defineFxTooltipDirective();
 *
 * Depois use em qualquer elemento:
 *   <div fx-tooltip="Texto simples">Div com tooltip</div>
 *   <button fx-tooltip="Clique" fx-tooltip-position="bottom">Botão</button>
 */
import type { ComponentDoc } from '../types';

export const tooltipDoc: ComponentDoc = {
	tag: "fx-tooltip",
	title: "Tooltip",
	group: "Feedback",
	lead: "Dica contextual que aparece ao passar o mouse ou focar no elemento. Pode ser usada como componente wrapper ou como diretiva em qualquer elemento HTML.",
	imports: ["import '@wrrdev/fenix-ui/tooltip';", "import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';"],
	demoHtml: (a) =>
		`<div style="display:flex;flex-direction:column;gap:24px">
			<!-- Componente wrapper dinâmico (controles interativos) -->
			<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:16px;background:var(--fx-surface-background);border-radius:var(--fx-radius-md)">
				<fx-tooltip ${a}><fx-button size="sm">Passe o mouse</fx-button></fx-tooltip>
			</div>
			<!-- Diretiva: uso em elementos HTML -->
			<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
				<div fx-tooltip="Tooltip em uma div" style="padding:12px 16px;background:var(--fx-surface-surface);border:1px solid var(--fx-border-default);border-radius:var(--fx-radius-sm);cursor:default">Div com tooltip</div>
				<span fx-tooltip="Tooltip em um span" style="padding:8px 12px;background:var(--fx-color-primary);color:#fff;border-radius:var(--fx-radius-sm);cursor:default">Span com tooltip</span>
				<span fx-tooltip="<strong>Negrito</strong> e <em>itálico</em>" fx-tooltip-html style="padding:8px 12px;background:var(--fx-color-success);color:#fff;border-radius:var(--fx-radius-sm);cursor:default">HTML tooltip</span>
			</div>
		</div>`,
	variantsHtml: () =>
		`<div style="display:flex;gap:24px;flex-wrap:wrap;padding:20px 10px 40px">
			<!-- Componente wrapper -->
			<fx-tooltip content="Acima" position="top"><fx-badge>top</fx-badge></fx-tooltip>
			<fx-tooltip content="Abaixo" position="bottom"><fx-badge>bottom</fx-badge></fx-tooltip>
			<fx-tooltip content="Esquerda" position="left"><fx-badge>left</fx-badge></fx-tooltip>
			<fx-tooltip content="Direita" position="right"><fx-badge>right</fx-badge></fx-tooltip>
			<!-- Diretiva em elementos diversos -->
			<div fx-tooltip="Tooltip na div" fx-tooltip-position="top" style="padding:10px 14px;background:var(--fx-surface-surface);border:1px solid var(--fx-border-default);border-radius:var(--fx-radius-sm)">Div (top)</div>
			<span fx-tooltip="Tooltip no span" fx-tooltip-position="bottom" style="padding:10px 14px;background:var(--fx-surface-surface);border:1px solid var(--fx-border-default);border-radius:var(--fx-radius-sm)">Span (bottom)</span>
		</div>`,
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
	directiveInfo: {
		name: "fx-tooltip",
		description: "Diretiva que permite aplicar tooltip em qualquer elemento HTML",
		attributes: [
			{
				name: "fx-tooltip",
				type: "string",
				required: true,
				description: "Conteúdo do tooltip (texto ou HTML)",
			},
			{
				name: "fx-tooltip-position",
				type: "'top' | 'bottom' | 'left' | 'right'",
				default: "'top'",
				description: "Posição do tooltip relativa ao elemento",
			},
			{
				name: "fx-tooltip-html",
				type: "boolean",
				default: "false",
				description: "Se presente, trata o conteúdo como HTML",
			},
		],
		examples: [
			'<div fx-tooltip="Texto simples">Div com tooltip</div>',
			'<button fx-tooltip="Clique aqui" fx-tooltip-position="bottom">Botão</button>',
			'<span fx-tooltip="<strong>HTML</strong> personalizado" fx-tooltip-html>Texto</span>',
		],
	},
};
