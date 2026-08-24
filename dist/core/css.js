function css(strings, ...values) {
  return strings.reduce((acc, part, i) => acc + part + (i < values.length ? String(values[i]) : ""), "");
}
function kebabToCamel(value) {
  return value.replace(/-+([a-z])/g, (_, c) => c.toUpperCase());
}
export {
  css,
  kebabToCamel
};
//# sourceMappingURL=css.js.map
