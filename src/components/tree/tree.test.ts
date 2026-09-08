import { describe, it, expect } from 'vitest';
import './index';

const DATA = JSON.stringify([
  { label: 'Documentos', icon: '📁', children: [
    { label: 'Contrato.pdf' },
    { label: 'Relatório.xlsx' },
  ]},
  { label: 'Imagens', icon: '📁', children: [
    { label: 'Foto.png' },
  ]},
]);

describe('fx-tree', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-tree')).toBeDefined();
  });

  it('renderiza nós raiz e filhos ocultos até expandir', () => {
    const el = document.createElement('fx-tree');
    el.setAttribute('data', DATA);
    document.body.appendChild(el);
    const rows = el.shadowRoot!.querySelectorAll('.row');
    expect(rows).toHaveLength(5); // 2 raízes + 3 filhos (ocultos)
    // nenhum grupo de filhos visível
    expect(el.shadowRoot!.querySelectorAll('ul.children:not([hidden]) .row')).toHaveLength(0);
    const caret = el.shadowRoot!.querySelector('.caret[data-toggle="0"]') as HTMLElement;
    caret.click();
    // filhos do primeiro nó agora visíveis
    const visible = el.shadowRoot!.querySelectorAll('ul.children:not([hidden]) .row');
    expect(visible).toHaveLength(2);
    const labels = Array.from(visible).map((l) => l.textContent);
    expect(labels.some((t) => t?.includes('Contrato.pdf'))).toBe(true);
    el.remove();
  });

  it('seleção emite select com o nó', () => {
    const el = document.createElement('fx-tree');
    el.setAttribute('data', DATA);
    document.body.appendChild(el);
    let node: unknown = null;
    el.addEventListener('select', (e: Event) => (node = (e as CustomEvent).detail.node));
    const row = el.shadowRoot!.querySelector('.row[data-path="0"]') as HTMLElement;
    row.click();
    expect((node as { label: string }).label).toBe('Documentos');
    expect(row.classList.contains('selected')).toBe(true);
    el.remove();
  });

  it('expand-all mostra todos os filhos', () => {
    const el = document.createElement('fx-tree');
    el.setAttribute('data', DATA);
    el.setAttribute('expand-all', '');
    document.body.appendChild(el);
    const labels = Array.from(el.shadowRoot!.querySelectorAll('.label')).map((l) => l.textContent);
    expect(labels).toContain('Contrato.pdf');
    expect(labels).toContain('Foto.png');
    el.remove();
  });
});