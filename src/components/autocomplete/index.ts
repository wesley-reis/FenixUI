import { FxAutocomplete, defineFxAutocomplete } from './autocomplete';

export { FxAutocomplete };


defineFxAutocomplete();

declare global {
  interface HTMLElementTagNameMap {
    'fx-autocomplete': FxAutocomplete;
  }
}

