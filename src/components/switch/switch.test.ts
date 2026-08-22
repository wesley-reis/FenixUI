import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

describe('fx-switch', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é um Custom Element registrado com role switch', () => {
    expect(customElements.get('fx-switch')).toBeTruthy();
    const el = mount('<fx-switch>Ligar</fx-switch>');
    expect(el.shadowRoot!.querySelector('[role="switch"]')).toBeTruthy();
  });

  it('alterna checked ao clicar e emite change composto', () => {
    const el = mount('<fx-switch>Ligar</fx-switch>') as any;
    let detail: unknown;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const btn = el.shadowRoot.querySelector('.switch')!;
    btn.click();
    expect(el.checked).toBe(true);
    expect(detail).toEqual({ checked: true });
    btn.click();
    expect(el.checked).toBe(false);
  });

  it('respeita o atributo checked inicial', () => {
    const el = mount('<fx-switch checked></fx-switch>') as any;
    expect(el.shadowRoot.querySelector('.switch')!.getAttribute('aria-checked')).toBe('true');
  });

  it('não alterna quando disabled', () => {
    const el = mount('<fx-switch disabled></fx-switch>') as any;
    el.shadowRoot.querySelector('.switch')!.click();
    expect(el.checked).toBe(false);
  });

  it('size padrão é md e valores inválidos caem para md', () => {
    const el = mount('<fx-switch size="xl"></fx-switch>') as any;
    expect(el.size).toBe('md');
  });
});
