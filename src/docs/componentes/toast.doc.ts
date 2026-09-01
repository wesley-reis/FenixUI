/**
 * Documentação do componente <fx-toast>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const toastDoc: ComponentDoc = {
	tag: "fx-toast",
	title: "Toast",
	group: "Feedback",
	lead: "Notificações flutuantes imperativas com posição e tempo de exibição configuráveis.",
	imports: ["import '@wrrdev/fenix-ui/toast';"],
	demoHtml: (a) => {
		const pos = /position="([^"]+)"/.exec(a)?.[1] ?? "top-right";
		const dur = /duration="([^"]+)"/.exec(a)?.[1] ?? "4000";
		const title = /title="([^"]*)"/.exec(a)?.[1] || "Sucesso";
		const msg = /message="([^"]*)"/.exec(a)?.[1] || "Registro salvo.";
		const o = `{position:'${pos}',duration:${dur || "0"}}`;
		return `<div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button variant="success" size="sm" onclick="FenixToast.success('${title}','${msg}',${o})">Success</fx-button><fx-button variant="danger" size="sm" onclick="FenixToast.error('${title}','${msg}',${o})">Error</fx-button><fx-button variant="warning" size="sm" onclick="FenixToast.warning('${title}','${msg}',${o})">Warning</fx-button><fx-button variant="secondary" size="sm" onclick="FenixToast.info('${title}','${msg}',${o})">Info</fx-button></div>`;
	},
	variantsHtml: () =>
		`<h4>Cada posição na tela</h4><div style="display:flex;gap:12px;flex-wrap:wrap">${["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"].map((p) => `<fx-button size="sm" variant="secondary" onclick="FenixToast.info('Posição: ${p}','Notificação de exemplo.',{position:'${p}',duration:3500})">${p}</fx-button>`).join("")}</div><h4>Duração customizada</h4><div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button size="sm" onclick="FenixToast.warning('Fixo até fechar','duration: 0',{position:'bottom-center',duration:0})">duration: 0 (fixo)</fx-button><fx-button size="sm" onclick="FenixToast.success('Rápido','some em 1,5s',{position:'bottom-center',duration:1500})">duration: 1500</fx-button></div>`,
	controls: [
		{
			kind: "select",
			attr: "position",
			label: "Posição",
			options: [
				"top-right",
				"top-center",
				"top-left",
				"bottom-right",
				"bottom-center",
				"bottom-left",
			],
			value: "top-right",
		},
		{
			kind: "text",
			attr: "duration",
			label: "Duração em ms (0 = fixo, mín. 1000)",
			value: "4000",
		},
		{
			kind: "text",
			attr: "title",
			label: "Título",
			value: "Operação concluída",
		},
		{
			kind: "text",
			attr: "message",
			label: "Mensagem",
			value: "Os dados foram salvos com sucesso.",
		},
	],
	attributes: [
		{
			name: "(API)",
			type: "FenixToast",
			default: "—",
			desc: "success/error/warning/info(title, message?, options?).",
		},
		{
			name: "options.position",
			type: `'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'`,
			default: "'top-right'",
			desc: "Região da tela onde empilha.",
		},
		{
			name: "options.duration",
			type: "number",
			default: "4000",
			desc: "Ms até dispensar. Mínimo 1000ms; 0 = fixo até fechar.",
		},
		{
			name: "(retorno)",
			type: "number",
			default: "—",
			desc: "Id do toast para FenixToast.close(id).",
		},
	],
};
