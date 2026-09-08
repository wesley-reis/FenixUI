/**
 * Documentação do componente <fx-stepper>.
 */
import type { ComponentDoc } from '../types';

export const stepperDoc: ComponentDoc = {
	tag: "fx-stepper",
	title: "Stepper",
	group: "Layout",
	lead: "Asistente de passos (wizard) para fluxos multi-etapa. Painéis via slot=\"step-N\" com step-title; navegação integrada com botões Anterior/Próximo ou clicando nos indicadores.",
	imports: ["import '@wrrdev/fenix-ui/stepper';"],
	demoHtml: (attrs) =>
		`<fx-stepper ${attrs} active="0" style="width:100%"><div slot="step-0" step-title="Dados pessoais"><p>Informe seus dados de contato.</p></div><div slot="step-1" step-title="Endereço"><p>Informe seu endereço de entrega.</p></div><div slot="step-2" step-title="Confirmação"><p>Revise e confirme o pedido.</p></div></fx-stepper>`,
	variantsHtml: () => {
		return `<fx-stepper linear show-numbers active="1" style="width:100%"><div slot="step-0" step-title="Passo A"><p>Passo A: informe as informações.</p></div><div slot="step-1" step-title="Passo B"><p>Passo B: revise os dados.</p></div><div slot="step-2" step-title="Passo C"><p>Passo C: finalize.</p></div></fx-stepper>`;
	},
	controls: [
		{ kind: "toggle", attr: "linear", label: "Lineal", on: true },
		{ kind: "toggle", attr: "show-numbers", label: "Mostrar números", on: true },
	],
	attributes: [
		{ name: "active", type: "number", default: "0", desc: "Índice do passo ativo." },
		{ name: "linear", type: "boolean", default: "false", desc: "Só permite avançar em ordem." },
		{ name: "show-numbers", type: "boolean", default: "true", desc: "Mostra o número no indicador." },
	],
	events: [
		{ name: "change", type: "CustomEvent<{ index: number }>", desc: "Al cambiar de paso (next/prev/clic en indicador)." },
		{ name: "complete", type: "CustomEvent<void>", desc: "Ao chegar ao último passo." },
	],
	slots: [
		{ name: "step-0, step-1, ...", desc: "Conteúdo de cada passo. Use step-title para o nome do indicador." },
	],
};