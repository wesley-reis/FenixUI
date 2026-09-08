/**
 * Documentação do componente <fx-popover>.
 */
import type { ComponentDoc } from '../types';

export const popoverDoc: ComponentDoc = {
	tag: "fx-popover",
	title: "Popover",
	group: "Feedback",
	lead: "Painel flutuante ancorado em um botão/elemento, com posicionamento automático (flip) e slots para header/content/footer. Estilo Popover do PrimeVue.",
	imports: ["import '@wrrdev/fenix-ui/popover';"],
	demoHtml: (attrs) =>
		`<fx-popover id="pop-demo" ${attrs} target="#pop-demo-btn"><b slot="header">Confirmação</b><p style="margin:0 0 8px">Deseja realmente excluir?</p><fx-button slot="footer" size="sm" variant="danger" onclick="document.getElementById('pop-demo').removeAttribute('open')">Excluir</fx-button><fx-button slot="footer" size="sm" variant="outline" onclick="document.getElementById('pop-demo').removeAttribute('open')">Cancelar</fx-button></fx-popover><fx-button id="pop-demo-btn">Abrir popover</fx-button>`,
	variantsHtml: () => {
		return `<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center"><fx-popover target="#pop-top" position="top"><span slot="header">Top</span><p style="margin:0">Aparece acima</p></fx-popover><fx-button id="pop-top" size="sm">Top</fx-button><fx-popover target="#pop-bottom" position="bottom"><span slot="header">Bottom</span><p style="margin:0">Aparece abaixo</p></fx-popover><fx-button id="pop-bottom" size="sm">Bottom</fx-button><fx-popover target="#pop-hover" trigger="hover"><span slot="header">Hover</span><p style="margin:0">Passe o mouse</p></fx-popover><fx-button id="pop-hover" size="sm">Hover</fx-button></div>`;
	},
	controls: [
		{ kind: "select", attr: "position", label: "Posição", options: ["auto", "top", "bottom"], value: "auto" },
		{ kind: "select", attr: "trigger", label: "Gatilho", options: ["click", "hover"], value: "click" },
		{ kind: "toggle", attr: "dismissible", label: "Fechar ao clicar fora", on: true },
	],
	attributes: [
		{ name: "open", type: "boolean", default: "false", desc: "Exibe o popover." },
		{ name: "target", type: "string", default: "''", desc: "Seletor CSS do elemento âncora." },
		{ name: "trigger", type: "'click' | 'hover'", default: "'click'", desc: "Como abrir o popover." },
		{ name: "position", type: "'auto' | 'top' | 'bottom'", default: "'auto'", desc: "Lado de exibição. auto faz flip." },
		{ name: "dismissible", type: "boolean", default: "true", desc: "Fecha ao clicar fora." },
	],
	events: [
		{ name: "show", type: "CustomEvent<void>", desc: "Ao abrir." },
		{ name: "hide", type: "CustomEvent<void>", desc: "Ao fechar (ESC, clique fora ou trigger)." },
	],
	slots: [
		{ name: "header", desc: "Cabeçalho do popover." },
		{ name: "(padrão)", desc: "Conteúdo principal." },
		{ name: "footer", desc: "Ações/roda pé." },
	],
};
