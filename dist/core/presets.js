import { configure } from "./theme.js";
const registry = /* @__PURE__ */ new Map();
function register(preset) {
  registry.set(preset.name, preset);
  return preset;
}
const themePresets = {
  fenix: register({
    name: "fenix",
    label: "Fenix (padrão)",
    tokens: {}
  }),
  seiya: register({
    name: "seiya",
    label: "Seiya",
    tokens: {
      color: { primary: "#e11d48", secondary: "#fb7185", info: "#f43f5e", danger: "#be123c" },
      radius: { sm: "6px", md: "10px", lg: "16px" }
    }
  }),
  shiryu: register({
    name: "shiryu",
    label: "Shiryu",
    tokens: {
      color: { primary: "#0d9488", secondary: "#2dd4bf", success: "#059669", info: "#14b8a6" },
      radius: { sm: "4px", md: "8px", lg: "14px" }
    }
  }),
  hyoga: register({
    name: "hyoga",
    label: "Hyoga",
    tokens: {
      color: { primary: "#0284c7", secondary: "#38bdf8", info: "#06b6d4", danger: "#e11d48" },
      surface: { surface: "#f0f9ff", "surface-hover": "#e0f2fe" },
      radius: { sm: "8px", md: "12px", lg: "18px" }
    }
  }),
  shun: register({
    name: "shun",
    label: "Shun",
    tokens: {
      color: { primary: "#db2777", secondary: "#f472b6", info: "#ec4899", warning: "#c026d3" },
      radius: { sm: "10px", md: "14px", lg: "20px" }
    }
  }),
  ikki: register({
    name: "ikki",
    label: "Ikki",
    tokens: {
      color: { primary: "#ea580c", secondary: "#fb923c", danger: "#dc2626", warning: "#f59e0b" },
      radius: { sm: "2px", md: "4px", lg: "6px" }
    }
  }),
  aiolia: register({
    name: "aiolia",
    label: "Aiolia",
    tokens: {
      color: { primary: "#b45309", secondary: "#f59e0b", warning: "#eab308", info: "#84cc16" },
      radius: { sm: "6px", md: "12px", lg: "20px" }
    }
  })
};
function listPresets() {
  return [...registry.values()];
}
function defineCustomPreset(name, label, tokens) {
  return register({ name, label, tokens });
}
function applyPreset(presetName, mode = "light") {
  const preset = registry.get(presetName) ?? registry.get("fenix");
  const state = configure({ theme: mode, tokens: preset.tokens });
  return { ...state, preset: preset.name };
}
export {
  applyPreset,
  defineCustomPreset,
  listPresets,
  themePresets
};
//# sourceMappingURL=presets.js.map
