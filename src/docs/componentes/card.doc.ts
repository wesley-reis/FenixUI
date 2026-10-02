/**
 * Documentação do componente <fx-card>.
 */
import type { ComponentDoc } from '../types';

export const cardDoc: ComponentDoc = {
	tag: "fx-card",
	title: "Card",
	group: "Layout",
	lead: "Container de conteúdo com cabeçalho (slot header), corpo (slot padrão) e rodapé (slot footer). Variantes elevated/flat/outline/ghost e raios sm/md/lg.",
	imports: ["import '@wrrdev/fenix-ui/card';"],
	demoHtml: (attrs) =>
		`<fx-card ${attrs} heading="Detalhes do pedido" style="max-width:360px"><p style="margin:0">Pedido #1234 — 3 itens, total R$ 199,00</p><fx-button slot="footer" size="sm">Ver mais</fx-button></fx-card>`,
	variantsHtml: () => {
		return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px"><fx-card variant="elevated" heading="Elevated" padded><p>Conteúdo elevado.</p></fx-card><fx-card variant="flat" heading="Flat" padded><p>Conteúdo plano.</p></fx-card><fx-card variant="outline" heading="Outline" padded><p>Conteúdo com borda.</p></fx-card><fx-card variant="ghost" heading="Ghost" padded><p>Conteúdo ghost.</p></fx-card></div>
        <h4>Seções implícitas (header e footer só existem com conteúdo)</h4>
        <p style="font-size:12px;color:var(--fx-text-muted);margin:0 0 8px">O <code>&lt;header&gt;</code> e o <code>&lt;footer&gt;</code> são renderizados condicionalmente: sem conteúdo no slot correspondente, a seção inteira — padding e linha divisória incluídos — não aparece. Por isso um card "cru" não deixa uma barra vazia no rodapé.</p>
        <div>
          <small style="color:var(--fx-text-muted)">Só o corpo</small>
          <fx-card variant="outline" padded style="margin-top:6px"><p style="margin:0">Sem heading e sem slot <code>header</code>/<code>footer</code>: nenhuma barra é desenhada.</p></fx-card>
        </div>
        <div>
          <small style="color:var(--fx-text-muted)">Com heading, sem rodapé</small>
          <fx-card variant="outline" heading="Só cabeçalho" padded style="margin-top:6px"><p style="margin:0">O <code>heading</code> preenche o header e nada mais: o rodapé continua ausente.</p></fx-card>
        </div>
        <div>
          <small style="color:var(--fx-text-muted)">Corpo + rodapé</small>
          <fx-card variant="outline" padded style="margin-top:6px"><p style="margin:0">Com <code>slot="footer"</code> preenchido, a linha divisória aparece normalmente.</p><fx-button slot="footer" size="sm">Confirmar</fx-button></fx-card>
        </div>
        <div>
          <small style="color:var(--fx-text-muted)">Só cabeçalho</small>
          <fx-card variant="outline" style="margin-top:6px"><span slot="header" style="padding:12px 20px;font-weight:600">Via slot header</span><p style="margin:0;padding:16px 20px">O header também nasce do slot, sem <code>heading</code>.</p></fx-card>
        </div>`;
	},
	controls: [
		{ kind: "select", attr: "variant", label: "Variante", options: ["elevated", "flat", "outline", "ghost"], value: "elevated" },
		{ kind: "toggle", attr: "padded", label: "Padding interno", on: true },
		{ kind: "select", attr: "radius", label: "Raio (radius)", options: ["sm", "md", "lg"], value: "md" },
	],
	attributes: [
		{ name: "variant", type: `'elevated' | 'flat' | 'outline' | 'ghost'`, default: "'elevated'", desc: "Estilo visual do container." },
		{ name: "radius", type: `'sm' | 'md' | 'lg'`, default: "'md'", desc: "Arredondamento do container." },
		{ name: "size", type: `'sm' | 'md' | 'lg'`, default: "—", desc: "Alias legado de radius (mantido por compatibilidade)." },
		{ name: "padded", type: "boolean", default: "false", desc: "Aplica padding interno no corpo." },
		{ name: "heading", type: "string", default: "''", desc: "Título do cabeçalho (esconde o header se vazio)." },
	],
	slots: [
		{ name: "header", desc: "Conteúdo extra no cabeçalho. O header só aparece se houver `heading` ou conteúdo neste slot." },
		{ name: "(padrão)", desc: "Corpo do card." },
		{ name: "footer", desc: "Ações/rodapé do card. O rodapé (com sua linha divisória) só é exibido quando este slot tem conteúdo." },
	],
};
