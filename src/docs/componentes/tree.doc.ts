/**
 * Documentação do componente <fx-tree>.
 */
import type { ComponentDoc } from '../types';

export const treeDoc: ComponentDoc = {
	tag: "fx-tree",
	title: "Tree",
	group: "Layout",
	lead: "Árvore hierárquica com expandir/recolher e seleção. Dados via atributo data (JSON) com label, icon e children.",
	imports: ["import '@wrrdev/fenix-ui/tree';"],
	demoHtml: (attrs) =>
		`<fx-tree ${attrs} style="width:100%" data='[{"label":"Documentos","icon":"📁","children":[{"label":"Contrato.pdf"},{"label":"Relatório.xlsx"}]},{"label":"Imagens","icon":"📁","children":[{"label":"Foto.png"}]},{"label":"README.md"}]'></fx-tree>`,
	variantsHtml: () => {
		return `<fx-tree expand-all size="sm" style="width:100%" data='[{"label":"src","icon":"📁","children":[{"label":"components","icon":"📁","children":[{"label":"button.ts"}]},{"label":"core.ts"}]},{"label":"package.json"}]'></fx-tree>`;
	},
	controls: [
		{ kind: "toggle", attr: "expand-all", label: "Expandir tudo", on: true },
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
	],
	attributes: [
		{ name: "data", type: "TreeNode[] (JSON)", default: "[]", desc: "Estrutura hierárquica: { label, icon?, children? }." },
		{ name: "expand-all", type: "boolean", default: "false", desc: "Expande todos os nós." },
		{ name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", desc: "Tamanho das linhas." },
	],
	events: [
		{ name: "select", type: "CustomEvent<{ node: TreeNode }>", desc: "Ao selecionar um nó." },
	],
	cssVars: [
		{ name: "setAllExpanded(open)", desc: "Método para expandir/recolher todos os nós via JS." },
	],
};