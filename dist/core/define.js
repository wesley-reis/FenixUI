function defineElement(tag, ctor) {
  if (typeof customElements !== "undefined" && !customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
  return customElements.get(tag) ?? ctor;
}
export {
  defineElement
};
//# sourceMappingURL=define.js.map
