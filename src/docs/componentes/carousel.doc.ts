/**
 * Documentação do componente <fx-carousel>.
 */
import type { ComponentDoc } from '../types';

export const carouselDoc: ComponentDoc = {
	tag: "fx-carousel",
	title: "Carousel",
	group: "Layout",
	lead: "Carrossel de slides com setas, indicadores, autoplay e loop. Slides via slot=\"slide\".",
	imports: ["import '@wrrdev/fenix-ui/carousel';"],
	demoHtml: (attrs) =>
		`<fx-carousel ${attrs} style="width:100%"><div slot="slide" style="background:var(--fx-color-primary);color:#fff;border-radius:8px;width:100%;height:160px;display:flex;align-items:center;justify-content:center;font-size:20px">Slide 1</div><div slot="slide" style="background:var(--fx-color-secondary);color:#fff;border-radius:8px;width:100%;height:160px;display:flex;align-items:center;justify-content:center;font-size:20px">Slide 2</div><div slot="slide" style="background:var(--fx-color-info);color:#fff;border-radius:8px;width:100%;height:160px;display:flex;align-items:center;justify-content:center;font-size:20px">Slide 3</div></fx-carousel>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:24px"><div><strong style="font-size:12px;color:var(--fx-text-muted)">Com loop e autoplay (3s)</strong><fx-carousel loop autoplay="3000" show-indicators style="width:100%"><div slot="slide" style="padding:32px;text-align:center"><h4 style="margin:0 0 8px">Automático</h4><p style="margin:0">Avança sozinho a cada 3 segundos.</p></div><div slot="slide" style="padding:32px;text-align:center"><h4 style="margin:0 0 8px">Loop</h4><p style="margin:0">Volta ao início ao passar do último.</p></div></fx-carousel></div></div>`;
	},
	controls: [
		{ kind: "toggle", attr: "show-arrows", label: "Setas", on: true },
		{ kind: "toggle", attr: "show-indicators", label: "Indicadores", on: true },
		{ kind: "toggle", attr: "loop", label: "Loop" },
		{ kind: "text", attr: "autoplay", label: "Autoplay (ms)", hint: "0 = desligado" },
	],
	attributes: [
		{ name: "active", type: "number", default: "0", desc: "Índice do slide ativo." },
		{ name: "show-arrows", type: "boolean", default: "false", desc: "Exibe setas de navegação." },
		{ name: "show-indicators", type: "boolean", default: "false", desc: "Exibe indicadores (pontos)." },
		{ name: "autoplay", type: "number", default: "0", desc: "Intervalo em ms para avançar automaticamente (0 = desligado)." },
		{ name: "loop", type: "boolean", default: "false", desc: "Volta ao início ao passar do último." },
	],
	events: [
		{ name: "change", type: "CustomEvent<{ index: number }>", desc: "Ao mudar de slide." },
	],
	slots: [{ name: "slide", desc: "Slides do carrossel (repetível)." }],
};