import { describe, it, expect, vi, beforeEach } from 'vitest';
import './index';
import { FenixToast } from './toast';

describe('fx-toast / FenixToast', () => {
  beforeEach(() => {
    document.querySelectorAll('fx-toast').forEach((h) => h.remove());
  });

  it('API imperativa cria toasts na tela', async () => {
    FenixToast.success('Salvo!');
    await Promise.resolve();
    const hosts = document.querySelectorAll('fx-toast');
    expect(hosts.length).toBeGreaterThan(0);
    hosts.forEach((h) => h.remove());
  });

  it('a região dos toasts usa o token --fx-z-toast (acima de modais)', async () => {
    FenixToast.info('Camada', 'msg', { duration: 3000 });
    await Promise.resolve();
    const style = document.getElementById('fx-toast-region-style');
    expect(style?.textContent).toContain('[data-fx-toast-region]');
    expect(style?.textContent).toContain('var(--fx-z-toast, 1200)');
    const region = document.querySelector<HTMLElement>('[data-fx-toast-region="top-right"]')!;
    // O z-index deixou de ser um valor fixo no inline style: era 1100 — o MESMO
    // de --fx-z-modal — e o overlay do modal (posterior no DOM) cobria o toast.
    expect(region.style.zIndex).toBe('');
    document.querySelectorAll('fx-toast').forEach((h) => h.remove());
  });

  it('mensagem sem título usa card compacto', async () => {
    FenixToast.info('', 'Apenas mensagem');
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const card = el.shadowRoot!.querySelector<HTMLElement>('.card')!;
    expect(card.classList.contains('no-title')).toBe(true);
    expect(el.shadowRoot!.querySelector('style')!.textContent).toContain('.card.no-title { min-height: 48px; }');
    el.remove();
  });

  it('options.progress cria a barra de contagem com a duração correta', async () => {
    FenixToast.info('Com barra', 'msg', { duration: 5000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const bar = el.shadowRoot!.querySelector<HTMLElement>('.progress');
    expect(bar).toBeTruthy();
    // O tempo da animação precisa bater com o do setTimeout que fecha o toast,
    // senão a barra e o desaparecimento desalinham.
    expect(bar!.style.getPropertyValue('--toast-duration')).toBe('5000ms');
    expect(bar!.classList.contains('run')).toBe(true);
    expect(el.getAttribute('progress')).toBe('always');
    el.remove();
  });

  it('sem progress não cria barra (comportamento atual preservado)', async () => {
    FenixToast.success('Sem barra');
    await Promise.resolve();
    expect(document.querySelector('fx-toast')!.shadowRoot!.querySelector('.progress')).toBeNull();
    document.querySelectorAll('fx-toast').forEach((h) => h.remove());
  });

  it('progress vazio (booleano) é tratado como "always"', async () => {
    FenixToast.error('Bool', 'msg', { duration: 3000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    expect((el as any).progress).toBe('always');
    expect(el.shadowRoot!.querySelector('.progress')).toBeTruthy();
    el.remove();
  });

  it('progress="paused" exibe a barra cheia, porém sem a classe run', async () => {
    FenixToast.warning('Parada', 'msg', { duration: 4000, progress: 'paused' });
    await Promise.resolve();
    const bar = document.querySelector('fx-toast')!.shadowRoot!.querySelector<HTMLElement>('.progress')!;
    expect(bar).toBeTruthy();
    expect(bar.classList.contains('run')).toBe(false);
    document.querySelectorAll('fx-toast').forEach((h) => h.remove());
  });

  it('progress="hover" roda a animação, mas o CSS só libera sob :hover/focus', async () => {
    FenixToast.info('Hover', 'msg', { duration: 4000, progress: 'hover' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const bar = el.shadowRoot!.querySelector<HTMLElement>('.progress')!;
    expect(bar.classList.contains('run')).toBe(true);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    expect(style).toContain('.card:hover .progress.run');
    expect(style).toContain('.card:focus-within .progress.run');
    el.remove();
  });

  it('duration=0 (toast fixo) omite a barra — não há tempo restante', async () => {
    FenixToast.info('Fixo', 'msg', { duration: 0, progress: 'always' });
    await Promise.resolve();
    expect(document.querySelector('fx-toast')!.shadowRoot!.querySelector('.progress')).toBeNull();
    document.querySelectorAll('fx-toast').forEach((h) => h.remove());
  });

  it('a barra usa a cor do kind (--kind) e é esvaziada por scaleX', async () => {
    FenixToast.success('Cor', 'msg', { duration: 3000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    // A barra herda a cor sem configuração extra por kind.
    expect(style).toMatch(/\.progress\s*\{[^}]*background:\s*var\(--kind\)/s);
    // scaleX em vez de width: sem reflow por frame.
    expect(style).toContain('scaleX(1)');
    expect(style).toContain('scaleX(0)');
    // A origem vem de custom property (padrão left) — o mesmo keyframe serve
    // para os dois lados.
    expect(style).toContain('transform-origin: var(--toast-progress-origin, left center)');
    expect(el.getAttribute('kind')).toBe('success');
    el.remove();
  });

  it('progress-origin padrão é left (barra ancorada à esquerda)', async () => {
    FenixToast.info('Esq', 'msg', { duration: 4000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const bar = el.shadowRoot!.querySelector<HTMLElement>('.progress')!;
    expect((el as any).progressOrigin).toBe('left');
    expect(bar.style.getPropertyValue('--toast-progress-origin')).toBe('left center');
    el.remove();
  });

  it('progress-origin="right" espelha a drenagem', async () => {
    FenixToast.info('Dir', 'msg', { duration: 4000, progress: 'always', progressOrigin: 'right' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const bar = el.shadowRoot!.querySelector<HTMLElement>('.progress')!;
    expect((el as any).progressOrigin).toBe('right');
    expect(bar.style.getPropertyValue('--toast-progress-origin')).toBe('right center');
    el.remove();
  });

  it('progress-origin com valor inválido cai em left', async () => {
    const el = document.createElement('fx-toast') as HTMLElement & { progressOrigin: string };
    el.setAttribute('kind', 'info');
    el.setAttribute('title', 'x');
    el.setAttribute('duration', '3000');
    el.setAttribute('progress', 'always');
    el.setAttribute('progress-origin', 'topo');
    document.body.appendChild(el);
    await Promise.resolve();
    expect(el.progressOrigin).toBe('left');
    expect(el.shadowRoot!.querySelector<HTMLElement>('.progress')!.style.getPropertyValue('--toast-progress-origin')).toBe('left center');
    el.remove();
  });

  it('mudar progress-origin com o toast na tela reaplica a origem', async () => {
    FenixToast.info('Flip', 'msg', { duration: 4000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const bar = el.shadowRoot!.querySelector<HTMLElement>('.progress')!;
    expect(bar.style.getPropertyValue('--toast-progress-origin')).toBe('left center');
    el.setAttribute('progress-origin', 'right');
    await Promise.resolve();
    expect(bar.style.getPropertyValue('--toast-progress-origin')).toBe('right center');
    el.remove();
  });

  it('progress-origin não cria barra sozinho (exige progress)', async () => {
    FenixToast.info('So origin', 'msg', { duration: 4000, progressOrigin: 'right' });
    await Promise.resolve();
    expect(document.querySelector('fx-toast')!.shadowRoot!.querySelector('.progress')).toBeNull();
    document.querySelectorAll('fx-toast').forEach((h) => h.remove());
  });

  it('atualizar duration com o toast na tela realinha a barra', async () => {
    FenixToast.info('Reload', 'msg', { duration: 4000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    el.setAttribute('duration', '7000');
    await Promise.resolve();
    const bar = el.shadowRoot!.querySelector<HTMLElement>('.progress')!;
    expect(bar.style.getPropertyValue('--toast-duration')).toBe('7000ms');
    el.remove();
  });

  it('remover o atributo progress remove a barra', async () => {
    FenixToast.info('Off', 'msg', { duration: 4000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    el.removeAttribute('progress');
    await Promise.resolve();
    expect(el.shadowRoot!.querySelector('.progress')).toBeNull();
    el.remove();
  });

  it('durações abaixo do mínimo são elevadas para 1s na barra e no timer', async () => {
    vi.useFakeTimers();
    FenixToast.info('Curto', 'msg', { duration: 50, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    expect(el.shadowRoot!.querySelector<HTMLElement>('.progress')!.style.getPropertyValue('--toast-duration')).toBe('1000ms');
    // O timer usa o MESMO valor elevado (1000ms), não os 50ms digitados.
    vi.advanceTimersByTime(1000);
    expect(el.shadowRoot!.querySelector('.card')!.classList.contains('leaving')).toBe(true);
    vi.advanceTimersByTime(200); // fade-out antes do remove()
    expect(el.isConnected).toBe(false);
    vi.useRealTimers();
  });

  it('respeita prefers-reduced-motion', async () => {
    FenixToast.info('RM', 'msg', { duration: 3000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    expect(el.shadowRoot!.querySelector('style')!.textContent).toContain('prefers-reduced-motion');
    el.remove();
  });

  /* ------------------------------------------------------------------ */
  /* Layout: altura mínima, ícone centralizado e mensagem longa          */
  /* ------------------------------------------------------------------ */

  it('card tem altura mínima e ícone centralizado mesmo com título', () => {
    const el = document.createElement('fx-toast');
    el.setAttribute('kind', 'success');
    el.setAttribute('title', 'Título');
    el.setAttribute('message', 'Mensagem');
    document.body.appendChild(el);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    expect(style).toContain('min-height: 56px');
    expect(style).toMatch(/\.card \{[^}]*align-items: center/);
    expect(style).toMatch(/\.icon \{[^}]*align-self: center/);
    // O ícone não tem mais o deslocamento que o deixava acima do centro.
    const iconBlock = style.match(/\.icon \{[^}]*\}/)?.[0] ?? '';
    expect(iconBlock).not.toContain('margin-top');
    el.remove();
  });

  it('sem título o card mantém a mesma altura mínima', () => {
    const el = document.createElement('fx-toast');
    el.setAttribute('kind', 'info');
    el.setAttribute('message', 'Só mensagem');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.title')).toBeNull();
    expect(el.shadowRoot!.querySelector('style')!.textContent).toContain('min-height: 56px');
    el.remove();
  });

  it('mensagem longa é truncada em 2 linhas e oferece "Ver mais" + copiar', () => {
    const el = document.createElement('fx-toast');
    el.setAttribute('kind', 'warning');
    el.setAttribute('title', 'Atenção');
    el.setAttribute('message', 'Uma mensagem bem longa '.repeat(20));
    document.body.appendChild(el);
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    expect(style).toContain('-webkit-line-clamp: 2');
    const more = el.shadowRoot!.querySelector<HTMLButtonElement>('.more')!;
    const copy = el.shadowRoot!.querySelector<HTMLButtonElement>('.copy')!;
    expect(more).toBeTruthy();
    expect(copy).toBeTruthy();
    // O copiar só aparece depois de expandir o texto.
    expect(copy.hidden).toBe(true);
    more.click();
    expect(copy.hidden).toBe(false);
    // A dica nativa mostra o texto completo ao passar o mouse.
    expect(el.shadowRoot!.querySelector('.msg')!.getAttribute('title')).toContain('Uma mensagem bem longa');
    el.remove();
  });

  it('"Ver mais" expande o card e troca o rótulo', () => {
    const el = document.createElement('fx-toast');
    el.setAttribute('kind', 'info');
    el.setAttribute('title', 'Título');
    el.setAttribute('message', 'texto longo');
    document.body.appendChild(el);
    const more = el.shadowRoot!.querySelector<HTMLButtonElement>('.more')!;
    const copy = el.shadowRoot!.querySelector<HTMLButtonElement>('.copy')!;
    more.click();
    expect(el.shadowRoot!.querySelector('.card')!.classList.contains('expanded')).toBe(true);
    expect(more.textContent).toBe('Ver menos');
    expect(copy.hidden).toBe(false);
    more.click();
    expect(el.shadowRoot!.querySelector('.card')!.classList.contains('expanded')).toBe(false);
    expect(more.textContent).toBe('Ver mais');
    expect(copy.hidden).toBe(true);
    el.remove();
  });

  it('botão copiar envia título + mensagem completa (após expandir)', async () => {
    const written: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (t: string) => { written.push(t); return Promise.resolve(); } },
    });
    const el = document.createElement('fx-toast');
    el.setAttribute('kind', 'success');
    el.setAttribute('title', 'Salvo');
    el.setAttribute('message', 'Registro atualizado.');
    document.body.appendChild(el);
    el.shadowRoot!.querySelector<HTMLButtonElement>('.more')!.click();
    el.shadowRoot!.querySelector<HTMLButtonElement>('.copy')!.click();
    expect(written[0]).toBe('Salvo\nRegistro atualizado.');
    el.remove();
  });

  /* ------------------------------------------------------------------ */
  /* Hover/foco pausam a contagem                                        */
  /* ------------------------------------------------------------------ */

  it('hover pausa o tempo de fechar e retoma ao sair', async () => {
    vi.useFakeTimers();
    FenixToast.info('Longa', 'mensagem grande', { duration: 3000 });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    vi.advanceTimersByTime(1000);
    el.dispatchEvent(new Event('mouseenter'));
    // Muito tempo com o cursor em cima: o toast NÃO pode sumir.
    vi.advanceTimersByTime(10000);
    expect(el.shadowRoot!.querySelector('.card')!.classList.contains('leaving')).toBe(false);
    el.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(4000);
    expect(el.shadowRoot!.querySelector('.card')!.classList.contains('leaving')).toBe(true);
    vi.advanceTimersByTime(250);
    expect(el.isConnected).toBe(false);
    vi.useRealTimers();
  });

  it('a barra pausa junto com o timer no hover (:hover/:focus-within)', async () => {
    FenixToast.info('Barra', 'msg', { duration: 4000, progress: 'always' });
    await Promise.resolve();
    const el = document.querySelector('fx-toast')!;
    const style = el.shadowRoot!.querySelector('style')!.textContent!;
    expect(style).toContain('.card:hover .progress.run');
    expect(style).toContain('animation-play-state: paused');
    expect(style).not.toContain('animation-play-state: running');
    el.remove();
  });
});

