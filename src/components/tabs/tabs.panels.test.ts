import { describe, it, expect } from 'vitest';
import './index';

describe('fx-tabs — visibilidade dos painéis', () => {
  it('mostra SOMENTE o painel da aba ativa (inicial e após clique)', async () => {
    document.body.innerHTML = `
      <fx-tabs value="a" id="tt">
        <fx-tab tab="a">A</fx-tab>
        <fx-tab tab="b">B</fx-tab>
        <fx-tab-panel tab="a" id="tpa">Conteudo A</fx-tab-panel>
        <fx-tab-panel tab="b" id="tpb">Conteudo B</fx-tab-panel>
      </fx-tabs>`;
    await new Promise((r) => setTimeout(r, 0));
    const t = document.getElementById('tt') as any;
    const pa = document.getElementById('tpa')!;
    const pb = document.getElementById('tpb')!;
    expect(pa.hasAttribute('hidden')).toBe(false);
    expect(pb.hasAttribute('hidden')).toBe(true);
    (t.shadowRoot.querySelector('[data-tab="b"]') as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r, 0));
    expect(t.getAttribute('value')).toBe('b');
    expect(pa.hasAttribute('hidden')).toBe(true);
    expect(pb.hasAttribute('hidden')).toBe(false);
  });
});
