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
		'<h4>Tamanhos</h4><div style="display:flex;gap:12px"><fx-textarea size="sm" placeholder="sm"></fx-textarea><fx-textarea size="md" placeholder="md"></fx-textarea><fx-textarea size="lg" placeholder="lg"></fx-textarea></div><h4>Estados</h4><fx-textarea disabled value="Desabilitado"></fx-textarea><fx-textarea readonly value="Somente leitura"></fx-textarea>',
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
};
