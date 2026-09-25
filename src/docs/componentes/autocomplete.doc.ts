/**
 * Documentação do componente <fx-autocomplete>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const autocompleteDoc: ComponentDoc = {
	tag: "fx-autocomplete",
	title: "Autocomplete",
	group: "Formulário",
	lead: "Campo de busca com sugestões filtradas conforme digitação (source local).",
	imports: ["import '@wrrdev/fenix-ui/autocomplete';"],
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
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block). Sem full, a largura também é controlável por CSS externo, classes ou style inline no elemento (ver Variáveis CSS).",
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
	],
	cssVars: [
		{ name: "--fx-autocomplete-width", type: "largura CSS", default: "260px", desc: "Largura padrão do campo (aplicada no host). CSS externo, classes e style inline no elemento vencem o default." },
		{ name: "--fx-autocomplete-width-sm / -lg", type: "largura CSS", default: "220px / 300px", desc: "Larguras padrão para size sm e lg." },
	],
};
