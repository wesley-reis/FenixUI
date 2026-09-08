import { FxStepper, defineFxStepper } from './stepper';

export { FxStepper };

defineFxStepper();

declare global {
  interface HTMLElementTagNameMap {
    'fx-stepper': FxStepper;
  }
}