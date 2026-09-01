import { describe, it, expect } from 'vitest';
import './index';

describe('fx-accordion / fx-accordion-panel', () => {
  it('registra os dois componentes', () => {
    expect(customElements.get('fx-accordion')).toBeDefined();
    expect(customElements.get('fx-accordion-panel')).toBeDefined();
  });

  it('modo single: abre um painel e fecha o outro', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<fx-accordion>
        <fx-accordion-panel value="p1" header="Titulo 1">Conteudo 1</fx-accordion-panel>
        <fx-accordion-panel value="p2" header="Titulo 2">Conteudo 2</fx-accordion-panel>
      </fx-accordion>`
    );
    await new Promise((r) => setTimeout(r, 0));
    const acc = document.querySelector('fx-accordion')!;
    const panels = acc.querySelectorAll('fx-accordion-panel');
    // Primeiro painel aberto por padrao.
    expect(panels[0].hasAttribute('expanded')).toBe(true);
    // Clica no segundo: fecha o primeiro.
    (panels[1].shadowRoot!.querySelector('.header') as HTMLElement).click();
    await Promise.resolve();
    expect(panels[0].hasAttribute('expanded')).toBe(false);
    expect(panels[1].hasAttribute('expanded')).toBe(true);
    acc.remove();
  });

  it('modo multiple: mantem os outros abertos', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<fx-accordion multiple value="p1">
        <fx-accordion-panel value="p1" header="T1">C1</fx-accordion-panel>
        <fx-accordion-panel value="p2" header="T2">C2</fx-accordion-panel>
      </fx-accordion>`
    );
    await new Promise((r) => setTimeout(r, 0));
    const acc = document.querySelector('fx-accordion[multiple]')!;
    const panels = acc.querySelectorAll('fx-accordion-panel');
    (panels[1].shadowRoot!.querySelector('.header') as HTMLElement).click();
    await Promise.resolve();
    expect(panels[0].hasAttribute('expanded')).toBe(true);
    expect(panels[1].hasAttribute('expanded')).toBe(true);
    // Fecha p1 novamente: p2 continua aberto.
    (panels[0].shadowRoot!.querySelector('.header') as HTMLElement).click();
    await Promise.resolve();
    expect(panels[0].hasAttribute('expanded')).toBe(false);
    expect(panels[1].hasAttribute('expanded')).toBe(true);
    acc.remove();
  });

  it('emite change com os valores ativos', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<fx-accordion>
        <fx-accordion-panel value="a" header="A">A</fx-accordion-panel>
      </fx-accordion>`
    );
    await new Promise((r) => setTimeout(r, 0));
    const acc = document.querySelector('fx-accordion')!;
    let detail: { value: string[] } | null = null;
    acc.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    const panel = acc.querySelector('fx-accordion-panel')!;
    (panel.shadowRoot!.querySelector('.header') as HTMLElement).click();
    await Promise.resolve();
    expect(detail!.value).toEqual([]);
    acc.remove();
  });

  it('painel disabled nao abre', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<fx-accordion>
        <fx-accordion-panel value="d" header="D" disabled>C</fx-accordion-panel>
      </fx-accordion>`
    );
    await new Promise((r) => setTimeout(r, 0));
    const acc = document.querySelector('fx-accordion')!;
    const panel = acc.querySelector('fx-accordion-panel')!;
    (panel.shadowRoot!.querySelector('.header') as HTMLElement).click();
    await Promise.resolve();
    expect(panel.hasAttribute('expanded')).toBe(false);
    acc.remove();
  });
});
