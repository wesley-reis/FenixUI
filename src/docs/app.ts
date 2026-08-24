/**
 * Documentação interativa do FenixUI.
 *
 * SPA sem framework (hash routing) no
 *  - navegação lateral por componente;
 *  - playground por componente com controles ao vivo;
 *  - tabelas de API (atributos, slots, eventos);
 *  - seletor de tema (preset × modo claro/escuro) refletindo na hora,
 *    pois os componentes leem CSS Custom Properties (`--fx-*`).
 */

import '../components/button';
import '../components/badge';
import '../components/spinner';
import '../components/select';
import '../components/input';
import '../components/switch';
import '../components/table';
import '../components/checkbox';
import '../components/radio';
import '../components/floatlabel';
import '../components/multiselect';
import '../components/calendar';
import '../components/datepicker';
import '../components/textarea';
import '../components/toast';
import '../components/dialog';
import '../components/tooltip';
import '../components/tabs';
import '../components/progress';
import '../components/skeleton';
import '../components/alert';
import '../components/dropdown';
import '../components/pagination';
import '../components/autocomplete';
import '../components/drawer';
import { fenixComponentMap } from '../plugins/auto-import';
import { applyPreset, listPresets, defineCustomPreset, type FenixPreset } from '../core/presets';
import { FenixUI } from '../core/theme';
import type { DeepPartial, FenixTokens } from '../core/tokens';

/* ------------------------------------------------------------------ */
/* Tipos de metadados                                                  */
/* ------------------------------------------------------------------ */

interface ApiRow {
  name: string;
  type?: string;
  default?: string;
  desc: string;
}
interface DemoControl {
  kind: 'select' | 'toggle' | 'text';
  attr: string;
  label: string;
  options?: string[];
  value?: string | boolean;
  /** Para toggles: começa ligado. */
  on?: boolean;
  /** Para text: dica exibida no placeholder. */
  hint?: string;
}
interface ComponentDoc {
  tag: string;
  title: string;
  group: string;
  lead: string;
  imports: string[];
  demoHtml: (attrs: string) => string;
  variantsHtml?: () => string;
  controls: DemoControl[];
  attributes: ApiRow[];
  events?: ApiRow[];
  slots?: ApiRow[];
  cssVars?: ApiRow[];
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ------------------------------------------------------------------ */
/* Metadados dos componentes                                           */
/* ------------------------------------------------------------------ */

const buttonVariants = ['primary', 'secondary', 'success', 'warning', 'danger', 'outline', 'ghost'];
const badgeVariants = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];
const sizes = ['sm', 'md', 'lg'];

