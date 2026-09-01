/**
 * Documentação do componente <fx-multiselect>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { sizes } from '../shared';

export const multiselectDoc: ComponentDoc = {
	tag: "fx-multiselect",
	title: "Multiselect",
	group: "Formulário",
	lead: "Seleção múltipla com chips, pesquisa e limpeza — dropdown customizado (componente separado do fx-select). Escreva <option> nativos como filhos.",
	imports: ["import '@wrrdev/fenix-ui/multiselect';"],
	demoHtml: (a) =>
		`<fx-multiselect ${a} placeholder="Estados">\n  <option value="sp">São Paulo</option>\n  <option value="rj">Rio de Janeiro</option>\n  <option value="mg">Minas Gerais</option>\n  <option value="ba">Bahia</option>\n</fx-multiselect>`,
	variantsHtml: () =>
		`<fx-multiselect searchable clearable placeholder="Pesquisável + limpar">
        <option value="a">Alpha</option><option value="b">Beta</option><option value="c">Gama</option>
      </fx-multiselect>
      <fx-multiselect values="b"><option value="a">Com valor inicial</option><option value="b">Beta</option></fx-multiselect>
      <fx-multiselect disabled><option value="a">Desabilitado</option></fx-multiselect>`,
	controls: [
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: sizes,
			value: "md",
		},
		{
			kind: "text",
			attr: "placeholder",
			label: "Placeholder",
			hint: "Texto quando vazio",
		},
		{
			kind: "text",
			attr: "values",
			label: "Values (CSV)",
			hint: "ex.: sp,rj",
		},
		{
			kind: "text",
			attr: "no-results",
			label: "Msg. sem resultado",
			hint: "ex.: Nada encontrado",
		},
		{ kind: "toggle", attr: "searchable", label: "Pesquisa", on: true },
		{ kind: "toggle", attr: "clearable", label: "Limpar", on: true },
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{
			name: "values",
			type: "string[] (CSV no atributo)",
			default: "[]",
			desc: "Valores selecionados; reflete ao alterar. Propriedade `values` aceita array.",
		},
		{
			name: "searchable",
			type: "boolean",
			default: "false",
			desc: "Exibe campo de pesquisa no popover.",
		},
		{
			name: "clearable",
			type: "boolean",
			default: "false",
			desc: "Botão × para limpar toda a seleção.",
		},
		{
			name: "placeholder",
			type: "string",
			default: `'Selecione…'`,
			desc: "Texto quando nada está selecionado.",
		},
		{
			name: "no-results",
			type: "string",
			default: `'Nenhum resultado'`,
			desc: "Mensagem quando a pesquisa não encontra nada.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: `'md'`,
			desc: "Tamanho do campo.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			desc: "Desabilita o componente.",
		},
	],
	events: [
		{
			name: "change",
			type: `CustomEvent<{ values: string[] }>`,
			desc: "Emitido ao adicionar/remover/limpar (composed).",
		},
	],
	slots: [
		{
			name: "(padrão)",
			desc: "Elementos <option> nativos, espelhados para dentro do componente.",
		},
	],
};
