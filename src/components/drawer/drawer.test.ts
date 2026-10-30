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

  it('header sempre existe (✕ disponível) e o título é opcional', async () => {
    // Antes o header (e o ✕) só existiam com title — um drawer sem título
    // ficava sem nenhum jeito de fechar pelo mouse.
    expect(el.dismissible).toBe(true);
    const header = el.shadowRoot!.querySelector('.header')!;
    expect(header).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.title')!.textContent).toBe('');
    expect(el.shadowRoot!.querySelector('.close')).toBeTruthy();
    el.title = 'Meu painel';
    await new Promise((r) => setTimeout(r, 0));
    expect(el.shadowRoot!.querySelector('.header')!.textContent).toContain('Meu painel');
    let closed = false;
    el.addEventListener('close', () => { closed = true; });
    el.open = true;
    (el.shadowRoot!.querySelector('.close') as HTMLElement).click();
    expect(closed).toBe(true);
  });

  it('dismissible="false" esconde o ✕ e bloqueia overlay/ESC', async () => {
    el.dismissible = false;
    expect(el.getAttribute('dismissible')).toBe('false');
    el.title = 'Fluxo obrigatório';
    el.open = true;
    await new Promise((r) => setTimeout(r, 0));
    // Com título o header continua (mostra o texto), porém sem o ✕.
    expect(el.shadowRoot!.querySelector('.header')!.textContent).toContain('Fluxo obrigatório');
    expect(el.shadowRoot!.querySelector('.close')).toBeNull();

    let closed = false;
    el.addEventListener('close', () => { closed = true; });
    (el.shadowRoot!.querySelector('.overlay') as HTMLElement).click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(el.open).toBe(true);
    expect(closed).toBe(false);

    // Sem título e não-dispensável: nenhum header (drawer sem chrome).
    el.removeAttribute('title');
    await new Promise((r) => setTimeout(r, 0));
    expect(el.shadowRoot!.querySelector('.header')).toBeNull();
  });

  it('header é sticky com fundo opaco acima do conteúdo (z-index tokenizado)', async () => {
    el.title = 'Meu painel';
    el.open = true;
    await new Promise((r) => setTimeout(r, 0));
    // Contrato visual: o conteúdo que rola por baixo não pode passar por cima do
    // header. O Shadow DOM não cria stacking context, então o z-index do header
    // precisa ganhar de z-index internos (ex.: .loading-overlay do fx-table = 10)
    // — daí o default 20 e o token para ajuste fino.
    expect(FxDrawer.styles).toMatch(/\.header\s*\{[^}]*position:\s*sticky/);
    expect(FxDrawer.styles).toMatch(
      /\.header\s*\{[^}]*background:\s*var\(--fx-surface-background\)/,
    );
    expect(FxDrawer.styles).toMatch(
      /\.header\s*\{[^}]*z-index:\s*var\(--fx-drawer-header-z,\s*20\)/,
    );
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
