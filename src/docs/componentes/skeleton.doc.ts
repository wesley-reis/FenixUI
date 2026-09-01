/**
 * Documentação do componente <fx-skeleton>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const skeletonDoc: ComponentDoc = {
	tag: "fx-skeleton",
	title: "Skeleton",
	group: "Feedback",
	lead: "Placeholder animado para carregamento: texto, círculo, retângulo ou múltiplas linhas.",
	imports: ["import '@wrrdev/fenix-ui/skeleton';"],
	demoHtml: (a) => `<fx-skeleton ${a}></fx-skeleton>`,
	variantsHtml: () =>
		`<h4>Texto</h4><fx-skeleton variant="text"><br/></fx-skeleton><div style="display:flex;gap:12px;align-items:center;margin-top:8px"><fx-skeleton variant="circle" width="40px" height="40px"></fx-skeleton><div style="flex:1"><fx-skeleton variant="text"></fx-skeleton><fx-skeleton variant="text"></fx-skeleton></div></div><br/><h4>Múltiplas linhas</h4><fx-skeleton variant="text" lines="3"></fx-skeleton><h4>Bloco</h4><fx-skeleton width="100%" height="120px"></fx-skeleton>`,
	controls: [
		{
			kind: "select",
			attr: "variant",
			label: "Variante",
			options: ["text", "circle", "rect"],
			value: "text",
		},
		{ kind: "text", attr: "width", label: "Largura", value: "100%" },
		{ kind: "text", attr: "height", label: "Altura" },
		{ kind: "text", attr: "lines", label: "Linhas" },
	],
	attributes: [
		{
			name: "variant",
			type: `'text' | 'circle' | 'rect'`,
			default: "'text'",
			desc: "Formato.",
		},
		{
			name: "width / height",
			type: "string",
			default: "—",
			desc: "Dimensões (CSS).",
		},
		{
			name: "lines",
			type: "number",
			default: "3",
			desc: "Linhas (variante text).",
		},
	],
};