const components: ComponentDoc[] = [
	{
		tag: "fx-button",
		title: "Button",
		group: "Formulário",
		lead: "Botão acionável com variantes semânticas, tamanhos, ícone via slot e estado de carregamento integrado.",
		imports: ["import '@fenix-ui/fenix-ui/button';"],
		demoHtml: (a) => `<fx-button ${a}>Confirmar ação</fx-button>`,
		variantsHtml: () =>
			buttonVariants
				.map((v) => `<fx-button variant="${v}">${v}</fx-button>`)
				.join(""),
		controls: [
			{
				kind: "select",
				attr: "variant",
				label: "Variante",
				options: buttonVariants,
				value: "primary",
			},
			{
				kind: "select",
				attr: "size",
				label: "Tamanho",
				options: sizes,
				value: "md",
			},
			{
				kind: "select",
				attr: "type",
				label: "Type (formulário)",
				options: ["button", "submit", "reset"],
				value: "button",
			},
			{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
			{ kind: "toggle", attr: "loading", label: "Carregando" },
			{ kind: "toggle", attr: "full", label: "Largura total (full)" },
		],
		attributes: [
			{
				name: "variant",
				type: `'${buttonVariants.join("' | '")}'`,
				default: `'primary'`,
				desc: "Estilo visual do botão.",
			},
			{
				name: "size",
				type: `'sm' | 'md' | 'lg'`,
				default: `'md'`,
				desc: "Tamanho (altura via token, fonte e padding).",
			},
			{
				name: "type",
				type: `'button' | 'submit' | 'reset'`,
				default: `'button'`,
				desc: "Tipo do button nativo (útil em forms).",
			},
			{
				name: "full",
				type: "boolean",
				default: "false",
				desc: "Ocupa 100% da largura do container.",
			},
			{
				name: "disabled",
				type: "boolean",
				default: "false",
				desc: "Desabilita a interação e aplica estilo esmaecido.",
			},
			{
				name: "loading",
				type: "boolean",
				default: "false",
				desc: "Exibe spinner interno e impede cliques.",
			},
		],
		events: [
			{
				name: "click",
				type: "MouseEvent",
				desc: "Evento nativo de clique (suprimido quando disabled ou loading).",
			},
		],
		slots: [
			{ name: "(padrão)", desc: "Texto/rótulo do botão." },
			{
				name: "icon",
				desc: `Ícone antes do rótulo (<span slot="icon">→</span>).`,
			},
		],
	},
	{
		tag: "fx-badge",
		title: "Badge",
		group: "Exibição",
		lead: "Rótulo compacto para status, contadores e destaques. Suporta formato arredondado para números.",
		imports: ["import '@fenix-ui/fenix-ui/badge';"],
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
	},
	{
		tag: "fx-select",
		title: "Select",
		group: "Formulário",
		lead: "Dropdown customizado com hover/seleção na cor do tema, busca e limpeza. Escreva <option> nativos como filhos — são espelhados automaticamente.",
		imports: ["import '@fenix-ui/fenix-ui/select';"],
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
	},
	{
		tag: "fx-input",
		title: "Input",
		group: "Formulário",
		lead: "Campo de texto (text, number, email, password, search…) estilizado com os tokens do tema. O anel de foco é controlado pelo token effect.focus-ring do preset.",
		imports: ["import '@fenix-ui/fenix-ui/input';"],
		demoHtml: (a) => `<fx-input ${a}></fx-input>`,
		variantsHtml: () =>
			["text", "number", "email", "password", "search"]
				.map((t) => `<fx-input type="${t}" placeholder="${t}"></fx-input>`)
				.join(""),
		controls: [
			{
				kind: "select",
				attr: "type",
				label: "Tipo",
				options: [
					"text",
					"number",
					"email",
					"password",
					"search",
					"tel",
					"url",
				],
				value: "text",
			},
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
				hint: "Texto de apoio",
			},
			{ kind: "text", attr: "value", label: "Value", hint: "Valor inicial" },
			{ kind: "text", attr: "min", label: "Min (number)", hint: "ex.: 0" },
			{ kind: "text", attr: "max", label: "Max (number)", hint: "ex.: 100" },
			{ kind: "text", attr: "step", label: "Step (number)", hint: "ex.: 5" },
			{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
			{ kind: "toggle", attr: "readonly", label: "Somente leitura" },
		],
		attributes: [
			{
				name: "type",
				type: `'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url'`,
				default: `'text'`,
				desc: "Tipo do campo nativo.",
			},
			{
				name: "value",
				type: "string",
				default: "''",
				desc: "Valor do campo; reflete para o atributo ao digitar.",
			},
			{
				name: "size",
				type: `'sm' | 'md' | 'lg'`,
				default: `'md'`,
				desc: "Tamanho do campo.",
			},
			{
				name: "placeholder",
				type: "string",
				default: "''",
				desc: "Texto de apoio.",
			},
			{
				name: "disabled",
				type: "boolean",
				default: "false",
				desc: "Desabilita o campo.",
			},
			{
				name: "readonly",
				type: "boolean",
				default: "false",
				desc: "Somente leitura.",
			},
			{
				name: "min / max / step",
				type: "string",
				default: "—",
				desc: 'Restrições para type="number".',
			},
		],
		events: [
			{
				name: "input",
				type: `CustomEvent<{ value: string }>`,
				desc: "Emitido a cada tecla (composed).",
			},
			{
				name: "change",
				type: `CustomEvent<{ value: string }>`,
				desc: "Emitido ao confirmar o valor (composed).",
			},
		],
	},
	{
		tag: "fx-multiselect",
		title: "Multiselect",
		group: "Formulário",
		lead: "Seleção múltipla com chips, pesquisa e limpeza — dropdown customizado (componente separado do fx-select). Escreva <option> nativos como filhos.",
		imports: ["import '@fenix-ui/fenix-ui/multiselect';"],
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
	},
	{
		tag: "fx-switch",
		title: "Switch",
		group: "Formulário",
		lead: 'Interruptor ligado/desligado com role="switch". O texto do slot é o rótulo clicável e o anel de foco respeita o token effect.focus-ring.',
		imports: ["import '@fenix-ui/fenix-ui/switch';"],
		demoHtml: (a) => `<fx-switch ${a}>Notificações</fx-switch>`,
		variantsHtml: () => `<fx-switch>Interruptor</fx-switch>`,
		controls: [
			{
				kind: "select",
				attr: "size",
				label: "Tamanho",
				options: sizes,
				value: "md",
			},
			{ kind: "toggle", attr: "checked", label: "Ligado" },
			{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		],
		attributes: [
			{
				name: "checked",
				type: "boolean",
				default: "false",
				desc: "Estado ligado; reflete para o atributo ao clicar.",
			},
			{
				name: "disabled",
				type: "boolean",
				default: "false",
				desc: "Desabilita o interruptor.",
			},
			{
				name: "size",
				type: `'sm' | 'md' | 'lg'`,
				default: `'md'`,
				desc: "Tamanho da trilha.",
			},
		],
		events: [
			{
				name: "change",
				type: `CustomEvent<{ checked: boolean }>`,
				desc: "Emitido ao alternar (composed).",
			},
		],
		slots: [{ name: "(padrão)", desc: "Rótulo exibido ao lado da trilha." }],
	},
	{
		tag: "fx-calendar",
		title: "Calendar",
		group: "Exibição",
		lead: 'Calendário com seleção simples, por período (início/fim) ou múltiplas datas. Clique no mês para escolher meses, no ano para escolher anos, e limite o período com min/max — incluindo ano ("2026") e mês ("2026-03").',
		imports: ["import '@fenix-ui/fenix-ui/calendar';"],
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
	},
	{
		tag: "fx-datepicker",
		title: "Datepicker",
		group: "Formulário",
		lead: "Campo de data com ícone de calendário: o calendário abre em um popover ao clicar no input e a(s) data(s) selecionada(s) aparecem nele. Suporta data simples, múltiplas datas e período, herdando min/max do calendário.",
		imports: ["import '@fenix-ui/fenix-ui/datepicker';"],
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
	},
	{
		tag: "fx-checkbox",
		title: "Checkbox",
		group: "Formulário",
		lead: "Caixa de seleção com estado indeterminado. Clique ou use Espaço/Enter; emite change composto.",
		imports: ["import '@fenix-ui/fenix-ui/checkbox';"],
		demoHtml: (a) => `<fx-checkbox ${a}>Aceito os termos</fx-checkbox>`,
		variantsHtml: () =>
			["sm", "md", "lg"]
				.map((s) => `<fx-checkbox size="${s}">Size ${s}</fx-checkbox>`)
				.join(""),
		controls: [
			{ kind: "toggle", attr: "checked", label: "Checked" },
			{ kind: "toggle", attr: "indeterminate", label: "Indeterminado" },
			{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		],
		attributes: [
			{
				name: "checked",
				type: "boolean",
				default: "false",
				desc: "Marcado (é refletido no host ao clicar).",
			},
			{
				name: "indeterminate",
				type: "boolean",
				default: "false",
				desc: "Estado misto; clicar resolve para checked.",
			},
			{
				name: "disabled",
				type: "boolean",
				default: "false",
				desc: "Desabilita.",
			},
			{
				name: "value",
				type: "string",
				default: "''",
				desc: "Valor associado (via detail de change).",
			},
			{
				name: "size",
				type: `'sm' | 'md' | 'lg'`,
				default: `'md'`,
				desc: "Tamanho do controle.",
			},
		],
		events: [
			{
				name: "change",
				type: `CustomEvent<{ checked: boolean; value: string }>`,
				desc: "Émisso composto ao alternar.",
			},
		],
		slots: [{ name: "(padrão)", desc: "Rótulo ao lado da caixa." }],
	},
	{
		tag: "fx-spinner",
		title: "Spinner",
		group: "Feedback",
		lead: "Indicador de carregamento animado que herda automaticamente a cor primária do tema ativo.",
		imports: ["import '@fenix-ui/fenix-ui/spinner';"],
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
	},
	{
		tag: "fx-radio",
		title: "Radio",
		group: "Formulário",
		lead: "Botão de opção. Radios com o mesmo `name` formam um grupo de seleção exclusiva.",
		imports: ["import '@fenix-ui/fenix-ui/radio';"],
		demoHtml: (a) =>
			`<fx-radio ${a} name="gender">Masculino</fx-radio><fx-radio ${a} name="gender">Feminino</fx-radio>`,
		variantsHtml: () =>
			["sm", "md", "lg"]
				.map((s) => `<fx-radio size="${s}">S ${s}</fx-radio>`)
				.join(""),
		controls: [
			{ kind: "toggle", attr: "checked", label: "Checked" },
			{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		],
		attributes: [
			{
				name: "checked",
				type: "boolean",
				default: "false",
				desc: "Marcado (reflete no host).",
			},
			{
				name: "disabled",
				type: "boolean",
				default: "false",
				desc: "Desabilita.",
			},
			{
				name: "value",
				type: "string",
				default: "''",
				desc: "Valor associado (via detail de change).",
			},
			{
				name: "name",
				type: "string",
				default: "''",
				desc: "Grupo: radios com o mesmo name alternam exclusivamente.",
			},
			{
				name: "size",
				type: `'sm' | 'md' | 'lg'`,
				default: `'md'`,
				desc: "Tamanho do controle.",
			},
		],
		events: [
			{
				name: "change",
				type: `CustomEvent<{ checked: boolean; value: string }>`,
				desc: "Emitido quando este radio passa a ser o do grupo.",
			},
		],
		slots: [{ name: "(padrão)", desc: "Rótulo ao lado do círculo." }],
	},
	{
		tag: "fx-table",
		title: "Table",
		group: "Exibição",
		lead: "Tabela estilo DataTable com ordenação, filtro no header, paginação e clique na linha. Colunas declaradas como <fx-column> dentro do componente.",
		imports: ["import '@fenix-ui/fenix-ui/table';"],
		demoHtml: (a) => {
			const data = [
				{
					id: 1,
					nome: "Ana Souza",
					cargo: "Analista",
					departamento: "Financeiro",
					salario: 5200,
					ativo: "Sim",
				},
				{
					id: 2,
					nome: "Bruno Lima",
					cargo: "Desenvolvedor",
					departamento: "TI",
					salario: 7800,
					ativo: "Sim",
				},
				{
					id: 3,
					nome: "Carla Dias",
					cargo: "Designer",
					departamento: "Marketing",
					salario: 6100,
					ativo: "Não",
				},
				{
					id: 4,
					nome: "Diego Alves",
					cargo: "Gerente",
					departamento: "Vendas",
					salario: 9500,
					ativo: "Sim",
				},
				{
					id: 5,
					nome: "Elaine Costa",
					cargo: "Analista",
					departamento: "RH",
					salario: 4900,
					ativo: "Sim",
				},
				{
					id: 6,
					nome: "Fábio Rocha",
					cargo: "DevOps",
					departamento: "TI",
					salario: 8900,
					ativo: "Não",
				},
				{
					id: 7,
					nome: "Gisele Martins",
					cargo: "Contadora",
					departamento: "Financeiro",
					salario: 6700,
					ativo: "Sim",
				},
				{
					id: 8,
					nome: "Hugo Pereira",
					cargo: "Vendedor",
					departamento: "Vendas",
					salario: 3800,
					ativo: "Sim",
				},
				{
					id: 9,
					nome: "Ivana Ferreira",
					cargo: "Designer",
					departamento: "Marketing",
					salario: 5600,
					ativo: "Sim",
				},
				{
					id: 10,
					nome: "João Cardoso",
					cargo: "Desenvolvedor",
					departamento: "TI",
					salario: 8200,
					ativo: "Não",
				},
				{
					id: 11,
					nome: "Karina Ribeiro",
					cargo: "Recrutadora",
					departamento: "RH",
					salario: 4500,
					ativo: "Sim",
				},
				{
					id: 12,
					nome: "Lucas Moraes",
					cargo: "Suporte",
					departamento: "TI",
					salario: 3600,
					ativo: "Sim",
				},
			];
			const json = JSON.stringify(data).replace(/"/g, "&quot;");
			return `<fx-table ${a} data="${json}"><fx-column field="nome" header="Nome" sortable filterable></fx-column><fx-column field="cargo" header="Cargo" sortable filterable></fx-column><fx-column field="departamento" header="Departamento" filterable></fx-column><fx-column field="salario" header="Salário (R$)" sortable></fx-column><fx-column field="ativo" header="Ativo"></fx-column></fx-table>`;
		},
		variantsHtml: () => {
			const small = JSON.stringify([
				{ nome: "Ana Souza", cargo: "Analista", salario: 5200 },
				{ nome: "Bruno Lima", cargo: "Desenvolvedor", salario: 7800 },
				{ nome: "Carla Dias", cargo: "Designer", salario: 6100 },
				{ nome: "Diego Alves", cargo: "Gerente", salario: 9500 },
				{ nome: "Elaine Costa", cargo: "Analista", salario: 4900 },
				{ nome: "Fábio Rocha", cargo: "DevOps", salario: 8900 },
				{ nome: "Gisele Martins", cargo: "Contadora", salario: 6700 },
			]).replace(/"/g, "&quot;");
			const cols =
				'<fx-column field="nome" header="Nome"></fx-column><fx-column field="cargo" header="Cargo"></fx-column><fx-column field="salario" header="Salário"></fx-column>';
			return [
				`<h4>Básica</h4><fx-table data="${small}">${cols}</fx-table>`,
				`<h4>Ordenação + Filtro no header</h4><fx-table data="${small}" sort-field="nome" sort-order="asc"><fx-column field="nome" header="Nome" sortable filterable></fx-column><fx-column field="cargo" header="Cargo" sortable filterable></fx-column><fx-column field="salario" header="Salário" sortable></fx-column></fx-table>`,
				`<h4>Paginação centralizada</h4><fx-table data="${small}" pagination rows="3" pagination-position="center">${cols}</fx-table>`,
				`<h4>Listrada + hover + paginação à direita</h4><fx-table data="${small}" striped hover pagination rows="3" pagination-position="right">${cols}</fx-table>`,
				`<h4>Vazia com mensagem customizada</h4><fx-table data='[]' empty-message="Nenhum funcionário encontrado">${cols}</fx-table>`,
			].join("");
		},
		controls: [
			{ kind: "toggle", attr: "pagination", label: "Paginação", on: true },
			{ kind: "toggle", attr: "striped", label: "Listrada", on: true },
			{ kind: "toggle", attr: "hover", label: "Hover" },
			{
				kind: "select",
				attr: "rows",
				label: "Por página",
				options: ["3", "5", "10"],
				value: "5",
			},
			{
				kind: "select",
				attr: "pagination-position",
				label: "Posição paginação",
				options: ["left", "center", "right"],
				value: "left",
			},
		],
		attributes: [
			{
				name: "data",
				type: "array",
				default: "[]",
				desc: "Dados exibidos (JSON no atributo ou propriedade).",
			},
			{
				name: "pagination",
				type: "boolean",
				default: "false",
				desc: "Exibe paginação no footer.",
			},
			{
				name: "rows-options",
				type: "string",
				default: "'5,10,20,50'",
				desc: "Opções do seletor de itens por página.",
			},
			{
				name: "pagination-position",
				type: `'left' | 'center' | 'right'`,
				default: "'left'",
				desc: "Alinhamento do pager.",
			},
			{
				name: "empty-message",
				type: "string",
				default: "'Nenhum registro'",
				desc: "Mensagem quando não há dados.",
			},
			{
				name: "rows",
				type: "number",
				default: "10",
				desc: "Itens por página.",
			},
			{
				name: "striped",
				type: "boolean",
				default: "false",
				desc: "Linhas listradas.",
			},
			{
				name: "hover",
				type: "boolean",
				default: "false",
				desc: "Hover nas linhas.",
			},
			{
				name: "sort-field",
				type: "string",
				default: "''",
				desc: "Ordenação inicial.",
			},
			{
				name: "sort-order",
				type: `'asc' | 'desc' | ''`,
				default: "''",
				desc: "Direção inicial.",
			},
		],
		events: [
			{
				name: "sort-change",
				type: `CustomEvent<{ field: string; direction: 'asc' | 'desc' }>`,
				desc: "Ao ordenar.",
			},
			{
				name: "filter-change",
				type: `CustomEvent<{ field: string; value: string }>`,
				desc: "Ao filtrar uma coluna.",
			},
			{
				name: "page-change",
				type: `CustomEvent<{ page: number; rows: number }>`,
				desc: "Ao trocar de página.",
			},
			{
				name: "row-click",
				type: `CustomEvent<{ row: any; index: number }>`,
				desc: "Clique na linha.",
			},
		],
		slots: [
			{
				name: "header[slot]",
				desc: "Slot de header customizado por coluna (via <fx-column>).",
			},
			{ name: "body[slot]", desc: "Slot de célula customizado." },
		],
	},
	{
		tag: "fx-floatlabel",
		title: "FloatLabel",
		group: "Formulário",
		lead: "Rótulo flutuante  comporta-se como placeholder quando vazio e sobe para o topo do campo ao focar, abrir ou preencher valor.",
		imports: ["import '@fenix-ui/fenix-ui/floatlabel';"],
		demoHtml: (a) =>
			`<fx-floatlabel ${a}><fx-input id="demo-fl-input"></fx-input><label for="demo-fl-input">Nome de usuário</label></fx-floatlabel>`,
		variantsHtml: () =>
			`<div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start;">
        <fx-floatlabel><fx-input id="fl-nome"></fx-input><label for="fl-nome">Nome</label></fx-floatlabel>
        <fx-floatlabel variant="in"><fx-input id="fl-email"></fx-input><label for="fl-email">E-mail</label></fx-floatlabel>
        <fx-floatlabel variant="over"><fx-input id="fl-tel"></fx-input><label for="fl-tel">Telefone</label></fx-floatlabel>
        <fx-floatlabel error><fx-input id="fl-err" value="valor inválido"></fx-input><label for="fl-err">Campo com erro</label></fx-floatlabel>
      </div>`,
		controls: [
			{
				kind: "select",
				attr: "variant",
				label: "Variante",
				options: ["on", "in", "over"],
			},
			{ kind: "toggle", attr: "error", label: "Erro" },
		],
		attributes: [
			{
				name: "variant",
				type: `'on' | 'in' | 'over'`,
				default: `'on'`,
				desc: 'Posição da label: "on" (borda, padrão), "in" (placeholder interno), "over" (acima do campo).',
			},
			{
				name: "error / invalid",
				type: "boolean",
				default: "false",
				desc: "Indica estado de erro (rótulo e borda em vermelho).",
			},
			{
				name: "success / valid",
				type: "boolean",
				default: "false",
				desc: "Indica estado de sucesso (rótulo e borda em verde).",
			},
			{
				name: "active",
				type: "boolean",
				default: "false",
				desc: "Refletido automaticamente quando o campo contém valor, foco ou dropdown aberto.",
			},
		],
		events: [],
		slots: [
			{
				name: "(padrão)",
				desc: "Contém exatamente um campo de controle (fx-input, fx-select, etc.) e um <label>.",
			},
		],
	},
	{
		tag: "fx-textarea",
		title: "Textarea",
		group: "Formulário",
		lead: "Campo de texto multilinha com validação visual e tamanhos padronizados.",
		imports: ["import '@fenix-ui/fenix-ui/textarea';"],
		demoHtml: (a) =>
			`<fx-textarea ${a} placeholder="Descreva sua necessidade..."></fx-textarea>`,
		variantsHtml: () =>
			'<h4>Tamanhos</h4><div style="display:flex;gap:12px"><fx-textarea size="sm" placeholder="sm"></fx-textarea><fx-textarea size="md" placeholder="md"></fx-textarea><fx-textarea size="lg" placeholder="lg"></fx-textarea></div><h4>Estados</h4><fx-textarea disabled value="Desabilitado"></fx-textarea><fx-textarea readonly value="Somente leitura"></fx-textarea>',
		controls: [
			{
				kind: "select",
				attr: "size",
				label: "Tamanho",
				options: ["sm", "md", "lg"],
			},
			{ kind: "text", attr: "rows", label: "Linhas", value: "4" },
			{ kind: "text", attr: "maxlength", label: "Máx. caracteres" },
			{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
			{ kind: "toggle", attr: "readonly", label: "Somente leitura" },
		],
		attributes: [
			{
				name: "value",
				type: "string",
				default: "''",
				desc: "Texto do campo.",
			},
			{
				name: "size",
				type: `'sm' | 'md' | 'lg'`,
				default: "'md'",
				desc: "Tamanho.",
			},
			{
				name: "rows",
				type: "number",
				default: "4",
				desc: "Altura em linhas.",
			},
			{
				name: "maxlength",
				type: "number",
				default: "—",
				desc: "Limite de caracteres.",
			},
			{
				name: "placeholder / disabled / readonly",
				type: "string | boolean",
				default: "—",
				desc: "Padrões de formulário.",
			},
		],
		events: [
			{
				name: "input",
				type: `CustomEvent<{ value: string }>`,
				desc: "Ao digitar.",
			},
			{
				name: "change",
				type: `CustomEvent<{ value: string }>`,
				desc: "Ao concluir a edição.",
			},
		],
	},
	{
		tag: "fx-dialog",
		title: "Dialog",
		group: "Feedback",
		lead: "Janela modal com overlay, título e fechamento por ESC/clique fora. Controle o estado pelo atributo open.",
		imports: ["import '@fenix-ui/fenix-ui/dialog';"],
		demoHtml: () =>
			`<fx-dialog id="dlg-demo" heading="Confirmar exclusão" size="md"><p style="margin:0">Tem certeza que deseja excluir este registro?</p><div slot="footer" style="display:flex;gap:8px;justify-content:flex-end"><fx-button size="sm" variant="outline" onclick="document.getElementById('dlg-demo').removeAttribute('open')">Cancelar</fx-button><fx-button size="sm" variant="danger" onclick="document.getElementById('dlg-demo').removeAttribute('open')">Excluir</fx-button></div></fx-dialog><fx-button onclick="document.getElementById('dlg-demo').setAttribute('open','')">Abrir dialog</fx-button>`,
		variantsHtml: () => {
			const mk = (id: string, size: string) =>
				`<fx-dialog id="${id}" heading="Diálogo ${size}" size="${size}"><p style="margin:0">Conteúdo de exemplo.</p></fx-dialog>`;
			return `${mk("dlg-s", "sm")}${mk("dlg-l", "lg")}<div style="display:flex;gap:12px"><fx-button size="sm" onclick="document.getElementById('dlg-s').setAttribute('open','')">Pequeno</fx-button><fx-button size="sm" onclick="document.getElementById('dlg-l').setAttribute('open','')">Grande</fx-button></div>`;
		},
		controls: [
			{
				kind: "select",
				attr: "size",
				label: "Tamanho",
				options: ["sm", "md", "lg"],
				value: "md",
			},
		],
		attributes: [
			{
				name: "open",
				type: "boolean",
				default: "false",
				desc: "Exibe o dialog.",
			},
			{
				name: "heading",
				type: "string",
				default: "''",
				desc: "Título da janela.",
			},
			{
				name: "size",
				type: `'sm' | 'md' | 'lg'`,
				default: "'md'",
				desc: "Largura máxima.",
			},
		],
		events: [
			{ name: "open", type: "CustomEvent<void>", desc: "Ao abrir." },
			{
				name: "close",
				type: "CustomEvent<void>",
				desc: "Ao fechar (ESC, overlay ou botão).",
			},
		],
		slots: [
			{ name: "(padrão)", desc: "Corpo do diálogo." },
			{ name: "footer", desc: "Ações (botões)." },
		],
	},
	{
		tag: "fx-toast",
		title: "Toast",
		group: "Feedback",
		lead: "Notificações flutuantes imperativas com posição e tempo de exibição configuráveis.",
		imports: ["import '@fenix-ui/fenix-ui/toast';"],
		demoHtml: (a) => {
			const pos = /position="([^"]+)"/.exec(a)?.[1] ?? "top-right";
			const dur = /duration="([^"]+)"/.exec(a)?.[1] ?? "4000";
			const title = /title="([^"]*)"/.exec(a)?.[1] || "Sucesso";
			const msg = /message="([^"]*)"/.exec(a)?.[1] || "Registro salvo.";
			const o = `{position:'${pos}',duration:${dur || "0"}}`;
			return `<div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button variant="success" size="sm" onclick="FenixToast.success('${title}','${msg}',${o})">Success</fx-button><fx-button variant="danger" size="sm" onclick="FenixToast.error('${title}','${msg}',${o})">Error</fx-button><fx-button variant="warning" size="sm" onclick="FenixToast.warning('${title}','${msg}',${o})">Warning</fx-button><fx-button variant="secondary" size="sm" onclick="FenixToast.info('${title}','${msg}',${o})">Info</fx-button></div>`;
		},
		variantsHtml: () =>
			`<h4>Cada posição na tela</h4><div style="display:flex;gap:12px;flex-wrap:wrap">${["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"].map((p) => `<fx-button size="sm" variant="secondary" onclick="FenixToast.info('Posição: ${p}','Notificação de exemplo.',{position:'${p}',duration:3500})">${p}</fx-button>`).join("")}</div><h4>Duração customizada</h4><div style="display:flex;gap:12px;flex-wrap:wrap"><fx-button size="sm" onclick="FenixToast.warning('Fixo até fechar','duration: 0',{position:'bottom-center',duration:0})">duration: 0 (fixo)</fx-button><fx-button size="sm" onclick="FenixToast.success('Rápido','some em 1,5s',{position:'bottom-center',duration:1500})">duration: 1500</fx-button></div>`,
		controls: [
			{
				kind: "select",
				attr: "position",
				label: "Posição",
				options: [
					"top-right",
					"top-center",
					"top-left",
					"bottom-right",
					"bottom-center",
					"bottom-left",
				],
				value: "top-right",
			},
			{
				kind: "text",
				attr: "duration",
				label: "Duração em ms (0 = fixo, mín. 1000)",
				value: "4000",
			},
			{
				kind: "text",
				attr: "title",
				label: "Título",
				value: "Operação concluída",
			},
			{
				kind: "text",
				attr: "message",
				label: "Mensagem",
				value: "Os dados foram salvos com sucesso.",
			},
		],
		attributes: [
			{
				name: "(API)",
				type: "FenixToast",
				default: "—",
				desc: "success/error/warning/info(title, message?, options?).",
			},
			{
				name: "options.position",
				type: `'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'`,
				default: "'top-right'",
				desc: "Região da tela onde empilha.",
			},
			{
				name: "options.duration",
				type: "number",
				default: "4000",
				desc: "Ms até dispensar. Mínimo 1000ms; 0 = fixo até fechar.",
			},
			{
				name: "(retorno)",
				type: "number",
				default: "—",
				desc: "Id do toast para FenixToast.close(id).",
			},
		],
	},
	{
		tag: "fx-tooltip",
		title: "Tooltip",
		group: "Feedback",
		lead: "Dica contextual que aparece ao passar o mouse ou focar no elemento filho.",
		imports: ["import '@fenix-ui/fenix-ui/tooltip';"],
		demoHtml: (a) =>
			`<fx-tooltip ${a}><fx-button size="sm">Passe o mouse</fx-button></fx-tooltip>`,
		variantsHtml: () =>
			`<div style="display:flex;gap:24px;flex-wrap:wrap;padding:20px 10px 40px"><fx-tooltip content="Acima" position="top"><fx-badge>top</fx-badge></fx-tooltip><fx-tooltip content="Abaixo" position="bottom"><fx-badge>bottom</fx-badge></fx-tooltip><fx-tooltip content="Esquerda" position="left"><fx-badge>left</fx-badge></fx-tooltip><fx-tooltip content="Direita" position="right"><fx-badge>right</fx-badge></fx-tooltip></div>`,
		controls: [
			{
				kind: "text",
				attr: "content",
				label: "Conteúdo",
				value: "Texto da dica",
			},
			{
				kind: "select",
				attr: "position",
				label: "Posição",
				options: ["top", "bottom", "left", "right"],
				value: "top",
			},
		],
		attributes: [
			{
				name: "content",
				type: "string",
				default: "''",
				desc: "Texto exibido.",
			},
			{
				name: "position",
				type: `'top' | 'bottom' | 'left' | 'right'`,
				default: "'top'",
				desc: "Posição relativa ao alvo.",
			},
		],
	},
	{
		tag: "fx-tabs",
		title: "Tabs",
		group: "Navegação",
		lead: 'Navegação por abas: <fx-tab tab="id"> para títulos e <fx-tab-panel tab="id"> para conteúdo (dentro ou logo após o fx-tabs).',
		imports: ["import '@fenix-ui/fenix-ui/tabs';"],
		demoHtml: (a) =>
			`<fx-tabs ${a}><fx-tab tab="perfil">Perfil</fx-tab><fx-tab tab="seguranca">Segurança</fx-tab><fx-tab tab="notificacoes">Notificações</fx-tab><fx-tab-panel tab="perfil"><p style="margin:8px 0">Dados do perfil do usuário.</p></fx-tab-panel><fx-tab-panel tab="seguranca"><p style="margin:8px 0">Senha e autenticação em dois fatores.</p></fx-tab-panel><fx-tab-panel tab="notificacoes"><p style="margin:8px 0">Preferências de notificação.</p></fx-tab-panel></fx-tabs>`,
		variantsHtml: () => {
			const p = (id: string, txt: string) =>
				`<fx-tab-panel tab="${id}"><p style="margin:8px 0">${txt}</p></fx-tab-panel>`;
			return [
				`<h4>Básica</h4><fx-tabs><fx-tab tab="a">Conta</fx-tab><fx-tab tab="b">Pedidos</fx-tab>${p("a", "Seus dados de conta.")}${p("b", "Histórico de pedidos.")}</fx-tabs>`,
				`<h4>Aba desabilitada</h4><fx-tabs value="vis"><fx-tab tab="vis">Visível</fx-tab><fx-tab tab="bloq" disabled>Bloqueada</fx-tab>${p("vis", "A segunda aba não pode ser aberta.")}${p("bloq", "Sem acesso.")}</fx-tabs>`,
				`<h4>Aba pré-selecionada</h4><fx-tabs value="c"><fx-tab tab="a">Resumo</fx-tab><fx-tab tab="b">Detalhes</fx-tab><fx-tab tab="c">Anexos</fx-tab>${p("a", "Resumo do processo.")}${p("b", "Detalhes técnicos.")}${p("c", "3 arquivos anexados.")}</fx-tabs>`,
				`<h4>Painéis fora do fx-tabs (irmãos)</h4><div><fx-tabs><fx-tab tab="x">Esquerda</fx-tab><fx-tab tab="y">Direita</fx-tab></fx-tabs>${p("x", "Painéis declarados como irmãos também funcionam.")}${p("y", "Útil para layouts customizados.")}</div>`,
			].join("");
		},
		controls: [
			{
				kind: "select",
				attr: "value",
				label: "Aba ativa (tab id)",
				options: ["perfil", "seguranca", "notificacoes"],
				value: "perfil",
			},
		],
		attributes: [
			{
				name: "value",
				type: "string",
				default: "'primeira aba'",
				desc: "Tab ativa.",
			},
		],
		events: [
			{
				name: "change",
				type: `CustomEvent<{ value: string }>`,
				desc: "Ao trocar de aba.",
			},
		],
	},
	{
		tag: "fx-progress",
		title: "Progress",
		group: "Feedback",
		lead: "Indicador de progresso determinado ou indeterminado, com variantes semânticas.",
		imports: ["import '@fenix-ui/fenix-ui/progress';"],
		demoHtml: (a) => `<fx-progress ${a}></fx-progress>`,
		variantsHtml: () =>
			`<h4>Determinado</h4><fx-progress value="30"></fx-progress><fx-progress value="65"></fx-progress><h4>Com rótulo e variantes</h4><fx-progress value="80" label="Upload" variant="success"></fx-progress><fx-progress value="45" label="Processando" variant="warning"></fx-progress>`,
		controls: [
			{ kind: "text", attr: "value", label: "Valor (%)", value: "60" },
			{
				kind: "select",
				attr: "variant",
				label: "Variante",
				options: ["", "success", "warning", "danger"],
			},
			{ kind: "text", attr: "label", label: "Rótulo" },
			{ kind: "toggle", attr: "indeterminate", label: "Indeterminado" },
		],
		attributes: [
			{
				name: "value",
				type: "number",
				default: "0",
				desc: "Percentual concluído (0-100).",
			},
			{
				name: "variant",
				type: `'' | 'success' | 'warning' | 'danger'`,
				default: "''",
				desc: "Cor.",
			},
			{
				name: "label",
				type: "string",
				default: "''",
				desc: "Rótulo acima da barra.",
			},
			{
				name: "indeterminate",
				type: "boolean",
				default: "false",
				desc: "Animação sem valor definido.",
			},
		],
		events: [
			{
				name: "complete",
				type: "CustomEvent<void>",
				desc: "Quando chega a 100%.",
			},
		],
	},
	{
		tag: "fx-skeleton",
		title: "Skeleton",
		group: "Feedback",
		lead: "Placeholder animado para carregamento: texto, círculo, retângulo ou múltiplas linhas.",
		imports: ["import '@fenix-ui/fenix-ui/skeleton';"],
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
	},
	{
		tag: "fx-alert",
		title: "Alert",
		group: "Feedback",
		lead: "Aviso inline com variantes semânticas, título opcional e possibilidade de dispensar.",
		imports: ["import '@fenix-ui/fenix-ui/alert';"],
		demoHtml: (a) =>
			`<fx-alert ${a}>Operação concluída com sucesso.</fx-alert>`,
		variantsHtml: () =>
			`<fx-alert variant="info" title="Informação">Nova versão disponível.</fx-alert><fx-alert variant="success" title="Sucesso">Dados salvos.</fx-alert><fx-alert variant="warning" title="Atenção" dismissible>Seu contrato vence em 5 dias.</fx-alert><fx-alert variant="danger" title="Erro">Não foi possível processar.</fx-alert>`,
		controls: [
			{
				kind: "select",
				attr: "variant",
				label: "Variante",
				options: ["info", "success", "warning", "danger"],
			},
			{ kind: "text", attr: "title", label: "Título" },
			{ kind: "toggle", attr: "dismissible", label: "Dispensável" },
		],
		attributes: [
			{
				name: "variant",
				type: `'info' | 'success' | 'warning' | 'danger'`,
				default: "'info'",
				desc: "Cor semântica.",
			},
			{
				name: "title",
				type: "string",
				default: "''",
				desc: "Título em negrito.",
			},
			{
				name: "dismissible",
				type: "boolean",
				default: "false",
				desc: "Botão de fechar.",
			},
		],
		events: [
			{
				name: "dismiss",
				type: "CustomEvent<void>",
				desc: "Ao fechar o alerta.",
			},
		],
	},
	{
		tag: "fx-drawer",
		title: "Drawer",
		group: "Feedback",
		lead: "Painel deslizante sobre a página com overlay desfocado e abertura/fechamento animado deslizando da borda configurada por position. Posição left/right/top/bottom, tamanho mínimo fixo e expansível via CSS, header com título e botão fechar, conteúdo livre por slot.",
		imports: ["import '@fenix-ui/fenix-ui/drawer';"],
		demoHtml: (a) => {
			const m = /position="([a-z]+)"/.exec(a);
			const pos = m ? m[1] : "right";
			const isOpen = /open/.test(a);
			const rest = a
				.replace(/ position="[a-z]+"/g, "")
				.replace(/(^| )open(="")?( |$)/g, " ")
				.trim();
			const drawer = `<fx-drawer id="drw-demo" position="${pos}"${isOpen ? " open" : ""}${rest ? " " + rest : ""}><p style="margin:0 0 12px">Conteúdo <strong>livre</strong>: formulários, filtros, listas…</p></fx-drawer>`;
			const btn = isOpen
				? ""
				: `<fx-button data-fx-open="drw-demo">Abrir drawer (${pos})</fx-button>`;
			return drawer + btn;
		},
		variantsHtml: () => {
			const body =
				'<p style="padding:0;margin:0 0 8px">Conteúdo do drawer.</p>';
			const mk = (id: string, pos: string, title: string) =>
				`<fx-drawer id="${id}" position="${pos}" title="${title}">${body}</fx-drawer><fx-button size="sm" data-fx-open="${id}">${pos.toUpperCase()}</fx-button>`;
			return `<div style="display:flex;gap:12px;flex-wrap:wrap">${mk("drw-l", "left", "Filtros")}${mk("drw-r", "right", "Detalhes")}${mk("drw-t", "top", "Notificações")}${mk("drw-b", "bottom", "Carrinho")}</div>`;
		},
		controls: [
			{
				kind: "select",
				attr: "position",
				label: "Posição",
				options: ["right", "left", "top", "bottom"],
				value: "right",
			},
			{ kind: "text", attr: "title", label: "Título", value: "Meu painel" },
		],
		attributes: [
			{
				name: "open",
				type: "boolean",
				default: "false",
				desc: "Exibe o drawer.",
			},
			{
				name: "position",
				type: `'left' | 'right' | 'top' | 'bottom'`,
				default: "'right'",
				desc: "Lado de origem. Left/right ocupam a altura total; top/bottom a largura total.",
			},
			{
				name: "title",
				type: "string",
				default: "''",
				desc: "Título no cabeçalho (com botão fechar).",
			},
		],
		cssVars: [
			{
				name: "--fx-drawer-width",
				default: "360px",
				desc: "Largura nos modos left/right (mín. 300px, máx. 90vw).",
			},
			{
				name: "--fx-drawer-height",
				default: "280px",
				desc: "Altura nos modos top/bottom (mín. 180px, máx. 85vh).",
			},
		],
		events: [
			{ name: "open", type: "Event", desc: "Ao abrir." },
			{
				name: "close",
				type: `CustomEvent`,
				desc: "Fechar por ✕, clique no overlay ou ESC.",
			},
		],
		slots: [{ name: "padrão", desc: "Conteúdo livre do painel." }],
	},
	{
		tag: "fx-dropdown",
		title: "Dropdown",
		group: "Navegação",
		lead: 'Menu de ações disparado por botão. Itens como <fx-dropdown-item value="...">.',
		imports: ["import '@fenix-ui/fenix-ui/dropdown';"],
		demoHtml: (a) =>
			`<fx-dropdown ${a}><fx-dropdown-item value="edit">Editar</fx-dropdown-item><fx-dropdown-item value="dup">Duplicar</fx-dropdown-item><fx-dropdown-item value="del">Excluir</fx-dropdown-item></fx-dropdown>`,
		variantsHtml: () =>
			`<div style="display:flex;gap:32px;padding-bottom:70px"><fx-dropdown label="Esquerda" position="left"><fx-dropdown-item value="a">Opção A</fx-dropdown-item><fx-dropdown-item value="b">Opção B</fx-dropdown-item></fx-dropdown><fx-dropdown label="Centro" position="center"><fx-dropdown-item value="a">Opção A</fx-dropdown-item><fx-dropdown-item value="b">Opção B</fx-dropdown-item></fx-dropdown><fx-dropdown label="Direita" position="right"><fx-dropdown-item value="a">Opção A</fx-dropdown-item><fx-dropdown-item value="b">Opção B</fx-dropdown-item></fx-dropdown></div>`,
		controls: [
			{
				kind: "text",
				attr: "label",
				label: "Rótulo do botão",
				value: "Ações",
			},
			{
				kind: "select",
				attr: "position",
				label: "Alinhamento",
				options: ["left", "center", "right"],
				value: "left",
			},
		],
		attributes: [
			{
				name: "label",
				type: "string",
				default: "''",
				desc: "Texto do botão gatilho.",
			},
			{
				name: "position",
				type: `'left' | 'center' | 'right'`,
				default: "'left'",
				desc: "Alinhamento do menu.",
			},
			{
				name: "open",
				type: "boolean",
				default: "false",
				desc: "Menu aberto (refletido).",
			},
		],
		events: [
			{
				name: "select",
				type: `CustomEvent<{ value: string }>`,
				desc: "Ao escolher um item.",
			},
		],
	},
	{
		tag: "fx-pagination",
		title: "Pagination",
		group: "Navegação",
		lead: "Paginação standalone com seletor de itens por página e alinhamento configurável.",
		imports: ["import '@fenix-ui/fenix-ui/pagination';"],
		demoHtml: (a) => `<fx-pagination ${a}></fx-pagination>`,
		variantsHtml: () =>
			`<h4>Alinhamentos</h4><fx-pagination total="120" rows="10" page="1" position="left"></fx-pagination><fx-pagination total="120" rows="10" page="3" position="center"></fx-pagination><fx-pagination total="120" rows="10" page="7" position="right"></fx-pagination>`,
		controls: [
			{ kind: "text", attr: "total", label: "Total de itens", value: "87" },
			{
				kind: "select",
				attr: "rows",
				label: "Por página",
				options: ["5", "10", "20"],
				value: "10",
			},
			{ kind: "text", attr: "page", label: "Página inicial", value: "2" },
			{
				kind: "select",
				attr: "position",
				label: "Alinhamento",
				options: ["left", "center", "right"],
			},
		],
		attributes: [
			{ name: "page", type: "number", default: "1", desc: "Página atual." },
			{
				name: "total",
				type: "number",
				default: "0",
				desc: "Total de itens.",
			},
			{
				name: "rows",
				type: "number",
				default: "10",
				desc: "Itens por página.",
			},
			{
				name: "rows-options",
				type: "string",
				default: "'5,10,20,50'",
				desc: "Opções do seletor.",
			},
			{
				name: "position",
				type: `'left' | 'center' | 'right'`,
				default: "'left'",
				desc: "Alinhamento.",
			},
		],
		events: [
			{
				name: "page-change",
				type: `CustomEvent<{ page: number; rows: number }>`,
				desc: "Ao mudar página ou rows.",
			},
		],
	},
	{
		tag: "fx-autocomplete",
		title: "Autocomplete",
		group: "Formulário",
		lead: "Campo de busca com sugestões filtradas conforme digitação (source local).",
		imports: ["import '@fenix-ui/fenix-ui/autocomplete';"],
		demoHtml: (a) =>
			`<fx-autocomplete ${a} source='["Brasil","Argentina","Chile","Colômbia","Peru","Uruguai"]' placeholder="Digite um país..."></fx-autocomplete>`,
		variantsHtml: () =>
			`<fx-autocomplete source='["Ana Souza","Bruno Lima","Carla Dias"]' placeholder="Funcionários..." min-chars="1"></fx-autocomplete>`,
		controls: [
			{
				kind: "select",
				attr: "size",
				label: "Tamanho",
				options: ["sm", "md", "lg"],
			},
			{
				kind: "text",
				attr: "placeholder",
				label: "Placeholder",
				value: "Buscar...",
			},
			{
				kind: "text",
				attr: "min-chars",
				label: "Mín. caracteres",
				value: "2",
			},
			{ kind: "toggle", attr: "disabled", label: "Desabilitado" },
		],
		attributes: [
			{
				name: "value",
				type: "string",
				default: "''",
				desc: "Valor selecionado.",
			},
			{
				name: "source",
				type: "string[] (JSON)",
				default: "[]",
				desc: "Opções filtráveis.",
			},
			{
				name: "min-chars",
				type: "number",
				default: "2",
				desc: "Mínimo para sugerir.",
			},
		],
		events: [
			{
				name: "select",
				type: `CustomEvent<{ value: string }>`,
				desc: "Ao escolher uma sugestão.",
			},
		],
	},
];

