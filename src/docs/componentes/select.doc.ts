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
		`<fx-select clearable searchable placeholder="Selecione um estado"><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option><option value="mg">Minas Gerais</option></fx-select>
        <h4>Validação (error / success)</h4>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Borda vermelha com <code>error</code>, verde com <code>success</code>. Combine com <code>fx-alert</code> no submit (ver página Formulários).</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <fx-select error placeholder="error"><option value="sp">São Paulo</option></fx-select>
          <fx-select success placeholder="success"><option value="sp">São Paulo</option></fx-select>
        </div>
        <h4>Posição do painel (automática)</h4>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 10px">Sem <code>placement</code>, o painel abre para baixo e <strong>inverte sozinho</strong> quando não cabe embaixo e há mais espaço acima — medindo a viewport de verdade, em resize e scroll. Role a página até a borda inferior da caixa: o select de baixo passa a abrir para cima, enquanto o de cima continua abrindo para baixo. Os dois são idênticos no código.</p>
        <div style="border:1px dashed var(--fx-border-default);border-radius:var(--fx-radius-md);padding:16px;display:flex;flex-direction:column;gap:12px;min-height:340px">
          <label style="font-size:12px;color:var(--fx-text-muted);font-weight:500">No topo — abre para baixo</label>
          <div><fx-select placeholder="UF de origem"><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option><option value="mg">Minas Gerais</option></fx-select></div>
          <div style="flex:1 1 auto"></div>
          <label style="font-size:12px;color:var(--fx-text-muted);font-weight:500">No fim — abre para cima</label>
          <div><fx-select placeholder="UF de destino"><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option><option value="mg">Minas Gerais</option></fx-select></div>
        </div>
        <h4>Posição fixa (placement)</h4>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Quando o auto-flip não serve, <code>placement="top"</code> ou <code>placement="bottom"</code> travam a direção. Útil em formulários dentro de modais ou gavetas, onde o painel sempre deve cobrir o campo.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
          <div><small style="color:var(--fx-text-muted)">placement="top"</small><br><fx-select placement="top" placeholder="Sempre para cima"><option value="a">Opção A</option><option value="b">Opção B</option></fx-select></div>
          <div><small style="color:var(--fx-text-muted)">placement="bottom"</small><br><fx-select placement="bottom" placeholder="Sempre para baixo"><option value="a">Opção A</option><option value="b">Opção B</option></fx-select></div>
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
		{ kind: "text", attr: "value", label: "Value", hint: "ex.: rj" },
		{
			kind: "select",
			attr: "placement",
			label: "Posição do painel",
			options: ["auto", "top", "bottom"],
			value: "auto",
		},
		{ kind: "toggle", attr: "searchable", label: "Busca (searchable)", on: true },
		{
			kind: "toggle",
			attr: "clearable",
			label: "Limpar (clearable)",
			on: true,
		},
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		{ kind: "toggle", attr: "error", label: "Erro" },
		{ kind: "toggle", attr: "success", label: "Sucesso" },
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
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
			name: "placement",
			type: `'auto' | 'top' | 'bottom'`,
			default: "'auto'",
			desc: "Posição do painel. `auto` (padrão) abre para baixo e inverte sozinha quando não cabe e há mais espaço acima; `top` e `bottom` fixam a direção. O painel também se limita à altura disponível e é reposicionado em resize/scroll.",
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
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block; min-width é descartado). Sem full, a largura também é controlável por CSS externo, classes ou style inline no elemento (ver Variáveis CSS).",
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
	cssVars: [
		{ name: "--fx-select-width", type: "largura CSS", default: "max-content", desc: "Largura do campo (aplicada no host): por padrão acompanha o conteúdo. CSS externo, classes e style inline no elemento definem a largura (o trigger acompanha)." },
		{ name: "--fx-select-min-width / -sm", type: "largura CSS", default: "200px / 180px", desc: "Largura mínima do campo (md/lg e sm)." },
		{ name: "--fx-select-panel-offset", type: "comprimento CSS", default: "4px", desc: "Espaço entre o campo e o painel. Use esta custom property (e não `::part(panel)`) para reposicionar o painel: por especificação, as regras `::part()` têm prioridade MENOR que a folha do shadow root e não vencem o `top` interno." },
		{ name: "--fx-select-panel-max-height", type: "comprimento CSS", default: "260px", desc: "Altura máxima do painel (também limita o cálculo do auto-flip)." },
	],
};
