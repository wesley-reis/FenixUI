/**
 * Documentação do componente <fx-chip>.
 */
import type { ComponentDoc } from '../types';

export const chipDoc: ComponentDoc = {
	tag: "fx-chip",
	title: "Chip",
	group: "Dados",
	lead: "Chip/Tag compacto para labels, filtros e seleções — com variantes de cor, ícone, remoção e seleção.",
	imports: ["import '@wrrdev/fenix-ui/chip';"],
	demoHtml: (attrs) =>
		`<fx-chip ${attrs} icon="🏷️">Categoria</fx-chip>`,
	variantsHtml: () => {
		return `<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><fx-chip>Padrão</fx-chip><fx-chip variant="primary">Primary</fx-chip><fx-chip variant="secondary">Secondary</fx-chip><fx-chip variant="success">Success</fx-chip><fx-chip variant="warning">Warning</fx-chip><fx-chip variant="danger">Danger</fx-chip><fx-chip variant="info">Info</fx-chip></div><div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:16px"><fx-chip removable icon="🔥">Removível</fx-chip><fx-chip selectable selected>Filtro ativo</fx-chip><fx-chip selectable>Filtro inativo</fx-chip><fx-chip size="sm">Pequeno</fx-chip><fx-chip size="lg">Grande</fx-chip><fx-chip disabled>Desabilitado</fx-chip></div>`;
	},
	controls: [
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
		{ kind: "select", attr: "variant", label: "Variante", options: ["", "primary", "secondary", "success", "warning", "danger", "info"], value: "primary" },
		{ kind: "toggle", attr: "removable", label: "Removível", on: true },
		{ kind: "toggle", attr: "selectable", label: "Selecionável" },
		{ kind: "toggle", attr: "selected", label: "Selecionado" },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{ name: "variant", type: `'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'`, default: "''", desc: "Cor do chip." },
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "'sm'", desc: "Tamanho do chip." },
		{ name: "icon", type: "string", default: "''", desc: "Ícone (glifo/emoji) antes do texto." },
		{ name: "removable", type: "boolean", default: "false", desc: "Exibe o botão × de remoção." },
		{ name: "selectable", type: "boolean", default: "false", desc: "Clique alterna o estado selected." },
		{ name: "selected", type: "boolean", default: "false", desc: "Estado selecionado (com selectable)." },
		{ name: "disabled", type: "boolean", default: "false", desc: "Desabilita o chip." },
	],
	events: [
		{ name: "remove", type: "CustomEvent<void>", desc: "Ao clicar no ×." },
		{ name: "chip-click", type: "CustomEvent<void>", desc: "Ao clicar no chip (com selectable)." },
	],
	slots: [{ name: "(padrão)", desc: "Texto/conteúdo do chip." }],
};
