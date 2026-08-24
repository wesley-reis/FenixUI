const fenixComponentMap = {
  "fx-button": "@fenix-ui/fenix-ui/button",
  "fx-badge": "@fenix-ui/fenix-ui/badge",
  "fx-spinner": "@fenix-ui/fenix-ui/spinner",
  "fx-select": "@fenix-ui/fenix-ui/select",
  "fx-multiselect": "@fenix-ui/fenix-ui/multiselect",
  "fx-input": "@fenix-ui/fenix-ui/input",
  "fx-switch": "@fenix-ui/fenix-ui/switch",
  "fx-calendar": "@fenix-ui/fenix-ui/calendar",
  "fx-datepicker": "@fenix-ui/fenix-ui/datepicker",
  "fx-checkbox": "@fenix-ui/fenix-ui/checkbox",
  "fx-radio": "@fenix-ui/fenix-ui/radio",
  "fx-table": "@fenix-ui/fenix-ui/table",
  "fx-floatlabel": "@fenix-ui/fenix-ui/floatlabel",
  "fx-textarea": "@fenix-ui/fenix-ui/textarea",
  "fx-dialog": "@fenix-ui/fenix-ui/dialog",
  "fx-drawer": "@fenix-ui/fenix-ui/drawer",
  "fx-toast": "@fenix-ui/fenix-ui/toast",
  "fx-tooltip": "@fenix-ui/fenix-ui/tooltip",
  "fx-tabs": "@fenix-ui/fenix-ui/tabs",
  "fx-tab-panel": "@fenix-ui/fenix-ui/tabs",
  "fx-progress": "@fenix-ui/fenix-ui/progress",
  "fx-skeleton": "@fenix-ui/fenix-ui/skeleton",
  "fx-alert": "@fenix-ui/fenix-ui/alert",
  "fx-dropdown": "@fenix-ui/fenix-ui/dropdown",
  "fx-dropdown-item": "@fenix-ui/fenix-ui/dropdown",
  "fx-pagination": "@fenix-ui/fenix-ui/pagination",
  "fx-autocomplete": "@fenix-ui/fenix-ui/autocomplete"
};
const TAG_RE = /<(fx-[a-z][a-z-]*)(?=[\s/>])/g;
function transformSource(code, options = {}) {
  const pkg = options.packageName ?? "@fenix-ui/fenix-ui";
  const resolve = (sub) => pkg === "@fenix-ui/fenix-ui" ? sub : sub.replace("@fenix-ui/fenix-ui", pkg);
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
function FenixAutoImport(options = {}) {
  return {
    name: "fenix-ui-auto-import",
    enforce: "pre",
    transform(code, id) {
      if (!shouldTransform(id)) return void 0;
      const result = transformSource(code, options);
      if (result === code) return void 0;
      return { code: result, map: null };
    }
  };
}
export {
  FenixAutoImport,
  fenixComponentMap,
  shouldTransform,
  transformSource
};
//# sourceMappingURL=fenix-ui2.esm.js.map
