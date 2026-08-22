/**
 * Motor de Tema e API global do FenixUI.
 *
 * Aplica os Design Tokens como CSS Custom Properties (`--fx-*`) no elemento
 * raiz. Como custom properties atravessam o Shadow DOM, TODOS os componentes
 * passam a reagir ao novo tema em runtime, sem recompilar.
 */

import { defaultTokens, darkTokens, type FenixTokens, type DeepPartial } from './tokens';

const PREFIX = '--fx';
export const VERSION = '0.1.0';

export type ThemeName = 'light' | 'dark';

let activeTheme: ThemeName = 'light';
let activeOverrides: DeepPartial<FenixTokens> | null = null;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Mescla tokens por grupo, permitindo override parcial (ex.: só `color.primary`). */
export function deepMerge<T>(base: T, override: DeepPartial<T> | null): T {
  if (!override) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override)) {
    const baseValue = (base as Record<string, unknown>)[key];
    const overrideValue = (override as Record<string, unknown>)[key];
    out[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? deepMerge(baseValue, overrideValue)
        : (overrideValue as unknown);
  }
  return out as T;
}

/** Achatamento de tokens em pares `--fx-{grupo}-{chave}` -> valor. */
export function tokenCssVars(tokens: FenixTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [group, values] of Object.entries(tokens)) {
    for (const [key, value] of Object.entries(values)) {
      out[`${PREFIX}-${group}-${key}`] = String(value);
    }
  }
  return out;
}

/** Aplica tokens no DOM (padrão: `:root`). Emite evento para notificar a aplicação. */
export function applyTokens(
  themeName: ThemeName,
  overrides: DeepPartial<FenixTokens> | null,
  target: HTMLElement = document.documentElement,
): void {
  const base = themeName === 'dark' ? darkTokens : defaultTokens;
  const finalTokens = deepMerge(base, overrides);
  const vars = tokenCssVars(finalTokens);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fenix:theme', { detail: { theme: themeName, tokens: finalTokens } }));
  }
}

export interface ConfigureOptions {
  theme?: ThemeName;
  tokens?: DeepPartial<FenixTokens>;
}

/** Configura a biblioteca: tema e/ou tokens. Retorna o estado ativo. */
export function configure(
  options: ConfigureOptions = {},
  target: HTMLElement = document.documentElement,
): { theme: ThemeName } {
  if (options.theme) activeTheme = options.theme;
  if (options.tokens) activeOverrides = options.tokens;
  applyTokens(activeTheme, activeOverrides, target);
  return { theme: activeTheme };
}

/** Troca o tema para claro/escuro em runtime. */
export function theme(name: ThemeName): { theme: ThemeName } {
  return configure({ theme: name });
}

/** Define tokens customizados (override parcial profundo). */
export function setTokens(tokens: DeepPartial<FenixTokens>): { theme: ThemeName } {
  return configure({ tokens });
}

/** Volta ao tema claro padrão sem overrides. */
export function resetTheme(): { theme: ThemeName } {
  activeTheme = 'light';
  activeOverrides = null;
  return configure({ theme: 'light' });
}

/** Namespace público (uso via ESM ou via global `FenixUI` no bundle CDN). */
export const FenixUI = {
  version: VERSION,
  configure,
  theme,
  setTokens,
  resetTheme,
  tokenCssVars,
  deepMerge,
};