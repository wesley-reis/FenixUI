/**
 * Documentação do componente <fx-fileupload>.
 */
import type { ComponentDoc } from '../types';

export const fileuploadDoc: ComponentDoc = {
	tag: "fx-fileupload",
	title: "FileUpload",
	group: "Formulário",
	lead: "Seletor de arquivos com upload e progresso. Dois modos: botão simples (basic) ou área de arrastar e soltar (advanced). Exibe nome e tamanho do arquivo e porcentagem do upload.",
	imports: ["import '@wrrdev/fenix-ui/fileupload';"],
	demoHtml: (attrs) =>
		`<fx-fileupload id="fu-demo" ${attrs} icon="📎" show-progress label="Enviar arquivo" accept=".pdf,.png,.jpg"></fx-fileupload>`,
	variantsHtml: () => {
		return `<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start"><fx-fileupload size="sm" icon="📎" label="Pequeno"></fx-fileupload><fx-fileupload size="md" icon="📎" label="Médio"></fx-fileupload><fx-fileupload size="lg" icon="📎" label="Grande"></fx-fileupload></div><div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center;margin-top:16px"><fx-fileupload severity="primary" icon="📎" label="Primary"></fx-fileupload><fx-fileupload severity="secondary" icon="📎" label="Secondary"></fx-fileupload><fx-fileupload severity="success" icon="📎" label="Success"></fx-fileupload><fx-fileupload severity="warning" icon="📎" label="Warning"></fx-fileupload><fx-fileupload severity="danger" icon="📎" label="Danger"></fx-fileupload><fx-fileupload severity="info" icon="📎" label="Info"></fx-fileupload></div><fx-fileupload mode="advanced" icon="☁️" label="Arraste arquivos aqui" multiple show-progress style="margin-top:16px"></fx-fileupload>`;
	},
	controls: [
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: ["sm", "md", "lg"],
			value: "md",
		},
		{
			kind: "select",
			attr: "severity",
			label: "Severidade",
			options: ["", "primary", "secondary", "success", "warning", "danger", "info"],
			value: "primary",
		},
		{
			kind: "toggle",
			attr: "show-progress",
			label: "Mostrar progresso",
			on: true,
		},
		{
			kind: "toggle",
			attr: "multiple",
			label: "Múltiplos",
		},
		{
			kind: "toggle",
			attr: "disabled",
			label: "Desabilitado",
		},
	],
	attributes: [
		{ name: "mode", type: `'basic' | 'advanced'`, default: "'basic'", desc: "`basic`: botão. `advanced`: dropzone com drag & drop." },
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "'md'", desc: "Tamanho do controle." },
		{ name: "severity", type: `'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'`, default: "''", desc: "Cor do botão no modo basic (como no fx-button)." },
		{ name: "label", type: "string", default: "'Escolher arquivo'", desc: "Texto do botão/área." },
		{ name: "icon", type: "string", default: "''", desc: "Ícone (glifo/emoji) antes do texto. Sem o atributo, sem ícone." },
		{ name: "accept", type: "string", default: "''", desc: "Tipos aceitos (como no input file)." },
		{ name: "multiple", type: "boolean", default: "false", desc: "Permite múltiplos arquivos." },
		{ name: "show-progress", type: "boolean", default: "false", desc: "Exibe barra e porcentagem de upload." },
		{ name: "progress", type: "number", default: "0", desc: "Progresso do upload (0-100). Atualize durante o upload real; chega a 100 em verde." },
		{ name: "disabled", type: "boolean", default: "false", desc: "Desabilita o controle." },
		{ name: "value", type: "string", default: "''", desc: "Nome(s) do(s) arquivo(s) selecionado(s)." },
	],
	events: [
		{ name: "select", type: "CustomEvent<{ files: File[] }>", desc: "Ao escolher/soltar arquivo(s)." },
		{ name: "remove", type: "CustomEvent<{ file: File }>", desc: "Ao remover um arquivo da lista." },
		{ name: "complete", type: "CustomEvent<void>", desc: "Quando o progresso chega a 100." },
	],
	cssVars: [
		{ name: "--fx-fileupload-*", desc: "Usa os tokens padrão do tema (cores, raios, espaçamentos)." },
	],
};
