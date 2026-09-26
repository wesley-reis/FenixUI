/**
 * Documentação do componente <fx-icon>.
 *
 * Elemento de glifo com `name` tipado: é ele que dá autocomplete dos +4.000
 * nomes da Fenix Icons no editor (Volar/vue-tsc, React/TSX).
 */
import type { ComponentDoc } from '../types';

export const iconDoc: ComponentDoc = {
	tag: "fx-icon",
	title: "Icon",
	group: "Exibição",
	lead:
		"Glifo da Fenix Icons com autocomplete no editor: o atributo name é tipado com todos os nomes da fonte (+4.000), então o editor sugere os válidos enquanto você digita — sem precisar consultar a doc.",
	imports: ["import '@wrrdev/fenix-ui/icon';"],
	demoHtml: (a) => `<fx-icon ${a}></fx-icon>`,
	variantsHtml: () =>
		`
  <h4>Tamanhos</h4>
  <div style="display:flex;gap:16px;align-items:center">
    <fx-icon name="settings" size="sm"></fx-icon>
    <fx-icon name="settings" size="md"></fx-icon>
    <fx-icon name="settings" size="lg"></fx-icon>
    <fx-icon name="settings" size="xl"></fx-icon>
  </div>
  <h4>Variantes da fonte</h4>
  <div style="display:flex;gap:16px;align-items:center">
    <fx-icon name="favorite" size="lg"></fx-icon>
    <fx-icon name="favorite" size="lg" fill></fx-icon>
    <fx-icon name="favorite" size="lg" bold></fx-icon>
  </div>
  <h4>Acessibilidade</h4>
  <div style="display:flex;gap:16px;align-items:center">
    <fx-icon name="delete" size="lg" label="Excluir"></fx-icon>
    <fx-icon name="add_alert" size="lg"></fx-icon>
  </div>
  <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">Sem <code>label</code> o ícone é decorativo (<code>aria-hidden</code>); com <code>label</code> vira <code>role="img"</code> + <code>aria-label</code>.</p>
  <h4>Texto livre / emoji</h4>
  <div style="display:flex;gap:16px;align-items:center;font-size:24px">
    <fx-icon name="⚠️"></fx-icon>
    <fx-icon name="🔥"></fx-icon>
  </div>`,
	controls: [
		{ kind: "text", attr: "name", label: "Nome do glifo", hint: "ex.: home, settings, delete", value: "home" },
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg", "xl"], value: "md" },
		{ kind: "text", attr: "label", label: "Label (a11y)", hint: "nome acessível; vazio = decorativo" },
		{ kind: "toggle", attr: "fill", label: "Preenchido (fill)" },
		{ kind: "toggle", attr: "bold", label: "Traço pesado (bold)" },
	],
	attributes: [
		{
			name: "name",
			type: "FenixIconName (string)",
			default: "—",
			desc: "Nome do glifo. No editor o valor sugere TODOS os nomes válidos da fonte; texto livre/emoji também funciona (renderizado como texto).",
		},
		{
			name: "size",
			type: "'sm' | 'md' | 'lg' | 'xl'",
			default: "—",
			desc: "Tamanho do glifo (16/20/24/32px). Sem atributo herda o tamanho do texto (1em).",
		},
		{
			name: "label",
			type: "string",
			default: "''",
			desc: "Nome acessível. Sem label o ícone é aria-hidden (decorativo); com label usa role=\"img\" + aria-label.",
		},
		{ name: "fill", type: "boolean", default: "false", desc: "Variante preenchida da fonte." },
		{ name: "bold", type: "boolean", default: "false", desc: "Traço mais pesado (wght 600)." },
	],
	cssVars: [
		{ name: "--fx-icon-size", desc: "Tamanho padrão do glifo (usado quando não há size). Também -sm/-md/-lg/-xl." },
	],
	initNote:
		"Import único por projeto (o FenixAutoImport já injeta automaticamente ao detectar <fx-icon>). O elemento carrega apenas o @font-face — leve, sem as ~4.300 classes por ícone.",
};
