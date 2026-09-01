const lightTokens = {
  color: {
    primary: "#C72703",
    secondary: "#f43f5e",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#f43f5e",
    info: "#0ea5e9"
  },
  surface: {
    background: "#ffffff",
    surface: "#f8fafc",
    "surface-hover": "#eef2f7"
  },
  text: {
    default: "#0f172a",
    muted: "#64748b",
    disabled: "#94a3b8"
  },
  border: {
    default: "#e2e8f0",
    hover: "#cbd5e1"
  },
  font: {
    family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    size: "14px",
    weight: "500",
    "line-height": "1.5"
  },
  space: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  radius: { none: "0", sm: "4px", md: "8px", lg: "12px", full: "9999px" },
  size: { sm: "32px", md: "40px", lg: "48px" },
  shadow: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 4px 12px rgba(15, 23, 42, 0.10)",
    lg: "0 12px 32px rgba(15, 23, 42, 0.18)"
  },
  motion: {
    "duration-fast": "120ms",
    "duration-normal": "240ms",
    easing: "cubic-bezier(0.25, 0.1, 0.25, 1)"
  },
  effect: {
    /** '0' desativa o efeito ripple do botão. */
    ripple: "1",
    /** Anel de foco dos campos de formulário. Use 'none' para campos sem sobra. */
    "focus-ring": "0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)"
  },
  z: { base: "auto", dropdown: "1000", modal: "1100", toast: "1200" }
};
const darkTokens = {
  color: { ...lightTokens.color },
  surface: {
    background: "#0f172a",
    surface: "#1e293b",
    "surface-hover": "#334155"
  },
  text: {
    default: "#f8fafc",
    muted: "#94a3b8",
    disabled: "#64748b"
  },
  border: { default: "#334155", hover: "#475569" },
  font: { ...lightTokens.font },
  space: { ...lightTokens.space },
  radius: { ...lightTokens.radius },
  size: { ...lightTokens.size },
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
    md: "0 6px 16px rgba(0, 0, 0, 0.5)",
    lg: "0 16px 40px rgba(0, 0, 0, 0.6)"
  },
  motion: { ...lightTokens.motion },
  effect: { ...lightTokens.effect },
  z: { ...lightTokens.z }
};
const defaultTokens = lightTokens;
export {
  darkTokens,
  defaultTokens,
  lightTokens
};
//# sourceMappingURL=tokens.js.map
