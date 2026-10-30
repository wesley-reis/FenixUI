/**
 * Documentação do componente <fx-drawer>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const drawerDoc: ComponentDoc = {
	tag: "fx-drawer",
	title: "Drawer",
	group: "Feedback",
	lead: "Painel deslizante sobre a página com overlay desfocado e abertura/fechamento animado deslizando da borda configurada por position. Posição left/right/top/bottom, tamanho mínimo fixo e expansível via CSS, header com botão fechar (o título é opcional) e conteúdo livre por slot. O z-index do header é tokenizado para o conteúdo do corpo nunca passar por cima dele.",
	imports: ["import '@wrrdev/fenix-ui/drawer';"],
	demoHtml: (a) => {
		const m = /position="([a-z]+)"/.exec(a);
		const pos = m ? m[1] : "right";
		const isOpen = /open/.test(a);
		const rest = a
			.replace(/ position="[a-z]+"/g, "")
			.replace(/(^| )open(="")?( |$)/g, " ")
			.trim();
		const drawer = `<fx-drawer id="drw-demo" position="${pos}"${isOpen ? " open" : ""}${rest ? " " + rest : ""}><p style="margin:0 0 12px">Conteúdo <strong>livre</strong>: formulários, filtros, listas…</p></fx-drawer>`;
		const btn = isOpen
			? ""
			: `<fx-button data-fx-open="drw-demo">Abrir drawer (${pos})</fx-button>`;
		return drawer + btn;
	},
	variantsHtml: () => {
		const body =
			'<p style="padding:0;margin:0 0 8px">Conteúdo do drawer.</p>';
		const mk = (id: string, pos: string, title: string) =>
			`<fx-drawer id="${id}" position="${pos}" title="${title}">${body}</fx-drawer><fx-button size="sm" data-fx-open="${id}">${pos.toUpperCase()}</fx-button>`;
		const semTitulo = `<fx-drawer id="drw-sem-titulo" position="right">${body}</fx-drawer><fx-button size="sm" variant="secondary" data-fx-open="drw-sem-titulo">Sem título (só ✕)</fx-button>`;
		const fixo = `<fx-drawer id="drw-fixo" position="right" title="Fluxo obrigatório" dismissible="false">${body}</fx-drawer><fx-button size="sm" variant="secondary" data-fx-open="drw-fixo">dismissible="false"</fx-button>`;
		return `<div style="display:flex;gap:12px;flex-wrap:wrap">${mk("drw-l", "left", "Filtros")}${mk("drw-r", "right", "Detalhes")}${mk("drw-t", "top", "Notificações")}${mk("drw-b", "bottom", "Carrinho")}</div>
      <h4>Título opcional e dismissible</h4>
      <p style="margin:0 0 8px">Sem <code>title</code> o header mostra só o <code>✕</code> — o título é opcional. Com <code>dismissible="false"</code> o <code>✕</code> some e o overlay/ESC não fecham: o drawer só fecha por código.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">${semTitulo}${fixo}</div>`;
	},
	controls: [
		{
			kind: "select",
			attr: "position",
			label: "Posição",
			options: ["right", "left", "top", "bottom"],
			value: "right",
		},
		{ kind: "text", attr: "title", label: "Título", value: "Meu painel" },
	],
	attributes: [
		{
			name: "open",
			type: "boolean",
			default: "false",
			desc: "Exibe o drawer.",
		},
		{
			name: "position",
			type: `'left' | 'right' | 'top' | 'bottom'`,
			default: "'right'",
			desc: "Lado de origem. Left/right ocupam a altura total; top/bottom a largura total.",
		},
		{
			name: "title",
			type: "string",
			default: "''",
			desc: "Texto do cabeçalho. OPCIONAL: sem título o header exibe apenas o botão fechar (✕).",
		},
		{
			name: "dismissible",
			type: "boolean",
			default: "true",
			desc: "Permite fechar pelo usuário (✕ no header, clique no overlay e ESC). Com \"false\" o drawer só fecha por código (open = false) e o header aparece apenas se houver title.",
		},
	],
	cssVars: [
		{
			name: "--fx-drawer-width",
			default: "360px",
			desc: "Largura nos modos left/right (mín. 300px, máx. 90vw).",
		},
		{
			name: "--fx-drawer-height",
			default: "280px",
			desc: "Altura nos modos top/bottom (mín. 180px, máx. 85vh).",
		},
		{
			name: "--fx-drawer-header-z",
			default: "20",
			desc: "Camada do header sticky dentro do painel. Precisa ganhar de z-index do conteúdo (ex.: o .loading-overlay do fx-table usa 10) e perder das camadas flutuantes (--fx-z-dropdown/--fx-z-tooltip). Suba se algum conteúdo do seu app cobrir o header.",
		},
		{
			name: "--fx-z-overlay",
			default: "1090",
			desc: "Camada do overlay desfocado (token global z.overlay). Fica abaixo do painel (--fx-z-modal = 1100).",
		},
	],
	events: [
		{ name: "open", type: "Event", desc: "Ao abrir." },
		{
			name: "close",
			type: `CustomEvent`,
			desc: "Fechar por ✕, clique no overlay ou ESC.",
		},
	],
	slots: [{ name: "padrão", desc: "Conteúdo livre do painel." }],
};
