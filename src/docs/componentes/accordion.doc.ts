/**
 * Documentação do componente <fx-accordion>.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 */
import type { ComponentDoc } from '../types';

export const accordionDoc: ComponentDoc = {
	tag: "fx-accordion",
	title: "Accordion",
	group: "Navegação",
	lead: "Conjunto de painéis expansíveis no estilo PrimeVue. No modo padrão, abrir um painel fecha os outros; com o atributo `multiple`, vários painéis podem ficar abertos ao mesmo tempo.",
	imports: [
		'import { defineFxAccordion, defineFxAccordionPanel } from "@wrrdev/fenix-ui/accordion";',
		"defineFxAccordion();",
		"defineFxAccordionPanel();",
	],
	demoHtml: (a) =>
		`<fx-accordion ${a} style="max-width:640px">
			<fx-accordion-panel value="p1" header="What is this service about?">
				This service provides a simple way to organize content into collapsible sections, keeping the interface clean while information stays accessible.
			</fx-accordion-panel>
			<fx-accordion-panel value="p2" header="Is my data secure?">
				Yes. All data is encrypted in transit and at rest, following industry best practices for security and privacy.
			</fx-accordion-panel>
			<fx-accordion-panel value="p3" header="Can I upgrade or downgrade my plan later?">
				Absolutely. You can change your subscription plan at any time from your account settings. Changes take effect immediately, and any billing adjustments are handled automatically.
			</fx-accordion-panel>
		</fx-accordion>`,
	variantsHtml: () =>
		`<div style="display:flex;flex-direction:column;gap:24px;max-width:640px">
			<div>
				<strong>Single (padrão — abre um, fecha os outros)</strong>
				<fx-accordion>
					<fx-accordion-panel value="a1" header="Primeiro painel">Conteúdo do primeiro painel.</fx-accordion-panel>
					<fx-accordion-panel value="a2" header="Segundo painel">Conteúdo do segundo painel.</fx-accordion-panel>
				</fx-accordion>
			</div>
			<div>
				<strong>Multiple (mantém os outros abertos)</strong>
				<fx-accordion multiple>
					<fx-accordion-panel value="m1" header="Painel A">Conteúdo do painel A.</fx-accordion-panel>
					<fx-accordion-panel value="m2" header="Painel B">Conteúdo do painel B.</fx-accordion-panel>
					<fx-accordion-panel value="m3" header="Painel C" disabled>Painel desabilitado.</fx-accordion-panel>
				</fx-accordion>
			</div>
		</div>`,
	controls: [
		{
			kind: "toggle",
			attr: "multiple",
			label: "Múltiplo",
			on: false,
		},
	],
	attributes: [
		{
			name: "value",
			type: "string",
			default: "''",
			desc: "Valor(es) ativo(s) do accordion, separados por vírgula no modo multiple. Ex.: value=\"p1\" ou value=\"p1,p2\".",
		},
		{
			name: "multiple",
			type: "boolean",
			default: "false",
			desc: "Permite manter vários painéis abertos ao mesmo tempo.",
		},
	],
	events: [
		{
			name: "change",
			type: "CustomEvent<{ value: string[] }>",
			desc: "Emitido quando o conjunto de painéis abertos muda.",
		},
	],
};
