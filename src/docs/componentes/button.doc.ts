/**
 * Documentação do componente <fx-button>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { buttonVariants, sizes } from '../shared';

export const buttonDoc: ComponentDoc = {
	tag: "fx-button",
	title: "Button",
	group: "Formulário",
	lead: "Botão acionável com variantes semânticas, tamanhos, ícone via slot e estado de carregamento integrado.",
	imports: ["import '@wrrdev/fenix-ui/button';"],
	demoHtml: (a) => `<fx-button ${a}>Confirmar ação</fx-button>`,
	variantsHtml: () =>
		buttonVariants
			.map((v) => `<fx-button variant="${v}">${v}</fx-button>`)
			.join(""),
	controls: [
		{
			kind: "select",
			attr: "variant",
			label: "Variante",
			options: buttonVariants,
			value: "primary",
		},
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: sizes,
			value: "md",
		},
		{
			kind: "select",
			attr: "type",
			label: "Type (formulário)",
			options: ["button", "submit", "reset"],
			value: "button",
		},
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		{ kind: "toggle", attr: "loading", label: "Carregando" },
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
	],
	attributes: [
		{
			name: "variant",
			type: `'${buttonVariants.join("' | '")}'`,
			default: `'primary'`,
			desc: "Estilo visual do botão.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: `'md'`,
			desc: "Tamanho (altura via token, fonte e padding).",
		},
		{
			name: "type",
			type: `'button' | 'submit' | 'reset'`,
			default: `'button'`,
			desc: "Tipo do button nativo (útil em forms).",
		},
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Ocupa 100% da largura do container.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			desc: "Desabilita a interação e aplica estilo esmaecido.",
		},
		{
			name: "loading",
			type: "boolean",
			default: "false",
			desc: "Exibe spinner interno e impede cliques.",
		},
	],
	events: [
		{
			name: "click",
			type: "MouseEvent",
			desc: "Evento nativo de clique (suprimido quando disabled ou loading).",
		},
	],
	slots: [
		{ name: "(padrão)", desc: "Texto/rótulo do botão." },
		{
			name: "icon",
			desc: `Ícone antes do rótulo (<span slot="icon">→</span>).`,
		},
	],
};
