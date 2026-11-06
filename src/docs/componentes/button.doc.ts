/**
 * Documentação do componente <fx-button>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';
import { buttonVariants, buttonSeverities, sizes } from '../shared';

/**
 * Handler do exemplo clicável abaixo: alterna `loading` (ícone → spinner → ícone).
 * `this` é o próprio `<fx-button>` no handler inline.
 */
const LOADING_DEMO_HANDLER =
  "const b=this;if(b.hasAttribute('loading'))return;b.setAttribute('loading','');setTimeout(function(){b.removeAttribute('loading')},1500)";

export const buttonDoc: ComponentDoc = {
	tag: "fx-button",
	title: "Button",
	group: "Formulário",
	lead: "Botão acionável com variantes semânticas, tamanhos, ícone via atributo ou slot e estado de carregamento integrado. Form-associated: type=\"submit\" submete o <form> em que vive e type=\"reset\" o limpa.",
	imports: ["import '@wrrdev/fenix-ui/button';", "import '@wrrdev/fenix-ui/icons'; // para o attr icon (glifos Fenix Icons)"],
	demoHtml: (a) => `<fx-button ${a}>Confirmar ação</fx-button>`,
	variantsHtml: () =>
		`<div style="display: flex; flex-direction: column; gap: 16px;">
        <h4>Formas (variant)</h4>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">` +
		buttonVariants
			.map((v) => `<fx-button variant="${v}">${v}</fx-button>`)
			.join("") +
		`</div>
        <h4>Cores (severity)</h4>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">` +
		buttonSeverities
			.map((s) => `<fx-button severity="${s}">${s}</fx-button>`)
			.join("") +
		`</div>
        <h4>Forma × cor (ex.: outline com cada cor)</h4>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">` +
		buttonSeverities
			.map((s) => `<fx-button variant="outline" severity="${s}">${s}</fx-button>`)
			.join("") +
		`</div>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px"><b>Forma e cor são dimensões separadas</b>: a forma vai em <code>variant</code> (<code>solid</code> · <code>outline</code> · <code>ghost</code>) e a cor em <code>severity</code>. Combinam livremente — ex.: <code>variant="outline" severity="danger"</code>. Por retrocompatibilidade os valores de cor antigos em <code>variant</code> (ex.: <code>variant="danger"</code>) seguem funcionando como alias de sólido + cor. O <code>outline</code> usa fundo sólido claro (<code>--fx-button-outline-bg</code>).</p>
        <h4>Tamanhos</h4>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <fx-button size="sm">Pequeno</fx-button>
          <fx-button>Normal (md)</fx-button>
          <fx-button size="lg">Grande</fx-button>
        </div>
        <h4>Ícone (attr icon + icon-pos)</h4>
        <p>O ícone usa o attr <code>icon</code> (glifo Fenix Icons via ligadura ou emoji/texto livre) ou <code>slot="icon"</code> (ícone custom — vence o attr). Tamanho via <code>--fx-button-icon-size</code> (padrão: fonte + 6px, igual ao input).</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <fx-button icon="search">Buscar</fx-button>
          <fx-button variant="secondary" icon="download">Baixar</fx-button>
          <fx-button variant="success" icon="check">Confirmar</fx-button>
          <fx-button variant="danger" icon="delete">Excluir</fx-button>
          <fx-button variant="outline" icon="arrow_forward" icon-pos="right">Avançar</fx-button>
          <fx-button icon="⭐">Emoji (texto livre)</fx-button>
          <fx-button><i slot="icon" class="fx-icon fx-icon-save"></i>Slot vence attr</fx-button>
        </div>
        <h4>Só ícone (icon-only)</h4>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <fx-button icon="search" aria-label="Buscar"></fx-button>
          <fx-button variant="outline" icon="close" aria-label="Fechar"></fx-button>
        </div>
        <h4>Estados</h4>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <fx-button loading>Carregando</fx-button>
          <fx-button disabled>Desabilitado</fx-button>
        </div>
        <h4>Loading com ícone (clique para testar)</h4>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Ao clicar, o <b>ícone some</b> e o <b>spinner aparece no lugar dele</b> (respeitando <code>icon-pos</code>); sem ícone, o spinner cai no fim do botão. Ao terminar, o <b>ícone volta</b>. Basta alternar o atributo <code>loading</code>.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <fx-button icon="save" onclick="${LOADING_DEMO_HANDLER}">Salvar</fx-button>
          <fx-button variant="outline" severity="danger" icon="delete" icon-pos="right" onclick="${LOADING_DEMO_HANDLER}">Excluir</fx-button>
          <fx-button variant="ghost" severity="success" icon="check" onclick="${LOADING_DEMO_HANDLER}">Confirmar</fx-button>
          <fx-button icon="search" aria-label="Buscar" onclick="${LOADING_DEMO_HANDLER}"></fx-button>
        </div>
        <h4>Full width (full)</h4>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">O host vira <code>block</code> e o botão ocupa 100% do pai. Para botão ao lado de um campo, envolva num pai com <code>display:flex</code>.</p>
        <div style="display:flex;flex-direction:column;gap:12px">
          <fx-button full icon="save">Salvar (largura total)</fx-button>
          <div>
            <strong style="font-size:12px;color:var(--fx-text-muted)">full + campo na mesma linha: pai com display:flex</strong>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
              <fx-input full icon="search" placeholder="Buscar"></fx-input>
              <fx-button icon="search">OK</fx-button>
            </div>
          </div>
        </div>
      </div>`,
	controls: [
		{
			kind: "select",
			attr: "variant",
			label: "Forma (variant)",
			options: buttonVariants,
			value: "solid",
		},
		{
			kind: "select",
			attr: "severity",
			label: "Cor (severity)",
			options: buttonSeverities,
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
		{ kind: "text", attr: "icon", label: "Ícone", hint: "glifo Fenix Icons (ex.: save) ou emoji" },
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
			name: "variant",
			type: `'solid' | 'outline' | 'ghost'`,
			default: `'solid'`,
			desc: "Forma do botão — nunca carrega cor. Os valores de cor antigos (primary…info) seguem aceitos como alias de sólido + cor.",
		},
		{
			name: "severity",
			type: `'${buttonSeverities.join("' | '")}'`,
			default: `'primary'`,
			desc: "Cor semântica — dimensão separada da forma. Combina com qualquer forma (ex.: variant=\"outline\" severity=\"danger\").",
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
			desc: "Tipo do button nativo. Dentro de um <form>: \"submit\" dispara requestSubmit (o Enter com foco no botão também) e \"reset\" chama form.reset(). Um <form>/<fieldset> disabled desabilita o botão automaticamente.",
		},
		{
			name: "full",
			type: "boolean",
			default: "false",
			desc: "Ocupa 100% da largura do container (o host vira block; o botão interno estica).",
		},
		{
			name: "icon",
			type: "string",
			default: "''",
			desc: `Ícone antes do rótulo: nome do glifo Fenix Icons (ex.: icon="save", via ligadura) ou emoji/texto livre. O slot "icon" vence o atributo.`,
		},
		{
			name: "icon-pos",
			type: `'left' | 'right'`,
			default: `'left'`,
			desc: "Posição do ícone em relação ao rótulo.",
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
			desc: `Ícone custom antes do rótulo (<i slot="icon" class="fx-icon fx-icon-save"></i>). Vence o attr icon.`,
		},
	],
	cssVars: [
		{
			name: "--fx-button-icon-size",
			type: "length",
			default: "calc(var(--fx-font-size) + 6px)",
			desc: "Tamanho do ícone (attr icon ou slot) — mesma métrica do --fx-input-icon-size. Aumente ex.: style=\"--fx-button-icon-size: 24px\".",
		},
		{
			name: "--fx-button-outline-bg",
			type: "color",
			default: "var(--fx-surface-background)",
			desc: "Fundo da variante outline (sólido e claro — branco no tema claro, escuro no dark). Sem fundo sólido a superfície cinza do card aparecia através do botão. O hover deriva 10% da cor primária sobre este fundo.",
		},
	],
};
