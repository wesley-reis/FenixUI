/**
 * Documentação do componente <fx-breadcrumb>.
 */
import type { ComponentDoc } from '../types';

export const breadcrumbDoc: ComponentDoc = {
	tag: "fx-breadcrumb",
	title: "Breadcrumb",
	group: "Layout",
	lead: "Trilha de navegação hierárquica. Itens via slot `item`; separador automático entre eles, último item marcado como página atual.",
	imports: ["import '@wrrdev/fenix-ui/breadcrumb';"],
	demoHtml: (attrs) =>
		`<fx-breadcrumb ${attrs}><a slot="item" href="#home">Home</a><a slot="item" href="#produtos">Produtos</a><span slot="item">Detalhe</span></fx-breadcrumb>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:16px"><fx-breadcrumb size="sm"><span slot="item">Pequeno</span><span slot="item">Agora</span></fx-breadcrumb><fx-breadcrumb separator="›"><span slot="item">Separador</span><span slot="item">Custom</span></fx-breadcrumb><fx-breadcrumb size="lg"><span slot="item">Grande</span><span slot="item">Aqui</span></fx-breadcrumb></div>`;
	},
	controls: [
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
		{ kind: "text", attr: "separator", label: "Separador", hint: "/" },
	],
	attributes: [
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "'md'", desc: "Tamanho da tipografia." },
		{ name: "separator", type: "string", default: "'/'", desc: "Glifo entre os itens." },
		{ name: "label", type: "string", default: "'Breadcrumb'", desc: "Rótulo acessível (aria-label)." },
	],
	slots: [
		{ name: "item", desc: "Itens da trilha (repetível). O último vira a página atual." },
	],
};
