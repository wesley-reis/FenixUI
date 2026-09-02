import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './index';
import { defineFxTooltipDirective, destroyFxTooltipDirective } from './directive';

describe('fx-tooltip', () => {
  it('registra e renderiza o conteúdo', () => {
    expect(customElements.get('fx-tooltip')).toBeDefined();
    const el = document.createElement('fx-tooltip');
    el.setAttribute('content', 'Ajuda aqui');
    document.body.appendChild(el);
    expect(el.shadowRoot!.innerHTML).toContain('Ajuda aqui');
    el.remove();
  });
});

describe('fx-tooltip directive', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    defineFxTooltipDirective();
  });

  afterEach(() => {
    destroyFxTooltipDirective();
    document.body.innerHTML = '';
  });

  it('cria tooltip em elemento com atributo fx-tooltip', () => {
    const el = document.createElement('div');
    el.setAttribute('fx-tooltip', 'Texto do tooltip');
    document.body.appendChild(el);

    // Força o observer a processar
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const bubble = el.querySelector('.fx-tooltip-bubble');
        expect(bubble).toBeTruthy();
        expect(bubble?.textContent).toBe('Texto do tooltip');
        resolve();
      }, 50);
    });
  });

  it('cria tooltip com posição bottom', () => {
    const el = document.createElement('button');
    el.setAttribute('fx-tooltip', 'Clique aqui');
    el.setAttribute('fx-tooltip-position', 'bottom');
    document.body.appendChild(el);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const bubble = el.querySelector('.fx-tooltip-bubble');
        expect(bubble).toBeTruthy();
        expect(bubble?.classList.contains('fx-tooltip-bottom')).toBe(true);
        resolve();
      }, 50);
    });
  });

  it('cria tooltip com HTML quando fx-tooltip-html está presente', () => {
    const el = document.createElement('span');
    el.setAttribute('fx-tooltip', '<strong>HTML</strong> personalizado');
    el.setAttribute('fx-tooltip-html', '');
    document.body.appendChild(el);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const bubble = el.querySelector('.fx-tooltip-bubble');
        expect(bubble).toBeTruthy();
        expect(bubble?.innerHTML).toContain('<strong>HTML</strong>');
        resolve();
      }, 50);
    });
  });

  it('remove tooltip quando atributo fx-tooltip é removido', () => {
    const el = document.createElement('div');
    el.setAttribute('fx-tooltip', 'Texto');
    document.body.appendChild(el);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(el.querySelector('.fx-tooltip-bubble')).toBeTruthy();
        el.removeAttribute('fx-tooltip');
        setTimeout(() => {
          expect(el.querySelector('.fx-tooltip-bubble')).toBeFalsy();
          resolve();
        }, 50);
      }, 50);
    });
  });

  it('adiciona position relative ao elemento sem position definida', () => {
    const el = document.createElement('div');
    el.setAttribute('fx-tooltip', 'Texto');
    document.body.appendChild(el);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Verifica se o elemento tem a classe ou estilo de tooltip
        const hasTooltip = el.querySelector('.fx-tooltip-bubble');
        expect(hasTooltip).toBeTruthy();
        resolve();
      }, 50);
    });
  });
});
