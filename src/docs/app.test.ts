/**
 * Teste de integração da documentação: monta o DOM do index.html,
 * carrega o app da doc e valida a renderização de cada página.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { applyPreset } from "../core/presets";

document.body.innerHTML = `
  <select id="preset-select"></select>
  <button id="mode-toggle"></button>
  <aside id="sidebar"></aside>
  <main id="main"></main>
`;

// Pré-registra todos os componentes para evitar timing de lazy-load nos testes.
const app = await import("../docs/app");
const loaders = app.componentLoaders;
await Promise.all(Object.values(loaders).map((l) => l()));

const main = () => document.getElementById("main")!;

/** Navega para a rota e aguarda a renderização (hashchange dispara renderRoute async). */
async function navigate(route: string): Promise<void> {
	location.hash = `#/${route}`;
	window.dispatchEvent(new Event("hashchange"));
	// Aguarda o ciclo completo: import lazy + whenDefined + innerHTML + refresh.
	await new Promise((r) => setTimeout(r, 0));
	await app.currentRouteReady();
}

describe("docs app", () => {
	beforeEach(async () => {
		await navigate("introduction");
	});

	it("constrói a sidebar com todos os componentes", async () => {
		const links = [...document.querySelectorAll("#sidebar a")].map((a) =>
			a.getAttribute("href"),
		);
		expect(links).toContain("#/fx-button");
		expect(links).toContain("#/fx-badge");
		expect(links).toContain("#/fx-select");
		expect(links).toContain("#/fx-input");
		expect(links).toContain("#/fx-switch");
		expect(links).toContain("#/fx-multiselect");
		expect(links).toContain("#/fx-spinner");
		expect(links).toContain("#/theming");
	});

	it("página do button renderiza playground com fx-button ao vivo", async () => {
		await navigate("fx-button");
		expect(main().querySelector("#stage fx-button")).toBeTruthy();
	});

	it("página do badge renderiza playground com fx-badge ao vivo", async () => {
		await navigate("fx-badge");
		expect(main().querySelector("#stage fx-badge")).toBeTruthy();
	});

	it("página do spinner renderiza playground com fx-spinner ao vivo", async () => {
		await navigate("fx-spinner");
		const spinner = main().querySelector("#stage fx-spinner") as HTMLElement;
		expect(spinner).toBeTruthy();
		expect(spinner.shadowRoot?.querySelector(".spinner")).toBeTruthy();
	});

	it("controles do playground (fx-select) atualizam atributos ao vivo", async () => {
		await navigate("fx-button");
		const select = main().querySelector(
			'fx-select[data-attr="variant"]',
		) as any;
		expect(select).toBeTruthy();
		select.value = "danger";
		select.dispatchEvent(new Event("change"));
		const btn = main().querySelector("#stage fx-button")!;
		expect(btn.getAttribute("variant")).toBe("danger");
	});

	it("página do floatlabel: label vive no shadow e a variante muda pelo controle", async () => {
		await navigate("fx-floatlabel");
		const fl = main().querySelector("#stage fx-floatlabel") as HTMLElement;
		expect(fl).toBeTruthy();
		const flabel = fl.shadowRoot?.querySelector(
			".flabel",
		) as HTMLElement | null;
		expect(flabel).toBeTruthy();
		expect(flabel?.textContent).toBe("Nome de usuário");
		// O CSS do shadow posiciona a label absolutamente sobre a borda.
		// (jsdom não computa estilos de Shadow DOM, então validamos a regra no stylesheet.)
		expect((fl.constructor as any).styles).toMatch(
			/\.flabel\s*\{[^}]*position:\s*absolute/s,
		);

		// Trocar a variante no controle atualiza o atributo do componente.
		const sel = main().querySelector('fx-select[data-attr="variant"]') as any;
		sel.value = "over";
		sel.dispatchEvent(new Event("change"));
		const fl2 = main().querySelector("#stage fx-floatlabel") as HTMLElement;
		expect(fl2.getAttribute("variant")).toBe("over");
		expect(fl2.shadowRoot?.querySelector(".flabel")).toBeTruthy();
	});

	it("página de temas renderiza preview com input e select do tema ativo", async () => {
		await navigate("theming");
		expect(main().querySelector(".demo-stage fx-input")).toBeTruthy();
		expect(main().querySelector(".demo-stage fx-select")).toBeTruthy();
	});

	it("troca de preset em theming reflete na variável CSS e persiste ao navegar", async () => {
		applyPreset("seiya", "light");
		await navigate("theming");
		expect(
			document.documentElement.style.getPropertyValue("--fx-color-primary"),
		).toBe("#e11d48");
		// ...e ao sair e voltar, também permanece
		await navigate("introduction");
		await navigate("theming");
		expect(
			document.documentElement.style.getPropertyValue("--fx-color-primary"),
		).toBe("#e11d48");
	});

	it("página de temas lista presets dos cavaleiros e pinta swatches", async () => {
		await navigate("theming");
		expect(
			document.getElementById("swatches")!.children.length,
		).toBeGreaterThan(0);
		const opts = [...document.querySelectorAll("#th-preset option")].map(
			(o) => o.getAttribute("value"),
		);
		expect(opts).toContain("seiya");
	});
	it("playground do drawer: renderiza no stage", async () => {
		await navigate("fx-drawer");
		await new Promise((r) => setTimeout(r, 50));
		const stage = main().querySelector("#stage")!;
		expect(stage.querySelector("fx-drawer")).toBeTruthy();
	});

	it.each([
		"fx-textarea",
		"fx-dialog",
		"fx-tooltip",
		"fx-tabs",
		"fx-progress",
		"fx-skeleton",
		"fx-alert",
		"fx-dropdown",
		"fx-pagination",
		"fx-autocomplete",
		"fx-table",
	])("página %s renderiza playground ao vivo", async (route) => {
		await navigate(route);
		expect(main().querySelector(`#stage ${route}`)).toBeTruthy();
	});

	it("página do toast: botões disparam a API FenixToast", async () => {
		await navigate("fx-toast");
		const btns = main().querySelectorAll("#stage fx-button");
		expect(btns.length).toBeGreaterThanOrEqual(4);
		// A API imperativa está disponível globalmente
		expect((window as any).FenixToast).toBeTruthy();
	});

	it("página da table exibe os dados fictícios no primeiro render", async () => {
		await navigate("fx-table");
		const table = main().querySelector("#stage fx-table") as any;
		expect(table).toBeTruthy();
		await new Promise((r) => setTimeout(r, 0));
		expect(table.data.length).toBeGreaterThan(0);
		expect(
			table.shadowRoot!.querySelectorAll("tbody tr").length,
		).toBeGreaterThan(0);
	});
});
