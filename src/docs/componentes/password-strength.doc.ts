/**
 * Documentação do componente <fx-password-strength>.
 */
import type { ComponentDoc } from '../types';

export const passwordStrengthDoc: ComponentDoc = {
	tag: "fx-password-strength",
	title: "Password Strength",
	group: "Formulário",
	lead: "Medidor visual de força de senha (0-4) com rótulos em português. Atualize o atributo value conforme o usuário digita.",
	imports: ["import '@wrrdev/fenix-ui/password-strength';"],
	demoHtml: (attrs) =>
		`<div style="width:320px"><fx-input placeholder="Digite uma senha" oninput="document.getElementById('ps-demo').setAttribute('value', this.value)"></fx-input><fx-password-strength id="ps-demo" ${attrs} style="margin-top:8px"></fx-password-strength></div>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:20px;max-width:320px"><fx-password-strength value="abc" label="Senha"></fx-password-strength><fx-password-strength value="Abc12345" label="Senha"></fx-password-strength><fx-password-strength value="Abc123!@#x" label="Senha"></fx-password-strength><fx-password-strength size="lg" value="Abc123!@#xyz" label="Senha"></fx-password-strength></div>`;
	},
	controls: [
		{ kind: "text", attr: "value", label: "Senha", hint: "digite para testar" },
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
	],
	attributes: [
		{ name: "value", type: "string", default: "''", desc: "Senha a avaliar." },
		{ name: "label", type: "string", default: "'Força da senha'", desc: "Rótulo exibido acima das barras." },
		{ name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", desc: "Espessura das barras." },
	],
	events: [
		{ name: "change", type: "CustomEvent<{ score: number; value: string }>", desc: "Quando o nível (0-4) muda." },
	],
};