/* ------------------------------------------------------------------ */
/* Helpers de renderização                                             */
/* ------------------------------------------------------------------ */

function codeBlock(code: string): string {
  return `<div class="code-block"><pre><code>${esc(code)}</code></pre><button class="copy-btn">Copiar</button></div>`;
}

/** Formata HTML em múltiplas linhas com indentação para facilitar a leitura. */
const VOID_TAGS = /^(input|br|hr|img|meta|link)\b/i;
export function formatHtml(src: string): string {
  const tokens = src
    .trim()
    .replace(/>\s+</g, '><')
    .match(/<[^>]+>|[^<]+/g);
  if (!tokens) return src;
  const lines: string[] = [];
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    const pad = '  '.repeat(depth);
    if (tk.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      lines.push('  '.repeat(depth) + tk);
      continue;
    }
    if (!tk.startsWith('<')) {
      const text = tk.trim();
      if (text) lines.push(pad + text);
      continue;
    }
    // tag de abertura
    const name = (tk.match(/^<([a-zA-Z-]+)/)?.[1] ?? '').toLowerCase();
    const isVoid = VOID_TAGS.test(name) || tk.endsWith('/>');
    const next = tokens[i + 1];
    if (!isVoid && next === `</${name}>`) {
      // elemento com conteúdo simples abre e fecha na mesma linha
      lines.push(`${pad}${tk}${next}`);
      i++;
      continue;
    }
    lines.push(pad + tk);
    if (!isVoid) depth++;
  }
  return lines.join('\n');
}


