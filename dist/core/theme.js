import { darkTokens, defaultTokens } from "./tokens.js";
const PREFIX = "--fx";
const VERSION = "0.1.0";
let activeTheme = "light";
let activeOverrides = null;
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function deepMerge(base, override) {
  if (!override) return base;
  const out = { ...base };
  for (const key of Object.keys(override)) {
    const baseValue = base[key];
    const overrideValue = override[key];
    out[key] = isPlainObject(baseValue) && isPlainObject(overrideValue) ? deepMerge(baseValue, overrideValue) : overrideValue;
  }
  return out;
}
function tokenCssVars(tokens) {
  const out = {};
  for (const [group, values] of Object.entries(tokens)) {
    for (const [key, value] of Object.entries(values)) {
      out[`${PREFIX}-${group}-${key}`] = String(value);
    }
  }
  return out;
}
function applyTokens(themeName, overrides, target = document.documentElement) {
  const base = themeName === "dark" ? darkTokens : defaultTokens;
  const finalTokens = deepMerge(base, overrides);
  const vars = tokenCssVars(finalTokens);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("fenix:theme", { detail: { theme: themeName, tokens: finalTokens } }));
  }
}
function configure(options = {}, target = document.documentElement) {
  if (options.theme) activeTheme = options.theme;
  if (options.tokens) activeOverrides = options.tokens;
  applyTokens(activeTheme, activeOverrides, target);
  return { theme: activeTheme };
}
function theme(name) {
  return configure({ theme: name });
}
function setTokens(tokens) {
  return configure({ tokens });
}
function resetTheme() {
  activeTheme = "light";
  activeOverrides = null;
  return configure({ theme: "light" });
}
const FenixUI = {
  version: VERSION,
  configure,
  theme,
  setTokens,
  resetTheme,
  tokenCssVars,
  deepMerge
};
export {
  FenixUI,
  VERSION,
  applyTokens,
  configure,
  deepMerge,
  resetTheme,
  setTokens,
  theme,
  tokenCssVars
};
//# sourceMappingURL=theme.js.map
