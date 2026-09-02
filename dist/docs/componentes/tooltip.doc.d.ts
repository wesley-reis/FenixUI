/**
 * Documentação do componente <fx-tooltip> e diretiva fx-tooltip.
 *
 * Gerado a partir do split de src/docs/app.ts — edite aqui os metadados.
 *
 * ## Uso como Componente (Wrapper)
 * O componente <fx-tooltip> envolve um elemento filho e exibe o tooltip ao passar o mouse.
 *
 * ## Uso como Diretiva (Atributo)
 * A diretiva permite aplicar tooltip em qualquer elemento HTML usando atributos:
 *   - fx-tooltip="texto" - Define o conteúdo do tooltip
 *   - fx-tooltip-position="top|bottom|left|right" - Define a posição
 *   - fx-tooltip-html - Se presente, trata o conteúdo como HTML
 *
 * Para usar a diretiva, importe e inicialize:
 *   import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';
 *   defineFxTooltipDirective();
 *
 * Depois use em qualquer elemento:
 *   <div fx-tooltip="Texto simples">Div com tooltip</div>
 *   <button fx-tooltip="Clique" fx-tooltip-position="bottom">Botão</button>
 */
import type { ComponentDoc } from '../types';
export declare const tooltipDoc: ComponentDoc;
//# sourceMappingURL=tooltip.doc.d.ts.map