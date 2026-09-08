/**
 * Documentação do componente <fx-empty-state>.
 */
import type { ComponentDoc } from '../types';

export const emptyStateDoc: ComponentDoc = {
	tag: "fx-empty-state",
	title: "Empty State",
	group: "Feedback",
	lead: "Estado vazio/ilustrativo para listas e telas sem dados, com ícone, título, descrição e ação opcional.",
	imports: ["import '@wrrdev/fenix-ui/empty-state';"],
	demoHtml: (attrs) =>
		`<fx-empty-state ${attrs} icon="📭" heading="Nada por aqui" description="Adicione itens para começar."><fx-button slot="action" size="sm">Adicionar item</fx-button></fx-empty-state>`,
	variantsHtml: () => {
		return `<div style="display:flex;gap:24px;flex-wrap:wrap;justify-content:center"><fx-empty-state icon="🔍" heading="Nenhum resultado" description="Tente ajustar os filtros de busca."></fx-empty-state><fx-empty-state icon="⚠️" heading="Erro ao carregar" description="Não foi possível carregar os dados."><fx-button slot="action" size="sm" variant="outline">Tentar novamente</fx-button></fx-empty-state></div>`;
	},
	controls: [
		{ kind: "text", attr: "heading", label: "Título", hint: "Nada por aqui" },
		{ kind: "text", attr: "description", label: "Descrição", hint: "Adicione itens para começar." },
		{ kind: "text", attr: "icon", label: "Ícone", hint: "📭" },
	],
	attributes: [
		{ name: "icon", type: "string", default: "'📭'", desc: "Glifo/emoji exibido no topo." },
		{ name: "heading", type: "string", default: "''", desc: "Título do estado vazio." },
		{ name: "description", type: "string", default: "''", desc: "Texto de apoio." },
	],
	slots: [
		{ name: "icon", desc: "Substitui o ícone (para SVG/imagem)." },
		{ name: "action", desc: "Ação principal (botão/link)." },
	],
};