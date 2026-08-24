import { FxProgress, defineFxProgress } from './progress';

export { FxProgress };


defineFxProgress();

declare global {
  interface HTMLElementTagNameMap {
    'fx-progress': FxProgress;
  }
}


