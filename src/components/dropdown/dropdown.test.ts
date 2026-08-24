import { describe, it, expect } from 'vitest';
import './index';

describe('fx-dropdown', () => {
  it('registra dropdown/item e abre com clique no trigger', async () => {
    expect(customElements.get('fx-dropdown')).toBeDefined();
    expect(customElements.get('fx-dropdown-item')).toBeDefined();
    document.body.insertAdjacentHTML(
      'beforeend',
      `<fx-dropdown label="Ações"><fx-dropdown-item value="edit">Editar</fx-dropdown-item></fx-dropdown>`
    );
    const dd = document.querySelector('fx-dropdown')!;
    (dd.shadowRoot!.querySelector('.trigger') as HTMLElement)?.click();
    await Promise.resolve();
    expect(dd.hasAttribute('open')).toBe(true);
    let sel = '';
    dd.addEventListener('select', (e) => { sel = (e as CustomEvent).detail.value; });
    (document.querySelector('fx-dropdown-item')?.shadowRoot?.querySelector('.item') as HTMLElement)?.click();
    await Promise.resolve();
    expect(sel).toBe('edit');
    dd.remove();
  });
});
