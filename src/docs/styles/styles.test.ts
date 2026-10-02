/**
 * Contrato de CSS da doc — gate contra tokens inexistentes.
 *
 * Bug que motivou este teste: `var(--fx-surface)` NÃO é emitido pelo tema
 * (o flatten gera `--fx-{grupo}-{chave}` → `--fx-surface-surface`), e uma
 * custom property indefinida invalida a declaração inteira → `background`
 * transparente. No desktop passa despercebido; no mobile o drawer ficava
 * transparente sobre o overlay com blur ("tudo embaçado").
 */
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tokenCssVars } from "../../core/theme";
import { darkTokens, defaultTokens } from "../../core/tokens";

/** Raiz do projeto (vitest roda na raiz do repositório). */
const ROOT = process.cwd();
const DIR = join(ROOT, "src", "docs", "styles");

/** Conjunto exato de `--fx-*` que `applyTokens()` escreve no documentElement. */
const EMITIDOS = new Set([
	...Object.keys(tokenCssVars(defaultTokens)),
	...Object.keys(tokenCssVars(darkTokens)),
]);

const CSS_FILES = readdirSync(DIR).filter((f) => f.endsWith(".css"));

/** Todos os `var(--fx-*)` referenciados num CSS (inclui fallbacks aninhados). */
const referenced = (css: string): string[] => [
	...new Set([...css.matchAll(/var\(\s*(--fx-[\w-]+)/g)].map((m) => m[1])),
];

describe("contrato de CSS da doc (styles/)", () => {
	it("há arquivos de estilo para auditar", () => {
		expect(CSS_FILES.length).toBeGreaterThanOrEqual(3);
	});

	it("só referencia tokens --fx-* que o tema realmente emite", () => {
		for (const arquivo of CSS_FILES) {
			const css = readFileSync(join(DIR, arquivo), "utf8");
			const invalidos = referenced(css).filter((t) => !EMITIDOS.has(t));
			expect(
				invalidos,
				`${arquivo}: tokens inexistentes → background/propriedade transparente: ${invalidos.join(", ")}`,
			).toEqual([]);
		}
	});

	it("shell.css mapeia superfícies opacas (sem --fx-surface cru)", () => {
		const css = readFileSync(join(DIR, "shell.css"), "utf8");
		// Superfície do shell = --fx-surface-surface com fallback opaco.
		expect(css).toMatch(
			/--doc-surface:\s*var\(--fx-surface-surface,\s*var\(--fx-surface-background\)\)/,
		);
		expect(css).not.toMatch(/var\(--fx-surface\)/);
		expect(css).not.toMatch(/var\(--fx-surface-hover\)/);
		// O drawer e o rodapé herdam a superfície opaca (nunca transparent).
		expect(css).toMatch(/\.doc-sidebar\s*\{[^}]*background:\s*var\(--doc-surface\)/);
		expect(css).toMatch(/\.doc-footer\s*\{[^}]*background:\s*var\(--doc-surface\)/);
	});

	it("campo de busca do header consome os mesmos tokens dos componentes", () => {
		const css = readFileSync(join(DIR, "shell.css"), "utf8");
		const bloco = (seletor: string): string => {
			const i = css.indexOf(seletor);
			return i < 0 ? "" : css.slice(i, css.indexOf("}", i) + 1);
		};
		// Altura, raio e fonte vêm dos tokens (igual fx-input) — nada fixo.
		const input = bloco(".search-box input {");
		expect(input).toContain("var(--fx-size-sm");
		expect(input).toContain("var(--fx-radius-full");
		expect(input).toContain("var(--fx-font-size");
		expect(input).toContain("appearance: none");
		// Anel de foco = mesmo token customizável dos demais campos.
		expect(bloco(".search-box input:focus-visible {")).toContain(
			"var(--fx-effect-focus-ring",
		);
		// Autofill do UA também é pintado com as cores do tema.
		expect(css).toContain(":-webkit-autofill");
	});

	it("inputs do card de formulários ficam confinados (min-width: 0 + largura fluida)", () => {
		const css = readFileSync(join(DIR, "content.css"), "utf8");
		const bloco = (seletor: string): string => {
			const i = css.indexOf(seletor);
			return i < 0 ? "" : css.slice(i, css.indexOf("}", i) + 1);
		};
		// O .uc-form é flex-item: sem min-width: 0 o min-content do input
		// (largura intrínseca) extravasa o card. Filhos também não travam.
		expect(bloco(".usecase-preview .uc-form {")).toContain("min-width: 0");
		expect(css).toContain(".usecase-preview .uc-form > *");
		// O host do fx-input tem 260px fixos por padrão: no card é fluido.
		const input = bloco(".usecase-preview .uc-form fx-input {");
		expect(input).toContain("width: 100%");
		expect(input).toContain("min-width: 0");
	});

	it("controles do drawer de temas ficam confinados às células (nada de encavalamento)", () => {
		// O CSS pode estar em CRLF (checkout no Windows): normalizar evita que a
		// busca pelo seletor falhe por causa da quebra de linha. Normalizar o
		// texto INTEIRO (e não só na busca) mantém os índices de slice coerentes.
		const css = readFileSync(join(DIR, "content.css"), "utf8").replace(/\r\n/g, "\n");
		const bloco = (seletor: string): string => {
			const i = css.indexOf(seletor);
			return i < 0 ? "" : css.slice(i, css.indexOf("}", i) + 1);
		};
		// Itens do grid não podem travar na largura intrínseca do conteúdo.
		expect(bloco(".theme-drawer-body .controls-grid > .control-item {")).toContain(
			"min-width: 0",
		);
		// Selects (max-content, mín 200px no host) e inputs (260px no host)
		// viram fluidos dentro das células estreitas do grid…
		const fluidos = bloco(
			".theme-drawer-body .controls-grid fx-select,\n.theme-drawer-body .controls-grid fx-input {",
		);
		expect(fluidos).toContain("width: 100%");
		expect(fluidos).toContain("min-width: 0");
		expect(fluidos).toContain("max-width: 100%");
		// …e nos campos soltos da aba Preset, que vive no mesmo drawer de 300px.
		const soltos = bloco(".theme-drawer-body .tab-content > .control-item > fx-input {");
		expect(soltos).toContain("width: 100%");
		expect(soltos).toContain("max-width: 100%");
	});

	it("rodapé: nada de documento interno nem licença que não existe", () => {
		const html = readFileSync(join(ROOT, "index.html"), "utf8");
		const footer = html.slice(
			html.indexOf("<footer"),
			html.indexOf("</footer>") + 9,
		);
		const links = [...footer.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([^<]*)<\/a>/g)].map(
			([, href, texto]) => [href ?? "", (texto ?? "").trim()] as const,
		);
		expect(
			links.length,
			"rodapé sem nenhum link? verifique o markup do index.html",
		).toBeGreaterThan(0);
		for (const [url] of links) {
			// Segurança/CI interno (SECURITY.md etc.) não é conteúdo de usuário.
			expect(
				/SECURITY|CONTRIBUTING|CODE_OF_CONDUCT|\.github/i.test(url),
				`link interno no rodapé: ${url}`,
			).toBe(false);
			// Referência a arquivo do repo (..blob../..raw..) só se o arquivo existir.
			const blob = url.match(
				/github\.com\/[\w-]+\/[\w.-]+\/blob\/[\w.-]+\/(.+)$/i,
			);
			if (blob) {
				expect(
					existsSync(join(ROOT, blob[1])),
					`link do rodapé quebra (arquivo não existe no repo): ${url}`,
				).toBe(true);
			}
		}
		// O texto da licença acompanha o package.json (hoje: "ISC", não "MIT").
		const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
			license: string;
		};
		const licença = links.find(([href]) =>
			/npmjs\.com\/package/i.test(href),
		);
		expect(licença, "rodapé precisa de um link de licença").toBeTruthy();
		expect(licença![1]).toContain(pkg.license);
	});
});
