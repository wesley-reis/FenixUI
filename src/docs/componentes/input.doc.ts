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
	lead: "Campo de texto estilizado com os tokens do tema, com type text, number ou password. Form-associated: com name entra no FormData de um <form>, o Enter submete e <label for> foca o campo. O anel de foco é controlado pelo token effect.focus-ring do preset. Autofill do navegador é desfeito por padrão (o campo não fica com credenciais salvas).",
	imports: ["import '@wrrdev/fenix-ui/input';"],
	demoHtml: (a) => `<fx-input ${a}></fx-input>`,
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:16px">
			<h4>Tipos</h4>
			<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
				${["text", "number", "password"]
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
			options: ["text", "number", "password"],
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
			type: `'text' | 'number' | 'password'`,
			default: `'text'`,
			desc: "Tipo do campo. Qualquer outro valor (email, tel, url, search, date, time, datetime-local, month, week, color, file, checkbox…) normaliza para text — para esses casos use o <input> nativo do tipo desejado.",
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
			desc: "Repassado ao input INTERNO (é ele que o navegador enxerga): controla o autofill e o gerenciador de senhas. Default 'off' (igual ao fx-autocomplete); o atributo declarado no host vence. Declare os tokens semânticos quando o autofill for desejado — 'username', 'current-password', 'new-password', 'one-time-code', 'email', 'street-address': com eles o valor é aceito e os eventos de valor saem; sem token semântico o preenchimento externo é DESFEITO. O Chrome IGNORA 'off' em type=\"password\" — ver a seção Autofill abaixo.",
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
			desc: "Aceita o valor colocado no campo pelo navegador (autofill/gerenciador de senha/script): input/change/valueChange também nesse caminho. Sem ele — e sem token semântico em autocomplete — o autofill é desfeito: o campo volta ao valor do host e nada é propagado.",
		},
		{
			name: "min / max / step",
			type: "string",
			default: "—",
			desc: 'Restrições nativas do type="number" (min/max/step).',
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
			desc: "Emitido a cada tecla (composed), exatamente uma vez por interação — é o evento que o v-model do Vue usa. Só sai em edição do usuário ou em autofill DECLARADO (token semântico de autocomplete/emit-autofill); valor externo bloqueado não emite nada.",
		},
		{
			name: "change",
			type: `CustomEvent<{ value: string }>`,
			desc: "Emitido ao confirmar o valor (composed). Só em edição do usuário (o change do autofill é absorvido).",
		},
		{
			name: "valueChange",
			type: `CustomEvent<{ value: string }>`,
			desc: "Espelho de input (composed) para o two-way binding do Angular: [value] + (valueChange)=\"x = $event.detail.value\". [(value)] NÃO funciona em Web Components — o $event é o CustomEvent, não o detail.",
		},
		{
			name: "autofill",
			type: `CustomEvent<{ value: string }>`,
			desc: "Valor colocado no campo SEM edição do usuário e ACEITO (token semântico de autocomplete ou emit-autofill). O value/FormData já estão sincronizados e input/valueChange também saem — use este evento só para reagir de forma específica.",
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
				<p>O componente ataca isso em duas camadas:</p>
				<ol>
					<li><b>preventiva</b> — <code>autocomplete</code>, <code>name</code> e <code>id</code> são <b>repassados</b> ao campo interno, com <b>default <code>off</code></b> (mesma escolha do <code>&lt;fx-autocomplete&gt;</code>). O atributo declarado no host sempre vence o default;</li>
					<li><b>garantia</b> — valor colocado no campo <b>sem edição do usuário</b> (autofill, gerenciador de senha, script) é <b>desfeito</b>: o campo volta ao valor do host e nada é propagado (nem <code>value</code>/FormData, nem <code>input</code>/<code>valueChange</code>/<code>change</code>). Isso não depende do <code>off</code>, que o Chrome ignora em <code>type="password"</code>.</li>
				</ol>
				<p>O autofill só é <b>aceito</b> quando o host declara intenção — token semântico em <code>autocomplete</code> ou o atributo <code>emit-autofill</code>. Nesse caminho o valor é adotado, sincroniza <code>value</code>/FormData, emite <code>autofill</code> e <b>também</b> <code>input</code>/<code>valueChange</code> (ou seja, o <code>v-model</code> do Vue acompanha o preenchimento).</p>
				<table>
					<thead><tr><th>Uso</th><th>Valor de <code>autocomplete</code></th></tr></thead>
					<tbody>
						<tr><td>Busca, filtro, campo comum (padrão do componente)</td><td><code>off</code> — autofill desfeito</td></tr>
						<tr><td>Login — campo de usuário</td><td><code>username</code></td></tr>
						<tr><td>Login — senha atual</td><td><code>current-password</code></td></tr>
						<tr><td>Cadastro / troca de senha</td><td><code>new-password</code></td></tr>
						<tr><td>Código de verificação em duas etapas</td><td><code>one-time-code</code></td></tr>
						<tr><td>E-mail, telefone, endereço</td><td><code>email</code>, <code>tel</code>, <code>street-address</code>, <code>postal-code</code></td></tr>
					</tbody>
				</table>
				<div class="note"><b>Senha:</b> o Chrome <b>ignora</b> <code>off</code> em <code>type="password"</code>. Para o login parar de pedir “Salvar senha?” e de preencher os outros campos, use <code>username</code> no usuário e <code>current-password</code> na senha — é o par semântico correto e o que faz o navegador abandonar a heurística. Use <code>new-password</code> só em cadastro/troca: ele suprime o autofill e, na maioria dos casos, o prompt de salvar.</div>
				<div class="note"><b>Limites:</b> o desfazer é reativo — depende de o navegador disparar <code>input</code> ao preencher (Chrome/Edge/Firefox disparam). Escolher uma credencial no dropdown do gerenciador em um campo <b>bloqueado</b> não cola nada (esse fluxo não dispara <code>beforeinput</code>); declare o token semântico onde o autofill é desejado. Simulação programática (<code>el.value = 'x'; dispatchEvent(new Event('input'))</code>) também é desfeita — use <code>emit-autofill</code> quando precisar adotar o valor.</div>
				<div class="note">Mude <code>autocomplete</code> <b>declarativamente</b>: como qualquer atributo observado (<code>type</code>, <code>placeholder</code>…), alterá-lo em runtime re-renderiza o campo e o foco é perdido.</div>
				<p>Os demais componentes com campo interno de texto seguem a mesma regra e já saem com <code>off</code>: <a href="#/fx-textarea">fx-textarea</a>, <a href="#/fx-select">fx-select</a> e <a href="#/fx-multiselect">fx-multiselect</a> (busca), <a href="#/fx-table">fx-table</a> (linha de filtros), <a href="#/fx-datepicker">fx-datepicker</a>, <a href="#/fx-orderlist">fx-orderlist</a>, <a href="#/fx-picklist">fx-picklist</a> e <a href="#/fx-editor">fx-editor</a> (diálogos).</p>
				<h4>Exemplo</h4>
				<pre><code>&lt;!-- busca: fora do autofill (o preenchimento é desfeito) --&gt;
&lt;fx-input autocomplete="off" placeholder="Buscar por usuário AD"&gt;&lt;/fx-input&gt;

&lt;!-- login: par semântico — autofill aceito e v-model atualizado --&gt;
&lt;fx-input id="usuario" name="usuario" autocomplete="username"&gt;&lt;/fx-input&gt;
&lt;fx-input type="password" name="senha" autocomplete="current-password"&gt;&lt;/fx-input&gt;

&lt;!-- cadastro / troca de senha --&gt;
&lt;fx-input type="password" name="nova" autocomplete="new-password"&gt;&lt;/fx-input&gt;</code></pre>
			`,
		},
		{
			title: "Two-way binding por framework",
			html: `
				<p>Cada stack liga o valor do campo à variável do app de um jeito diferente. <b>Estas são as formas que funcionam com Web Components</b> — copie a da sua stack:</p>
				<table>
					<thead><tr><th>Stack</th><th>Forma correta</th><th>Por quê</th></tr></thead>
					<tbody>
						<tr>
							<td><b>Vue 3 / Nuxt</b></td>
							<td><code>&lt;fx-input v-model="valor" /&gt;</code></td>
							<td>Com <code>isCustomElement</code> o compilador trata a tag como <i>elemento</i>: o <code>v-model</code> vira <code>:value</code> + <code>@input</code> e lê a propriedade <code>value</code> do host. Não escreva <code>:value</code> + <code>@input</code> na mão.</td>
						</tr>
						<tr>
							<td><b>React 18 / 19</b></td>
							<td><code>&lt;fx-input value={valor} onInput={(e) =&gt; setValor(e.currentTarget.value)} /&gt;</code></td>
							<td>React não tem açúcar de two-way (o estado é do componente). O evento <code>input</code> é genérico e chega em custom elements em qualquer versão; o React 18 <b>não</b> dispara <code>onChange</code> em custom element. O host já reflete o valor antes do evento.</td>
						</tr>
						<tr>
							<td><b>Angular</b></td>
							<td><code>&lt;fx-input [value]="valor" (valueChange)="valor = $event.detail.value" /&gt;</code></td>
							<td><b><code>[(value)]</code> não funciona</b>: o açúcar vira <code>[value]</code> + <code>(valueChange)="valor = $event"</code> e o <code>$event</code> é o <b>CustomEvent</b>, não o <code>detail</code>. <code>ngModel</code> também não funciona em Web Components.</td>
						</tr>
						<tr>
							<td><b>Svelte 4 / 5</b></td>
							<td><code>&lt;fx-input value={valor} on:input={(e) =&gt; valor = e.detail.value} /&gt;</code></td>
							<td><b><code>bind:value</code> não compila</b> em custom element — o compilador do Svelte restringe o binding a <code>&lt;input&gt;</code>/<code>&lt;textarea&gt;</code>/<code>&lt;select&gt;</code>.</td>
						</tr>
						<tr>
							<td><b>HTML / JS puro</b></td>
							<td><code>el.addEventListener('input', (e) =&gt; valor = e.detail.value)</code></td>
							<td>Sem framework não há binding: use o listener — ou o <code>FormData</code> do <code>&lt;form&gt;</code>, já que o componente é form-associated.</td>
						</tr>
					</tbody>
				</table>
				<p>Os eventos <code>input</code>/<code>change</code>/<code>valueChange</code> são <code>CustomEvent</code>s <b>composed</b> com <code>detail: { value }</code> — atravessam o Shadow DOM. Em <code>fx-checkbox</code>/<code>fx-switch</code>/<code>fx-radio</code> o two-way é por <code>checked</code> + <code>change</code> (o <code>v-model</code> de elemento usa <code>value</code> + <code>input</code>, não <code>checked</code>).</p>
			`,
		},
	],
};
