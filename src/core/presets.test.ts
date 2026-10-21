import { describe, it, expect, beforeEach } from 'vitest';
import './presets';
import { applyPreset, themePresets, defineCustomPreset, listPresets } from './presets';
import { resetTheme, deepMerge } from './theme';
import { defaultTokens } from './tokens';

describe('themePresets', () => {
  it('expõe presets nomeados com label', () => {
    expect(Object.keys(themePresets)).toContain('ikki');
    for (const p of Object.values(themePresets)) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.label.length).toBeGreaterThan(0);
      expect(typeof p.tokens).toBe('object');
    }
  });

  it('ikki é o preset padrão e não existe mais preset "fenix"', () => {
    expect(themePresets.ikki.label).toContain('padrão');
    expect(Object.keys(themePresets)).not.toContain('fenix');
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

  it('preset pode configurar os tokens da tabela (table.*)', () => {
    defineCustomPreset('tabela-da-marca', 'Tabela da marca', {
      table: { text: '#0f172a', 'header-weight': '600' },
    });
    applyPreset('tabela-da-marca', 'light');
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--fx-table-text')).toBe('#0f172a');
    expect(root.getPropertyValue('--fx-table-header-weight')).toBe('600');
    // Chave não informada continua com o padrão do tema base.
    expect(root.getPropertyValue('--fx-table-header-text')).toBe('var(--fx-table-text)');
  });

  it('preset desconhecido cai no padrão ikki (focus-ring desligado)', () => {
    applyPreset('inexistente', 'light');
    expect(document.documentElement.style.getPropertyValue('--fx-color-primary')).toBe(
      defaultTokens.color.primary,
    );
    expect(document.documentElement.style.getPropertyValue('--fx-effect-focus-ring')).toBe('none');
  });

  it('preset Ikki (padrão) respeita focus-ring desligado', () => {
    applyPreset('ikki', 'light');
    expect(document.documentElement.style.getPropertyValue('--fx-effect-focus-ring')).toBe('none');
    // ...e ao trocar de modo, o valor do preset permanece
    applyPreset('ikki', 'dark');
    expect(document.documentElement.style.getPropertyValue('--fx-effect-focus-ring')).toBe('none');
  });

  it('preset com focus-ring desligado deriva error-ring/success-ring = none', () => {
    applyPreset('ikki', 'light');
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--fx-effect-error-ring')).toBe('none');
    expect(root.getPropertyValue('--fx-effect-success-ring')).toBe('none');
  });

  it('preset sem focus-ring override mantém os brilhos de validação', () => {
    // Hyoga não define focus-ring → herda o default (anel ligado).
    applyPreset('hyoga', 'light');
    const root = document.documentElement.style;
    expect(root.getPropertyValue('--fx-effect-focus-ring')).toContain('color-mix');
    expect(root.getPropertyValue('--fx-effect-error-ring')).toContain('color-mix');
  });

  it('deepMerge mantém merge parcial profundo', () => {
    const merged = deepMerge({ a: { b: 1, c: 2 } }, { a: { b: 9 } });
    expect(merged).toEqual({ a: { b: 9, c: 2 } });
  });
});