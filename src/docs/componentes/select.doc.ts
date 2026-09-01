/**
 * Documentação do componente <fx-select>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { sizes } from '../shared';

export const selectDoc: ComponentDoc = {
	tag: "fx-select",
	title: "Select",
	group: "Formulário",
	lead: "Dropdown customizado com hover/seleção na cor do tema, busca e limpeza. Escreva <option> nativos como filhos — são espelhados automaticamente.",
	imports: ["import '@wrrdev/fenix-ui/select';"],
	demoHtml: (a) =>
		`<fx-select ${a}>\n  <option value="sp">São Paulo</option>\n  <option value="rj">Rio de Janeiro</option>\n  <option value="mg">Minas Gerais</option>\n  <option value="ba">Bahia</option>\n  <option value="pr">Paraná</option>\n</fx-select>`,
	variantsHtml: () =>
		`<fx-select clearable searchable placeholder="Selecione um estado"><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option><option value="mg">Minas Gerais</option></fx-select>`,
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
		{ kind: "text", attr: "value", label: "Value", hint: "ex.: rj" },
		{
			kind: "toggle",
			attr: "searchable",
			label: "Busca (searchable)",
			on: true,
		},
		{
			kind: "toggle",
			attr: "clearable",
			label: "Limpar (clearable)",
			on: true,
		},
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
	],
	attributes: [
		{
			name: "value",
			type: "string",
			default: "1ª opção ou `selected`",
			desc: "Valor selecionado; reflete para o atributo ao escolher.",
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
			desc: "Desabilita o campo.",
		},
		{
			name: "placeholder",
			type: "string",
			default: "''",
			desc: "Texto exibido quando nada está selecionado.",
		},
		{
			name: "searchable",
			type: "boolean",
			default: "false",
			desc: "Exibe campo de pesquisa dentro do dropdown.",
		},
		{
			name: "search-placeholder",
			type: "string",
			default: "'Pesquisar…'",
			desc: "Placeholder do campo de pesquisa.",
		},
		{
			name: "no-results",
			type: "string",
			default: "'Nenhum resultado'",
			desc: "Mensagem quando a busca não encontra nada.",
		},
		{
			name: "clearable",
			type: "boolean",
			default: "false",
			desc: "Exibe botão × para limpar a seleção (visível quando há valor).",
		},
	],
	events: [
		{
			name: "change",
			type: `CustomEvent<{ value: string }>`,
			desc: "Emitido ao selecionar (composed — atravessa o Shadow DOM).",
		},
	],
	slots: [
		{
			name: "(padrão)",
			desc: "Elementos <option> nativos, espelhados para dentro do componente.",
		},
	],
};
