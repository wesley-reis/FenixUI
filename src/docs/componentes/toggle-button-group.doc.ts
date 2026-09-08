/**
 * Documentação do componente <fx-toggle-button-group>.
 */
import type { ComponentDoc } from '../types';

export const toggleButtonGroupDoc: ComponentDoc = {
	tag: "fx-toggle-button-group",
	title: "Toggle Button",
	group: "Formulario",
	lead: "Grupo de botões de seleção múltipla ou única. Cada opção é definida com slot=\"option\" e atributo value.",
	imports: ["import '@wrrdev/fenix-ui/toggle-button-group';"],
	demoHtml: (attrs) =>
		`<fx-toggle-button-group ${attrs} style="width:100%"><button slot="option" value="dia">Día</button><button slot="option" value="semana">Semana</button><button slot="option" value="mes">Mes</button></fx-toggle-button-group>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:20px"><fx-toggle-button-group size="sm" multiple><button slot="option" value="a">A</button><button slot="option" value="b">B</button><button slot="option" value="c">C</button></fx-toggle-button-group><fx-toggle-button-group multiple value="a,c"><button slot="option" value="a">Red</button><button slot="option" value="b">Green</button><button slot="option" value="c">Blue</button></fx-toggle-button-group></div>`;
	},
	controls: [
		{ kind: "toggle", attr: "multiple", label: "Seleção múltipla" },
		{ kind: "select", attr: "size", label: "Tamaño", options: ["sm", "md", "lg"], value: "md" },
	],
	attributes: [
		{ name: "multiple", type: "boolean", default: "false", desc: "Permite selecionar várias opções." },
		{ name: "value", type: "string", default: "''", desc: "Opções selecionadas separadas por vírgula." },
		{ name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", desc: "Tamanho dos botões." },
	],
	events: [
		{ name: "change", type: "CustomEvent<{ value: string[] }>", desc: "Ao alternar uma opção." },
	],
	slots: [
		{ name: "option", desc: "Cada botão do grupo. Use o atributo `value` para identificá-lo." },
	],
};