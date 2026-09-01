/**
 * Documentação do componente <fx-dialog>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const dialogDoc: ComponentDoc = {
	tag: "fx-dialog",
	title: "Dialog",
	group: "Feedback",
	lead: "Janela modal com overlay, título e fechamento por ESC/clique fora. Controle o estado pelo atributo open.",
	imports: ["import '@wrrdev/fenix-ui/dialog';"],
	demoHtml: () =>
		`<fx-dialog id="dlg-demo" heading="Confirmar exclusão" size="md"><p style="margin:0">Tem certeza que deseja excluir este registro?</p><div slot="footer" style="display:flex;gap:8px;justify-content:flex-end"><fx-button size="sm" variant="outline" onclick="document.getElementById('dlg-demo').removeAttribute('open')">Cancelar</fx-button><fx-button size="sm" variant="danger" onclick="document.getElementById('dlg-demo').removeAttribute('open')">Excluir</fx-button></div></fx-dialog><fx-button onclick="document.getElementById('dlg-demo').setAttribute('open','')">Abrir dialog</fx-button>`,
	variantsHtml: () => {
		const mk = (id: string, size: string) =>
			`<fx-dialog id="${id}" heading="Diálogo ${size}" size="${size}"><p style="margin:0">Conteúdo de exemplo.</p></fx-dialog>`;
		return `${mk("dlg-s", "sm")}${mk("dlg-l", "lg")}<div style="display:flex;gap:12px"><fx-button size="sm" onclick="document.getElementById('dlg-s').setAttribute('open','')">Pequeno</fx-button><fx-button size="sm" onclick="document.getElementById('dlg-l').setAttribute('open','')">Grande</fx-button></div>`;
	},
	controls: [
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: ["sm", "md", "lg"],
			value: "md",
		},
	],
	attributes: [
		{
			name: "open",
			type: "boolean",
			default: "false",
			desc: "Exibe o dialog.",
		},
		{
			name: "heading",
			type: "string",
			default: "''",
			desc: "Título da janela.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: "'md'",
			desc: "Largura máxima.",
		},
	],
	events: [
		{ name: "open", type: "CustomEvent<void>", desc: "Ao abrir." },
		{
			name: "close",
			type: "CustomEvent<void>",
			desc: "Ao fechar (ESC, overlay ou botão).",
		},
	],
	slots: [
		{ name: "(padrão)", desc: "Corpo do diálogo." },
		{ name: "footer", desc: "Ações (botões)." },
	],
};
