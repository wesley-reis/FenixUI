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
});

