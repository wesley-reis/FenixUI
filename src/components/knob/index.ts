import { FxKnob, defineFxKnob } from './knob';

export { FxKnob };

defineFxKnob();

declare global {
  interface HTMLElementTagNameMap {
    'fx-knob': FxKnob;
  }
}