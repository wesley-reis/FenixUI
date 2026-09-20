/**
 * Documentação do componente <fx-textarea>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const textareaDoc: ComponentDoc = {
	tag: "fx-textarea",
	title: "Textarea",
	group: "Formulário",
	lead: "Campo de texto multilinha com validação visual e tamanhos padronizados.",
	imports: ["import '@wrrdev/fenix-ui/textarea';"],
	demoHtml: (a) =>
		`<fx-textarea ${a} placeholder="Descreva sua necessidade..."></fx-textarea>`,
	variantsHtml: () =>
		'<h4>Tamanhos</h4><div style="display:flex;gap:12px"><fx-textarea size="sm" placeholder="sm"></fx-textarea><fx-textarea size="md" placeholder="md"></fx-textarea><fx-textarea size="lg" placeholder="lg"></fx-textarea></div><h4>Estados</h4><div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><fx-textarea disabled value="Desabilitado"></fx-textarea><fx-textarea readonly value="Somente leitura"></fx-textarea></div><h4>Validação (error / success)</h4><p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Borda vermelha com <code>error</code>/<code>invalid</code>, verde com <code>success</code>/<code>valid</code>. Combine com <code>fx-alert</code> no submit (ver página Formulários).</p><div style="display:flex;gap:12px;flex-wrap:wrap"><fx-textarea error placeholder="error"></fx-textarea><fx-textarea success placeholder="success"></fx-textarea></div>',
	controls: [
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: ["sm", "md", "lg"],
		},
		{ kind: "text", attr: "rows", label: "Linhas", value: "4" },
		{ kind: "text", attr: "maxlength", label: "Máx. caracteres" },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		{ kind: "toggle", attr: "readonly", label: "Somente leitura" },
		{ kind: "toggle", attr: "error", label: "Erro" },
		{ kind: "toggle", attr: "success", label: "Sucesso" },
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
	],
	attributes: [
		{
			name: "value",
			type: "string",
			default: "''",
			desc: "Texto do campo.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: "'md'",
			desc: "Tamanho.",
		},
		{
			name: "rows",
			type: "number",
			default: "4",
			desc: "Altura em linhas.",
		},
		{
			name: "maxlength",
			type: "number",
			default: "—",
			desc: "Limite de caracteres.",
		},
		{
			name: "placeholder / disabled / readonly",
			type: "string | boolean",
			default: "—",
			desc: "Padrões de formulário.",
		},
		{
			name: "error / invalid",
			type: "boolean",
			default: "false",
			desc: "Borda vermelha de validação (ex.: campo obrigatório vazio no submit). Combine com fx-alert para a mensagem (ver página Formulários).",
		},
		{
			name: "success / valid",
			type: "boolean",
			default: "false",
			desc: "Borda verde de validação (campo válido).",
		},
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block). Sem full, a largura também é controlável por CSS externo, classes ou style inline no elemento (ver Variáveis CSS).",
		},
	],
	events: [
		{
			name: "input",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao digitar.",
		},
		{
			name: "change",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao concluir a edição.",
		},
	],
	cssVars: [
		{ name: "--fx-textarea-width", type: "largura CSS", default: "260px", desc: "Largura padrão do campo (aplicada no host). CSS externo, classes e style inline no elemento vencem o default." },
		{ name: "--fx-textarea-width-sm / -lg", type: "largura CSS", default: "220px / 300px", desc: "Larguras padrão para size sm e lg." },
	],
};
