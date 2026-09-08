import { FxToggleButtonGroup, defineFxToggleButtonGroup } from './toggle-button-group';

export { FxToggleButtonGroup };

defineFxToggleButtonGroup();

declare global {
  interface HTMLElementTagNameMap {
    'fx-toggle-button-group': FxToggleButtonGroup;
  }
}