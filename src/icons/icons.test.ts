import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  FENIX_ICON_NAMES,
  FENIX_ICON_BASE_CSS,
  FENIX_ICON_FONT_FAMILY,
  buildFenixIconsCss,
  loadFenixIcons,
  __resetFenixIconsInjection,
  isFenixIconName,
} from './index';
import { transformSource } from '../plugins/auto-import';

describe('Fenix Icons', () => {
  beforeEach(() => {
    __resetFenixIconsInjection();
    document.getElementById('fenix-icons')?.remove();
  });

  afterEach(() => {
    document.getElementById('fenix-icons')?.remove();
    __resetFenixIconsInjection();
  });

  it('contém a lista completa de nomes de ícones', () => {
    expect(FENIX_ICON_NAMES.length).toBeGreaterThan(4000);
    expect(FENIX_ICON_NAMES).toContain('home');
    expect(FENIX_ICON_NAMES).toContain('settings');
  });

  it('isFenixIconName distingue nome de ícone de emoji/texto livre', () => {
    expect(isFenixIconName('home')).toBe(true);
    expect(isFenixIconName('check_circle')).toBe(true);
    expect(isFenixIconName('⚠️')).toBe(false);
    expect(isFenixIconName('olá mundo')).toBe(false);
  });

  it('loadFenixIcons injeta o CSS no <head> de forma idempotente', () => {
    loadFenixIcons();
    loadFenixIcons();
    const styles = document.querySelectorAll('style#fenix-icons');
    expect(styles.length).toBe(1);
    const css = (styles[0] as HTMLStyleElement).textContent ?? '';
    expect(css).toContain('@font-face');
    expect(css).toContain(`font-family:'${FENIX_ICON_FONT_FAMILY}'`);
    expect(css).toContain('woff2');
  });

  it('CSS gerado inclui a classe base e a regra por ícone (ligadura)', () => {
    const css = buildFenixIconsCss();
    expect(css).toContain('.fx-icon {');
    expect(css).toContain('.fx-icon-home::before{content:"home"}');
    expect(css).toContain('.fx-icon-fill');
    expect(css).toContain('.fx-icon-bold');
  });

  it('CSS base é compatível com Shadow DOM (usa var com fallback)', () => {
    expect(FENIX_ICON_BASE_CSS).toContain('var(--fx-icon-font');
  });

  it('auto-import injeta @wrrdev/fenix-ui/icons para classes fx-icon-*', () => {
    const code = `import '@wrrdev/fenix-ui/button';\nconst html = '<i class="fx-icon fx-icon-home"></i>';\n`;
    const out = transformSource(code);
    expect(out).toContain("@wrrdev/fenix-ui/button");
    expect(out).toContain("@wrrdev/fenix-ui/icons");
  });

  it('auto-import não duplica o import de ícones', () => {
    const code = `import '@wrrdev/fenix-ui/icons';\nconst html = '<i class="fx-icon">home</i>';\n`;
    const out = transformSource(code);
    expect(out.match(/fenix-ui\/icons/g)?.length).toBe(1);
  });

  it('auto-import não injeta ícones quando não há fx-icon no código', () => {
    const code = `const html = '<fx-button>Salvar</fx-button>';\n`;
    const out = transformSource(code);
    expect(out).not.toContain('fenix-ui/icons');
  });
});
