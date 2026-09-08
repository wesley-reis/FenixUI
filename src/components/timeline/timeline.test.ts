import { describe, it, expect } from 'vitest';
import './index';

describe('fx-timeline', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-timeline')).toBeDefined();
  });

  it('renderiza eventos com time, title e conteúdo', () => {
    const el = document.createElement('fx-timeline');
    el.innerHTML = `
      <div slot="item" time="09:00" title="Reunião">Alinhamento da equipe.</div>
      <div slot="item" time="14:00" title="Deploy">Publicação da versão 2.0.</div>`;
    document.body.appendChild(el);
    const events = el.shadowRoot!.querySelectorAll('.event');
    expect(events).toHaveLength(2);
    expect(events[0].querySelector('.time')?.textContent).toBe('09:00');
    expect(events[0].querySelector('.title')?.textContent).toBe('Reunião');
    expect(events[0].querySelector('.content')?.textContent).toContain('Alinhamento');
    expect(el.shadowRoot!.querySelectorAll('.dot')).toHaveLength(2);
    el.remove();
  });

  it('marker customizado', () => {
    const el = document.createElement('fx-timeline');
    el.setAttribute('marker', '◆');
    el.innerHTML = `<div slot="item" title="Evento">Texto</div>`;
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.dot')?.textContent).toBe('◆');
    el.remove();
  });
});