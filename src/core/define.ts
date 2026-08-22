/**
 * Registro seguro de Custom Elements.
 *
 * Usa `customElements.get()` antes de `define()` para que múltiplos imports
 * (index + subpath, bundler + CDN) não lancem erro de re-definição.
 */
export function defineElement<T extends typeof HTMLElement>(tag: string, ctor: T): T {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
  return (customElements.get(tag) as T) ?? ctor;
}