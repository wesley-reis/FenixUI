import { describe, it, expect } from 'vitest';
import './index';

describe('fx-confirmpopup', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-confirmpopup')).toBeDefined();
  });

  it('abre ancorado no target, posiciona abaixo e emite accept', () => {
    const btn = document.createElement('button');
    btn.id = 'cp-anchor';
    document.body.appendChild(btn);
    const el = document.createElement('fx-confirmpopup');
    el.setAttribute('target', '#cp-anchor');
    el.setAttribute('message', 'Confirmar ação?');
    document.body.appendChild(el);

    let accepted = false;
    el.addEventListener('accept', () => (accepted = true));

    el.setAttribute('open', '');
    const popup = el.shadowRoot!.querySelector('.popup') as HTMLElement;
    expect(popup.hidden).toBe(false);
    expect(popup.dataset.side).toBe('bottom');

    (el.shadowRoot!.querySelector('button.accept') as HTMLButtonElement).click();
    expect(accepted).toBe(true);
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
    btn.remove();
  });

  it('emite reject e fecha via ESC', () => {
    const btn = document.createElement('button');
    btn.id = 'cp-anchor2';
    document.body.appendChild(btn);
    const el = document.createElement('fx-confirmpopup');
    el.setAttribute('target', '#cp-anchor2');
    document.body.appendChild(el);

    let rejected = false;
    el.addEventListener('reject', () => (rejected = true));

    el.setAttribute('open', '');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(rejected).toBe(true);
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
    btn.remove();
  });

  it('permite templates customizados nos slots accept/reject', () => {
    const btn = document.createElement('button');
    btn.id = 'cp-anchor3';
    document.body.appendChild(btn);
    const el = document.createElement('fx-confirmpopup');
    el.setAttribute('target', '#cp-anchor3');
    el.innerHTML =
      'Mensagem customizada<span slot="accept">OK!</span><span slot="reject">Nada feito</span>';
    document.body.appendChild(el);
    el.setAttribute('open', '');
    const footer = el.shadowRoot!.querySelector('footer') as HTMLElement;
    // conteúdo dos slots é projetado no light DOM
    expect(el.querySelector('[slot="accept"]')?.textContent).toBe('OK!');
    expect(el.querySelector('[slot="reject"]')?.textContent).toBe('Nada feito');
    // slot padrão (mensagem) presente no shadow
    expect(el.shadowRoot!.querySelector('.message slot')).toBeTruthy();
    expect(el.textContent).toContain('Mensagem customizada');
    expect(footer).toBeTruthy();
    el.remove();
    btn.remove();
  });
});
