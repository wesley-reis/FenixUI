import { describe, it, expect } from 'vitest';
import './index';

describe('fx-popover', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-popover')).toBeDefined();
  });

  it('abre ancorado no target e emite show', () => {
    const btn = document.createElement('button');
    btn.id = 'pop-anchor';
    document.body.appendChild(btn);
    const el = document.createElement('fx-popover');
    el.setAttribute('target', '#pop-anchor');
    el.setAttribute('trigger', 'click');
    document.body.appendChild(el);

    let shown = false;
    el.addEventListener('show', () => (shown = true));

    el.setAttribute('open', '');
    const popup = el.shadowRoot!.querySelector('.popup') as HTMLElement;
    expect(popup.hidden).toBe(false);
    expect(shown).toBe(true);

    // hide se emite por ESC (más realista que removeAttribute)
    let hidden = false;
    el.addEventListener('hide', () => (hidden = true));
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(esc);
    expect(hidden).toBe(true);
    expect(el.open).toBe(false);

    el.remove();
    btn.remove();
  });

  it('slots header/footer aparecem só com conteúdo', () => {
    const btn = document.createElement('button');
    btn.id = 'pop-anchor2';
    document.body.appendChild(btn);
    const el = document.createElement('fx-popover');
    el.setAttribute('target', '#pop-anchor2');
    el.innerHTML = '<b slot="header">Título</b><p>Conteúdo</p><fx-button slot="footer">OK</fx-button>';
    document.body.appendChild(el);
    el.setAttribute('open', '');

    const header = el.shadowRoot!.querySelector('header') as HTMLElement;
    const footer = el.shadowRoot!.querySelector('footer') as HTMLElement;
    expect(header.hidden).toBe(false);
    expect(footer.hidden).toBe(false);
    el.remove();
    btn.remove();
  });
});
