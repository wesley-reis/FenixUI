import { FxCard, defineFxCard } from './card';

export { FxCard };

defineFxCard();

declare global {
  interface HTMLElementTagNameMap {
    'fx-card': FxCard;
  }
}
