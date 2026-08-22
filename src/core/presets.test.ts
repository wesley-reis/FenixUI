import { describe, it, expect, beforeEach } from 'vitest';
import './presets';
import { applyPreset, themePresets, defineCustomPreset, listPresets } from './presets';
import { resetTheme, deepMerge } from './theme';
import { defaultTokens } from './tokens';

describe('themePresets', () => {
  it('expõe presets nomeados com label', () => {
    expect(Object.keys(themePresets)).toContain('fenix');
    for (const p of Object.values(themePresets)) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.label.length).toBeGreaterThan(0);
      expect(typeof p.tokens).toBe('object');
    }
  });
});

describe('applyPreset', () => {
  beforeEach(() => {
    document.documentElement.style.cssText = '';
    resetTheme();
  });

  it('aplica preset em runtime via CSS vars', () => {
    applyPreset('seiya', 'light');
    const primary = document.documentElement.style.getPropertyValue('--fx-color-primary');
    expect(primary).toBe('#e11d48');

    applyPreset('shun', 'dark');
    expect(document.documentElement.style.getPropertyValue('--fx-color-primary')).toBe('#db2777');
  });

  it('defineCustomPreset registra e aplica tema do usuário', () => {
    defineCustomPreset('mascara-da-morte', '💀 Máscara da Morte', {
      color: { primary: '#7c3aed' },
    });
    applyPreset('mascara-da-morte', 'light');
    expect(document.documentElement.style.getPropertyValue('--fx-color-primary')).toBe('#7c3aed');
    expect(listPresets().map((p) => p.name)).toContain('mascara-da-morte');
  });

  it('preset desconhecido cai no padrão fenix (sem override)', () => {
    applyPreset('inexistente', 'light');
    expect(document.documentElement.style.getPropertyValue('--fx-color-primary')).toBe(
      defaultTokens.color.primary,
    );
  });

  it('deepMerge mantém merge parcial profundo', () => {
    const merged = deepMerge({ a: { b: 1, c: 2 } }, { a: { b: 9 } });
    expect(merged).toEqual({ a: { b: 9, c: 2 } });
  });
});