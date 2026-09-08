import { FxRating, defineFxRating } from './rating';

export { FxRating };

defineFxRating();

declare global {
  interface HTMLElementTagNameMap {
    'fx-rating': FxRating;
  }
}