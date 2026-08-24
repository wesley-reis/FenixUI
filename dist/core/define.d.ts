/**
 * Registro seguro de Custom Elements.
 *
 * Usa `customElements.get()` antes de `define()` para que múltiplos imports
 * (index + subpath, bundler + CDN) não lancem erro de re-definição.
 */
export declare function defineElement<T extends typeof HTMLElement>(tag: string, ctor: T): T;
//# sourceMappingURL=define.d.ts.map