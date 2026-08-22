import { describe, it, expect, beforeEach } from 'vitest';
import '../badge';
import '../spinner';

const badges = () => document.body.querySelectorAll('fx-badge');

describe('fx-badge', () => {
  beforeEach(() => badges().forEach((el) => el.remove()));

  it('é registrado e expõe slot default (jsdom não projeta light DOM)', () => {
    expect(customElements.get('fx-badge')).toBeTruthy();
    const el = document.createElement('fx-badge');
    el.innerHTML = 'Aprovado';
    document.body.appendChild(el);
    const slot = el.shadowRoot!.querySelector('.badge slot');
    expect(slot).toBeTruthy();
    expect(el.textContent).toContain('Aprovado');
  });

  it('suporta variante round', () => {
    const el = document.createElement('fx-badge');
    el.setAttribute('round', '');
    document.body.appendChild(el);
    expect(el.getAttribute('round')).toBe('');
  });
});

describe('fx-spinner', () => {
  beforeEach(() => document.body.querySelectorAll('fx-spinner').forEach((el) => el.remove()));

  it('é registrado e renderiza o spinner com role status', () => {
    expect(customElements.get('fx-spinner')).toBeTruthy();
    const el = document.createElement('fx-spinner');
    el.setAttribute('size', 'lg');
    document.body.appendChild(el);
    const span = el.shadowRoot!.querySelector('.spinner')!;
    expect(span.getAttribute('role')).toBe('status');
  });
});