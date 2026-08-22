/**
 * Design Tokens — camada de personalização do FenixUI.
 *
 * Os componentes consomem apenas `var(--fx-*)`, nunca valores fixos.
 * Isso atravessa o Shadow DOM via CSS Custom Properties e permite
 * trocar o tema em runtime sem recompilar a biblioteca.
 */

export interface FenixTokens {
  /** Cores semânticas */ color: Record<'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info', string>;
  /** Superfícies */ surface: Record<'background' | 'surface' | 'surface-hover', string>;
  /** Texto */ text: Record<'default' | 'muted' | 'disabled', string>;
  /** Bordas */ border: Record<'default' | 'hover', string>;
  /** Tipografia */ font: Record<'family' | 'size' | 'weight' | 'line-height', string>;
  /** Espaçamento */ space: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>;
  /** Radius */ radius: Record<'none' | 'sm' | 'md' | 'lg' | 'full', string>;
  /** Altura dos controles (button, input, select, switch…). Personalizável por preset. */
  size: Record<'sm' | 'md' | 'lg', string>;
  /** Sombras */ shadow: Record<'sm' | 'md' | 'lg', string>;
  /** Motion */ motion: Record<'duration-fast' | 'duration-normal' | 'easing', string>;
  /** Efeitos visuais configuráveis (ripple, anel de foco dos campos). */
  effect: { ripple: string; 'focus-ring': string };
  /** Z-index */ z: Record<'base' | 'dropdown' | 'modal' | 'toast', string>;
}

/** Tema claro (padrão). */
export const lightTokens: FenixTokens = {
  color: {
    primary: '#4f46e5',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#0ea5e9',
  },
  surface: {
    background: '#ffffff',
    surface: '#f8fafc',
    'surface-hover': '#eef2f7',
  },
  text: {
    default: '#0f172a',
    muted: '#64748b',
    disabled: '#94a3b8',
  },
  border: {
    default: '#e2e8f0',
    hover: '#cbd5e1',
  },
  font: {
    family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    size: '14px',
    weight: '500',
    'line-height': '1.5',
  },
  space: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  radius: { none: '0', sm: '4px', md: '8px', lg: '12px', full: '9999px' },
  size: { sm: '32px', md: '40px', lg: '48px' },
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
    md: '0 4px 12px rgba(15, 23, 42, 0.10)',
    lg: '0 12px 32px rgba(15, 23, 42, 0.18)',
  },
  motion: {
    'duration-fast': '120ms',
    'duration-normal': '240ms',
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
  effect: {
    /** '0' desativa o efeito ripple do botão. */
    ripple: '1',
    /** Anel de foco dos campos de formulário. Use 'none' para campos sem sobra. */
    'focus-ring': '0 0 0 3px color-mix(in srgb, var(--fx-color-primary) 22%, transparent)',
  },
  z: { base: 'auto', dropdown: '1000', modal: '1100', toast: '1200' },
};

/** Tema escuro — os componentes reagem automaticamente às variáveis CSS. */
export const darkTokens: FenixTokens = {
  color: { ...lightTokens.color },
  surface: {
    background: '#0f172a',
    surface: '#1e293b',
    'surface-hover': '#334155',
  },
  text: {
    default: '#f8fafc',
    muted: '#94a3b8',
    disabled: '#64748b',
  },
  border: { default: '#334155', hover: '#475569' },
  font: { ...lightTokens.font },
  space: { ...lightTokens.space },
  radius: { ...lightTokens.radius },
  size: { ...lightTokens.size },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 6px 16px rgba(0, 0, 0, 0.5)',
    lg: '0 16px 40px rgba(0, 0, 0, 0.6)',
  },
  motion: { ...lightTokens.motion },
  effect: { ...lightTokens.effect },
  z: { ...lightTokens.z },
};

export const defaultTokens: FenixTokens = lightTokens;

/** Override parcial e profundo — permite customizar apenas alguns tokens por vez. */
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };