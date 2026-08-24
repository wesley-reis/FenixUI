const _FxElement = class _FxElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }
  /** Chamado quando um atributo observado muda. */
  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }
  /** Chamado quando o elemento é anexado ao DOM. */
  connectedCallback() {
    this.render();
  }
  /** Chamado quando o elemento é removido do DOM (limpeza de recursos). */
  disconnectedCallback() {
  }
  hasAttr(name) {
    return this.hasAttribute(name);
  }
  getAttr(name, fallback = "") {
    return this.getAttribute(name) ?? fallback;
  }
  toggleAttr(name, on) {
    if (on) this.setAttribute(name, "");
    else this.removeAttribute(name);
  }
  /** Injeta `<style>` + template no Shadow DOM. */
  setTemplate(html) {
    const styles = this.constructor.styles;
    this.root.innerHTML = `<style>${styles}</style>${html}`;
  }
};
_FxElement.styles = "";
let FxElement = _FxElement;
export {
  FxElement
};
//# sourceMappingURL=base.js.map
