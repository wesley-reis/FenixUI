import { FxDropdown, FxDropdownItem, defineFxDropdown, defineFxDropdownItem } from './dropdown';

export { FxDropdown, FxDropdownItem };

defineFxDropdown();
defineFxDropdownItem();

declare global {
  interface HTMLElementTagNameMap {
    'fx-dropdown': FxDropdown;
    'fx-dropdown-item': FxDropdownItem;
  }
}