function apiTable(title: string, rows: ApiRow[], cols: string[]): string {
  const head = cols.map((c) => `<th>${c}</th>`).join('');
  const body = rows
    .map((r) => {
      const cells = [
        `<td><code class="inline">${esc(r.name)}</code></td>`,
        r.type ? `<td class="type">${esc(r.type)}</td>` : '<td>—</td>',
        r.default ? `<td class="default">${esc(r.default)}</td>` : '<td>—</td>',
        `<td>${r.desc}</td>`,
      ];
      return `<tr>${cells.filter((_, i) => cols[i]).join('')}</tr>`;
    })
    .join('');
  return `<h3>${title}</h3><table class="api"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function buildControls(doc: ComponentDoc): string {
  return doc.controls
    .map((c) => {
      if (c.kind === 'select') {
        const opts = c.options!
          .map((o) => `<option value="${o}" ${o === c.value ? 'selected' : ''}>${o}</option>`)
          .join('');
        return `<label>${c.label}: <fx-select data-attr="${c.attr}" value="${c.value}">${opts}</fx-select></label>`;
      }
      if (c.kind === 'text') {
        return `<label>${c.label}: <fx-input data-attr="${c.attr}" placeholder="${c.hint ?? ''}"></fx-input></label>`;
      }
      return `<fx-switch data-attr="${c.attr}" size="sm" ${c.on ? 'checked' : ''}>${c.label}</fx-switch>`;
    })
    .join('');
}

function currentAttrs(doc: ComponentDoc): string {
  return doc.controls
    .map((c) => {
      if (c.kind === 'select') {
        const sel = document.querySelector(`fx-select[data-attr="${c.attr}"]`) as any;
        return `${c.attr}="${sel?.value ?? c.value}"`;
      }
      if (c.kind === 'text') {
        const inp = document.querySelector(`fx-input[data-attr="${c.attr}"]`) as any;
        const v = inp?.value ?? '';
        return v ? `${c.attr}="${v}"` : '';
      }
      const sw = document.querySelector(`fx-switch[data-attr="${c.attr}"]`) as any;
      return sw?.checked ? c.attr : '';
    })
    .filter(Boolean)
    .join(' ');
}

function wireCopyButtons(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.parentElement!.querySelector('code')!.textContent ?? '');
      btn.textContent = 'Copiado!';
      setTimeout(() => (btn.textContent = 'Copiar'), 1200);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Páginas: Introdução e Theming                                       */
/* ------------------------------------------------------------------ */

function renderIntro(): void {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>Introdução</h2>
    <p class="lead">FenixUI é um Design System de <strong>Web Components nativos</strong> — funciona com
    qualquer framework (ou sem nenhum). Cada componente é importável isoladamente, então o bundle do
    cliente contém apenas o que ele usa.</p>
    <h3>Instalação</h3>
    ${codeBlock('npm install @fenix-ui/fenix-ui')}
    <h3>Uso básico</h3>
    ${codeBlock("import '@fenix-ui/fenix-ui/button';\nimport { FenixUI } from '@fenix-ui/fenix-ui';\n\nFenixUI.theme('dark');")}
    <h3>Componentes</h3>
    <div class="demo"><div class="demo-stage">
      <fx-button variant="primary">Button</fx-button>
      <fx-badge variant="success">Badge</fx-badge>
      <fx-spinner></fx-spinner>
    </div></div>
    <p>Consulte cada componente no menu lateral para exemplos interativos e API completa.</p>
  `;
  wireCopyButtons(main);
}

