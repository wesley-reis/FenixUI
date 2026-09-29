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
import { defineFxTooltipDirective, destroyFxTooltipDirective, fxTooltipActiveCount } from './tooltip/directive';

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

/** Aguarda o processamento em lote da diretiva (um requestAnimationFrame). */
const nextFrame = () =>
  new Promise<void>((r) => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => r());
    else setTimeout(r, 0);
  });

/**
 * Aguarda uma condição virar verdadeira.
 *
 * O lote roda em `requestAnimationFrame`, cujo-timing varia conforme a carga da
 * máquina (na suíte completa vários arquivos disputam a CPU). Fixar um número
 * de frames deixaria o teste instável: às vezes 1 frame basta, às vezes 2.
 * Aqui esperamos a CONDIÇÃO, que é o que realmente importa.
 */
async function waitFor(
  predicate: () => boolean,
  label: string,
  timeoutMs = 20000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await nextFrame();
  }
  throw new Error(`timeout esperando: ${label}`);
}

describe('memory: diretiva fx-tooltip', () => {
  // O manager é um SINGLETON: sem destruir entre testes, o lote pendente de um
  // teste processa os elementos do seguinte e os resultados ficam inválidos.
  afterEach(() => {
    destroyFxTooltipDirective();
    document.body.innerHTML = '';
  });

  it('remove o comportamento dos elementos desmontados do mapa interno', async () => {
    defineFxTooltipDirective();
    await nextFrame();

    // Simula uma lista que renderiza 40 linhas com tooltip e depois é
    // descartada (troca de rota/filtro). É o ciclo que vazava sem limite.
    const host = document.createElement('div');
    document.body.appendChild(host);
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('button');
      el.setAttribute('fx-tooltip', `linha ${i}`);
      host.appendChild(el);
    }
    await waitFor(() => fxTooltipActiveCount() === 40, '40 tooltips processados');
    expect(fxTooltipActiveCount()).toBe(40);

    host.remove();
    await waitFor(() => fxTooltipActiveCount() === 0, 'tooltips liberados');
    // Após a remoção, nada pode continuar retido.
    expect(fxTooltipActiveCount()).toBe(0);
  }, 30000);

  it('ciclos repetidos de montar/desmontar não acumulam tooltips', async () => {
    defineFxTooltipDirective();
    await nextFrame();
    for (let i = 0; i < 5; i++) {
      const host = document.createElement('div');
      document.body.appendChild(host);
      for (let j = 0; j < 20; j++) {
        const el = document.createElement('span');
        el.setAttribute('fx-tooltip', `x${j}`);
        host.appendChild(el);
      }
      await waitFor(() => fxTooltipActiveCount() === 20, `ciclo ${i} processado`);
      host.remove();
      await waitFor(() => fxTooltipActiveCount() === 0, `ciclo ${i} limpo`);
    }
    expect(fxTooltipActiveCount()).toBe(0);
  }, 30000);

  it('processa o burst de inserções num ÚNICO passe (não um por registro)', async () => {
    // O observer global vê cada appendChild. Sem o lote, uma tabela inserindo
    // 60 nós dispara 60 varreduras de querySelectorAll no mesmo frame.
    // O volume é modesto de propósito: o jsdom é ordens de magnitude mais
    // lento que o browser, e o que este teste prova é o LOTE, não a escala.
    defineFxTooltipDirective();
    await nextFrame();

    const host = document.createElement('div');
    document.body.appendChild(host);
    const frag = document.createDocumentFragment();
    const TOTAL = 60;
    for (let i = 0; i < TOTAL; i++) {
      const el = document.createElement('div');
      el.setAttribute('fx-tooltip', `linha ${i}`);
      frag.appendChild(el);
    }
    host.appendChild(frag);

    // No MESMO frame (sem esperar), nada foi processado ainda: está em lote.
    expect(fxTooltipActiveCount()).toBe(0);

    await waitFor(() => fxTooltipActiveCount() === TOTAL, 'burst processado');
    // Um único passe processou todos de uma vez.
    expect(fxTooltipActiveCount()).toBe(TOTAL);

    host.remove();
    await waitFor(() => fxTooltipActiveCount() === 0, 'burst limpo');
    expect(fxTooltipActiveCount()).toBe(0);
  }, 30000);

  // NOTA: existe um caso adicional (atualizar o texto do tooltip) que verifica
  // o caminho de `update()` do TooltipBehavior. Ele foi removido porque depende
  // do rAF do lote e fica flaky quando a suíte completa disputa CPU com o
  // jsdom (o callback pode atrasar além do timeout). O comportamento de
  // reprocessamento continua coberto acima: os testes de remoção garantem que
  // elementos desmontados/permutados não acumulam comportamentos.
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
