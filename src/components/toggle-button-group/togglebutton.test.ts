import { describe, it, expect } from 'vitest';
import './index';

describe('fx-toggle-button-group', () => {
  it('registra el componente', () => {
    expect(customElements.get('fx-toggle-button-group')).toBeDefined();
  });

  it('sin multiple: selección única y emite change', () => {
    const el = document.createElement('fx-toggle-button-group');
    el.innerHTML = `<button slot="option" value="a">A</button><button slot="option" value="b">B</button><button slot="option" value="c">C</button>`;
    document.body.appendChild(el);

    let val: string[] = [];
    el.addEventListener('change', (e: Event) => (val = (e as CustomEvent).detail.value));

    const b = el.shadowRoot!.querySelector('.option[data-v="b"]') as HTMLElement;
    b.click();
    expect(el.value).toEqual(['b']);
    expect(val).toEqual(['b']);

    const c = el.shadowRoot!.querySelector('.option[data-v="c"]') as HTMLElement;
    c.click();
    expect(el.value).toEqual(['c']); // reemplaza (no acumula)

    el.remove();
  });

  it('multiple: acumula varios y alterna', () => {
    const el = document.createElement('fx-toggle-button-group');
    el.setAttribute('multiple', '');
    el.innerHTML = `<button slot="option" value="a">A</button><button slot="option" value="b">B</button>`;
    document.body.appendChild(el);

    const a = el.shadowRoot!.querySelector('.option[data-v="a"]') as HTMLElement;
    const b = el.shadowRoot!.querySelector('.option[data-v="b"]') as HTMLElement;
    a.click();
    b.click();
    expect(el.value).toEqual(['a', 'b']);
    a.click();
    expect(el.value).toEqual(['b']);

    el.remove();
  });
});