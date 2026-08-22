import { describe, it, expect, beforeEach } from 'vitest';
import { defaultTokens, darkTokens, type FenixTokens } from '../core/tokens';
import { tokenCssVars, configure, theme, setTokens, resetTheme, deepMerge } from '../core/theme';

describe('Design Tokens', () => {
  it('gera variáveis CSS com prefixo --fx por grupo', () => {
    const vars = tokenCssVars(defaultTokens);
    expect(vars['--fx-color-primary']).toBe(defaultTokens.color.primary);
    expect(vars['--fx-surface-background']).toBe(defaultTokens.surface.background);
    expect(vars['--fx-radius-md']).toBe('8px');
  });

  it('tema escuro mantém mesma estrutura que o claro', () => {
    expect(Object.keys(darkTokens)).toEqual(Object.keys(defaultTokens));
    expect(darkTokens.surface.background).not.toBe(defaultTokens.surface.background);
  });

  it('deepMerge mescla nested mantendo nós não sobrepostos', () => {
    const base: FenixTokens = defaultTokens;
    const merged = deepMerge(base, { color: { primary: '#0d9488' } });
    expect(merged.color.primary).toBe('#0d9488');
    expect(merged.color.danger).toBe(base.color.danger);
    expect(merged.surface.background).toBe(base.surface.background);
  });
});

describe('Motor de tema (runtime)', () => {
  beforeEach(() => {
    document.documentElement.style.cssText = '';
    resetTheme();
  });

  it('configure aplica variáveis no :root', () => {
    configure({ theme: 'dark' });
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--fx-surface-background')).toBe(darkTokens.surface.background);
  });

  it('setTokens aplica override parcial e preserva o resto', () => {
    setTokens({ color: { primary: '#0d9488' } });
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--fx-color-primary')).toBe('#0d9488');
    expect(root.getPropertyValue('--fx-color-danger')).toBe(defaultTokens.color.danger);
  });

  it('resetTheme volta ao tema claro com tokens padrão', () => {
    setTokens({ color: { primary: '#123456' } });
    resetTheme();
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--fx-color-primary')).toBe(defaultTokens.color.primary);
  });

  it('theme() alterna claro/escuro', () => {
    const r1 = theme('dark');
    expect(r1.theme).toBe('dark');
    const r2 = theme('light');
    expect(r2.theme).toBe('light');
  });

  it('dispara evento fenix:theme ao configurar', () => {
    const spy = { hit: 0 };
    window.addEventListener('fenix:theme', () => spy.hit++);
    configure({ theme: 'dark' });
    expect(spy.hit).toBe(1);
  });
});