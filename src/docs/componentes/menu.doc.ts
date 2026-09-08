/**
 * Documentação do componente <fx-menu>.
 */
import type { ComponentDoc } from '../types';

export const menuDoc: ComponentDoc = {
	tag: "fx-menu",
	title: "Menu",
	group: "Navegação",
	lead: "Menu de navegação horizontal ou vertical com itens (slot=\"item\") e submenus: adicione o atributo `submenu` ao item e o conteúdo via `slot=\"submenu-N\"` (N = índice do item).",
	imports: ["import '@wrrdev/fenix-ui/menu';"],
	demoHtml: (attrs) =>
		`<fx-menu ${attrs} titles="Início, Produtos, Contato"><span slot="item"></span><span slot="item" submenu></span><span slot="item"></span><div slot="submenu-1" style="display:flex;flex-direction:column;gap:2px"><span style="padding:6px 12px;border-radius:6px;cursor:pointer" onmouseover="this.style.background='rgba(0,0,0,0.06)'" onmouseout="this.style.background=''">Eletrônicos</span><span style="padding:6px 12px;border-radius:6px;cursor:pointer" onmouseover="this.style.background='rgba(0,0,0,0.06)'" onmouseout="this.style.background=''">Roupas</span><span style="padding:6px 12px;border-radius:6px;cursor:pointer" onmouseover="this.style.background='rgba(0,0,0,0.06)'" onmouseout="this.style.background=''">Alimentos</span></div></fx-menu>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:16px"><div><strong style="font-size:12px;color:var(--fx-text-muted)">Horizontal</strong><fx-menu titles="Início, Serviços, Sobre"><span slot="item"></span><span slot="item" submenu></span><span slot="item"></span><div slot="submenu-1" style="display:flex;flex-direction:column;gap:2px"><span style="padding:6px 12px;border-radius:6px;cursor:pointer">Consultoria</span><span style="padding:6px 12px;border-radius:6px;cursor:pointer">Suporte</span></div></fx-menu></div><div><strong style="font-size:12px;color:var(--fx-text-muted)">Vertical</strong><fx-menu orientation="vertical" titles="Minha conta, Pedidos, Sair"><span slot="item"></span><span slot="item"></span><span slot="item"></span></fx-menu></div>`;
	},
	controls: [
		{ kind: "select", attr: "orientation", label: "Orientação", options: ["horizontal", "vertical"], value: "horizontal" },
		{ kind: "select", attr: "size", label: "Tamaño", options: ["sm", "md", "lg"], value: "md" },
	],
	attributes: [
		{ name: "orientation", type: "'horizontal' | 'vertical'", default: "'horizontal'", desc: "Direção do menu." },
		{ name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", desc: "Tamanho de los ítems." },
		{ name: "titles", type: "string", default: "''", desc: "Lista separada por comas de los rótulos de los ítems." },
	],
	events: [
		{ name: "select", type: "CustomEvent<{ index: number; label: string }>", desc: "Ao clicar em um item do menu." },
	],
	slots: [
		{ name: "item", desc: "Itens do menu. Adicione o atributo `submenu` para criar submenu." },
		{ name: "submenu-N", desc: "Conteúdo do submenu do item N." },
	],
};