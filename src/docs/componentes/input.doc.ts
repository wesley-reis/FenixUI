/**
 * Documentação do componente <fx-input>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { sizes } from '../shared';

export const inputDoc: ComponentDoc = {
	tag: "fx-input",
	title: "Input",
	group: "Formulário",
	lead: "Campo de texto (text, number, email, password, search…) estilizado com os tokens do tema. O anel de foco é controlado pelo token effect.focus-ring do preset.",
	imports: ["import '@wrrdev/fenix-ui/input';"],
	demoHtml: (a) => `<fx-input ${a}></fx-input>`,
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:16px">
			<h4>Tipos</h4>
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				${["text", "number", "email", "password", "search"]
					.map((t) => `<fx-input type="${t}" placeholder="${t}"></fx-input>`)
					.join("")}
			</div>
			<h4>Ícones (attr icon + icon-pos)</h4>
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				<fx-input icon="search" placeholder="Com ícone (left)"></fx-input>
				<fx-input icon="mail" icon-pos="right" placeholder="Ícone à direita"></fx-input>
				<fx-input icon="lock" type="password" placeholder="Password"></fx-input>
				<fx-input icon="📎" placeholder="Emoji também funciona"></fx-input>
			</div>
			<h4>Ícone via slot (qualquer fx-icon)</h4>
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				<fx-input placeholder="Slot icon custom">
					<i slot="icon" class="fx-icon fx-icon-person"></i>
				</fx-input>
			</div>
			<h4>Full width (full)</h4>
			<div style="display:flex;flex-direction:column;gap:8px">
				<fx-input full icon="search" placeholder="Estica até o pai (block, largura 100%)"></fx-input>
				<div>
					<strong style="font-size:12px;color:var(--fx-text-muted)">full + button na MESMA linha: pai com display:flex</strong>
					<div style="display:flex;gap:8px;align-items:center;margin-top:6px">
						<fx-input full icon="search" placeholder="flex-1 estica, botão mantém o tamanho"></fx-input>
						<fx-button>OK</fx-button>
					</div>
				</div>
			</div>
			<h4>Validação (error / success)</h4>
			<p style="font-size:12px;color:var(--fx-text-muted);margin:0">Borda vermelha com <code>error</code>/<code>invalid</code>, verde com <code>success</code>/<code>valid</code>. Combine com <code>fx-alert</code> no submit (ver página Formulários).</p>
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				<fx-input error placeholder="error"></fx-input>
				<fx-input success placeholder="success"></fx-input>
			</div>
		</div>`,
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
		{ kind: "toggle", attr: "error", label: "Erro" },
		{ kind: "toggle", attr: "success", label: "Sucesso" },
		{ kind: "toggle", attr: "full", label: "Largura total (full)" },
		{ kind: "text", attr: "icon", label: "Ícone", hint: "nome do glifo Fenix Icons ou emoji" },
		{
			kind: "select",
			attr: "icon-pos",
			label: "Posição do ícone",
			options: ["left", "right"],
			value: "left",
		},
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
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block). Ocupa a linha inteira; para manter um fx-button na mesma linha, use o elemento pai com display:flex — o input estica (flex) e o botão mantém o tamanho.",
		},
		{
			name: "error / invalid",
			type: "boolean",
			default: "false",
			desc: "Borda vermelha de validação (ex.: campo obrigatório vazio no submit). Combine com fx-alert para a mensagem (ver página Formulários).",
		},
		{
			name: "success / valid",
			type: "boolean",
			default: "false",
			desc: "Borda verde de validação (campo válido).",
		},
		{
			name: "icon",
			type: "string",
			default: "''",
			desc: "Ícone DENTRO do campo (padrão Material/PrimeVue), sobre o padding: nome do glifo Fenix Icons (ex.: icon=\"search\") ou emoji/texto livre. Tamanho via --fx-input-icon-size.",
		},
		{
			name: "icon-pos",
			type: "'left' | 'right'",
			default: "'left'",
			desc: "Posição do ícone dentro do campo.",
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
	slots: [
		{
			name: "icon",
			desc: "Ícone customizado (ex.: <i class=\"fx-icon fx-icon-search\">) no lugar do atributo icon. Requer import '@wrrdev/fenix-ui/icons'.",
		},
	],
	cssVars: [
		{
			name: "--fx-input-icon-size",
			type: "tamanho CSS",
			default: "calc(var(--fx-font-size) + 6px)",
			desc: "Tamanho do ícone dentro do campo (via attr icon ou slot icon). Aumente para ícones maiores, ex.: style=\"--fx-input-icon-size: 24px\".",
		},
	],
};
