/**
 * Documentação do componente <fx-autocomplete>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { autofillSection } from '../shared';

export const autocompleteDoc: ComponentDoc = {
	tag: "fx-autocomplete",
	title: "Autocomplete",
	group: "Formulário",
	lead: "Campo de busca com sugestões filtradas conforme digitação (source local).",
	imports: ["import '@wrrdev/fenix-ui/autocomplete';"],
	extraSections: [
		autofillSection(
			'O campo interno é <b>sempre</b> <code>autocomplete="off"</code> — regra fixa do componente (não há atributo para alterar). É por isso que este é o componente seguro para busca de nomes/usuários.'
		),
	],
	demoHtml: (a) =>
		`<fx-autocomplete ${a} source='["Brasil","Argentina","Chile","Colômbia","Peru","Uruguai"]' placeholder="Digite um país..."></fx-autocomplete>`,
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
		{ kind: "toggle", attr: "error", label: "Erro" },
		{ kind: "toggle", attr: "success", label: "Sucesso" },
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
	],
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:12px">
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				<fx-autocomplete size="sm" placeholder="sm" source='["São Paulo","Rio de Janeiro","Belo Horizonte"]'></fx-autocomplete>
				<fx-autocomplete placeholder="md (padrão)" source='["São Paulo","Rio de Janeiro","Belo Horizonte"]'></fx-autocomplete>
				<fx-autocomplete size="lg" placeholder="lg" source='["São Paulo","Rio de Janeiro","Belo Horizonte"]'></fx-autocomplete>
			</div>
			<h4>Validação (error / success)</h4>
			<p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Borda vermelha com <code>error</code>, verde com <code>success</code>. Combine com <code>fx-alert</code> no submit (ver página Formulários).</p>
			<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
				<fx-autocomplete error placeholder="error" source='["São Paulo","Rio de Janeiro"]'></fx-autocomplete>
				<fx-autocomplete success placeholder="success" source='["São Paulo","Rio de Janeiro"]'></fx-autocomplete>
			</div>
			<h4>Full width (full)</h4>
			<fx-autocomplete full placeholder="Estica até o pai" source='["São Paulo","Rio de Janeiro","Belo Horizonte"]'></fx-autocomplete>
		</div>`,
	attributes: [
		{
			name: "value",
			type: "string",
			default: "''",
			desc: "Valor selecionado. Setar el.value também atualiza o campo interno (sem re-render).",
		},
		{
			name: "name",
			type: "string",
			default: "''",
			desc: "Nome do campo no FormData quando dentro de um <form> (form-associated); Enter com a lista fechada submete o form.",
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
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block). Sem full, a largura também é controlável por CSS externo, classes ou style inline no elemento (ver Variáveis CSS).",
		},
		{
			name: "emit-autofill",
			type: "boolean",
			default: "false",
			desc: "Aceita o valor colocado no campo pelo navegador (autofill/gerenciador de senha/script): input/valueChange também nesse caminho. O campo interno é sempre autocomplete=\"off\" (regra fixa), então sem este atributo o autofill é desfeito.",
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
			name: "select",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao escolher uma sugestão.",
		},
		{
			name: "input",
			type: `CustomEvent<{ value: string }>`,
			desc: "Ao digitar (composed) — é o evento que o v-model do Vue usa. Só sai em edição do usuário ou com emit-autofill; valor externo bloqueado é desfeito e não emite nada.",
		},
		{
			name: "valueChange",
			type: `CustomEvent<{ value: string }>`,
			desc: "Espelho de input (composed) para o two-way binding do Angular: [value] + (valueChange)=\"x = $event.detail.value\". [(value)] NÃO funciona em Web Components — o $event é o CustomEvent.",
		},
		{
			name: "autofill",
			type: `CustomEvent<{ value: string }>`,
			desc: "Valor colocado no campo SEM edição do usuário e ACEITO (com emit-autofill). O value/FormData já estão sincronizados e a lista não abre.",
		},
	],
	cssVars: [
		{ name: "--fx-autocomplete-width", type: "largura CSS", default: "260px", desc: "Largura padrão do campo (aplicada no host). CSS externo, classes e style inline no elemento vencem o default." },
		{ name: "--fx-autocomplete-width-sm / -lg", type: "largura CSS", default: "220px / 300px", desc: "Larguras padrão para size sm e lg." },
	],
};
