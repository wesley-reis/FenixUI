/**
 * Presets de tema prontos para uso.
 *
 * Cada preset é um override parcial profundo sobre os tokens base.
 * Combina com o modo claro/escuro: `applyPreset('seiya', 'dark')`.
 */

import { configure } from './theme';
import { type DeepPartial, type FenixTokens } from './tokens';

export interface FenixPreset {
  /** Identificador usado em `applyPreset(name)`. */
  name: string;
  /** Rótulo amigável para UIs (documentação/seletor). */
  label: string;
  /** Override parcial de tokens aplicado sobre o tema base. */
  tokens: DeepPartial<FenixTokens>;
}

const registry = new Map<string, FenixPreset>();

function register(preset: FenixPreset): FenixPreset {
  registry.set(preset.name, preset);
  return preset;
}

/* ------------------------------------------------------------------ */
/* Cavaleiros do Zodíaco ✨                                            */
/* ------------------------------------------------------------------ */

export const themePresets = {
  fenix: register({
    name: 'fenix',
    label: 'Fenix (padrão)',
    tokens: {},
  }),
  seiya: register({
    name: 'seiya',
    label: 'Seiya',
    tokens: {
      color: { primary: '#e11d48', secondary: '#fb7185', info: '#f43f5e', danger: '#be123c' },
      radius: { sm: '6px', md: '10px', lg: '16px' },
    },
  }),
  shiryu: register({
    name: 'shiryu',
    label: 'Shiryu',
    tokens: {
      color: { primary: '#0d9488', secondary: '#2dd4bf', success: '#059669', info: '#14b8a6' },
      radius: { sm: '4px', md: '8px', lg: '14px' },
    },
  }),
  hyoga: register({
    name: 'hyoga',
    label: 'Hyoga',
    tokens: {
      color: { primary: '#0284c7', secondary: '#38bdf8', info: '#06b6d4', danger: '#e11d48' },
      surface: { surface: '#f0f9ff', 'surface-hover': '#e0f2fe' },
      radius: { sm: '8px', md: '12px', lg: '18px' },
    },
  }),
  shun: register({
    name: 'shun',
    label: 'Shun',
    tokens: {
      color: { primary: '#db2777', secondary: '#f472b6', info: '#ec4899', warning: '#c026d3' },
      radius: { sm: '10px', md: '14px', lg: '20px' },
    },
  }),
  ikki: register({
    name: 'ikki',
    label: 'Ikki',
    tokens: {
      color: { primary: '#ea580c', secondary: '#fb923c', danger: '#dc2626', warning: '#f59e0b' },
      radius: { sm: '2px', md: '4px', lg: '6px' },
    },
  }),
  aiolia: register({
    name: 'aiolia',
    label: 'Aiolia',
    tokens: {
      color: { primary: '#b45309', secondary: '#f59e0b', warning: '#eab308', info: '#84cc16' },
      radius: { sm: '6px', md: '12px', lg: '20px' },
    },
  }),
} as const;

/** Lista todos os presets registrados (inclui os customizados). */
export function listPresets(): FenixPreset[] {
  return [...registry.values()];
}

/**
 * Registra um preset personalizado, tornando-o disponível em `applyPreset`.
 * Útil para o usuário criar seu próprio tema e reutilizá-lo na aplicação.
 */
export function defineCustomPreset(
  name: string,
  label: string,
  tokens: DeepPartial<FenixTokens>,
): FenixPreset {
  return register({ name, label, tokens });
}

/**
 * Aplica um preset + modo de cor em runtime.
 * @returns o estado ativo ({ theme }) repassado por `configure`.
 */
export function applyPreset(
  presetName: string,
  mode: 'light' | 'dark' = 'light',
): { theme: 'light' | 'dark'; preset: string } {
  const preset = registry.get(presetName) ?? registry.get('fenix')!;
  const state = configure({ theme: mode, tokens: preset.tokens });
  return { ...state, preset: preset.name };
}