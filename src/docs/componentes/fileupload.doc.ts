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
		return `<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start"><fx-fileupload size="sm" icon="upload_file" label="Pequeno"></fx-fileupload><fx-fileupload size="md" icon="upload_file" label="Médio"></fx-fileupload><fx-fileupload size="lg" icon="upload_file" label="Grande"></fx-fileupload></div><div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center;margin-top:16px"><fx-fileupload severity="primary" icon="upload_file" label="Primary"></fx-fileupload><fx-fileupload severity="secondary" icon="upload_file" label="Secondary"></fx-fileupload><fx-fileupload severity="success" icon="upload_file" label="Success"></fx-fileupload><fx-fileupload severity="warning" icon="upload_file" label="Warning"></fx-fileupload><fx-fileupload severity="danger" icon="upload_file" label="Danger"></fx-fileupload><fx-fileupload severity="info" icon="upload_file" label="Info"></fx-fileupload></div><div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;margin-top:16px"><fx-fileupload mode="advanced" icon="cloud_upload" label="Arraste arquivos aqui" multiple show-progress></fx-fileupload><fx-fileupload mode="advanced" icon="☁️" label="Emoji também funciona" multiple></fx-fileupload></div><h4>Full width (full)</h4><fx-fileupload full icon="upload_file" label="Estica até o pai"></fx-fileupload>`;
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
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
		{ kind: "text", attr: "icon", label: "Ícone", hint: "glifo Fenix Icons (ex.: upload_file) ou emoji" },
	],
	attributes: [
		{ name: "mode", type: `'basic' | 'advanced'`, default: "'basic'", desc: "`basic`: botão. `advanced`: dropzone com drag & drop." },
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "'md'", desc: "Tamanho do controle." },
		{ name: "severity", type: `'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'`, default: "''", desc: "Cor do botão no modo basic (como no fx-button)." },
		{ name: "label", type: "string", default: "'Escolher arquivo'", desc: "Texto do botão/área." },
		{ name: "icon", type: "string", default: "''", desc: "Ícone antes do texto: nome do glifo Fenix Icons (ex.: icon=\"upload_file\") ou emoji/texto livre. Requer '@wrrdev/fenix-ui/icons' para glifos." },
		{ name: "accept", type: "string", default: "''", desc: "Tipos aceitos (como no input file)." },
		{ name: "multiple", type: "boolean", default: "false", desc: "Permite múltiplos arquivos." },
		{ name: "show-progress", type: "boolean", default: "false", desc: "Exibe barra e porcentagem de upload." },
		{ name: "progress", type: "number", default: "0", desc: "Progresso do upload (0-100). Atualize durante o upload real; chega a 100 em verde." },
		{ name: "disabled", type: "boolean", default: "false", desc: "Desabilita o controle." },
		{ name: "value", type: "string", default: "''", desc: "Nome(s) do(s) arquivo(s) selecionado(s)." },
		{ name: "full", type: "boolean", default: "false", desc: "Largura 100% acompanhando o elemento pai (host vira block; botão/dropzone esticam)." },
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
