import { FxChip, defineFxChip } from './chip';

export { FxChip };

defineFxChip();

declare global {
  interface HTMLElementTagNameMap {
    'fx-chip': FxChip;
  }
}
