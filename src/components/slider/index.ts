import { FxSlider, defineFxSlider } from './slider';

export { FxSlider };

defineFxSlider();

declare global {
  interface HTMLElementTagNameMap {
    'fx-slider': FxSlider;
  }
}
