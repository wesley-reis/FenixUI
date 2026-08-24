import { FxTabs, FxTabPanel, defineFxTabs, defineFxTabPanel } from './tabs';

export { FxTabs, FxTabPanel };

defineFxTabs();
defineFxTabPanel();

declare global {
  interface HTMLElementTagNameMap {
    'fx-tabs': FxTabs;
    'fx-tab-panel': FxTabPanel;
  }
}
