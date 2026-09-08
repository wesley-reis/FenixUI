/**
 * Documentação do componente <fx-card>.
 */
import type { ComponentDoc } from '../types';

export const cardDoc: ComponentDoc = {
	tag: "fx-card",
	title: "Card",
	group: "Layout",
	lead: "Container de conteúdo com cabeçalho (slot header), corpo (slot padrão) e rodapé (slot footer). Variantes elevator/flat/outline/ghost e tamanhos sm/md/lg.",
	imports: ["import '@wrrdev/fenix-ui/card';"],
	demoHtml: (attrs) =>
		`<fx-card ${attrs} heading="Detalhes do pedido" padded style="max-width:360px"><p style="margin:0">Pedido #1234 — 3 itens, total R$ 199,00</p><fx-button slot="footer" size="sm">Ver mais</fx-button></slot></fx-card>`,
	variantsHtml: () => {
		return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px"><fx-card variant="elevated" heading="Elevated" padded><p>Conteúdo elevado.</p></fx-card><fx-card variant="flat" heading="Flat" padded><p>Conteúdo plano.</p></fx-card><fx-card variant="outline" heading="Outline" padded><p>Conteúdo com borda.</p></fx-card><fx-card variant="ghost" heading="Ghost" padded><p>Conteúdo ghost.</p></fx-card></div>`;
	},
	controls: [
		{ kind: "select", attr: "variant", label: "Variante", options: ["elevated", "flat", "outline", "ghost"], value: "elevated" },
		{ kind: "toggle", attr: "padded", label: "Padding interno", on: true },
		{ kind: "select", attr: "size", label: "Radius", options: ["sm", "md", "lg"], value: "md" },
	],
	attributes: [
		{ name: "variant", type: `'elevated' | 'flat' | 'outline' | 'ghost'`, default: "'elevated'", desc: "Estilo visual do container." },
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "'md'", desc: "Radius do container." },
		{ name: "padded", type: "boolean", default: "false", desc: "Aplica padding interno no corpo." },
		{ name: "heading", type: "string", default: "''", desc: "Título do cabeçalho (esconde o header se vazio)." },
	],
	slots: [
		{ name: "header", desc: "Conteúdo extra no cabeçalho." },
		{ name: "(padrão)", desc: "Corpo do card." },
		{ name: "footer", desc: "Ações/roda pé do card." },
	],
};
