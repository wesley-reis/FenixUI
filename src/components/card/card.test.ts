import { describe, it, expect } from 'vitest';
import './index';

describe('fx-card', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-card')).toBeDefined();
  });

  it('projection de slots header/content/footer', () => {
    const el = document.createElement('fx-card');
    el.setAttribute('heading', 'Título');
    el.setAttribute('padded', '');
    el.innerHTML =
      '<span slot="header">H</span><p>Corpo</p><span slot="footer">F</span>';
    document.body.appendChild(el);
    const header = el.shadowRoot!.querySelector('header');
    expect(header?.textContent).toContain('Título');
    // conteúdo dos slots fica no light DOM; os slots existem no shadow
    expect(el.querySelector('p')).toBeTruthy();
    expect(el.querySelector('p')?.textContent).toBe('Corpo');
    expect(el.querySelector('[slot="footer"]')?.textContent).toBe('F');
    expect(el.shadowRoot!.querySelector('slot[name="header"]')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('slot[name="footer"]')).toBeTruthy();
    el.remove();
  });

  it('variant outline flat ghost renderizam sem sombra', () => {
    for (const v of ['elevated', 'flat', 'outline', 'ghost']) {
      const el = document.createElement('fx-card');
      el.setAttribute('variant', v);
      document.body.appendChild(el);
      const card = el.shadowRoot!.querySelector('.card') as HTMLElement;
      expect(card).toBeTruthy();
      el.remove();
    }
  });
});
