import { FxPopover, defineFxPopover } from './popover';

export { FxPopover };

defineFxPopover();

declare global {
  interface HTMLElementTagNameMap {
    'fx-popover': FxPopover;
  }
}
