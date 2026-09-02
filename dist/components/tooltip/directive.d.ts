/**
 * Diretiva fx-tooltip — Aplica tooltip em qualquer elemento HTML.
 *
 * Uso:
 *   <div fx-tooltip="Texto simples">Div com tooltip</div>
 *   <button fx-tooltip="Clique" fx-tooltip-position="bottom">Botão</button>
 *   <span fx-tooltip="<strong>HTML</strong>" fx-tooltip-html>Texto</span>
 *
 * Atributos:
 *   fx-tooltip           — Conteúdo do tooltip (texto ou HTML)
 *   fx-tooltip-position  — Posição: top | bottom | left | right (padrão: top)
 *   fx-tooltip-html      — Se presente, trata o conteúdo como HTML
 */
export interface FxTooltipConfig {
    position: 'top' | 'bottom' | 'left' | 'right';
    html: boolean;
}
/**
 * Inicializa a diretiva fx-tooltip.
 * Deve ser chamado uma vez na aplicação.
 *
 * @example
 * import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';
 * defineFxTooltipDirective();
 */
export declare function defineFxTooltipDirective(): void;
/**
 * Destrói a diretiva fx-tooltip e limpa todos os recursos.
 */
export declare function destroyFxTooltipDirective(): void;
//# sourceMappingURL=directive.d.ts.map