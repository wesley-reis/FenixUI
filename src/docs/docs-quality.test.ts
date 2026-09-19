/**
 * Qualidade da documentação — gate de formatação e completude.
 *
 * Garante que toda página de componente (1) tem os metadados obrigatórios,
 * (2) produz HTML bem formado (sem tags não fechadas, que o parser
 * "consertaria" silenciosamente e bagunçaria o layout dos exemplos) e
 * (3) tem linhas de API completas nas tabelas.
 */
import { describe, it, expect } from "vitest";
import { componentDocs } from "./componentes";
import type { ComponentDoc } from "./types";

/** Tags HTML que aparecem nos exemplos e precisam estar balanceadas. */
const TAGS = [
	"div", "span", "p", "strong", "label", "ul", "li", "button", "em", "b", "h4", "small",
] as const;

/** Conta abertura e fechamento de cada tag num trecho de HTML. */
function balance(html: string): Array<[string, number, number]> {
	return TAGS.map((tag) => {
		const open = (html.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;
		const close = (html.match(new RegExp(`</${tag}>`, "g")) ?? []).length;
		return [tag, open, close] as [string, number, number];
	}).filter(([, open, close]) => open !== close);
}

/** Todo o HTML de exemplo de uma página (demo + variantes). */
function examplesHtml(doc: ComponentDoc): string {
	return `${doc.demoHtml("")}${doc.variantsHtml?.() ?? ""}`;
}

describe("documentação: metadados", () => {
	it("há páginas de componentes registradas", () => {
		expect(componentDocs.length).toBeGreaterThan(20);
	});

	it.each(componentDocs.map((d) => [d.tag, d] as const))(
		"%s tem metadados completos e coerentes",
		(tag, doc) => {
			expect(doc.tag).toBe(tag);
			expect(doc.tag.startsWith("fx-")).toBe(true);
			expect(doc.title.trim().length).toBeGreaterThan(1);
			expect(doc.group.trim().length).toBeGreaterThan(1);
			expect(doc.lead.trim().length).toBeGreaterThan(20);
			expect(doc.imports.length).toBeGreaterThan(0);
			expect(doc.imports[0]).toContain(`@wrrdev/fenix-ui/`);
			expect(doc.controls.length).toBeGreaterThan(0);
			expect(doc.attributes.length).toBeGreaterThan(0);
		},
	);

	it("páginas são únicas por tag (sem duplicatas no sidebar)", () => {
		const tags = componentDocs.map((d) => d.tag);
		expect(new Set(tags).size).toBe(tags.length);
	});

	/** Grupos canônicos do sidebar — evita "Formulario"/"Formulário" separados. */
	const GROUPS = ["Dados", "Exibição", "Feedback", "Formulário", "Layout", "Navegação"];

	it("grupos do sidebar são canônicos (sem variações de acento/typo)", () => {
		const used = [...new Set(componentDocs.map((d) => d.group))].sort();
		expect(used).toEqual([...GROUPS].sort());
	});
});

describe("documentação: HTML dos exemplos", () => {
	it.each(componentDocs.map((d) => [d.tag, d] as const))(
		"%s tem exemplos com tags balanceadas",
		(_tag, doc) => {
			const unbalanced = balance(examplesHtml(doc));
			expect(unbalanced, `tags desbalanceadas: ${JSON.stringify(unbalanced)}`).toEqual([]);
		},
	);

	it.each(componentDocs.map((d) => [d.tag, d] as const))(
		"%s: o playground renderiza componentes fx-*",
		(_tag, doc) => {
			// O toast, por exemplo, é imperativo (API FenixToast) e o demo usa
			// fx-button como disparador — por isso a checagem é por família fx-*.
			expect(doc.demoHtml("")).toContain("<fx-");
		},
	);
});

describe("documentação: tabelas de API", () => {
	it.each(componentDocs.map((d) => [d.tag, d] as const))(
		"%s: todo atributo tem nome e descrição",
		(_tag, doc) => {
			for (const row of doc.attributes) {
				expect(row.name.trim().length).toBeGreaterThan(0);
				expect(row.desc.trim().length).toBeGreaterThan(0);
			}
		},
	);

	it.each(componentDocs.map((d) => [d.tag, d] as const))(
		"%s: eventos/slots/variáveis, quando existem, têm descrição",
		(_tag, doc) => {
			for (const row of [...(doc.events ?? []), ...(doc.slots ?? []), ...(doc.cssVars ?? [])]) {
				expect(row.name.trim().length).toBeGreaterThan(0);
				expect(row.desc.trim().length).toBeGreaterThan(0);
			}
		},
	);

	it.each(componentDocs.map((d) => [d.tag, d] as const))(
		"%s: controles do playground têm attr, label e valores válidos",
		(_tag, doc) => {
			for (const c of doc.controls) {
				expect(c.attr.trim().length).toBeGreaterThan(0);
				expect(c.label.trim().length).toBeGreaterThan(0);
				if (c.kind === "select") expect(c.options?.length ?? 0).toBeGreaterThan(0);
			}
		},
	);
});