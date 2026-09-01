/**
 * Documentação do componente <fx-floatlabel>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const floatlabelDoc: ComponentDoc = {
	tag: "fx-floatlabel",
	title: "FloatLabel",
	group: "Formulário",
	lead: "Rótulo flutuante  comporta-se como placeholder quando vazio e sobe para o topo do campo ao focar, abrir ou preencher valor.",
	imports: ["import '@wrrdev/fenix-ui/floatlabel';"],
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
};
