/**
 * Documentação do componente <fx-calendar>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const calendarDoc: ComponentDoc = {
	tag: "fx-calendar",
	title: "Calendar",
	group: "Exibição",
	lead: 'Calendário com seleção simples, por período (início/fim) ou múltiplas datas. Clique no mês para escolher meses, no ano para escolher anos, e limite o período com min/max — incluindo ano ("2026") e mês ("2026-03").',
	imports: ["import '@wrrdev/fenix-ui/calendar';"],
	demoHtml: (a) => `<fx-calendar ${a}></fx-calendar>`,
	variantsHtml: () =>
		`<fx-calendar mode="single" value="2026-08-15"></fx-calendar>\n       <fx-calendar mode="range" start="2026-08-10" end="2026-08-20"></fx-calendar>\n       <fx-calendar mode="multiple" values="2026-08-05,2026-08-12,2026-08-25"></fx-calendar>`,
	controls: [
		{
			kind: "select",
			attr: "mode",
			label: "Modo",
			options: ["single", "range", "multiple"],
			value: "single",
		},
		{ kind: "text", attr: "value", label: "value", hint: "2026-08-15" },
		{ kind: "text", attr: "start", label: "start", hint: "2026-08-10" },
		{ kind: "text", attr: "end", label: "end", hint: "2026-08-20" },
		{
			kind: "text",
			attr: "min",
			label: "min",
			hint: "2026 | 2026-03 | 2026-03-15",
		},
		{ kind: "text", attr: "max", label: "max", hint: "2026-12" },
	],
	attributes: [
		{
			name: "mode",
			type: `'single' | 'range' | 'multiple'`,
			default: `'single'`,
			desc: "Um dia, período (início/fim) ou múltiplas datas.",
		},
		{
			name: "value",
			type: "string (ISO)",
			default: "''",
			desc: "Data selecionada no modo single, ex.: 2026-08-15.",
		},
		{
			name: "start / end",
			type: "string (ISO)",
			default: "''",
			desc: "Período selecionado no modo range.",
		},
		{
			name: "values",
			type: "CSV de ISO",
			default: "''",
			desc: 'Múltiplas datas no modo multiple, ex.: values="2026-08-05,2026-08-12".',
		},
		{
			name: "min / max",
			type: "ISO parcial",
			default: "''",
			desc: 'Limites por ano ("2026"), mês ("2026-03") ou dia ("2026-03-15"). Datas fora do limite ficam desabilitadas.',
		},
		{
			name: "week-starts-on",
			type: `0 | 1`,
			default: `0`,
			desc: "Início da semana: 0 = domingo, 1 = segunda.",
		},
	],
	events: [
		{
			name: "change",
			type: `CustomEvent`,
			desc: "Composed. Detail conforme o modo: `{ value }` · `{ value, start, end }` · `{ values: string[] }`.",
		},
	],
	slots: [],
};
