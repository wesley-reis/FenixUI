/**
 * Documentação do componente <fx-switch>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { sizes } from '../shared';

export const switchDoc: ComponentDoc = {
	tag: "fx-switch",
	title: "Switch",
	group: "Formulário",
	lead: 'Interruptor ligado/desligado com role="switch". O texto do slot é o rótulo clicável e o anel de foco respeita o token effect.focus-ring.',
	imports: ["import '@wrrdev/fenix-ui/switch';"],
	demoHtml: (a) => `<fx-switch ${a}>Notificações</fx-switch>`,
	variantsHtml: () => `<fx-switch>Interruptor</fx-switch>`,
	controls: [
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: sizes,
			value: "md",
		},
		{ kind: "toggle", attr: "checked", label: "Ligado" },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{
			name: "checked",
			type: "boolean",
			default: "false",
			desc: "Estado ligado; reflete para o atributo ao clicar.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			desc: "Desabilita o interruptor.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: `'md'`,
			desc: "Tamanho da trilha.",
		},
	],
	events: [
		{
			name: "change",
			type: `CustomEvent<{ checked: boolean }>`,
			desc: "Emitido ao alternar (composed).",
		},
	],
	slots: [{ name: "(padrão)", desc: "Rótulo exibido ao lado da trilha." }],
};
