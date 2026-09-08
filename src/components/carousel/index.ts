import { FxCarousel, defineFxCarousel } from './carousel';

export { FxCarousel };

defineFxCarousel();

declare global {
  interface HTMLElementTagNameMap {
    'fx-carousel': FxCarousel;
  }
}