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
	lead: "Campo de texto e tipos nativos do <input> (text, number, password, email, tel, url, search, date, time, datetime-local, month, week, color) estilizado com os tokens do tema. Form-associated: com name entra no FormData de um <form>, o Enter submete e <label for> foca o campo. O anel de foco é controlado pelo token effect.focus-ring do preset.",
	imports: ["import '@wrrdev/fenix-ui/input';"],
	demoHtml: (a) => `<fx-input ${a}></fx-input>`,
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:16px">
			<h4>Tipos</h4>
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				${["text", "number", "password", "email", "tel", "date", "time"]
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
			<h4>Largura customizada (CSS externo, classes ou style inline — sem atributo)</h4>
			<p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">O default (260px; sm 220px / lg 300px) fica no <code>:host</code>: qualquer largura definida no elemento vence o default. Para trocar globalmente, defina <code>--fx-input-width</code> no root do tema.</p>
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				<fx-input style="width: 180px" placeholder="style width 180px"></fx-input>
				<fx-input size="lg" style="width: 100%" placeholder="size lg + width 100%"></fx-input>
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
				"password",
				"email",
				"tel",
				"url",
				"search",
				"date",
				"time",
				"datetime-local",
				"month",
				"week",
				"color",
			],
			value: "text",
		},
		{
			kind: "select",
			attr: "autocomplete",
			label: "Autocomplete (autofill)",
			options: [
				"off",
				"username",
				"current-password",
				"new-password",
				"one-time-code",
				"email",
				"tel",
				"street-address",
			],
			value: "off",
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
		{ kind: "toggle", attr: "clearable", label: "Botão limpar (clearable)" },
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
			type: `'text' | 'number' | 'password' | 'email' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color'`,
			default: `'text'`,
			desc: "Tipo do input interno. Tipos com semântica própria (file, checkbox, radio, submit, reset, button, image) caem em text.",
		},
		{
			name: "value",
			type: "string",
			default: "''",
			desc: "Valor do campo; reflete para o atributo ao digitar. Setar el.value também atualiza o campo interno (sem re-render, preservando foco/cursor).",
		},
		{
			name: "name",
			type: "string",
			default: "''",
			desc: "Nome do campo no FormData quando dentro de um <form> (form-associated); o Enter no campo submete o form. Também é repassado ao input interno (ajuda o navegador a classificar o campo).",
		},
		{
			name: "autocomplete",
			type: "string",
			default: "'off'",
			desc: "Repassado ao input INTERNO (é ele que o navegador enxerga): controla o autofill e o gerenciador de senhas. Default 'off' (igual ao fx-autocomplete); o atributo declarado no host vence. Use os tokens semânticos quando o autofill for desejado — 'username', 'current-password', 'new-password', 'one-time-code', 'email', 'street-address'. O Chrome IGNORA 'off' em type=\"password\". Ver a seção Autofill abaixo.",
		},
		{
			name: "autofocus",
			type: "boolean",
			default: "false",
			desc: "Foca o campo ao entrar na tela (delegatesFocus leva o foco ao input interno).",
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
			name: "clearable",
			type: "boolean",
			default: "false",
			desc: "Exibe um botão × que limpa o campo; emite input + change uma única vez.",
		},
		{
			name: "emit-autofill",
			type: "boolean",
			default: "false",
			desc: "Restaura o comportamento anterior à correção de autofill: input/change/valueChange também quando o valor é colocado no campo pelo navegador (autofill/gerenciador de senha). Sem ele, autofill emite `autofill` e não aciona o v-model.",
		},
		{
			name: "min / max / step",
			type: "string",
			default: "—",
			desc: 'Restrições nativas aplicadas ao tipo escolhido (number, date, time, datetime-local, month, week etc.).',
		},
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Largura 100% acompanhando o elemento pai (host vira block). Ocupa a linha inteira; para manter um fx-button na mesma linha, use o elemento pai com display:flex — o input estica (flex) e o botão mantém o tamanho. Sem full, a largura também pode ser definida por CSS externo, classes do framework ou style inline no elemento (o default vive no host via --fx-input-width).",
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
			desc: "Emitido a cada tecla (composed), exatamente uma vez por interação. Só sai em edição do usuário: valor colocado no campo por autofill/gerenciador de senha/script emite `autofill`.",
		},
		{
			name: "change",
			type: `CustomEvent<{ value: string }>`,
			desc: "Emitido ao confirmar o valor (composed). Só em edição do usuário (o change do autofill é absorvido).",
		},
		{
			name: "autofill",
			type: `CustomEvent<{ value: string }>`,
			desc: "Valor colocado no campo SEM edição do usuário (autofill do navegador, gerenciador de senha, script). O value/FormData já estão sincronizados — use este evento para reagir sem poluir o v-model.",
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
		{
			name: "--fx-input-width",
			type: "largura CSS",
			default: "260px",
			desc: "Largura padrão do campo (aplicada no host). CSS externo, classes e style inline no elemento vencem o default; defina no root/preset para mudar globalmente.",
		},
		{
			name: "--fx-input-width-sm / -lg",
			type: "largura CSS",
			default: "220px / 300px",
			desc: "Larguras padrão para size sm e lg (mesma regra de sobrescrita).",
		},
	],
	extraSections: [
		{
			title: "Autofill e gerenciadores de senha",
			html: `
				<p>O <code>&lt;input&gt;</code> real do <code>fx-input</code> vive no <b>Shadow DOM</b>. O navegador só enxerga o campo interno — um <code>autocomplete</code> escrito no host (light DOM) não chega lá sozinho. Como o default da spec é <code>on</code>, sem o atributo o Chrome autopreenche o campo com o usuário/senha salvos (heurística “primeiro campo de texto = usuário”) e ainda oferece <b>“Salvar senha?”</b>. O sintoma clássico é a busca de uma tabela ou um campo de diálogo amanhecer preenchido com o login do usuário.</p>
				<p>Por isso o componente <b>repassa</b> <code>autocomplete</code>, <code>name</code> e <code>id</code> ao campo interno, com <b>default <code>off</code></b> (mesma escolha do <code>&lt;fx-autocomplete&gt;</code>). O atributo declarado no host sempre vence o default.</p>
				<table>
					<thead><tr><th>Uso</th><th>Valor de <code>autocomplete</code></th></tr></thead>
					<tbody>
						<tr><td>Busca, filtro, campo comum (padrão do componente)</td><td><code>off</code></td></tr>
						<tr><td>Login — campo de usuário</td><td><code>username</code></td></tr>
						<tr><td>Login — senha atual</td><td><code>current-password</code></td></tr>
						<tr><td>Cadastro / troca de senha</td><td><code>new-password</code></td></tr>
						<tr><td>Código de verificação em duas etapas</td><td><code>one-time-code</code></td></tr>
						<tr><td>E-mail, telefone, endereço</td><td><code>email</code>, <code>tel</code>, <code>street-address</code>, <code>postal-code</code></td></tr>
					</tbody>
				</table>
				<div class="note"><b>Senha:</b> o Chrome <b>ignora</b> <code>off</code> em <code>type="password"</code>. Para o login parar de pedir “Salvar senha?” e de preencher os outros campos, use <code>username</code> no usuário e <code>current-password</code> na senha — é o par semântico correto e o que faz o navegador abandonar a heurística. Use <code>new-password</code> só em cadastro/troca: ele suprime o autofill e, na maioria dos casos, o prompt de salvar.</div>
				<div class="note">Mude <code>autocomplete</code> <b>declarativamente</b>: como qualquer atributo observado (<code>type</code>, <code>placeholder</code>…), alterá-lo em runtime re-renderiza o campo e o foco é perdido.</div>
				<p>Os demais componentes com campo interno de texto seguem a mesma regra e já saem com <code>off</code>: <a href="#/fx-textarea">fx-textarea</a>, <a href="#/fx-select">fx-select</a> e <a href="#/fx-multiselect">fx-multiselect</a> (busca), <a href="#/fx-table">fx-table</a> (linha de filtros), <a href="#/fx-datepicker">fx-datepicker</a>, <a href="#/fx-orderlist">fx-orderlist</a>, <a href="#/fx-picklist">fx-picklist</a> e <a href="#/fx-editor">fx-editor</a> (diálogos).</p>
				<h4>Exemplo</h4>
				<pre><code>&lt;!-- busca: fora do autofill --&gt;
&lt;fx-input type="search" autocomplete="off" placeholder="Buscar por usuário AD"&gt;&lt;/fx-input&gt;

&lt;!-- login: par semântico (usuário + senha) --&gt;
&lt;fx-input id="usuario" name="usuario" autocomplete="username"&gt;&lt;/fx-input&gt;
&lt;fx-input type="password" name="senha" autocomplete="current-password"&gt;&lt;/fx-input&gt;

&lt;!-- cadastro / troca de senha --&gt;
&lt;fx-input type="password" name="nova" autocomplete="new-password"&gt;&lt;/fx-input&gt;</code></pre>
			`,
		},
	],
};
