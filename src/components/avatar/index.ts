import { FxAvatar, defineFxAvatar } from './avatar';

export { FxAvatar };

defineFxAvatar();

declare global {
  interface HTMLElementTagNameMap {
    'fx-avatar': FxAvatar;
  }
}
