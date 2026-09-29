import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  FENIX_ICON_NAMES,
  FENIX_ICON_BASE_CSS,
  FENIX_ICON_FONT_FAMILY,
  buildFenixIconsCss,
  buildFenixIconsFontCss,
  loadFenixIcons,
  loadFenixIconsFont,
  setFenixIconsFontUrl,
  __resetFenixIconsFontInjection,
  __resetFenixIconsInjection,
  isFenixIconName,
} from './index';
import { transformSource } from '../plugins/auto-import';

describe('Fenix Icons', () => {
  beforeEach(() => {
    __resetFenixIconsInjection();
    // Volta a URL para a do build: os testes de subset não podem vazar estado.
    setFenixIconsFontUrl('');
    document.getElementById('fenix-icons')?.remove();
    document.getElementById('fenix-icons-font')?.remove();
  });

  afterEach(() => {
    document.getElementById('fenix-icons')?.remove();
    document.getElementById('fenix-icons-font')?.remove();
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

  it('usa font-display:swap (nunca block, que deixa o glifo invisível)', () => {
    // `block` segura a renderização do texto até a fonte baixar: em 3G/4G a
    // tela fica branca por segundos. `swap` mostra fallback imediatamente.
    const css = buildFenixIconsFontCss();
    expect(css).toContain('font-display:swap');
    expect(css).not.toContain('font-display:block');
    expect(buildFenixIconsCss()).toContain('font-display:swap');
  });

  it('setFenixIconsFontUrl aponta o @font-face para um subset próprio', async () => {
    // Caso 1: chamado ANTES de injetar — o CSS já nasce com a nova URL.
    setFenixIconsFontUrl('/fonts/subset.woff2');
    loadFenixIconsFont();
    const style = document.getElementById('fenix-icons-font')!;
    expect(style.textContent).toContain("url('/fonts/subset.woff2')");
    expect(style.textContent).toContain('font-display:swap');

    // Caso 2: chamado DEPOIS de injetar — reinjeta com a URL nova.
    setFenixIconsFontUrl('/fonts/subset2.woff2');
    const after = document.getElementById('fenix-icons-font')!;
    expect(after.textContent).toContain("url('/fonts/subset2.woff2')");
    expect(after.textContent).not.toContain('subset.woff2\'');
    // Não duplica o <style> ao trocar a URL.
    expect(document.querySelectorAll('style#fenix-icons-font').length).toBe(1);
  });

  it('setFenixIconsFontUrl também reinyeta o CSS completo', () => {
    loadFenixIcons();
    setFenixIconsFontUrl('/fonts/full-subset.woff2');
    const full = document.getElementById('fenix-icons')!;
    expect(full.textContent).toContain("url('/fonts/full-subset.woff2')");
    // As regras por ícone continuam lá (a tipagem/nomes não mudam).
    expect(full.textContent).toContain('.fx-icon-home::before');
    expect(document.querySelectorAll('style#fenix-icons').length).toBe(1);
  });

  it('a tipagem dos ícones NÃO muda com o subset (lista completa preservada)', () => {
    // O subset é só uma otimização de bytes: o contrato de tipos continua
    // incluindo todos os ~4.200 nomes, para nenhum `name` quebrar no editor.
    expect(FENIX_ICON_NAMES.length).toBeGreaterThan(4000);
    setFenixIconsFontUrl('/fonts/subset.woff2');
    const css = buildFenixIconsCss();
    for (const name of ['home', 'settings', 'first_page']) {
      expect(css).toContain(`.fx-icon-${name}::before{content:"${name}"}`);
    }
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

  it('loadFenixIconsFont injeta só @font-face + base (leve) e é idempotente', () => {
    loadFenixIconsFont();
    loadFenixIconsFont();
    const styles = document.querySelectorAll('style#fenix-icons-font');
    expect(styles.length).toBe(1);
    const css = (styles[0] as HTMLStyleElement).textContent ?? '';
    expect(css).toContain('@font-face');
    expect(css).toContain('.fx-icon {');
    // As classes por ícone (4k+) não são necessárias para o <fx-icon>.
    expect(css).not.toContain('.fx-icon-home::before');
  });

  it('loadFenixIconsFont não duplica quando o CSS completo já foi injetado', () => {
    loadFenixIcons();
    __resetFenixIconsFontInjection();
    loadFenixIconsFont();
    expect(document.querySelectorAll('style#fenix-icons-font').length).toBe(0);
    expect(document.querySelectorAll('style#fenix-icons').length).toBe(1);
  });

  it('o CSS leve é bem menor que o completo (o <fx-icon> não puxa as 4k classes)', () => {
    expect(buildFenixIconsFontCss().length).toBeLessThan(buildFenixIconsCss().length / 50);
  });

  it('a união literal de nomes cobre TODOS os ícones em tempo de execução', () => {
    const union = readFileSync(resolve(process.cwd(), 'src/icons/name-union.ts'), 'utf8');
    for (const name of ['home', 'settings', 'delete', 'arrow_forward', '10k']) {
      expect(union, `name-union sem '${name}'`).toContain(`'${name}'`);
    }
    // 1 ocorrência de `| '` por nome — mantém unions e lista em sincronia.
    const count = (union.match(/\|\s*'/g) ?? []).length;
    expect(count).toBe(FENIX_ICON_NAMES.length);
  });

  it('auto-import injeta @wrrdev/fenix-ui/icon ao detectar <fx-icon>', () => {
    const out = transformSource(`const t = '<fx-icon name="home" />';\n`);
    expect(out).toContain("import '@wrrdev/fenix-ui/icon'");
  });

  it('tipagem: FenixIconName aceita nome conhecido e string dinâmica', () => {
    // Comportamento garantido pelo tipo (a união tem a escotilha (string & {})).
    const known: import('./types').FenixIconName = 'home';
    const dynamic: import('./types').FenixIconName = `prefixo_${Math.random()}`;
    expect(known).toBe('home');
    expect(typeof dynamic).toBe('string');
  });
  it('auto-import: <fx-icon> não injeta o CSS completo (o componente carrega o @font-face leve)', () => {
    const out = transformSource(`const t = '<fx-icon name="home" />';\n`);
    expect(out).toContain("import '@wrrdev/fenix-ui/icon'");
    expect(out).not.toContain("import '@wrrdev/fenix-ui/icons'");
  });

  it('auto-import: o CSS completo continua sendo injetado quando a CLASSE é usada', () => {
    const out = transformSource(
      `const t = '<fx-icon name="home" /><i class="fx-icon fx-icon-home"></i>';\n`,
    );
    expect(out).toContain("import '@wrrdev/fenix-ui/icons'");
  });

  it('auto-import: não confunde a tag de fechamento </fx-icon> com a classe', () => {
    const out = transformSource(`const t = '<fx-icon name="home"></fx-icon>';\n`);
    expect(out).not.toContain("import '@wrrdev/fenix-ui/icons'");
  });

});
