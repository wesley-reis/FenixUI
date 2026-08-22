import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

describe('fx-button', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é um Custom Element registrado e renderiza o botão interno', () => {
    expect(customElements.get('fx-button')).toBeTruthy();
    const el = mount('<fx-button>Salvar</fx-button>');
    expect(el.shadowRoot!.querySelector('.btn')).toBeTruthy();
  });

  it('disabled mantém a cor da variante (apenas opacidade, sem trocar o fundo)', () => {
    const el = mount('<fx-button disabled>Salvar</fx-button>');
    const btn = el.shadowRoot!.querySelector('.btn')!;
    // A cor vem do tema via var() — não é sobrescrita por cinza fixo.
    expect(btn.getAttribute('style')).toBe(null);
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('cria ripple ao clicar (pointerdown)', () => {
    const el = mount('<fx-button>Salvar</fx-button>') as any;
    el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    const ripples = el.shadowRoot.querySelectorAll('.btn__ripple');
    expect(ripples.length).toBe(1);
  });

  it('não cria ripple com effect.ripple desativado pelo preset', () => {
    const el = mount('<fx-button style="--fx-effect-ripple:0">Salvar</fx-button>') as any;
    el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }));
    expect(el.shadowRoot.querySelectorAll('.btn__ripple').length).toBe(0);
  });
});
