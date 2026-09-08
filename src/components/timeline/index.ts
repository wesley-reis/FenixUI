import { FxTimeline, defineFxTimeline } from './timeline';

export { FxTimeline };

defineFxTimeline();

declare global {
  interface HTMLElementTagNameMap {
    'fx-timeline': FxTimeline;
  }
}