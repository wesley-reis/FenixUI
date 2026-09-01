/**
 * Documentação do componente <fx-badge>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { badgeVariants } from '../shared';

export const badgeDoc: ComponentDoc = {
	tag: "fx-badge",
	title: "Badge",
	group: "Exibição",
	lead: "Rótulo compacto para status, contadores e destaques. Suporta formato arredondado para números.",
	imports: ["import '@wrrdev/fenix-ui/badge';"],
	demoHtml: (a) => `<fx-badge ${a}>Novo</fx-badge>`,
	variantsHtml: () =>
		badgeVariants
			.map((v) => `<fx-badge variant="${v}">${v}</fx-badge>`)
			.join(""),
	controls: [
		{
			kind: "select",
			attr: "variant",
			label: "Variante",
			options: badgeVariants,
			value: "primary",
		},
		{ kind: "toggle", attr: "round", label: "Arredondado (round)" },
	],
	attributes: [
		{
			name: "variant",
			type: `'${badgeVariants.join("' | '")}'`,
			default: `'neutral'`,
			desc: "Cor semântica do badge.",
		},
		{
			name: "round",
			type: "boolean",
			default: "false",
			desc: "Formato pílula/circular — ideal para contadores.",
		},
	],
	slots: [{ name: "(padrão)", desc: "Conteúdo do badge." }],
};
