import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

const day = (el: any, d: number): HTMLButtonElement | null =>
  [...el.shadowRoot.querySelectorAll('[data-day]')].find(
    (b: any) => Number(b.dataset.day) % 100 === d,
  ) ?? null;

describe('fx-calendar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é um Custom Element registrado', () => {
    expect(customElements.get('fx-calendar')).toBeTruthy();
  });

  it('seleção simples reflete value e emite change', () => {
    const el = mount('<fx-calendar></fx-calendar>') as any;
    let detail: any;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    day(el, 15)!.click();
    expect(detail.value).toMatch(/-\d{2}$/);
    expect(el.value.endsWith('15')).toBe(true);
    expect(day(el, 15)!.classList.contains('sel')).toBe(true);
  });

  it('range: dois cliques montam período com swap automático', () => {
    const el = mount('<fx-calendar range></fx-calendar>') as any;
    let detail: any;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    day(el, 20)!.click();
    day(el, 10)!.click(); // anterior → swap
    expect(detail.start.endsWith('10')).toBe(true);
    expect(detail.end.endsWith('20')).toBe(true);
  });

  it('navegação: título abre meses, ano abre anos', () => {
    const el = mount('<fx-calendar></fx-calendar>') as any;
    (el.shadowRoot.querySelector('.title') as HTMLElement).click();
    expect(el.shadowRoot.querySelector('.grid.months')).toBeTruthy();
    (el.shadowRoot.querySelector('.title') as HTMLElement).click();
    expect(el.shadowRoot.querySelector('.grid.years')).toBeTruthy();
  });

  it('min por mês desabilita dias anteriores e o mês inteiro na grade', () => {
    const now = new Date();
    const y = now.getFullYear();
    const m1 = String(now.getMonth() + 1).padStart(2, '0');
    const el = mount(`<fx-calendar min="${y}-${m1}-15"></fx-calendar>`) as any;
    // dia 5 do mês corrente deve estar desabilitado
    const d5 = day(el, 5)!;
    if (d5) expect(d5.hasAttribute('disabled')).toBe(true);
    // grade de meses: nenhum mês deve estar desabilitado além do atual? atual parcial → habilitado
    (el.shadowRoot.querySelector('.title') as HTMLElement).click();
    const months = [...el.shadowRoot.querySelectorAll('[data-month]')];
    months.forEach((b: any, i: number) => {
      const dis = b.hasAttribute('disabled');
      if (i + 1 < now.getMonth() + 1) expect(dis).toBe(true);
      else expect(dis).toBe(false);
    });
  });

  it('min/max por ano limita a grade de anos', () => {
    const el = mount('<fx-calendar min="2024" max="2027"></fx-calendar>') as any;
    (el.shadowRoot.querySelector('.title') as HTMLElement).click();   // meses
    (el.shadowRoot.querySelector('.title') as HTMLElement).click();   // anos
    const years = [...el.shadowRoot.querySelectorAll('[data-year]')] as any[];
    years.forEach((b) => {
      const y = Number(b.dataset.year);
      expect(b.hasAttribute('disabled')).toBe(y < 2024 || y > 2027);
    });
  });
});
