/**
 * Documentação do componente <fx-timeline>.
 */
import type { ComponentDoc } from '../types';

export const timelineDoc: ComponentDoc = {
	tag: "fx-timeline",
	title: "Timeline",
	group: "Layout",
	lead: "Linha do tempo vertical com eventos. Cada item usa slot=\"item\" com os atributos time (horário/data) e title.",
	imports: ["import '@wrrdev/fenix-ui/timeline';"],
	demoHtml: (attrs) =>
		`<fx-timeline ${attrs} style="width:100%"><div slot="item" time="09:00" title="Reunião de alinhamento">Definição do escopo da sprint.</div><div slot="item" time="11:30" title="Revisão de código">Merge do PR #142 após aprovação.</div><div slot="item" time="16:00" title="Deploy">Publicação da versão 2.0 em produção.</div></fx-timeline>`,
	variantsHtml: () => {
		return `<div style="display:flex;flex-direction:column;gap:24px"><div><strong style="font-size:12px;color:var(--fx-text-muted)">Horizontal</strong><fx-timeline orientation="horizontal" style="width:100%"><div slot="item" time="Seg" title="Planejamento">Definição das tarefas da semana.</div><div slot="item" time="Qua" title="Desenvolvimento">Implementação das features.</div><div slot="item" time="Sex" title="Entrega">Deploy e retrospectiva.</div></fx-timeline></div><div><strong style="font-size:12px;color:var(--fx-text-muted)">Marcador customizado</strong><fx-timeline marker="◆"><div slot="item" time="10/05" title="Marcador custom">Marker com glifo ◆.</div><div slot="item" time="11/05" title="Outro evento">Conteúdo do evento.</div></fx-timeline></div></div>`;
	},
	controls: [
		{ kind: "select", attr: "orientation", label: "Orientação", options: ["vertical", "horizontal"], value: "vertical" },
		{ kind: "select", attr: "size", label: "Tamanho", options: ["sm", "md", "lg"], value: "md" },
		{ kind: "text", attr: "marker", label: "Marcador", hint: "●" },
	],
	attributes: [
		{ name: "orientation", type: "'vertical' | 'horizontal'", default: "'vertical'", desc: "Direção da linha do tempo." },
		{ name: "marker", type: "string", default: "'●'", desc: "Glifo do marcador de cada evento." },
		{ name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", desc: "Tamanho dos marcadores." },
	],
	slots: [
		{ name: "item", desc: "Eventos da linha do tempo. Atributos: time (data/hora) e title." },
	],
};