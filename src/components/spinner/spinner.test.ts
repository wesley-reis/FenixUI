import { describe, it, expect } from 'vitest';
import './index';

describe('fx-spinner', () => {
  it('é registrado e renderiza o elemento giratório com keyframes', () => {
    expect(customElements.get('fx-spinner')).toBeTruthy();
    const el = document.createElement('fx-spinner');
    document.body.appendChild(el);
    const html = (el as any).shadowRoot.innerHTML as string;
    expect(html).toContain('class="spinner"');
    expect(html).toContain('@keyframes');
    expect(html).toContain('animation');
    el.remove();
  });

  it('reflete atributo size sem quebrar o template', () => {
    const el = document.createElement('fx-spinner');
    el.setAttribute('size', 'lg');
    document.body.appendChild(el);
    expect((el as any).shadowRoot.querySelector('.spinner')).toBeTruthy();
    el.setAttribute('size', 'sm');
    expect((el as any).shadowRoot.querySelector('.spinner')).toBeTruthy();
    el.remove();
  });
});