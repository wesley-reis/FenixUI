/**
 * Documentação do componente <fx-avatar>.
 */
import type { ComponentDoc } from '../types';

export const avatarDoc: ComponentDoc = {
	tag: "fx-avatar",
	title: "Avatar",
	group: "Dados",
	lead: "Representação visual de usuário/item: imagem, iniciais ou ícone. Use a classe `avatar-group` no container para empilhar com overlap.",
	imports: ["import '@wrrdev/fenix-ui/avatar';"],
	demoHtml: (attrs) =>
		`<div class="avatar-group"><fx-avatar ${attrs}>WR</fx-avatar></div>`,
	variantsHtml: () => {
		return `<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><span class="avatar-group"><fx-avatar size="sm">SM</fx-avatar><fx-avatar size="md">MD</fx-avatar><fx-avatar size="lg">LG</fx-avatar></span><fx-avatar variant="image" src="https://avatars.githubusercontent.com/u/2" shape="circle" style="margin-left:12px"></fx-avatar><fx-avatar variant="image" src="https://avatars.githubusercontent.com/u/3" shape="rounded" style="margin-left:12px"></fx-avatar><fx-avatar variant="image" src="https://avatars.githubusercontent.com/u/4" shape="square" style="margin-left:12px"></fx-avatar><fx-avatar variant="icon" size="lg" style="margin-left:12px"><span slot="icon">📷</span></fx-avatar></div>`;
	},
	controls: [
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
		{ kind: "select", attr: "variant", label: "Variante", options: ["text", "image", "icon"], value: "text" },
		{ kind: "select", attr: "shape", label: "Formato", options: ["circle", "rounded", "square"], value: "circle" },
	],
	attributes: [
		{ name: "variant", type: `'image' | 'text' | 'icon'`, default: "'text'", desc: "Forma de apresentação do avatar." },
		{ name: "src", type: "string", default: "''", desc: "URL da imagem (variant=image)." },
		{ name: "alt", type: "string", default: "''", desc: "Texto alternativo (acessibilidade)." },
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "'md'", desc: "Diâmetro do avatar." },
		{ name: "shape", type: `'circle' | 'rounded' | 'square'`, default: "'circle'", desc: "Forma (radius)." },
	],
	slots: [
		{ name: "(padrão)", desc: "Iniciais do texto (variant=text)." },
		{ name: "icon", desc: "Conteúdo do avatar (variant=icon)." },
	],
	cssVars: [
		{ name: ".avatar-group", desc: "Classe utilitária embutida: posicione vários fx-avatar dentro para empilhamento com overlap." },
	],
};
