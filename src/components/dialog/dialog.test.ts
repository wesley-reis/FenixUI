import { describe, it, expect } from 'vitest';
import './index';

describe('fx-dialog', () => {
  it('registra e abre/fecha com eventos', () => {
    expect(customElements.get('fx-dialog')).toBeDefined();
    const el = document.createElement('fx-dialog');
    el.setAttribute('heading', 'Confirmar');
    document.body.appendChild(el);
    let opened = false;
    let closed = false;
    el.addEventListener('open', () => (opened = true));
    el.addEventListener('close', () => (closed = true));
    el.setAttribute('open', '');
    expect(opened).toBe(true);
    // fechar via botão × emite 'close' e remove o atributo
    (el.shadowRoot!.querySelector('.close') as HTMLButtonElement)?.click();
    expect(closed).toBe(true);
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
  });

  it('não duplica listeners em re-render com o dialog aberto (ex.: heading mudando)', () => {
    const el = document.createElement('fx-dialog');
    el.setAttribute('heading', 'Título A');
    document.body.appendChild(el);
    el.setAttribute('open', '');

    // Re-renders enquanto aberto (mudanças de heading/size observadas)
    el.setAttribute('heading', 'Título B');
    el.setAttribute('size', 'lg');

    let closes = 0;
    el.addEventListener('close', () => (closes++));

    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(esc);

    expect(closes).toBe(1);
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
  });
});
