/**
 * Documentação do componente <fx-alert>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const alertDoc: ComponentDoc = {
	tag: "fx-alert",
	title: "Alert",
	group: "Feedback",
	lead: "Aviso inline com variantes semânticas, título opcional e possibilidade de dispensar.",
	imports: ["import '@wrrdev/fenix-ui/alert';"],
	demoHtml: (a) =>
		`<fx-alert ${a}>Operação concluída com sucesso.</fx-alert>`,
	variantsHtml: () =>
		`<fx-alert variant="info" title="Informação">Nova versão disponível.</fx-alert><fx-alert variant="success" title="Sucesso">Dados salvos.</fx-alert><fx-alert variant="warning" title="Atenção" dismissible>Seu contrato vence em 5 dias.</fx-alert><fx-alert variant="danger" title="Erro">Não foi possível processar.</fx-alert>`,
	controls: [
		{
			kind: "select",
			attr: "variant",
			label: "Variante",
			options: ["info", "success", "warning", "danger"],
		},
		{ kind: "text", attr: "title", label: "Título" },
		{ kind: "toggle", attr: "dismissible", label: "Dispensável" },
	],
	attributes: [
		{
			name: "variant",
			type: `'info' | 'success' | 'warning' | 'danger'`,
			default: "'info'",
			desc: "Cor semântica.",
		},
		{
			name: "title",
			type: "string",
			default: "''",
			desc: "Título em negrito.",
		},
		{
			name: "dismissible",
			type: "boolean",
			default: "false",
			desc: "Botão de fechar.",
		},
	],
	events: [
		{
			name: "dismiss",
			type: "CustomEvent<void>",
			desc: "Ao fechar o alerta.",
		},
	],
};
