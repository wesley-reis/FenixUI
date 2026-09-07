/**
 * Documentação do componente <fx-confirmpopup>.
 */
import type { ComponentDoc } from '../types';

export const confirmpopupDoc: ComponentDoc = {
	tag: "fx-confirmpopup",
	title: "ConfirmPopup",
	group: "Feedback",
	lead: "Popup de confirmação não-modal ancorado em um botão, exibido acima ou abaixo dinamicamente (flip automático). Personalize mensagem e botões via slots.",
	imports: ["import '@wrrdev/fenix-ui/confirmpopup';"],
	demoHtml: () =>
		`<fx-confirmpopup id="cp-demo" target="#cp-demo-btn" message="Tem certeza que deseja excluir este registro?" icon="⚠️"></fx-confirmpopup><fx-button id="cp-demo-btn" variant="danger" size="sm" onclick="document.getElementById('cp-demo').setAttribute('open','')">Excluir</fx-button>`,
	variantsHtml: () => {
		return `<fx-confirmpopup id="cp-top" target="#cp-top-btn" position="top" message="Aplicar as alterações?" accept-label="Aplicar" reject-label="Cancelar"></fx-confirmpopup><fx-confirmpopup id="cp-tpl" target="#cp-tpl-btn" message="Salvar rascunho?"><b slot="accept">Sim, salvar</b><i slot="reject">Agora não</i></fx-confirmpopup><div style="display:flex;gap:12px"><fx-button id="cp-top-btn" size="sm" onclick="document.getElementById('cp-top').setAttribute('open','')">Forçar acima</fx-button><fx-button id="cp-tpl-btn" size="sm" onclick="document.getElementById('cp-tpl').setAttribute('open','')">Com template</fx-button></div>`;
	},
	controls: [],
	attributes: [
		{ name: "open", type: "boolean", default: "false", desc: "Exibe o popup ancorado no target." },
		{ name: "target", type: "string", default: "''", desc: "Seletor CSS do elemento âncora." },
		{ name: "message", type: "string", default: "''", desc: "Texto da mensagem (usado quando não há conteúdo no slot padrão)." },
		{ name: "icon", type: "string", default: "''", desc: "Ícone (glifo/emoji) exibido antes da mensagem." },
		{ name: "accept-label", type: "string", default: "'Sim'", desc: "Texto do botão de confirmação padrão." },
		{ name: "reject-label", type: "string", default: "'Não'", desc: "Texto do botão de rejeição padrão." },
		{ name: "position", type: `'auto' | 'top' | 'bottom'`, default: "'auto'", desc: "Lado de exibição. `auto` faz flip para cima quando não há espaço abaixo." },
	],
	events: [
		{ name: "accept", type: "CustomEvent<void>", desc: "Ao confirmar (botão accept ou template com slot accept)." },
		{ name: "reject", type: "CustomEvent<void>", desc: "Ao rejeitar (botão reject, ESC ou clique fora)." },
	],
	slots: [
		{ name: "(padrão)", desc: "Corpo da mensagem (equivalente ao template message)." },
		{ name: "accept", desc: "Conteúdo do botão de confirmação (equivalente ao template accept)." },
		{ name: "reject", desc: "Conteúdo do botão de rejeição (equivalente ao template reject)." },
	],
};
