/**
 * Documentação do componente <fx-tabs>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const tabsDoc: ComponentDoc = {
	tag: "fx-tabs",
	title: "Tabs",
	group: "Navegação",
	lead: 'Navegação por abas: <fx-tab tab="id"> para títulos e <fx-tab-panel tab="id"> para conteúdo (dentro ou logo após o fx-tabs).',
	imports: ["import '@wrrdev/fenix-ui/tabs';"],
	demoHtml: (a) =>
		`<fx-tabs ${a}><fx-tab tab="perfil">Perfil</fx-tab><fx-tab tab="seguranca">Segurança</fx-tab><fx-tab tab="notificacoes">Notificações</fx-tab><fx-tab-panel tab="perfil"><p style="margin:8px 0">Dados do perfil do usuário.</p></fx-tab-panel><fx-tab-panel tab="seguranca"><p style="margin:8px 0">Senha e autenticação em dois fatores.</p></fx-tab-panel><fx-tab-panel tab="notificacoes"><p style="margin:8px 0">Preferências de notificação.</p></fx-tab-panel></fx-tabs>`,
	variantsHtml: () => {
		const p = (id: string, txt: string) =>
			`<fx-tab-panel tab="${id}"><p style="margin:8px 0">${txt}</p></fx-tab-panel>`;
		return [
			`<h4>Básica</h4><fx-tabs><fx-tab tab="a">Conta</fx-tab><fx-tab tab="b">Pedidos</fx-tab>${p("a", "Seus dados de conta.")}${p("b", "Histórico de pedidos.")}</fx-tabs>`,
			`<h4>Aba desabilitada</h4><fx-tabs value="vis"><fx-tab tab="vis">Visível</fx-tab><fx-tab tab="bloq" disabled>Bloqueada</fx-tab>${p("vis", "A segunda aba não pode ser aberta.")}${p("bloq", "Sem acesso.")}</fx-tabs>`,
			`<h4>Aba pré-selecionada</h4><fx-tabs value="c"><fx-tab tab="a">Resumo</fx-tab><fx-tab tab="b">Detalhes</fx-tab><fx-tab tab="c">Anexos</fx-tab>${p("a", "Resumo do processo.")}${p("b", "Detalhes técnicos.")}${p("c", "3 arquivos anexados.")}</fx-tabs>`,
			`<h4>Painéis fora do fx-tabs (irmãos)</h4><div><fx-tabs><fx-tab tab="x">Esquerda</fx-tab><fx-tab tab="y">Direita</fx-tab></fx-tabs>${p("x", "Painéis declarados como irmãos também funcionam.")}${p("y", "Útil para layouts customizados.")}</div>`,
		].join("");
	},
	controls: [
		{
			kind: "select",
			attr: "value",
			label: "Aba ativa (tab id)",
			options: ["perfil", "seguranca", "notificacoes"],
			value: "perfil",
		},
	],
	attributes: [
		{
			name: "value",
			type: "string",
			default: "'primeira aba'",
			desc: "Tab ativa.",
		},
	],
	events: [
		{
			name: "change",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao trocar de aba.",
		},
	],
};
