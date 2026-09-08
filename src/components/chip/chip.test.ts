import { describe, it, expect } from 'vitest';
import './index';

describe('fx-chip', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-chip')).toBeDefined();
  });

  it('removable: × emite remove (e não chip-click)', () => {
    const el = document.createElement('fx-chip');
    el.setAttribute('removable', '');
    el.textContent = 'React';
    document.body.appendChild(el);
    let removed = false;
    let clicked = false;
    el.addEventListener('remove', () => (removed = true));
    el.addEventListener('chip-click', () => (clicked = true));
    const btn = el.shadowRoot!.querySelector('.remove') as HTMLButtonElement;
    expect(btn.hidden).toBe(false);
    btn.click();
    expect(removed).toBe(true);
    expect(clicked).toBe(false);
    el.remove();
  });

  it('selectable alterna selected e emite chip-click', () => {
    const el = document.createElement('fx-chip');
    el.setAttribute('selectable', '');
    el.textContent = 'Filtro';
    document.body.appendChild(el);
    let clicks = 0;
    el.addEventListener('chip-click', () => clicks++);
    const chip = el.shadowRoot!.querySelector('.chip') as HTMLElement;
    chip.click();
    expect(el.selected).toBe(true);
    chip.click();
    expect(el.selected).toBe(false);
    expect(clicks).toBe(2);
    el.remove();
  });

  it('sem selectable/removable não é clicável', () => {
    const el = document.createElement('fx-chip');
    el.textContent = 'estático';
    document.body.appendChild(el);
    const chip = el.shadowRoot!.querySelector('.chip') as HTMLElement;
    expect(chip.classList.contains('clickable')).toBe(false);
    expect(chip.getAttribute('role')).toBe('status');
    expect((el.shadowRoot!.querySelector('.remove') as HTMLButtonElement).hidden).toBe(true);
    el.remove();
  });

  it('disabled não permite seleção', () => {
    const el = document.createElement('fx-chip');
    el.setAttribute('selectable', '');
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    const chip = el.shadowRoot!.querySelector('.chip') as HTMLElement;
    chip.click();
    expect(el.selected).toBe(false);
    el.remove();
  });
});
