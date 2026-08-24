import { describe, it, expect } from 'vitest';
import './index';

describe('fx-tabs / fx-tab-panel', () => {
  it('registra os dois componentes', () => {
    expect(customElements.get('fx-tabs')).toBeDefined();
    expect(customElements.get('fx-tab-panel')).toBeDefined();
  });

  it('troca de aba emite change e atualiza value', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<fx-tabs value="a"><fx-tab tab="a">Aba A</fx-tab><fx-tab tab="b">Aba B</fx-tab></fx-tabs>`
    );
    await new Promise((r) => setTimeout(r, 0));
    const tabs = document.querySelector('fx-tabs')!;
    let detail: { value: string } | null = null;
    tabs.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    const btns = tabs.shadowRoot!.querySelectorAll('.tab');
    expect(btns.length).toBe(2);
    (btns[1] as HTMLElement).click();
    await Promise.resolve();
    expect(tabs.getAttribute('value')).toBe('b');
    expect(detail!.value).toBe('b');
    tabs.remove();
  });
});
