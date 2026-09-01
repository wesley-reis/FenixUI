/**
 * Documentação do componente <fx-spinner>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { sizes } from '../shared';

export const spinnerDoc: ComponentDoc = {
	tag: "fx-spinner",
	title: "Spinner",
	group: "Feedback",
	lead: "Indicador de carregamento animado que herda automaticamente a cor primária do tema ativo.",
	imports: ["import '@wrrdev/fenix-ui/spinner';"],
	demoHtml: (a) => `<fx-spinner ${a}></fx-spinner>`,
	variantsHtml: () => `<fx-spinner></fx-spinner>`,
	controls: [
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: sizes,
			value: "md",
		},
	],
	attributes: [
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: `'md'`,
			desc: "Diâmetro do spinner.",
		},
	],
};
