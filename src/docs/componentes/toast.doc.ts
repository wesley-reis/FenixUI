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
		const mode = /mode="([^"]+)"/.exec(a)?.[1] ?? "";
		const progress = /progress="([^"]*)"/.exec(a)?.[1] ?? "";
		const origin = /progress-origin="([^"]*)"/.exec(a)?.[1] ?? "";
		const o = `{position:'${pos}',duration:${dur || "0"}${mode ? `,mode:'${mode}'` : ""}${progress ? `,progress:'${progress || "always"}'` : ""}${origin ? `,progressOrigin:'${origin}'` : ""}}`;
		return `<div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button variant="success" size="sm" onclick="FenixToast.success('${title}','${msg}',${o})">Success</fx-button><fx-button variant="danger" size="sm" onclick="FenixToast.error('${title}','${msg}',${o})">Error</fx-button><fx-button variant="warning" size="sm" onclick="FenixToast.warning('${title}','${msg}',${o})">Warning</fx-button><fx-button variant="secondary" size="sm" onclick="FenixToast.info('${title}','${msg}',${o})">Info</fx-button></div>`;
	},
	variantsHtml: () =>
		`<h4>Cada posição na tela</h4><div style="display:flex;gap:12px;flex-wrap:wrap">${["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"].map((p) => `<fx-button size="sm" variant="secondary" onclick="FenixToast.info('Posição: ${p}','Notificação de exemplo.',{position:'${p}',duration:3500})">${p}</fx-button>`).join("")}</div><h4>Duração customizada</h4><div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button size="sm" onclick="FenixToast.warning('Fixo até fechar','duration: 0',{position:'bottom-center',duration:0})">duration: 0 (fixo)</fx-button><fx-button size="sm" onclick="FenixToast.success('Rápido','some em 1,5s',{position:'bottom-center',duration:1500})">duration: 1500</fx-button></div><h4>Barra de contagem regressiva (progress)</h4><p>Uma borda inferior na cor do toast esvazia durante a <code>duration</code> — você vê o tempo restante. Acompanha o <code>kind</code> automaticamente. O lado é configurável em <code>progress-origin</code>.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button size="sm" variant="success" onclick="FenixToast.success('Salvando...','Barra esvaziando em 5s',{duration:5000,progress:'always'})">success 5s</fx-button><fx-button size="sm" variant="danger" onclick="FenixToast.error('Falhou','Barra vermelha em 6s',{duration:6000,progress:'always'})">error 6s</fx-button><fx-button size="sm" variant="secondary" onclick="FenixToast.info('Passe o mouse','A barra só corre sob o cursor',{duration:6000,progress:'hover'})">progress: 'hover'</fx-button><fx-button size="sm" variant="secondary" onclick="FenixToast.warning('Parada','Barra cheia e imóvel',{duration:0,progress:'paused'})">progress: 'paused'</fx-button></div><h4>Lado da barra (progress-origin)</h4><p>O padrão é <code>'left'</code>: a barra fica ancorada à esquerda e drena da direita para a esquerda. Use <code>'right'</code> para espelhar.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button size="sm" variant="success" onclick="FenixToast.success('Padrão: left','Ancorada à esquerda',{duration:5000,progress:'always'})">origin: 'left' (padrão)</fx-button><fx-button size="sm" variant="success" onclick="FenixToast.success('Espelhado: right','Ancorada à direita',{duration:5000,progress:'always',progressOrigin:'right'})">origin: 'right'</fx-button></div><h4>Modo claro/escuro por toast</h4><p>Force o esquema de cores do card independentemente do tema global (útil sobre fundos personalizados):</p><div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button size="sm" variant="secondary" onclick="FenixToast.info('Modo claro','mode: light',{mode:'light',duration:4000})">mode: 'light'</fx-button><fx-button size="sm" variant="secondary" onclick="FenixToast.info('Modo escuro','mode: dark',{mode:'dark',duration:4000})">mode: 'dark'</fx-button><fx-button size="sm" variant="secondary" onclick="FenixToast.success('Segue o tema','sem mode',{duration:4000})">sem mode (tema global)</fx-button></div>`,
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
			kind: "select",
			attr: "mode",
			label: "Modo (cores do card)",
			options: ["", "light", "dark"],
			value: "",
		},
		{
			kind: "select",
			attr: "progress",
			label: "Barra de tempo",
			options: ["", "always", "hover", "paused"],
			value: "",
		},
		{
			kind: "select",
			attr: "progress-origin",
			label: "Lado da barra",
			options: ["", "left", "right"],
			value: "",
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
			name: "options.mode / atributo mode",
			type: `'light' | 'dark'`,
			default: "—",
			desc: "Força o esquema de cores do card independentemente do tema global.",
		},
		{
			name: "options.progress / atributo progress",
			type: `'always' | 'hover' | 'paused'`,
			default: "— (desligado)",
			desc: "Barra de contagem regressiva na base do card, na cor do kind (success/error/warning/info), esvaziando durante a duration. 'always' (ou atributo vazio) corre sempre; 'hover' só enquanto o cursor estiver sobre o toast; 'paused' exibe a barra cheia, porém imóvel. O lado é definido por progress-origin. Sem efeito com duration: 0 (toast fixo).",
		},
		{
			name: "options.progressOrigin / atributo progress-origin",
			type: `'left' | 'right'`,
			default: "'left'",
			desc: "Lado pelo qual a barra esvazia. 'left' (padrão) deixa a barra ancorada à esquerda drenando da direita para a esquerda; 'right' espelha (ancorada à direita, drenando da esquerda para a direita). Exige progress.",
		},
		{
			name: "(retorno)",
			type: "number",
			default: "—",
			desc: "Id do toast para FenixToast.close(id).",
		},
	],
};
