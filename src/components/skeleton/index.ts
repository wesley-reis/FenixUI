import { FxSkeleton, defineFxSkeleton } from './skeleton';

export { FxSkeleton };


defineFxSkeleton();

declare global {
  interface HTMLElementTagNameMap {
    'fx-skeleton': FxSkeleton;
  }
}


