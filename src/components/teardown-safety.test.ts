/**
 * Regressão: callbacks DIFERIDOS (timer, `requestAnimationFrame`,
 * `MutationObserver`) que sobrevivem ao teardown do ambiente.
 *
 * Contexto real: a esteira falhou com
 *
 *   ReferenceError: HTMLElement is not defined
 *   ❯ FxTooltipManager._flush (src/components/tooltip/directive.ts)
 *   ❯ Timeout.run
 *
 * Os 1.163 testes passaram e mesmo assim o processo saiu com erro: o Vitest
 * fecha a janela do jsdom e remove os globais ao terminar cada arquivo, mas o
 * flush agendado pelo `MutationObserver` do `fx-tooltip` continuava na fila —
 * ao disparar, `HTMLElement` já não existia. Isso é reportado como
 * "Unhandled Errors" e derruba o build.
 *
 * Aqui o teardown é simulado de forma DETERMINÍSTICA (globais do DOM zerados,
 * timers pendentes drenados), então a falha não depende mais do timing da
 * máquina — que é justamente o motivo de passar local e falhar no CI.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './carousel/index';
import './dialog/index';
import './editor/index';
import './toast/index';
import './tooltip/index';
import { isDomAvailable } from '../core/dom';
import {
  defineFxTooltipDirective,
  destroyFxTooltipDirective,
  fxTooltipActiveCount,
} from './tooltip/directive';
import { FenixToast } from './toast/toast';

/** Globais que o jsdom remove no teardown e que os callbacks podem tocar. */
const DOM_GLOBALS = ['document', 'window', 'HTMLElement', 'Element', 'Node', 'CustomEvent'] as const;

/**
 * Zera os globais do DOM — mesma situação de um ambiente já desmontado.
 * Devolve a função que restaura tudo.
 */
function simulateTeardown(): () => void {
  const target = globalThis as unknown as Record<string, unknown>;
  const saved: Array<[string, PropertyDescriptor | undefined]> = [];
  for (const key of DOM_GLOBALS) {
    saved.push([key, Object.getOwnPropertyDescriptor(target, key)]);
    try {
      Object.defineProperty(target, key, { value: undefined, configurable: true, writable: true });
    } catch {
      /* global não configurável neste ambiente: segue sem simular */
    }
  }
  return () => {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(target, key, descriptor);
      else delete target[key];
    }
  };
}

/**
 * Deixa a fila de timers/rAF drenar e devolve o que explodiu nesse período.
 * O handler de `uncaughtException` transforma o erro "não tratado" em uma
 * asserção legível (`ReferenceError: HTMLElement is not defined`) em vez de um
 * erro solto no fim da suíte.
 */
async function drainPending(ms: number): Promise<unknown[]> {
  const errors: unknown[] = [];
  const onUncaught = (error: unknown): void => {
    errors.push(error);
  };
  process.on('uncaughtException', onUncaught);
  try {
    await new Promise((resolve) => setTimeout(resolve, ms));
  } finally {
    process.off('uncaughtException', onUncaught);
  }
  return errors;
}

function expectNoErrors(errors: unknown[]): void {
  expect(errors.map((e) => (e instanceof Error ? `${e.name}: ${e.message}` : String(e)))).toEqual([]);
}

function mount(html: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const el = wrap.firstElementChild as HTMLElement;
  document.body.appendChild(wrap);
  return el;
}


describe('teardown: timers pendentes não tocam globais do DOM', () => {
  let restore: (() => void) | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    restore?.();
    restore = null;
    destroyFxTooltipDirective();
    document.body.innerHTML = '';
  });

  it('isDomAvailable reflete o ambiente (e a simulação de teardown)', () => {
    expect(isDomAvailable()).toBe(true);
    const undo = simulateTeardown();
    expect(isDomAvailable()).toBe(false);
    undo();
    expect(isDomAvailable()).toBe(true);
  });

  it('fx-tooltip: o flush agendado pelo observer não quebra após o teardown', async () => {
    defineFxTooltipDirective();
    const el = document.createElement('div');
    el.setAttribute('fx-tooltip', 'Texto');
    document.body.appendChild(el); // agenda o flush (rAF ou timer)

    restore = simulateTeardown();
    const errors = await drainPending(90);

    expectNoErrors(errors);
  });

  it('fx-tooltip: destroy cancela o flush pendente (nada roda depois)', async () => {
    defineFxTooltipDirective();
    const el = document.createElement('div');
    el.setAttribute('fx-tooltip', 'Texto');
    document.body.appendChild(el);
    destroyFxTooltipDirective(); // cancela o flush agendado

    restore = simulateTeardown();
    const errors = await drainPending(90);

    expectNoErrors(errors);
    restore();
    restore = null;
    expect(fxTooltipActiveCount()).toBe(0);
  });

  it('fx-carousel: autoplay não emite change depois do teardown', async () => {
    mount('<fx-carousel autoplay="20"><div slot="slide">A</div><div slot="slide">B</div></fx-carousel>');

    restore = simulateTeardown();
    const errors = await drainPending(90); // o intervalo dispara aqui

    expectNoErrors(errors);
  });

  it('fx-toast: o timer de duração não mexe no DOM depois do teardown', async () => {
    FenixToast.info('Título', 'Mensagem', { duration: 30 });
    await Promise.resolve(); // host entra no DOM

    restore = simulateTeardown();
    const errors = await drainPending(120); // o timer (30ms) dispara aqui

    expectNoErrors(errors);
  });

  it('fx-editor: o emit diferido (rAF) não quebra depois do teardown', async () => {
    const el = mount('<fx-editor></fx-editor>');
    const content = el.shadowRoot!.querySelector<HTMLElement>('.content')!;
    content.innerHTML = '<p>Oi</p>';
    content.dispatchEvent(new Event('input', { bubbles: true })); // agenda o emit

    restore = simulateTeardown();
    const errors = await drainPending(90);

    expectNoErrors(errors);
  });

  it('fx-dialog: o rAF de foco não usa document depois do teardown', async () => {
    const el = mount('<fx-dialog heading="Título"></fx-dialog>');
    el.setAttribute('open', ''); // agenda o rAF que lê document.activeElement

    restore = simulateTeardown();
    const errors = await drainPending(90);

    expectNoErrors(errors);
  });
});
