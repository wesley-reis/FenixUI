import { describe, it, expect } from 'vitest';
import './index';

describe('fx-stepper', () => {
  it('registra el componente', () => {
    expect(customElements.get('fx-stepper')).toBeDefined();
  });

  it('navega por next/prev y emite change/complete', () => {
    const el = document.createElement('fx-stepper');
    el.innerHTML = `
      <div slot="step-0" step-title="Datos">Datos</div>
      <div slot="step-1" step-title="Pago">Pago</div>
      <div slot="step-2" step-title="Listo">Listo</div>`;
    document.body.appendChild(el);

    const changes: number[] = [];
    let complete = false;
    el.addEventListener('change', (e: Event) => changes.push((e as CustomEvent).detail.index));
    el.addEventListener('complete', () => (complete = true));

    expect(el.active).toBe(0);
    el.next();
    expect(el.active).toBe(1);
    expect(changes).toEqual([1]);
    el.next();
    el.next();
    expect(el.active).toBe(2);
    expect(complete).toBe(true);
    el.remove();
  });

  it('linear bloquea saltar pasos', () => {
    const el = document.createElement('fx-stepper');
    el.setAttribute('linear', '');
    el.innerHTML = `
      <div slot="step-0" step-title="A">A</div>
      <div slot="step-1" step-title="B">B</div>
      <div slot="step-2" step-title="C">C</div>`;
    document.body.appendChild(el);
    el.goTo(2); // no permitido en linear (de 0 a 2)
    expect(el.active).toBe(0);
    el.next();
    expect(el.active).toBe(1);
    el.remove();
  });
});