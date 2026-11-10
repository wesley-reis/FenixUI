/**
 * Documentação do componente <fx-datepicker>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { autofillSection, sizes } from '../shared';

export const datepickerDoc: ComponentDoc = {
	tag: "fx-datepicker",
	title: "Datepicker",
	group: "Formulário",
	lead: "Campo de data com ícone de calendário: o calendário abre em um popover ao clicar no input e a(s) data(s) selecionada(s) aparecem nele. Suporta data simples, múltiplas datas e período (herdando min/max do calendário) e, via <code>picker</code>, também fecha/hora isolada ou data+hora.",
	imports: ["import '@wrrdev/fenix-ui/datepicker';"],
	extraSections: [
		autofillSection(
			'O input de exibição (e os campos de hora quando <code>show-time</code> está ligado) vive no Shadow DOM e já sai com <code>autocomplete="off"</code>.'
		),
	],
	demoHtml: (a) => `<fx-datepicker ${a}></fx-datepicker>`,
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:12px">
			<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
				<fx-datepicker placeholder="Data única" value="2026-08-15"></fx-datepicker>
				<fx-datepicker mode="range" placeholder="Período"></fx-datepicker>
				<fx-datepicker mode="multiple" placeholder="Várias datas"></fx-datepicker>
			</div>
			<h4>picker — data, hora ou ambos</h4>
			<p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px"><code>picker="date"</code> (padrão) mostra só o calendário; <code>picker="datetime"</code> mostra calendário + hora; <code>picker="time"</code> mostra só a seleção de hora (com os rótulos Hora/Min/Seg e o botão <b>Agora</b>).</p>
			<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
				<fx-datepicker picker="date" placeholder="Só data" value="2026-08-15"></fx-datepicker>
				<fx-datepicker picker="datetime" placeholder="Data e hora" value="2026-08-15T14:30:00"></fx-datepicker>
				<fx-datepicker picker="time" placeholder="Só hora" value="14:30:00"></fx-datepicker>
			</div>
			<h4>Validação (error / success)</h4>
			<p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Borda vermelha com <code>error</code>, verde com <code>success</code>. Combine com <code>fx-alert</code> no submit (ver página Formulários).</p>
			<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
				<fx-datepicker error placeholder="error"></fx-datepicker>
				<fx-datepicker success placeholder="success"></fx-datepicker>
			</div>
		</div>`,
	controls: [
		{
			kind: "select",
			attr: "mode",
			label: "Modo",
			options: ["single", "range", "multiple"],
			value: "single",
		},
		{ kind: "toggle", attr: "clearable", label: "Limpar" },
		{
			kind: "select",
			attr: "picker",
			label: "Exibir (picker)",
			options: ["date", "time", "datetime"],
			value: "date",
		},
		{ kind: "toggle", attr: "free-text", label: "Digitar livre" },
		{
			kind: "text",
			attr: "format",
			label: "format",
			hint: "dd/mm/yyyy HH:MM:SS",
		},
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		{ kind: "toggle", attr: "error", label: "Erro" },
		{ kind: "toggle", attr: "success", label: "Sucesso" },
		{
			kind: "select",
			attr: "size",
			label: "Tamanho",
			options: sizes,
			value: "md",
		},
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
	],
	attributes: [
		{
			name: "mode",
			type: `'single' | 'range' | 'multiple'`,
			default: `'single'`,
			desc: "Tipo de seleção. Em single, o popover fecha ao escolher.",
		},
		{
			name: "value",
			type: "string (ISO)",
			default: "''",
			desc: "Data (single), ex.: 2026-08-15.",
		},
		{
			name: "name",
			type: "string",
			default: "''",
			desc: "Nome do campo no FormData quando dentro de um <form>: single envia name; range envia name-start/name-end; multiple envia uma entrada name por data.",
		},
		{
			name: "start / end",
			type: "string (ISO)",
			default: "''",
			desc: "Período (range).",
		},
		{
			name: "values",
			type: "CSV",
			default: "''",
			desc: 'Múltiplas datas, ex.: values="2026-08-01,2026-08-15".',
		},
		{
			name: "min / max",
			type: "ISO parcial",
			default: "''",
			desc: 'Repasse direto ao calendário: ano ("2026"), mês ("2026-03") ou dia.',
		},
		{
			name: "format",
			type: "string",
			default: "'' (ISO)",
			desc: "Máscara de exibição. Tokens: `dd mm yyyy` (data) e `HH MM SS` (hora, minuto, segundo) — ex.: dd/mm/yyyy HH:MM:SS.",
		},
		{
			name: "picker",
			type: `'date' | 'time' | 'datetime'`,
			default: `'date'`,
			desc: "O que exibir no popover: <code>date</code> (só calendário), <code>time</code> (só hora — valor <code>HH:mm:ss</code>) ou <code>datetime</code> (calendário + hora — valor <code>YYYY-MM-DDTHH:mm:ss</code>).",
		},
		{
			name: "show-time",
			type: "boolean",
			default: "false",
			desc: "<b>Alias legado</b> de <code>picker=\"datetime\"</code>. Continua aceito: sem <code>picker</code>, liga a seleção de hora e o valor passa a ser <code>YYYY-MM-DDTHH:mm:ss</code>.",
		},
		{
			name: "clearable",
			type: "boolean",
			default: "false",
			desc: "Mostra × para limpar quando há valor.",
		},
		{
			name: "free-text",
			type: "boolean",
			default: "false",
			desc: "Permite digitar a data no input (Enter ou blur aplica). Valida formato, data real e min/max; inválido reverte e emite `invalid`.",
		},
		{
			name: "placeholder",
			type: "string",
			default: "conforme o picker",
			desc: "Texto do input vazio. Sem valor explícito, segue o <code>format</code> (quando definido) ou o <code>picker</code>: <code>dd/mm/aaaa</code> · <code>hh:mm:ss</code> (hora) · <code>dd/mm/aaaa hh:mm:ss</code> (data+hora).",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			desc: "Desabilita o campo.",
		},
		{
			name: "size",
			type: `'sm' | 'md' | 'lg'`,
			default: `'md'`,
			desc: "Altura do campo.",
		},
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block; min-width por modo é descartado).",
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
			type: `CustomEvent`,
			desc: "Composed. Detail conforme o modo: `{ value }` · `{ value, start, end }` · `{ values }`; vazio ao limpar.",
		},
		{
			name: "fx-datepicker-invalid",
			type: `CustomEvent<{ text: string }>`,
			desc: "Emitido no modo free-text quando o texto digitado é rejeitado (formato/data real/min-max). Vue: `@fx-datepicker-invalid` · React: `onfx-datepicker-invalid`.",
		},
	],
	slots: [],
};
