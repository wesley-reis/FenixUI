import { describe, it, expect, beforeEach } from 'vitest';
import { FxDrawer } from './drawer';
import './index';

describe('<fx-drawer>', () => {
  let el: FxDrawer;
  beforeEach(async () => {
    document.body.innerHTML = '';
    el = document.createElement('fx-drawer');
    document.body.appendChild(el);
    await new Promise((r) => setTimeout(r, 0));
  });

  it('registra o componente', () => {
    expect(customElements.get('fx-drawer')).toBeDefined();
    expect(el.shadowRoot).toBeTruthy();
  });

  it('fecha por padrão e abre com o atributo open', () => {
    expect(el.open).toBe(false);
    expect(el.hasAttribute('open')).toBe(false);
    el.open = true;
    expect(el.hasAttribute('open')).toBe(true);
    // CSS: overlay visível somente com [open]
    expect(FxDrawer.styles).toContain(':host([open]) .overlay');
  });

  it('fecha ao clicar no overlay e emite close', async () => {
    el.open = true;
    await new Promise((r) => setTimeout(r, 0));
    let closed = false;
    el.addEventListener('close', () => { closed = true; });
    (el.shadowRoot!.querySelector('.overlay') as HTMLElement).click();
    expect(el.open).toBe(false);
    expect(closed).toBe(true);
  });

  it('header só aparece com title; botão fechar funciona', async () => {
    expect(el.shadowRoot!.querySelector('.header')).toBeNull();
    el.title = 'Meu painel';
    await new Promise((r) => setTimeout(r, 0));
    const header = el.shadowRoot!.querySelector('.header')!;
    expect(header.textContent).toContain('Meu painel');
    let closed = false;
    el.addEventListener('close', () => { closed = true; });
    el.open = true;
    (el.shadowRoot!.querySelector('.close') as HTMLElement).click();
    expect(closed).toBe(true);
  });

  it('header é sticky com fundo opaco acima do conteúdo (z-index)', async () => {
    el.title = 'Meu painel';
    el.open = true;
    await new Promise((r) => setTimeout(r, 0));
    // Contrato visual: o conteúdo que rola por baixo não pode passar
    // por cima do header — position sticky + background + z-index.
    expect(FxDrawer.styles).toMatch(/\.header\s*\{[^}]*position:\s*sticky/);
    expect(FxDrawer.styles).toMatch(
      /\.header\s*\{[^}]*background:\s*var\(--fx-surface-background\)/,
    );
    expect(FxDrawer.styles).toMatch(/\.header\s*\{[^}]*z-index:\s*1/);
  });

  it('position normalizada para right quando inválida', async () => {
    el.setAttribute('position', 'diagonal');
    await new Promise((r) => setTimeout(r, 0));
    expect(el.position).toBe('right');
    el.position = 'top';
    expect(el.getAttribute('position')).toBe('top');
  });

  it('fecha por ESC', async () => {
    el.open = true;
    let closed = false;
    el.addEventListener('close', () => { closed = true; });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(el.open).toBe(false);
    expect(closed).toBe(true);
  });
});
