import { describe, it, expect } from 'vitest';
import './index';

describe('fx-avatar', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-avatar')).toBeDefined();
  });

  it('variant image renderiza <img>', () => {
    const el = document.createElement('fx-avatar');
    el.setAttribute('variant', 'image');
    el.setAttribute('src', 'https://exemplo.com/img.png');
    el.setAttribute('alt', 'Usuário João');
    document.body.appendChild(el);
    const img = el.shadowRoot!.querySelector('img');
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('https://exemplo.com/img.png');
    expect(img!.getAttribute('alt')).toBe('Usuário João');
    el.remove();
  });

  it('variant text exibe iniciais do slot', () => {
    const el = document.createElement('fx-avatar');
        el.textContent = 'WR';
    document.body.appendChild(el);
    const avatar = el.shadowRoot!.querySelector('.avatar');
    expect(avatar?.classList.contains('text')).toBe(true);
    // slot content is projected from light DOM
    expect(el.textContent).toContain('WR');
    el.remove();
  });

  it('variant icon projeta slot name=icon', () => {
    const el = document.createElement('fx-avatar');
    el.setAttribute('variant', 'icon');
    el.innerHTML = '<span slot="icon">📷</span>';
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('slot[name="icon"]')).toBeTruthy();
    el.remove();
  });

  it('tamanhos e shapes aplicam tokens', () => {
    const el = document.createElement('fx-avatar');
    el.setAttribute('size', 'lg');
    el.setAttribute('shape', 'square');
    document.body.appendChild(el);
        const avatar = el.shadowRoot!.querySelector('.avatar') as HTMLElement;
    expect(el.hasAttribute('size')).toBe(true);
    expect(el.getAttribute('size')).toBe('lg');
    expect(avatar).toBeTruthy();
    el.remove();
  });
});
