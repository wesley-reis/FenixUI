import { FxPasswordStrength, defineFxPasswordStrength } from './password-strength';

export { FxPasswordStrength };

defineFxPasswordStrength();

declare global {
  interface HTMLElementTagNameMap {
    'fx-password-strength': FxPasswordStrength;
  }
}