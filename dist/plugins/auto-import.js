const fenixComponentMap = {
  "fx-button": "@wrrdev/fenix-ui/button",
  "fx-badge": "@wrrdev/fenix-ui/badge",
  "fx-spinner": "@wrrdev/fenix-ui/spinner",
  "fx-select": "@wrrdev/fenix-ui/select",
  "fx-multiselect": "@wrrdev/fenix-ui/multiselect",
  "fx-input": "@wrrdev/fenix-ui/input",
  "fx-switch": "@wrrdev/fenix-ui/switch",
  "fx-calendar": "@wrrdev/fenix-ui/calendar",
  "fx-datepicker": "@wrrdev/fenix-ui/datepicker",
  "fx-checkbox": "@wrrdev/fenix-ui/checkbox",
  "fx-radio": "@wrrdev/fenix-ui/radio",
  "fx-table": "@wrrdev/fenix-ui/table",
  "fx-floatlabel": "@wrrdev/fenix-ui/floatlabel",
  "fx-textarea": "@wrrdev/fenix-ui/textarea",
  "fx-dialog": "@wrrdev/fenix-ui/dialog",
  "fx-drawer": "@wrrdev/fenix-ui/drawer",
  "fx-toast": "@wrrdev/fenix-ui/toast",
  "fx-tooltip": "@wrrdev/fenix-ui/tooltip",
  "fx-tabs": "@wrrdev/fenix-ui/tabs",
  "fx-tab-panel": "@wrrdev/fenix-ui/tabs",
  "fx-progress": "@wrrdev/fenix-ui/progress",
  "fx-skeleton": "@wrrdev/fenix-ui/skeleton",
  "fx-alert": "@wrrdev/fenix-ui/alert",
  "fx-dropdown": "@wrrdev/fenix-ui/dropdown",
  "fx-dropdown-item": "@wrrdev/fenix-ui/dropdown",
  "fx-pagination": "@wrrdev/fenix-ui/pagination",
  "fx-autocomplete": "@wrrdev/fenix-ui/autocomplete",
  "fx-knob": "@wrrdev/fenix-ui/knob",
  "fx-accordion": "@wrrdev/fenix-ui/accordion",
  "fx-accordion-panel": "@wrrdev/fenix-ui/accordion",
  "fx-orderlist": "@wrrdev/fenix-ui/orderlist",
  "fx-picklist": "@wrrdev/fenix-ui/picklist",
  "fx-column": "@wrrdev/fenix-ui/table"
};
const TAG_RE = /<(fx-[a-z][a-z-]*)(?=[\s/>])/g;
function transformSource(code, options = {}) {
  const pkg = options.packageName ?? "@wrrdev/fenix-ui";
  const resolve = (sub) => pkg === "@wrrdev/fenix-ui" ? sub : sub.replace("@wrrdev/fenix-ui", pkg);
  const needed = /* @__PURE__ */ new Set();
  for (const m of code.matchAll(TAG_RE)) {
    const sub = fenixComponentMap[m[1]];
    if (sub) {
      const target = resolve(sub);
      if (!code.includes(`'${target}'`) && !code.includes(`"${target}"`)) {
        needed.add(target);
      }
    }
  }
  if (!needed.size) return code;
  const lines = [...needed].map((s) => `import '${s}';`);
  const vueScript = /(<script[^>]*>)\n/.exec(code);
  if (vueScript) {
    return code.replace(vueScript[0], `${vueScript[1]}
${lines.join("\n")}
`);
  }
  let lastEnd = -1;
  for (const m of code.matchAll(/^[ \t]*import\b[^;]*?['"][^'"]+['"];?[^\S\n]*$/gm)) {
    lastEnd = Math.max(lastEnd, m.index + m[0].length);
  }
  if (lastEnd === -1) return `${lines.join("\n")}
${code}`;
  return `${code.slice(0, lastEnd)}
${lines.join("\n")}${code.slice(lastEnd)}`;
}
function shouldTransform(id) {
  return !id.includes("node_modules") && !id.endsWith(".d.ts") && !id.endsWith(".css") && /\.(ts|js|tsx|jsx|vue|html|svelte)$/.test(id);
}
export {
  fenixComponentMap,
  shouldTransform,
  transformSource
};
//# sourceMappingURL=auto-import.js.map
