const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
};
const SANITIZE_REGEX = /[&<>"'`=/]/g;
function esc(value) {
  if (value == null) return "";
  return String(value).replace(SANITIZE_REGEX, (char) => HTML_ENTITIES[char] || char);
}
function stripTags(html) {
  return html.replace(/<[^>]*>/g, "");
}
function sanitizeData(data) {
  if (data == null) return data;
  if (typeof data === "string") return esc(data);
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (typeof data === "object") {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = sanitizeData(value);
    }
    return result;
  }
  return data;
}
export {
  esc,
  sanitizeData,
  stripTags
};
//# sourceMappingURL=sanitize.js.map
