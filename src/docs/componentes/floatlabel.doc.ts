/**
 * Documentação do componente <fx-floatlabel>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const floatlabelDoc: ComponentDoc = {
	tag: 'fx-floatlabel',
	title: 'FloatLabel',
	group: 'Formulário',
	lead: 'Rótulo flutuante  comporta-se como placeholder quando vazio e sobe para o topo do campo ao focar, abrir ou preencher valor. A <label> do light DOM é MOVIDA para o Shadow DOM na primeira renderização (não sobra cópia no light DOM — nada que o consumidor/CSS possa reexibir); o clique na label foca o campo.',
	imports: ['import \'@wrrdev/fenix-ui/floatlabel\';'],
	extraSections: [
		{
			title: 'name, id e autocomplete ficam no CONTROLE (não no floatlabel)',
			html: `
				<p>O <code>fx-floatlabel</code> é um wrapper de layout: não cria nenhum controle nativo e apenas projeta os filhos via <code>&lt;slot&gt;</code> (a <code>&lt;label&gt;</code> do light DOM é movida para o Shadow DOM). Por isso <code>name</code>, <code>id</code> e <code>autocomplete</code> pertencem ao <b>campo</b> — <code>&lt;fx-input&gt;</code>, <code>&lt;fx-select&gt;</code>, <code>&lt;fx-textarea&gt;</code>… — e não precisam (nem devem) ser repetidos no wrapper:</p>
				<pre><code>&lt;fx-floatlabel&gt;
  &lt;fx-input id="usuario" name="usuario" autocomplete="username"&gt;&lt;/fx-input&gt;
  &lt;label for="usuario"&gt;Usuário&lt;/label&gt;
&lt;/fx-floatlabel&gt;</code></pre>
				<p>O floatlabel espelha no controle apenas atributos de <b>apresentação</b>: <code>full</code>, <code>icon</code>, <code>icon-pos</code> e <code>error</code>/<code>success</code>. O <code>for</code> da label é preservado, mas não cruza a fronteira do shadow — o clique na label foca o campo por listener próprio do componente.</p>
				<p>A regra completa de autofill (default <code>off</code>, tokens semânticos e o caso do login) está em <a href="#/fx-input">fx-input</a>.</p>
			`,
		},
	],
	demoHtml: (a) =>
		`<fx-floatlabel ${a}><fx-input id="demo-fl-input"></fx-input><label for="demo-fl-input">Nome de usuário</label></fx-floatlabel>`,
	variantsHtml: () =>
		`<div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start;">
          <fx-floatlabel><fx-input id="fl-nome"></fx-input><label for="fl-nome">Nome</label></fx-floatlabel>
          <fx-floatlabel variant="in"><fx-input id="fl-email"></fx-input><label for="fl-email">E-mail</label></fx-floatlabel>
          <fx-floatlabel variant="over"><fx-input id="fl-tel"></fx-input><label for="fl-tel">Telefone</label></fx-floatlabel>
          <fx-floatlabel error><fx-input id="fl-err" value="valor inválido"></fx-input><label for="fl-err">Campo com erro</label></fx-floatlabel>
        </div>
        <h4>Ícone (attr icon + icon-pos)</h4>
        <p>O ícone fica DENTRO do campo, sobre o padding (padrão Material/PrimeVue). Use attr icon ou slot="icon"</p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <fx-floatlabel icon="search"><fx-input id="fl-icon-search"></fx-input><label for="fl-icon-search">Buscar</label></fx-floatlabel>
          <fx-floatlabel icon="lock" icon-pos="right"><fx-input id="fl-icon-lock" type="password"></fx-input><label for="fl-icon-lock">Senha</label></fx-floatlabel>
          <fx-floatlabel full icon="mail"><fx-input id="fl-icon-mail"></fx-input><label for="fl-icon-mail">E-mail</label></fx-floatlabel>
        </div>
        <h4>Full width (full)</h4>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">O full do floatlabel é propagado automaticamente para o controle interno (fx-input, fx-select, …) — não é preciso repetir o atributo no campo.</p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <fx-floatlabel full><fx-input id="fl-full"></fx-input><label for="fl-full">Nome completo</label></fx-floatlabel>
          <fx-floatlabel full><fx-select id="fl-full-uf"><option value="sp">São Paulo</option><option value="rj">Rio de Janeiro</option></fx-select><label for="fl-full-uf">Estado</label></fx-floatlabel>
          <div>
            <strong style="font-size:12px;color:var(--fx-text-muted)">full + button na mesma linha: pai com display:flex</strong>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
              <fx-floatlabel full><fx-input id="fl-full-btn"></fx-input><label for="fl-full-btn">Buscar</label></fx-floatlabel>
              <fx-button>OK</fx-button>
            </div>
          </div>
        </div>
      </div>`,
	controls: [
		{
			kind: 'select',
			attr: 'variant',
			label: 'Variante',
			options: ['on', 'in', 'over'],
		},
		{ kind: 'toggle', attr: 'error', label: 'Erro' },
		{ kind: 'toggle', attr: 'success', label: 'Sucesso' },
		{ kind: 'toggle', attr: 'full', label: 'Largura total (full)' },
		{ kind: 'text', attr: 'icon', label: 'Ícone', hint: 'glifo Fenix Icons (ex.: search) ou emoji' },
		{
			kind: 'select',
			attr: 'icon-pos',
			label: 'Posição do ícone',
			options: ['left', 'right'],
			value: 'left',
		},
	],
	attributes: [
		{
			name: 'variant',
			type: `'on' | 'in' | 'over'`,
			default: `'on'`,
			desc: 'Posição da label: "on" (borda, padrão), "in" (placeholder interno), "over" (acima do campo).',
		},
		{
			name: 'error / invalid',
			type: 'boolean',
			default: 'false',
			desc: 'Indica estado de erro (rótulo e borda em vermelho).',
		},
		{
			name: 'success / valid',
			type: 'boolean',
			default: 'false',
			desc: 'Indica estado de sucesso (rótulo e borda em verde).',
		},
		{
			name: 'active',
			type: 'boolean',
			default: 'false',
			desc: 'Refletido automaticamente quando o campo contém valor, foco ou dropdown aberto. Apenas levanta a label (não muda a cor).',
		},
		{
			name: 'focus',
			type: 'boolean',
			default: 'false',
			desc: 'Refletido automaticamente quando o campo está focado ou com dropdown aberto. É o que destaca a label em primária; error/invalid e success/valid têm prioridade.',
		},
		{
			name: 'full',
			type: 'boolean',
			default: 'false',
			desc: 'Largura 100% acompanhando o elemento pai (host vira block). O full é propagado automaticamente para o controle interno (fx-input, fx-select, …), que também estica.',
		},
		{
			name: 'icon',
			type: 'string',
			default: "''",
			desc: 'Ícone dentro do campo (padrão Material/PrimeVue), sobre o padding: nome do glifo Fenix Icons (ex.: icon="search") ou emoji/texto livre. Tamanho via --fx-input-icon-size.',
		},
		{
			name: 'icon-pos',
			type: "'left' | 'right'",
			default: "'left'",
			desc: 'Posição do ícone dentro do campo.',
		},
	],
	events: [],
	slots: [
		{
			name: '(padrão)',
			desc: 'Contém exatamente um campo de controle (fx-input, fx-select, etc.) e um <label>. A label é MOVIDA para o Shadow DOM no primeiro render — escreva-a normalmente no light DOM (com for apontando o id do controle, se quiser); depois dela não existe cópia no light DOM.',
		},
	],
};
