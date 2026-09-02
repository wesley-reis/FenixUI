import { FxTooltip, defineFxTooltip } from './tooltip';
import { defineFxTooltipDirective, destroyFxTooltipDirective } from './directive';

export { FxTooltip, defineFxTooltipDirective, destroyFxTooltipDirective };

defineFxTooltip();

declare global {
  interface HTMLElementTagNameMap {
    'fx-tooltip': FxTooltip;
  }
}