function renderTheming(): void {
  const main = document.getElementById('main')!;
  const presetsList = listPresets()
    .map((p) => `<option value="${p.name}">${p.label}</option>`)
    .join('');
  main.innerHTML = `
    <h2>Temas</h2>
    <p class="lead">Todo o visual é dirigido por Design Tokens expostos como CSS Custom Properties
    (<code class="inline">--fx-*</code>) no <code class="inline">:root</code>. Trocar de tema em runtime
    atualiza todos os componentes instantaneamente — inclusive dentro do Shadow DOM.</p>
    <h3>Presets prontos (Cavaleiros do Zodíaco)</h3>
    <p>Escolha um preset e o modo no topo da página — a mudança reflete em toda a documentação imediatamente.
    Qualquer preset pode ser usado diretamente na sua aplicação:</p>
    <div class="demo"><div class="demo-controls" style="border:none">
      <label>Preset: <fx-select id="th-preset">${presetsList}</fx-select></label>
      <label>Modo: <fx-select id="th-mode"><option value="light">light</option><option value="dark">dark</option></fx-select></label>
    </div></div>
    ${codeBlock(`import { applyPreset } from '@fenix-ui/fenix-ui';

// Presets disponíveis:
applyPreset('fenix',  'light'); // padrão (indigo)
applyPreset('seiya',  'light'); // rose/coral
applyPreset('shiryu', 'dark');  // teal/esmeralda
applyPreset('hyoga',  'light'); // azul-gelo
applyPreset('shun',   'dark');  // magenta, cantos em pílula
applyPreset('ikki',   'light'); // laranja fogo, cantos retos
applyPreset('aiolia', 'dark');  // âmbar/dourado`)}

    <h4>Usar um tema como base e mudar só o que quiser</h4>
    <p>O preset define o ponto de partida; depois, sobrescreva apenas os tokens desejados
    (merge profundo — nada do que não for informado é alterado):</p>
    ${codeBlock(`import { applyPreset, FenixUI } from '@fenix-ui/fenix-ui';

// Base Shiryu (teal)…
applyPreset('shiryu', 'dark');
// …mas com a cor primária e o raio da sua marca:
FenixUI.setTokens({
  color: { primary: '#8b5cf6' },
  radius: { md: '16px' },
});`)}
    <h3>Preview dos componentes neste tema</h3>
    <p>Troque o preset acima e veja botões, campos e seletores repintarem na hora.</p>
    <div class="demo"><div class="demo-stage" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
      <fx-button variant="primary">Primário</fx-button>
      <fx-button variant="secondary">Secundário</fx-button>
      <fx-button variant="danger">Perigo</fx-button>
      <fx-button variant="outline">Outline</fx-button>
      <fx-badge variant="success">Ativo</fx-badge>
      <fx-spinner></fx-spinner>
      <fx-input placeholder="Nome completo"></fx-input>
      <fx-input type="number" placeholder="Idade"></fx-input>
      <fx-select><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option></fx-select>
      <fx-switch>Notificações</fx-switch>
    </div></div>
    <h3>Tudo que pode ser personalizado</h3>
    <p>Cada grupo abaixo é um conjunto de CSS Custom Properties (<code class="inline">--fx-*</code>) que
    os componentes consomem. No preset, sobrescreva <strong>apenas o que quiser</strong> — o restante
    herda do tema base (claro ou escuro) automaticamente.</p>
    ${apiTable(
      'Grupos de tokens',
      [
        { name: 'color', type: 'primary, secondary, success, warning, danger, info', default: 'paleta indigo', desc: 'Cores semânticas usadas por todos os componentes.' },
        { name: 'surface', type: 'background, surface, surface-hover', default: 'branco / cinza-50', desc: 'Fundos de página, campos e estados hover.' },
        { name: 'text', type: 'default, muted, disabled', default: 'slate-900/500/400', desc: 'Cores de texto e placeholders.' },
        { name: 'border', type: 'default, hover', default: 'cinza-200/300', desc: 'Bordas de campos, cards e divisores.' },
        { name: 'font', type: 'family, size, weight, line-height', default: 'Inter 14px 500', desc: 'Tipografia global.' },
        { name: 'space', type: 'xs…xl', default: '4–24px', desc: 'Espaçamentos internos.' },
        { name: 'radius', type: 'none, sm, md, lg, full', default: '0–9999px', desc: 'Arredondamento (botões, campos, badges…).' },
        { name: 'size', type: 'sm, md, lg', default: '32 / 40 / 48px', desc: 'Altura dos controles (button, input, select, multiselect) — personalize a escala de tamanhos no preset.' },
        { name: 'shadow', type: 'sm, md, lg', default: 'elevações suaves', desc: 'Sombras de elevação.' },
        { name: 'motion', type: 'duration-fast, duration-normal, easing', default: '120/240ms', desc: 'Velocidade e curva das transições.' },
        { name: 'effect', type: `ripple ('1'/'0'), focus-ring`, default: 'ligados', desc: 'Ripple do botão e anel de foco dos campos — desative para visual sem sobra.' },
        { name: 'z', type: 'base, dropdown, modal, toast', default: '1000–1200', desc: 'Camadas de sobreposição.' },
      ],
      ['Grupo', 'Chaves', 'Padrão', 'Descrição'],
    )}
    ${codeBlock("// O preset só precisa do que for diferente do tema base:\nFenixUI.setTokens({\n  color: { primary: '#0d9488' },   // só a cor primária muda\n  effect: { 'focus-ring': 'none' }, // campos sem anel de foco\n  size: { lg: '52px' },             // só o tamanho lg fica maior\n});")}
    <h3>API de tema</h3>
    ${apiTable('Métodos', [
      { name: 'FenixUI.theme(name)', type: `name: 'light' | 'dark'`, desc: 'Troca o modo de cor em runtime.' },
      { name: 'FenixUI.setTokens(tokens)', type: 'DeepPartial<FenixTokens>', desc: 'Override parcial profundo (ex.: só color.primary).' },
      { name: 'FenixUI.configure(options)', type: 'ConfigureOptions', desc: 'Configuração combinada; retorna o estado ativo.' },
      { name: 'FenixUI.resetTheme()', type: '', desc: 'Volta ao tema claro padrão, sem overrides.' },
      { name: 'applyPreset(preset, mode)', type: `preset: string, mode: 'light' | 'dark'`, desc: 'Aplica um preset nomeado + modo.' },
    ], ['Método', 'Tipo', 'Padrão', 'Descrição'])}
    <h3>Tokens ativos agora</h3>
    <div class="swatches" id="swatches"></div>
    ${codeBlock("// Override customizado\nFenixUI.setTokens({\n  color: { primary: '#0d9488' },\n  radius: { md: '16px' },\n});")}
    <h3>Crie seu próprio tema</h3>
    <p>Personalize as cores, veja o preview ao vivo nos componentes abaixo e <strong>baixe o preset</strong>
    com o nome que escolher. O arquivo <code class="inline">.fenix-preset.json</code> pode ser carregado na
    aplicação via <code class="inline">defineCustomPreset()</code>.</p>
    <div class="demo">
      <div class="demo-controls" style="border:none">
        <label>Nome do tema: <fx-input id="cp-name" value="meu-tema"></fx-input></label>
        <label>Rótulo: <fx-input id="cp-label" value="✨ Meu Tema"></fx-input></label>
      </div>
      <div class="demo-controls">
        ${['primary', 'secondary', 'success', 'warning', 'danger', 'info']
          .map((c) => `<label>${c}: <input type="color" data-cp-color="${c}" style="width:2.2rem;height:1.6rem;padding:0;border:none;background:none;cursor:pointer" /></label>`)
          .join('')}
        <label>Arredondamento:
          <fx-select id="cp-radius" value="8px">
            <option value="0">Nenhum (retas)</option>
            <option value="4px">Pequeno</option>
            <option value="8px">Médio</option>
            <option value="16px">Grande</option>
            <option value="9999px">Pílula</option>
          </fx-select>
        </label>
        <label>Tamanho sm:
          <fx-select id="cp-size-sm" value="32px">
            <option value="28px">Compacto (28px)</option>
            <option value="32px">Padrão (32px)</option>
            <option value="36px">Confortável (36px)</option>
          </fx-select>
        </label>
        <label>Tamanho md:
          <fx-select id="cp-size-md" value="40px">
            <option value="34px">Compacto (34px)</option>
            <option value="40px">Padrão (40px)</option>
            <option value="44px">Confortável (44px)</option>
          </fx-select>
        </label>
        <label>Tamanho lg:
          <fx-select id="cp-size-lg" value="48px">
            <option value="42px">Compacto (42px)</option>
            <option value="48px">Padrão (48px)</option>
            <option value="56px">Confortável (56px)</option>
          </fx-select>
        </label>
        <label><fx-switch id="cp-focus-ring" checked>Anel de foco nos campos</fx-switch></label>
        <label><fx-switch id="cp-ripple" checked>Efeito ripple no botão</fx-switch></label>
      </div>
      <div class="demo-stage" id="cp-preview"></div>
      <div class="demo-controls" style="border-top:1px dashed var(--fx-border-default)">
        <fx-button id="cp-download" variant="primary">⬇️ Baixar preset (.json)</fx-button>
        <span id="cp-status" style="color:var(--fx-text-muted);font-size:.82rem"></span>
      </div>
    </div>
    ${codeBlock(
      "// Usando o preset baixado na sua aplicação:\nimport { defineCustomPreset, applyPreset } from '@fenix-ui/fenix-ui';\nimport meuTema from './meu-tema.fenix-preset.json';\n\ndefineCustomPreset(meuTema.name, meuTema.label, meuTema.tokens);\napplyPreset('meu-tema', 'dark');",
    )}
  `;
  const paint = (): void => {
    const cs = getComputedStyle(document.documentElement);
    const names = ['--fx-color-primary', '--fx-color-secondary', '--fx-color-success', '--fx-color-warning', '--fx-color-danger', '--fx-color-info', '--fx-surface-surface', '--fx-surface-background', '--fx-text-default', '--fx-border-default'];
    document.getElementById('swatches')!.innerHTML = names
      .map((n) => {
        const v = cs.getPropertyValue(n).trim();
        return `<div class="swatch"><div class="chip" style="background:${v}"></div><div class="meta"><b>${n.replace('--fx-', '')}</b>${v}</div></div>`;
      })
      .join('');
  };
  const sync = (): void => {
    const p = (document.getElementById('th-preset') as HTMLSelectElement).value;
    const m = (document.getElementById('th-mode') as HTMLSelectElement).value as 'light' | 'dark';
    applyPreset(p, m);
    syncHeaderControls(p, m);
    paint();
  };
  document.getElementById('th-preset')!.addEventListener('change', sync);
  document.getElementById('th-mode')!.addEventListener('change', sync);
  paint();
  setupCustomBuilder();
  wireCopyButtons(main);
}

/* ------------------------------------------------------------------ */
/* Construtor de preset personalizado (preview + download .json)       */
/* ------------------------------------------------------------------ */

const DEFAULT_CUSTOM_COLORS: Record<string, string> = {
  primary: '#4f46e5',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  info: '#0ea5e9',
};

function slugify(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'meu-tema'
  );
}

function readCustomTokens(): DeepPartial<FenixTokens> {
  const colors: Record<string, string> = {};
  document.querySelectorAll<HTMLInputElement>('input[data-cp-color]').forEach((input) => {
    colors[input.dataset.cpColor!] = input.value;
  });
  const radius = (document.getElementById('cp-radius') as any)?.value ?? '8px';
  const readSize = (id: string, fallback: string): string =>
    (document.getElementById(id) as any)?.value || fallback;
  const focusRing = document.querySelector('fx-switch#cp-focus-ring') as any;
  const ripple = document.querySelector('fx-switch#cp-ripple') as any;
  return {
    color: colors,
    radius: { sm: radius === '9999px' ? '9999px' : `calc(${radius} / 2)`, md: radius, lg: `calc(${radius} * 1.5)` },
    // Escala de alturas dos controles — só entra no preset se diferente do padrão.
    ...(radius !== undefined
      ? {
          size: {
            sm: readSize('cp-size-sm', '32px'),
            md: readSize('cp-size-md', '40px'),
            lg: readSize('cp-size-lg', '48px'),
          },
        }
      : {}),
    effect: {
      // O cliente decide se o tema usa anel de foco/ripple — basta desmarcar.
      'focus-ring': focusRing && !focusRing.checked
        ? 'none'
        : '0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)',
      ripple: ripple && !ripple.checked ? '0' : '1',
    },
  };
}

/** Renderiza o preview. Só aplica tokens se `apply` — nunca no paint inicial,
 * para não sobrescrever o tema/preset ativo escolhido pelo usuário. */
function paintCustomPreview(apply = false): void {
  if (apply) FenixUI.setTokens(readCustomTokens());
  const preview = document.getElementById('cp-preview');
  if (preview) {
    preview.innerHTML = `
      <fx-button variant="primary">Primário</fx-button>
      <fx-button variant="success">Sucesso</fx-button>
      <fx-button variant="outline">Outline</fx-button>
      <fx-badge variant="danger">7</fx-badge>
      <fx-spinner></fx-spinner>
      <fx-input placeholder="Digite algo…"></fx-input>
      <fx-select><option value="a">Opção A</option><option value="b">Opção B</option></fx-select>
    `;
  }
}

function downloadPreset(preset: FenixPreset): void {
  const blob = new Blob([JSON.stringify({ $schema: 'fenix-preset/v1', ...preset }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${slugify(preset.name)}.fenix-preset.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function setupCustomBuilder(): void {
  // valores iniciais dos color pickers
  document.querySelectorAll<HTMLInputElement>('input[data-cp-color]').forEach((input) => {
    input.value = DEFAULT_CUSTOM_COLORS[input.dataset.cpColor!];
    input.addEventListener('input', () => {
      paintCustomPreview(true);
      const sw = document.getElementById('swatches');
      if (sw) renderThemingSwatchesOnly(sw);
    });
  });
  (document.getElementById('cp-radius') as any).addEventListener('change', () => {
    paintCustomPreview(true);
  });
  for (const id of ['cp-size-sm', 'cp-size-md', 'cp-size-lg']) {
    (document.getElementById(id) as any)?.addEventListener('change', () => {
      paintCustomPreview(true);
    });
  }
  for (const id of ['cp-focus-ring', 'cp-ripple']) {
    document.getElementById(id)?.addEventListener('change', () => {
      paintCustomPreview(true);
    });
  }

  document.getElementById('cp-download')!.addEventListener('click', () => {
    const nameInput = document.getElementById('cp-name') as HTMLInputElement;
    const labelInput = document.getElementById('cp-label') as HTMLInputElement;
    const name = slugify(nameInput.value || 'meu-tema');
    const preset = defineCustomPreset(name, labelInput.value || name, readCustomTokens());
    downloadPreset(preset);

    // aparece no seletor global imediatamente
    currentPreset = name;
    syncHeaderControls(name, currentMode);
    const thPreset = document.getElementById('th-preset') as HTMLSelectElement | null;
    if (thPreset) thPreset.value = name;

    const status = document.getElementById('cp-status')!;
    status.textContent = `✅ "${labelInput.value}" registrado e baixado como ${name}.fenix-preset.json`;
  });

  paintCustomPreview();
}

/** Repinta apenas os swatches sem reconstruir a página (usado durante o preview). */
function renderThemingSwatchesOnly(container: HTMLElement): void {
  const cs = getComputedStyle(document.documentElement);
  const names = ['--fx-color-primary', '--fx-color-secondary', '--fx-color-success', '--fx-color-warning', '--fx-color-danger', '--fx-color-info', '--fx-surface-surface', '--fx-surface-background', '--fx-text-default', '--fx-border-default'];
  container.innerHTML = names
    .map((n) => {
      const v = cs.getPropertyValue(n).trim();
      return `<div class="swatch"><div class="chip" style="background:${v}"></div><div class="meta"><b>${n.replace('--fx-', '')}</b>${v}</div></div>`;
    })
    .join('');
}

/* ------------------------------------------------------------------ */
/* Header: preset + modo (global, reflete em todas as páginas)         */
/* ------------------------------------------------------------------ */

let currentPreset = 'fenix';
let currentMode: 'light' | 'dark' = 'light';

function syncHeaderControls(preset: string, mode: 'light' | 'dark'): void {
  currentPreset = preset;
  currentMode = mode;
  document.getElementById('mode-toggle')!.textContent =
    mode === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro';
  const thMode = document.getElementById('th-mode') as HTMLSelectElement | null;
  if (thMode) thMode.value = mode;
  const thPreset = document.getElementById('th-preset') as HTMLSelectElement | null;
  if (thPreset) thPreset.value = preset;
}

function setupHeader(): void {
  document.getElementById('mode-toggle')!.addEventListener('click', () => {
    currentMode = currentMode === 'dark' ? 'light' : 'dark';
    applyPreset(currentPreset, currentMode);
    syncHeaderControls(currentPreset, currentMode);
  });
}

/* ------------------------------------------------------------------ */
/* Roteamento (hash) + sidebar                                         */
/* ------------------------------------------------------------------ */

function buildSidebar(): void {
  const groups = new Map<string, { id: string; title: string }[]>();
  groups.set('Guia', [
    { id: 'introduction', title: 'Introdução' },
    { id: 'auto-import', title: 'Auto Import' },
    { id: 'theming', title: 'Temas' },
  ]);
  for (const c of components) {
    if (!groups.has(c.group)) groups.set(c.group, []);
    groups.get(c.group)!.push({ id: c.tag, title: c.title });
  }
  document.getElementById('sidebar')!.innerHTML = [...groups.entries()]
    .map(
      ([group, items]) =>
        `<div class="group">${group}</div>` +
        items.map((i) => `<a href="#/${i.id}" data-id="${i.id}">${i.title}</a>`).join(''),
    )
    .join('');
}

function renderComponentPage(doc: ComponentDoc): void {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>&lt;${doc.tag}&gt;</h2>
    <p class="lead">${doc.lead}</p>
    <h3>Importação (tree-shakeable)</h3>
    ${codeBlock(doc.imports.join('\n'))}
    <h3>Playground</h3>
    <div class="demo">
      <div class="demo-stage" id="stage"></div>
      <div class="demo-controls">${buildControls(doc)}</div>
    </div>
    ${codeBlock(`<${doc.tag}>…</${doc.tag}>`)}
    <h3>Todas as variantes</h3>
    <div class="demo"><div class="demo-stage">${doc.variantsHtml!()}</div></div>
    <h3>Código das variantes</h3>
    ${codeBlock([doc.imports.join('\n'), '', formatHtml(doc.variantsHtml!())].join('\n'))}
    ${apiTable('Atributos / Propriedades', doc.attributes, ['Nome', 'Tipo', 'Padrão', 'Descrição'])}
    ${doc.events ? apiTable('Eventos', doc.events, ['Evento', 'Tipo', 'Padrão', 'Descrição']) : ''}
    ${doc.slots ? apiTable('Slots', doc.slots, ['Slot', 'Tipo', 'Padrão', 'Descrição']) : ''}
    ${doc.cssVars ? apiTable('Variáveis CSS', doc.cssVars, ['Variável', 'Tipo', 'Padrão', 'Descrição']) : ''}
  `;

  const stage = main.querySelector<HTMLDivElement>('#stage')!;
  const codeEl = main.querySelectorAll('.code-block')[1]?.querySelector('code');
  const refresh = (): void => {
    stage.innerHTML = doc.demoHtml(currentAttrs(doc));
    if (codeEl) {
      // Atributos booleanos não têm valor: `disabled=""` vira apenas `disabled`.
      const clean = stage.innerHTML.replace(
        /(\s(?:disabled|loading|checked|readonly|full|round))=""/g,
        '$1',
      );
      codeEl.textContent = formatHtml(clean);
    }
  };
  main.querySelectorAll('fx-select[data-attr], fx-switch[data-attr]').forEach((el) =>
    el.addEventListener('change', refresh),
  );
  main.querySelectorAll('fx-input[data-attr]').forEach((el) =>
    el.addEventListener('input', refresh),
  );
  refresh();
  wireCopyButtons(main);
}

