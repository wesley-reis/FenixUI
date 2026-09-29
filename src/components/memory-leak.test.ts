/**
 * Testes de REGRESSÃO de vazamento de memória / travar CPU.
 *
 * Estes testes existem para travar o comportamento: um app grande e de uso
 * prolongado acumula instâncias e listeners, então qualquer referencia forte
 * esquecida (Map global, observer sem `disconnect`, timer sem `clear`)
 * cresce sem limite e derruba a aba.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// Os `index.ts` de cada componente fazem o auto-registro da custom element.
import './select';
import './multiselect';
import './dropdown';
import './datepicker';
import './autocomplete';
import './menu';
import './popover';
import './toast';
import './tooltip/directive';
import './breadcrumb';
import { FenixToast } from './toast';
import { defineFxTooltipDirective, fxTooltipActiveCount } from './tooltip/directive';

/** Espia add/removeEventListener em document/window para contar listeners vivos. */
function trackGlobalListeners() {
  const live = new Map<string, number>();
  const key = (t: EventTarget, type: string) => `${t === document ? 'document' : 'window'}:${type}`;
  const bump = (t: EventTarget, type: string, delta: number) => {
    const k = key(t, type);
    live.set(k, (live.get(k) ?? 0) + delta);
  };
  const origAddDoc = document.addEventListener.bind(document);
  const origRemDoc = document.removeEventListener.bind(document);
  const origAddWin = window.addEventListener.bind(window);
  const origRemWin = window.removeEventListener.bind(window);
  document.addEventListener = ((t: string, ...r: unknown[]) => {
    bump(document, t, 1);
    return (origAddDoc as never as (t: string, ...r: unknown[]) => void)(t, ...r);
  }) as typeof document.addEventListener;
  document.removeEventListener = ((t: string, ...r: unknown[]) => {
    bump(document, t, -1);
    return (origRemDoc as never as (t: string, ...r: unknown[]) => void)(t, ...r);
  }) as typeof document.removeEventListener;
  window.addEventListener = ((t: string, ...r: unknown[]) => {
    bump(window, t, 1);
    return (origAddWin as never as (t: string, ...r: unknown[]) => void)(t, ...r);
  }) as typeof window.addEventListener;
  window.removeEventListener = ((t: string, ...r: unknown[]) => {
    bump(window, t, -1);
    return (origRemWin as never as (t: string, ...r: unknown[]) => void)(t, ...r);
  }) as typeof window.removeEventListener;
  return {
    total: () => [...live.values()].reduce((a, b) => a + b, 0),
    restore: () => {
      document.addEventListener = origAddDoc;
      document.removeEventListener = origRemDoc;
      window.addEventListener = origAddWin;
      window.removeEventListener = origRemWin;
    },
  };
}

describe('memory: FenixToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('fx-toast').forEach((n) => n.remove());
    document.querySelectorAll('[data-fx-toast-region]').forEach((n) => n.remove());
  });

  it('NÃO retém toasts já dispensados: o mapa interno não cresce sem limite', async () => {
    // 50 toasts, todos expirando sozinhos (dismiss automático).
    for (let i = 0; i < 50; i++) FenixToast.info(`toast ${i}`);
    await vi.advanceTimersByTimeAsync(10);
    const peak = (FenixToast as unknown as { map: Map<number, unknown> }).map.size;
    expect(peak).toBe(50);

    // Deixa TODOS expirarem. Depois disso nada pode continuar retido:
    // o elemento saiu do DOM e o mapa precisa estar vazio.
    await vi.advanceTimersByTimeAsync(10_000);
    const after = (FenixToast as unknown as { map: Map<number, unknown> }).map.size;
    expect(after).toBe(0);
    expect(document.querySelectorAll('fx-toast').length).toBe(0);
  });

  it('toast expirado não deixa timer pendente nem elemento no DOM', async () => {
    FenixToast.error('some', 'msg', { duration: 1000 });
    const el = document.querySelector('fx-toast')!;
    await vi.advanceTimersByTimeAsync(1500);
    expect(el.isConnected).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('memory: listeners globais por instância', () => {
  it.each([
    'fx-select',
    'fx-multiselect',
    'fx-dropdown',
    'fx-datepicker',
    'fx-autocomplete',
    'fx-menu',
    'fx-popover',
  ] as const)('%s não deixa listener órfão em document/window após remover', (tag) => {
    const tracker = trackGlobalListeners();
    try {
      // Monta e desmonta 30 instâncias: é o ciclo de vida real de uma rota
      // de listagem que abre/fecha repeatedly.
      for (let i = 0; i < 30; i++) {
        const el = document.createElement(tag) as HTMLElement;
        el.setAttribute('trigger', 'click');
        document.body.appendChild(el);
        el.remove();
      }
      // Cada add tem que ter um remove correspondente. Diferença != 0 = vazamento.
      expect(tracker.total()).toBe(0);
    } finally {
      tracker.restore();
    }
  });
});

describe('memory: diretiva fx-tooltip', () => {
  it('remove o comportamento dos elementos desmontados do mapa interno', async () => {
    defineFxTooltipDirective();
    await new Promise((r) => setTimeout(r, 0));

    // Simula uma lista que renderiza 40 linhas com tooltip e depois é
    // descartada (troca de rota/filtro). É o ciclo que vazava sem limite.
    const host = document.createElement('div');
    document.body.appendChild(host);
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('button');
      el.setAttribute('fx-tooltip', `linha ${i}`);
      host.appendChild(el);
    }
    await new Promise((r) => setTimeout(r, 0));
    expect(fxTooltipActiveCount()).toBe(40);

    host.remove();
    await new Promise((r) => setTimeout(r, 0));
    // Após a remoção, nada pode continuar retido.
    expect(fxTooltipActiveCount()).toBe(0);
  });

  it('ciclos repetidos de montar/desmontar não acumulam tooltips', async () => {
    defineFxTooltipDirective();
    await new Promise((r) => setTimeout(r, 0));
    for (let i = 0; i < 5; i++) {
      const host = document.createElement('div');
      document.body.appendChild(host);
      for (let j = 0; j < 20; j++) {
        const el = document.createElement('span');
        el.setAttribute('fx-tooltip', `x${j}`);
        host.appendChild(el);
      }
      await new Promise((r) => setTimeout(r, 0));
      host.remove();
      await new Promise((r) => setTimeout(r, 0));
    }
    expect(fxTooltipActiveCount()).toBe(0);
  });
});

describe('memory: fx-breadcrumb', () => {
  it('desconecta o observer de filhos quando sai do DOM', async () => {
    const { defineFxBreadcrumb } = await import('./breadcrumb/breadcrumb');
    defineFxBreadcrumb();
    const el = document.createElement('fx-breadcrumb');
    document.body.appendChild(el);
    // Sem itens, o observer fica esperando os filhos chegarem.
    await new Promise((r) => setTimeout(r, 0));
    const pending = (el as unknown as { _childObserver?: MutationObserver })._childObserver;
    expect(pending).toBeDefined();

    el.remove();
    // Referência solta = observer desconectado = nada working em background.
    expect((el as unknown as { _childObserver?: MutationObserver })._childObserver).toBeUndefined();
  });
});
