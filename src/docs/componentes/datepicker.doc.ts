/**
 * Documentação do componente <fx-datepicker>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { sizes } from '../shared';

export const datepickerDoc: ComponentDoc = {
	tag: "fx-datepicker",
	title: "Datepicker",
	group: "Formulário",
	lead: "Campo de data com ícone de calendário: o calendário abre em um popover ao clicar no input e a(s) data(s) selecionada(s) aparecem nele. Suporta data simples, múltiplas datas e período, herdando min/max do calendário.",
	imports: ["import '@wrrdev/fenix-ui/datepicker';"],
	demoHtml: (a) => `<fx-datepicker ${a}></fx-datepicker>`,
	variantsHtml: () =>
		`<fx-datepicker placeholder="Data única" value="2026-08-15"></fx-datepicker>
       <fx-datepicker mode="range" placeholder="Período"></fx-datepicker>
       <fx-datepicker mode="multiple" placeholder="Várias datas"></fx-datepicker>`,
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
			kind: "toggle",
			attr: "show-time",
			label: "Hora (hh:mm:ss)",
			on: true,
		},
		{ kind: "toggle", attr: "free-text", label: "Digitar livre" },
		{
			kind: "text",
			attr: "format",
			label: "format",
			hint: "dd/mm/yyyy HH:MM:SS",
		},
		{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
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
			name: "show-time",
			type: "boolean",
			default: "false",
			desc: "Inclui seleção de hora/minuto/segundo no popover; o valor passa a ser YYYY-MM-DDTHH:mm:ss.",
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
			default: `'dd/mm/aaaa'`,
			desc: "Texto do input vazio.",
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
	],
	events: [
		{
			name: "change",
			type: `CustomEvent`,
			desc: "Composed. Detail conforme o modo: `{ value }` · `{ value, start, end }` · `{ values }`; vazio ao limpar.",
		},
		{
			name: "invalid",
			type: `CustomEvent<{ text }>`,
			desc: "Emitido no modo free-text quando o texto digitado é rejeitado (formato/data real/min-max).",
		},
	],
	slots: [],
};