function renderRoute(): void {
  const route = location.hash.replace(/^#\//, '') || 'introduction';
  document.querySelectorAll('#sidebar a').forEach((a) =>
    a.classList.toggle('active', (a as HTMLAnchorElement).dataset.id === route),
  );
  const doc = components.find((c) => c.tag === route);
  if (doc) renderComponentPage(doc);
  else if (route === 'theming') renderTheming();
  else if (route === 'auto-import') renderAutoImport();
  else renderIntro();
}

/** Página Auto Import — uso do plugin no projeto do cliente. */
function renderAutoImport(): void {
  const main = document.getElementById('main')!;
  main.innerHTML = `
    <h2>Auto Import</h2>
    <p class="lead">Cansado de importar componente por componente? Com o plugin
    <code>FenixAutoImport</code>, você escreve apenas as tags <code>fx-*</code> no código e o
    import de cada componente é injetado automaticamente em tempo de build — mantendo o
    tree-shaking: só entra no bundle o que é usado.</p>

    <h3>1. Instale o pacote</h3>
    <pre><code>npm i @fenix-ui/fenix-ui</code></pre>

    <h3>2. Adicione o plugin no build</h3>
    <p>Vite (<code>vite.config.ts</code>):</p>
    <pre><code>import { defineConfig } from 'vite';
import { FenixAutoImport } from '@fenix-ui/fenix-ui/auto-import';

export default defineConfig({
  plugins: [FenixAutoImport()],
});</code></pre>

    <h3>3. Use sem importar</h3>
    <pre><code>&lt;!-- Em qualquer template/componente --&gt;
&lt;fx-button variant="primary"&gt;Salvar&lt;/fx-button&gt;
&lt;fx-select clearable&gt;
  &lt;option value="sp"&gt;São Paulo&lt;/option&gt;
&lt;/fx-select&gt;

// O plugin gera automaticamente:
// import '@fenix-ui/fenix-ui/button';
// import '@fenix-ui/fenix-ui/select';</code></pre>

    <div class="note">
      <strong>Como funciona:</strong> o plugin percorre seus arquivos (.ts, .js, .tsx, .jsx,
      .vue, .html, .svelte) procurando tags <code>fx-*</code> conhecidas e injeta
      <code>import '@fenix-ui/fenix-ui/&lt;componente&gt;'</code> após os imports existentes.
      Se você já importou um subpath manualmente, ele não duplica. Arquivos em
      <code>node_modules</code>, <code>.d.ts</code> e CSS são ignorados.
    </div>

    <h3>Componentes suportados</h3>
    <table>
      <thead><tr><th>Tag</th><th>Subpath injetado</th></tr></thead>
      <tbody id="ai-map"></tbody>
    </table>

    <h3>Compatibilidade com frameworks</h3>
    <table>
      <thead><tr><th>Framework</th><th>Suporte</th></tr></thead>
      <tbody>
        <tr><td>Vue 3 / Nuxt</td><td>✅ via Vite/Rollup (inclusive SFC)</td></tr>
        <tr><td>React / Next</td><td>✅ via Vite/Rollup/Webpack (transform genérico)</td></tr>
        <tr><td>HTML puro / JSP / .NET</td><td>✅ use o bundle CDN (<code>fenix-ui.umd.min.js</code>) que já registra tudo</td></tr>
      </tbody>
    </table>
  `;

  const tbody = document.getElementById('ai-map');
  if (tbody) {
    for (const [tag, sub] of Object.entries(fenixComponentMap)) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><code>&lt;${tag}&gt;</code></td><td><code>${sub}</code></td>`;
      tbody.appendChild(tr);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

/** Eventos de ação globais da doc (funciona dentro de shadow DOM e no jsdom). */
document.addEventListener('click', (e: MouseEvent) => {
  const path = 'composedPath' in e ? e.composedPath() as Element[] : [];
  const opener = (path.find((n) => n instanceof Element && n.hasAttribute?.('data-fx-open')) ??
    (e.target as Element)?.closest?.('[data-fx-open')) as HTMLElement | undefined;
  if (opener) {
    const id = opener.getAttribute('data-fx-open')!;
    const drawer = document.getElementById(id);
    if (drawer) drawer.setAttribute('open', '');
  }
});

applyPreset('fenix', 'light');
setupHeader();
buildSidebar();
window.addEventListener('hashchange', renderRoute);
renderRoute();



