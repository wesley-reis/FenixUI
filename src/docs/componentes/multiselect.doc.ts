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
      <fx-multiselect disabled><option value="a">Desabilitado</option></fx-multiselect>
      <h4>Validação (error / success)</h4>
      <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Borda vermelha com <code>error</code>, verde com <code>success</code>. Combine com <code>fx-alert</code> no submit (ver página Formulários).</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <fx-multiselect error placeholder="error"><option value="a">Alpha</option></fx-multiselect>
        <fx-multiselect success placeholder="success"><option value="a">Alpha</option></fx-multiselect>
      </div>`,
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
		{ kind: "toggle", attr: "error", label: "Erro" },
		{ kind: "toggle", attr: "success", label: "Sucesso" },
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
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
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block; largura fixa do trigger é sobrescrita). Sem full, a largura também é controlável por CSS externo, classes ou style inline no elemento (ver Variáveis CSS).",
		},
		{
			name: "error",
			type: "boolean",
			default: "false",
			desc: "Borda vermelha de validação (ex.: campo obrigatório vazio no submit). Combine com fx-alert para a mensagem (ver página Formulários).",
		},
		{
			name: "success",
			type: "boolean",
			default: "false",
			desc: "Borda verde de validação (campo válido).",
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
	cssVars: [
		{ name: "--fx-multiselect-width", type: "largura CSS", default: "240px", desc: "Largura padrão do trigger (aplicada no host). CSS externo, classes e style inline no elemento vencem o default." },
		{ name: "--fx-multiselect-width-sm / -lg", type: "largura CSS", default: "200px / 280px", desc: "Larguras padrão para size sm e lg." },
	],
};
