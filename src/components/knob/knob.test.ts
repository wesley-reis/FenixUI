import { describe, it, expect } from 'vitest';
import './index';

describe('fx-knob', () => {
  it('registra o elemento', () => {
    expect(customElements.get('fx-knob')).toBeDefined();
  });

  it('exibe valor padrao', () => {
    const el = document.createElement('fx-knob');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toContain('0');
    el.remove();
  });

  it('reflete valor inicial', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('value', '75');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toContain('75');
    el.remove();
  });

  it('respeita min e max', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('min', '10');
    el.setAttribute('max', '50');
    el.setAttribute('value', '5');
    document.body.appendChild(el);
    expect(el.value).toBe(10);
    el.value = 100;
    expect(el.value).toBe(50);
    el.remove();
  });

  it('aplica step corretamente', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('step', '5');
    el.value = 7;
    expect(el.value).toBe(5);
    el.value = 8;
    expect(el.value).toBe(10);
    el.remove();
  });

  it('valueTemplate funciona', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('value', '50');
    el.setAttribute('value-template', '{value}%');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toContain('50%');
    el.remove();
  });

  it('emite evento change', () => {
    const el = document.createElement('fx-knob');
    document.body.appendChild(el);
    let emitted = false;
    let detail: number | null = null;
    el.addEventListener('change', ((e: CustomEvent) => {
      emitted = true;
      detail = e.detail.value;
    }) as EventListener);
    el.value = 42;
    expect(emitted).toBe(true);
    expect(detail).toBe(42);
    el.remove();
  });

  it('disabled nao permite alteracoes', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('disabled', '');
    el.setAttribute('value', '30');
    document.body.appendChild(el);
    el.value = 60;
    expect(el.value).toBe(30);
    el.remove();
  });

  it('readonly nao permite alteracoes', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('readonly', '');
    el.setAttribute('value', '20');
    document.body.appendChild(el);
    el.value = 80;
    expect(el.value).toBe(20);
    el.remove();
  });

  it('atributos ARIA corretos', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('value', '65');
    el.setAttribute('min', '0');
    el.setAttribute('max', '100');
    document.body.appendChild(el);
    const knob = el.shadowRoot!.querySelector('.knob');
    expect(knob!.getAttribute('aria-valuenow')).toBe('65');
    expect(knob!.getAttribute('aria-valuemin')).toBe('0');
    expect(knob!.getAttribute('aria-valuemax')).toBe('100');
    expect(knob!.getAttribute('role')).toBe('slider');
    el.remove();
  });

  it('size sm aplica corretamente', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('size', 'sm');
    document.body.appendChild(el);
    expect(el.size).toBe('sm');
    el.remove();
  });

  it('size lg aplica corretamente', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('size', 'lg');
    document.body.appendChild(el);
    expect(el.size).toBe('lg');
    el.remove();
  });

  it('strokeWidth personalizado', () => {
    const el = document.createElement('fx-knob');
    el.setAttribute('stroke-width', '12');
    document.body.appendChild(el);
    expect(el.strokeWidth).toBe(12);
    el.remove();
  });
});