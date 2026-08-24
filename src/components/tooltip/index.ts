import { FxTooltip, defineFxTooltip } from './tooltip';

export { FxTooltip };


defineFxTooltip();

declare global {
  interface HTMLElementTagNameMap {
    'fx-tooltip': FxTooltip;
  }
}


