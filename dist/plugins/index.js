import { shouldTransform, transformSource } from "./auto-import.js";
import { fenixComponentMap } from "./auto-import.js";
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
//# sourceMappingURL=index.js.map
