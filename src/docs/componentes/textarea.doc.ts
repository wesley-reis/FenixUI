/**
 * Documentação do componente <fx-textarea>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { autofillSection } from '../shared';

export const textareaDoc: ComponentDoc = {
	tag: "fx-textarea",
	title: "Textarea",
	group: "Formulário",
	lead: "Campo de texto multilinha com validação visual e tamanhos padronizados. Form-associated: com name entra no FormData de um <form> (Enter segue sendo quebra de linha, como o nativo).",
	imports: ["import '@wrrdev/fenix-ui/textarea';"],
	extraSections: [
		autofillSection(
			'O <code>&lt;textarea&gt;</code> interno recebe <code>autocomplete</code> (default <code>off</code>), <code>name</code> e <code>id</code> do host. Declare o atributo no <code>&lt;fx-textarea&gt;</code> quando o autofill for desejado (ex.: <code>autocomplete="street-address"</code>); o valor do host sempre vence o default.'
		),
	],
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
			desc: "Texto do campo. Setar el.value também atualiza o campo interno (sem re-render, preservando foco/cursor).",
		},
		{
			name: "name",
			type: "string",
			default: "''",
			desc: "Nome do campo no FormData quando dentro de um <form> (form-associated). Também é repassado ao textarea interno (ajuda o navegador a classificar o campo).",
		},
		{
			name: "autocomplete",
			type: "string",
			default: "'off'",
			desc: "Repassado ao textarea INTERNO (é ele que o navegador enxerga): controla o autofill e o gerenciador de senhas. Default 'off'; o atributo declarado no host vence. Ex.: 'street-address', 'off'. Ver a seção Autofill abaixo.",
		},
		{
			name: "autofocus",
			type: "boolean",
			default: "false",
			desc: "Foca o campo ao entrar na tela (delegatesFocus leva o foco ao textarea interno).",
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
		{
			name: "emit-autofill",
			type: "boolean",
			default: "false",
			desc: "Restaura o comportamento anterior à correção de autofill: input/change/valueChange também quando o valor é colocado no campo pelo navegador (autofill/gerenciador de senha). Sem ele, autofill emite `autofill` e não aciona o v-model.",
		},
	],
	events: [
		{
			name: "input",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao digitar. Só sai em edição do usuário: valor colocado no campo por autofill/gerenciador de senha/script emite `autofill`.",
		},
		{
			name: "change",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao concluir a edição. Só em edição do usuário (o change do autofill é absorvido).",
		},
		{
			name: "autofill",
			type: `CustomEvent<{ value: string }>`,
			desc: "Valor colocado no campo SEM edição do usuário (autofill do navegador, gerenciador de senha, script). O value/FormData já estão sincronizados — use este evento para reagir sem poluir o v-model.",
		},
	],
	cssVars: [
		{ name: "--fx-textarea-width", type: "largura CSS", default: "260px", desc: "Largura padrão do campo (aplicada no host). CSS externo, classes e style inline no elemento vencem o default." },
		{ name: "--fx-textarea-width-sm / -lg", type: "largura CSS", default: "220px / 300px", desc: "Larguras padrão para size sm e lg." },
	],
};
