import { FxTooltip } from './tooltip';
import { defineFxTooltipDirective, destroyFxTooltipDirective } from './directive';
export { FxTooltip, defineFxTooltipDirective, destroyFxTooltipDirective };
declare global {
    interface HTMLElementTagNameMap {
        'fx-tooltip': FxTooltip;
    }
}
//# sourceMappingURL=index.d.ts.map